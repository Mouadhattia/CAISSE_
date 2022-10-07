import useTranslation from "./../i18";
import axios from "axios";
import Swal from "sweetalert2";
import React, { useEffect, useRef, useState } from "react";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import LinkIcon from '@mui/icons-material/Link';
import {
  Button,
  Col,
  Container,
  Modal,
  Nav,
  Navbar,
  Row,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import tableIcon from "./../Shared/table.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "./../Shared/logo.png";
import { faHistory, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import serveur from "./../Shared/serveur.png";
import NaviBottom from "../Components/NaviBottom";
import $ from "jquery";
import { clearData, clearOrders } from "../Slices/order";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import TicketZ from "../Components/TicketZ";
import AnimatedNumber from "animated-number-react";
import _ from "lodash";
import { storeCategories, storeNSteps, storeProducts } from "../Slices/data";
import loading from "../Shared/loading.gif";
import TicketH from "../Components/TicketH";

const Cloture = () => {
  
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = localStorage.getItem("username") || "";
  const user_id = localStorage.getItem("user_id") || "";
  const username = localStorage.getItem("username") || "";
  const caisse_id = localStorage.getItem("caisse_id");
  const [copySuccess, setCopySuccess] = useState('');
  const textAreaRef = useRef(null);
  const copyToClipBoard = async copyMe => {
    try {
      await navigator.clipboard.writeText(copyMe);
      setCopySuccess('Copied!');
      Swal.fire({
        position: "center",
        icon: "success",
        title: "lien copiée",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      setCopySuccess('Failed to copy!');
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Error",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };
  var curr = new Date();
  var date = curr.toISOString().substr(0, 10);
  const options = [date, "two", "three"];
  const defaultOption = options[0];

  const [selectedDate, setSelectedDate] = useState(date);
  const initialValue = useSelector((state) => state.caisse.initialValue);
  const products = useSelector((state) => state.data.products);
  const checkoutData = useSelector((state) => state.order.checkoutData);
  let enCours =
    checkoutData?.filter((e) => e.status == "pending" && e.date == date)
      ?.length || 0;
  const annules =checkoutData?.filter((e) => e.status == "rejected")
  const orders = useSelector((state) => state.data.orderHistory) || [];
  const completd = orders?.slice()?.sort((a, b) => b.id - a.id).filter((item) => item.paymentsInDb && item.paymentsInDb.length > 0)
  const [finalValue, setFinalValue] = useState(initialValue);
  const [recap, setrecap] = useState({});
  const [ping, setping] = useState(false);
  const [page, setpage] = useState(1);
  const [data, setdata] = useState({});
  const [zHistory, setzHistory] = useState({});
  const [previewTicket, setPreviewTicket] = useState(false);
  const [previewZ, setPreviewZ] = useState(false);
  const [previewHistory, setPreviewHistory] = useState(false);
  const [history, setHistory] = useState([])

  let ouvDate = recap?.lastOuverture?.date.substr(0, 10);
  let ouvTime = recap?.lastOuverture?.date.substr(11, 5);
  let nowTime = curr.toISOString().substr(11, 5);
  let ouverture = ouvDate + "  " + ouvTime;
  const handleDisconnect = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    navigate("/");
  };

  const handleCloseCaisse = () => {
    let pay_method = [];
    let orderTypes={
      surPlace:0,
      livraison:0,
      emporter:0,
      borne:0
    }
    completd.map(e=>{
      if(e.order_type=="sur place"){
        return orderTypes.surPlace +=1
      }
      if(e.order_type=="emporter"){
        return orderTypes.livraison +=1
      }
      if(e.order_type=="livraison"){
        return orderTypes.emporter +=1
      }
      if(e.from_kiosk==1){
        return orderTypes.borne +=1
      }
        
      
    })
   
    for (const key in recap.today?.groups) {
      let elementt = recap.today?.groups[key];
     
      let sum = 0;

      elementt?.forEach((ticket) => {
        sum = sum + ticket.price + (ticket.price * ticket.tva) / 100;
      });
      pay_method.push({ qt: elementt.length, name: key, prix: sum });
    
    }
  
   let newTva ={
    5.5 : 0,
    10:  0,
    20 :0
   }
   
   for (const key in recap.today?.tvas) {

    let E = recap.today?.tvas[key];
  for( let j in newTva){
    if(j==key){
     newTva[j]=E
    }
  }
    
    
   }
    let PrintData = {
      restaurant: {
        name: recap.Restaurant.name,
        address: recap.Restaurant.address,
        telephone: recap.Restaurant.telephone,
      },
      cancledOrders:annules,
      ordersType:orderTypes,
      products: recap.today?.orderItems?.map((e) => ({
        ...e,
        totalPrice: e.price * e.quantity,
        name: findProduct({ id: e.item_id }).name,
      })),
      impression: selectedDate + " " + nowTime,
      ouverture: ouverture,
      fermeture: selectedDate + " " + nowTime,
      commandes: recap.today.nbr,
      logs: recap.today.logs?.filter((e) => e.title_log == "Annulation"),
      clients: Object.keys(recap.today?.clientGroups || {}).length,
      ticket_moyen: (
        (recap.today?.total + tvasum) /
        recap.today?.nbr
      ).toFixed(2),

      pay_method: pay_method,
      tva: newTva,
      ht: recap.today?.total.toFixed(2),
      ttc: (recap.today?.total+tvasum).toFixed(2),
      fond_initial: recap.lastOuverture?.montant.toFixed(2),
      fond_final:
      (
        recap.lastOuverture?.montant +
        recap.today?.total +
        tvasum 
      ).toFixed(2)
    };
    let historiquePrint = {
      caisse_id: caisse_id,
      date: Date.now(),
      montant: finalValue,
      type: "close",
    };
    if(enCours ==0)
    {
      axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/CloseCaisse",
        {
          user_id: user_id,
          user: user,
          montant: finalValue,
          historiquePrint,
        }
      )
      .then((res) => {
        
        localStorage.clear();
        dispatch(clearData())
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Caisse fermée",
          showConfirmButton: false,
          timer: 1500,
        });
        axios
        .post(
          process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/historiqueZcaisse",
          { PrintData, user_id }
        )
        .then((res) => console.log(res.data))
        .catch((err) => console.log(err));
        setTimeout(() => {
          navigate("/init");
        }, 1500);
      });

  
    }
    
    else if(enCours==1){
      Swal.fire({
        position: "center",
        icon: "error",
        title: `Il ya ${enCours} commande en cours`,
        showConfirmButton: false,
        timer: 2500,
      });
    }
    else{
      Swal.fire({
        position: "center",
        icon: "error",
        title: `Il ya ${enCours} commandes en cours`,
        showConfirmButton: false,
        timer: 2500,
      });
    }
 
  };
  let findProduct = ({ id }) => {
    return products?.find((el) => el.id == id);
  };
useEffect(() => {

  axios
        .post(
          process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/getHistoriqueZcaisse",
          { user_id }
        )
        .then((res) => setHistory(res.data.allHistorique))
        .catch((err) => console.log(err));
}, [])

  useEffect(async () => {
 
    
    await axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/clotureData",
        { user_id, caisse_id, TODAY: selectedDate }
      )
      .then((res) => {
     
        setrecap(res.data);
        var bodyFormData = new FormData();
        bodyFormData.append("rest_id", user_id);
        bodyFormData.append("page", page);
        bodyFormData.append("date", selectedDate);
        axios({
          method: "post",
          url: "http://141.94.77.9/menu_premium_v2/index.php/api/order/venteCaisse",
          data: bodyFormData,
          headers: { "Content-Type": "multipart/form-data" },
        })
          .then(function (response) {
            console.log(response.data.data.data);
            setdata(response.data);
            
          })
          .catch(function (response) {
            //handle error
            console.log(response);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [ping]);
  const columns = [
    { field: "id", headerName: "#", width: 50 },
    { field: "col1", headerName: "Nom", width: 180 },
    { field: "col2", headerName: "Quantités", width: 150 },
    { field: "col3", headerName: "Prix", width: 150 },
    { field: "col4", headerName: "Sous-Total", width: 150 },
  ];

  let rows = recap.today?.orderItems?.map((e, key) => ({
    id: key,
    col1: findProduct({ id: e.item_id })?.name,
    col2: e.quantity,
    col3: e.price?.toFixed(2) + "€",
    col4: (e.price * e.quantity).toFixed(2) + "€",
  }));

  
  // const rows = [
  //   { id: 1, col1: "Hello", col2: "World" },
  //   { id: 2, col1: "DataGridPro", col2: "is Awesome" },
  //   { id: 3, col1: "MUI", col2: "is Amazing" },
  // ];
  var tvasum = 0;
  Object.keys(recap.today?.tvas || {}).map((key) => {
    tvasum = tvasum + recap.today?.tvas[key];
  });
  
  const handlePrint = () => {
    
    let pay_method = [];
    let orderTypes={
      surPlace:0,
      livraison:0,
      emporter:0,
      borne:0
    }
    completd.map(e=>{
      if(e.order_type=="sur place"){
        return orderTypes.surPlace +=1
      }
      if(e.order_type=="emporter"){
        return orderTypes.livraison +=1
      }
      if(e.order_type=="livraison"){
        return orderTypes.emporter +=1
      }
      if(e.from_kiosk==1){
        return orderTypes.borne +=1
      }
        
      
    })
   
    for (const key in recap.today?.groups) {
      let elementt = recap.today?.groups[key];
     
      let sum = 0;

      elementt?.forEach((ticket) => {
        sum = sum + ticket.price + (ticket.price * ticket.tva) / 100;
      });
      pay_method.push({ qt: elementt.length, name: key, prix: sum });
    
    }
  
   let newTva ={
    5.5 : 0,
    10:  0,
    20 :0
   }
   
   for (const key in recap.today?.tvas) {

    let E = recap.today?.tvas[key];
  for( let j in newTva){
    if(j==key){
     newTva[j]=E
    }
  }
    
    
   }
   
    let PrintData = {
      restaurant: {
        name: recap.Restaurant.name,
        address: recap.Restaurant.address,
        telephone: recap.Restaurant.telephone,
      },
      cancledOrders:annules,
      ordersType:orderTypes,
      products: recap.today?.orderItems?.map((e) => ({
        ...e,
        totalPrice: e.price * e.quantity,
        name: findProduct({ id: e.item_id }).name,
      })),
      impression: selectedDate + " " + nowTime,
      ouverture: ouverture,
      fermeture: selectedDate + " " + nowTime,
      commandes: recap.today.nbr,
      logs: recap.today.logs?.filter((e) => e.title_log == "Annulation"),
      clients: Object.keys(recap.today?.clientGroups || {}).length,
      ticket_moyen: (
        (recap.today?.total + tvasum) /
        recap.today?.nbr
      ).toFixed(2),

      pay_method: pay_method,
      tva: newTva,
      ht: recap.today?.total.toFixed(2),
      ttc: (recap.today?.total+tvasum).toFixed(2),
      fond_initial: recap.lastOuverture?.montant.toFixed(2),
      fond_final:
      (
        recap.lastOuverture?.montant +
        recap.today?.total +
        tvasum 
      ).toFixed(2)
    };
   
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/printzcaisse",
        { PrintData, user_id }
      )
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
    
  };
  const showZcaisse =(data)=>{
    setPreviewZ(true);
    setzHistory(data)
    console.log(data)
  }
  const handlePrintHistory=(PrintData)=>{
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/printzcaisse",
        { PrintData, user_id }
      )
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
  }

  return (
    <div>
      <Navbar
       
        variant="warning"
        className="colture_nav"
      >
        <Container className="colture_navbar">
          <Navbar.Brand>
            <div class="logo-container">
              <img id="chrome" class="logo" src={logo} />
            </div>
          </Navbar.Brand>
        <h6 className="zcaisse_history" onClick={()=>setPreviewHistory(true)}>
        <FontAwesomeIcon
             
              size="1x"
              icon={faHistory}
              style={{ marginRight: "0.5rem"}}
            />
          Historique
        </h6>
          <Nav className="ms-auto">
            {/* <Dropdown
              options={options}
              value={defaultOption}
              placeholder="Select an option"
            /> */}
            <Nav.Link> </Nav.Link>
            <Nav.Link
              onClick={() => {
                navigate("/main");
                dispatch(clearOrders());
              }}
            >
              <img
                width="45px"
                src={tableIcon}
                className="colture-table-icon"
              />
            </Nav.Link>
          </Nav>
          <h6
            className="cloture-server"
            style={{
              color: "white",
              marginLeft: "1rem",
              marginTop: "0.5rem",
              borderLeft: "1px solid white",
              padding: "5px",
            }}
          >
            <img
              className="cloture_server_img"
              src={serveur}
              width={32}
              height={32}
              style={{ marginRight: "0.5rem" }}
            />
            <b>{username}</b>
            <FontAwesomeIcon
              onClick={() => handleDisconnect()}
              size="2x"
              icon={faSignOutAlt}
              style={{ marginLeft: "0.5rem", paddingTop: "0.5rem" }}
            />
          </h6>
        </Container>
      </Navbar>
      {recap.today ? (
        <div
          style={{
            padding: "1rem",
            display: "flex",
            width: "100%",
            height: "93vh",
            overflow: "hidden",
            paddingTop: "1rem",
            backgroundColor: "white",
          }}
        >
          <div style={{ width: "30%", height: "100vh" }}>
            {/* <h6>{t("closureHistory")}</h6>
          <p>{t("selectDate")}</p>
          <input
            type="date"
            defaultValue={date}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setping(!ping);
            }}
          /> */}

            <TicketZ
           
              tvas={recap.today?.tvas}
              products={recap.today?.orderItems?.map((e) => ({
                ...e,
                totalPrice: e.price * e.quantity,
                name: findProduct({ id: e.item_id })?.name,
              }))}
              data={data}
              recap={recap}
              selectedDate={selectedDate}
              tvasum ={tvasum}
            />
          </div>
          <div
            style={{
              width: "70%",
              height: "100vh",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-evenly",
              }}
            >
              <div className="rec">
                <h1>
                  <b>
                    <AnimatedNumber
                      value={recap.commandesTotal}
                      formatValue={(value) => value.toFixed(0)}
                    />
                  </b>
                </h1>
                <h5>Total des commandes</h5>
              </div>
              <div className="rec">
                <h1>
                  <b>
                    <AnimatedNumber
                      value={recap.today?.clients}
                      formatValue={(value) => value.toFixed(0)}
                    />
                  </b>
                </h1>
                <h5>Clients total</h5>
              </div>
              <div className="rec">
                <h1>
                  <b>
                    <AnimatedNumber
                      value={recap.chiffre}
                      formatValue={(value) => value.toFixed(2)}
                    />{" "}
                    <br />€
                  </b>
                </h1>
                <h5>Chiffre d'affaire</h5>
              </div>
              <div className="rec">
                <h1>
                  <b>
                    <AnimatedNumber
                      value={recap.chiffre / recap.commandesTotal}
                      formatValue={(value) => value.toFixed(2)}
                    />
                    <br />€
                  </b>
                </h1>
                <h5>Panier moyen</h5>
              </div>
            </div>
            <div style={{ width: "100%", height: "300px", marginTop: "1rem" }}>
              <DataGrid
                className="colture-datagrid"
                loading={rows?.length == 0}
                pageSize={10}
                paginationMode="client"
                onPageChange={(e) => {
                  setpage(e + 1);
                }}
                rowCount={data?.data?.total}
                rows={rows == undefined ? [] : rows}
                columns={columns}
              />
              <div className="colture_buttons">
                <div
                  style={{
                    width: "100%",
                    marginTop: "1rem",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    className="colture_buton"
                    onClick={() => handlePrint()}
                    style={{ marginRight: "1rem" }}
                    variant="outline-info"
                  >{`${t("print")} X ${t("ofCashier")}`}</Button>
                  <Button
                    className="colture_buton"
                    variant="outline-danger"
                    onClick={() => setPreviewTicket(!previewTicket)}
                  >
                    Visualiser Ticket
                  </Button>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "1rem",
                    height: "100px",
                  }}
                >
                  <h3
                    style={{
                      color: "#ff6b6b",
                      fontWeight: "bold",
                      marginRight: "1rem",
                      width: "max-content",
                    }}
                  >
                    {(
                      recap.lastOuverture?.montant +
                      recap.today?.total +
                      tvasum
                    ).toFixed(2) + " €"}
                  </h3>
                  <Button
                    variant="danger"
                    className="clot_btn "
                    onClick={() => handleCloseCaisse()}
                  >
                    {t("close")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading-z-caisse">
          <h1>Chargement de caisse...</h1>
          <img src={loading} alt="loading" />
        </div>
      )}

      <Modal show={previewTicket} onHide={() => setPreviewTicket(false)}>
        <Modal.Header closeButton></Modal.Header>;
        <Modal.Body>
          <div className="z-cais_show_ticket">
            <TicketZ
              products={recap.today?.orderItems?.map((e) => ({
                ...e,
                totalPrice: e.price * e.quantity,
                name: findProduct({ id: e.item_id })?.name,
              }))}
              data={data}
              recap={recap}
              selectedDate={selectedDate}
              tvasum ={tvasum}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPreviewTicket(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={previewHistory} onHide={() => setPreviewHistory(false)}>
        <Modal.Header closeButton>
          <h4>Historique Z-Caisse</h4>
        </Modal.Header>
        <Modal.Body>
          <div className="z-cais_history">
            {history.length==0? "Il n'y a pas d'historique encore ... ":  history.map((el,key)=>(
              <div key={key} className='z-history'>
                <h6> Du {el.data.ouverture}  au {el.data.fermeture}</h6>
                <div>
                <Button variant="info" onClick={() => handlePrintHistory(el.data)}>
            Imprimer
          </Button>
          <Button variant="success" onClick={() => showZcaisse(el.data)} style={{marginLeft:"1rem"}} >
            Afficher
          </Button>
         
                </div>
        

              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div>
          <Button variant="success" onClick={() => navigate('/data/zcaisse')} >
           Zcaisse
          </Button>         
          </div>
        
          <Button variant="secondary" onClick={() => setPreviewHistory(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={previewZ} onHide={() => setPreviewZ(false)}>
        <Modal.Header closeButton></Modal.Header>;
        <Modal.Body>
          <div className="z-cais_show_ticket">
            <TicketH zHistory={zHistory} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPreviewZ(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Cloture;
