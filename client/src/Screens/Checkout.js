import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import tableIcon from "./../Shared/table.png";
import {
  Badge,
  Button,
  Col,
  Container,
  Form,
  Modal,
  Nav,
  Navbar,
  Offcanvas,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";

import {
  faAngleLeft,
  faAngleRight,
  faBorderAll,
  faBorderNone,
  faCalendarAlt,
  faCashRegister,
  faCircle,
  faEdit,
  faHistory,
  faMapMarkedAlt,
  faMapMarkerAlt,
  faPhone,
  faSignOutAlt,
  faTimesCircle,
  faUsers,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import Ticket from "../Components/Ticket";
import { handle } from "express/lib/application";
import useTranslation from "./../i18";
import { useNavigate } from "react-router";
import {
  deletecheckoutData,
  initClient,
  setCheckoutChange,
  setNbrCouverts,
} from "../Slices/order";
import axios from "axios";
import NaviBottom from "../Components/NaviBottom";
import Bat from "../Components/Bat";
import logo from "./../Shared/logo.png";
import serveur from "./../Shared/serveur.png";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import $ from "jquery";
import Swal from "sweetalert2";
import { Typeahead } from "react-bootstrap-typeahead";

const Checkout = () => {
  var curr = new Date();
  var time = curr.getHours() + ":" + curr.getMinutes();
  var date = curr.toISOString().substr(0, 10);
  const [idz, setidz] = useState(0)
  const [clientone, setclientone] = useState({
    prenom: "",
    company: "",
    code1: "",
    code2: "",
    etage: "",
    interphone: "",
    name: "",
    phone: "",
    address: "",
    post: "",
    city: "",
    message: "",
    email: "",
    type: "emporter",
    nbrCouverts: 1,
    date: date,
    time: time,
    id:0
  });
  const [isavoir, setisavoir] = useState(false)
  const [showform, setshowform] = useState(false)
  const [load, setLoad] = useState(false)
  const username = localStorage.getItem("username") || "";
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { table_id } = params;
  console.log(params);
  const ordersData = useSelector((state) => state.order.checkoutData);
  const selectedTable = useSelector((state) => state.order.selectedTable);
  const client = useSelector((state) => state.order.client);
  const clients = useSelector((state) => state.data.clients);
  console.log(ordersData);
  let thisOrder = ordersData.filter((o) => o.order_id == table_id)[0] || {};
  
  console.log(thisOrder);
  if (thisOrder.totalPrice == undefined) {
    thisOrder = {
      ...thisOrder,
      totalPrice: thisOrder.price,
    };
  }
  let orderDate = new Date(
    thisOrder.Date == undefined ? thisOrder.date : thisOrder.Date
  );
  var curr_date = orderDate?.getDate();
  var curr_month = orderDate?.getMonth();
  var curr_year = orderDate?.getFullYear();
  var curr_hour = orderDate?.getHours();
  var curr_min = orderDate?.getMinutes();
  const [show, setShow] = useState(false);
  const [showtwo, setshowtwo] = useState(false)
  const [old, setOld] = useState(false);
  const [showHistoryButton, setshowHistoryButton] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [accompte, setAccompte] = useState(false);
  const [part, setPart] = useState(1);
  const [typeRepart, settypeRepart] = useState("partager");
  const [paymentType, setpaymentType] = useState("Especes");
  const [amount, setAmount] = useState(0);
  const [amountPaid, setamountPaid] = useState(0);
  const [note, setNote] = useState("");
  const [notefrais, setnotefrais] = useState(false);
  const [input, setInput] = useState("");
  const [nbrCouverts, setNbrCouverts] = useState(1);
  const [selected, setSelected] = useState("pay");
  const [acompte, setAcompte] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [payments, setpayments] = useState([]);
  const user_id = localStorage.getItem("user_id");
 const handlefinal=(id)=>{
  setisavoir(true)
  thisOrder={...thisOrder,client_id:id,customer_name:clientone.name,customer_tel:client.phone}
    axios
    .post(
      process.env.REACT_APP_API_HOST +
        ":" +
        process.env.REACT_APP_API_PORT +
        "/api/finalizeorder",
      {
        order: {
          ...thisOrder,
          nbrCouverts: nbrCouverts,
          message: note,
          pay_method: paymentType,
          amount: amount,
          amountPaid: amountPaid,
        },
      }
    )
    .then((res) => {
      console.log(res.data);
         
      console.log(amount);
      console.log(amountPaid);
      setpayments([...payments, { type: paymentType, value: amount }]);
      let paid = ["Glovo", "Just-Eat", "Deliveroo", "Uber Eats","ticket restaurant"].includes(
        paymentType
      );
      setTimeout(() => {
        if (
          amountPaid + amount >=
          (
            thisOrder?.totalPrice +
            (thisOrder?.totalPrice * tvas) / 100
          ).toFixed(2)
        ) 
          handleExit();
        
      }, 1);
      setAmount(0);
    })
    .catch((err) => {
      console.log(err);
    })
  }
  const handleCreate = () => {
     
    if (old == false) {
      axios
        .post(
          process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/createClient",
          {
            user_id,
            client: {
              etage: clientone.etage || 0,
              interphone: clientone.interphone || 0,
              supprimer: 0,
              societe: clientone.company || "",
              nom_prenom: clientone.name || "",
              telephone: clientone.phone || "",
              adresse: clientone.address || "",
              code_postal: clientone.post || 0,
              ville: clientone.city || "",
              email: clientone.email || "",
              code_1: clientone.code1 || "",
              code_2: clientone.code2 || "",
          
            },
          }
        )
        .then((res) => {  
handlefinal(res.data.id);
})
        .catch((err) => console.log(err));
    } else {
      dispatch(initClient({ clientone }));  
      handlefinal();   
    }    
  };
  const handleSelection = (x) => {
    setOld(true);
    let selectedClient = clients?.filter(
      (e) =>
        e.nom_prenom?.toLowerCase().includes(x?.toLowerCase()) ||
        e.telephone?.toLowerCase().includes(x?.toLowerCase()) ||
        e.email?.toLowerCase().includes(x?.toLowerCase())
    )[0];
    if (selectedClient) {
      setclientone({
        ...clientone,
        id: selectedClient.id,
        prenom: selectedClient.nom_prenom,
        company: selectedClient.societe,
        code1: selectedClient.code_1,
        code2: selectedClient.code_2,
        etage: selectedClient.etage,
        interphone: selectedClient.interphone,
        name: selectedClient.nom_prenom,
        phone: selectedClient.telephone,
        address: selectedClient.adresse,
        post: selectedClient.code_postal,
        city: selectedClient.ville,
        email: selectedClient.email,
      });
    }
  };
  var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x.value);
      return rv;
    }, {});
  };
  
  let tvas = 0;
  let is_alcool = false;
  let test = thisOrder.orderItems;
  thisOrder?.orderItems?.forEach((element) => {
    if (element.tva == 20) {
      is_alcool = true;
    }
  });
  if (is_alcool == true) {
    tvas = 20;
  } else {
    switch (
      thisOrder.orderType == undefined
        ? thisOrder.order_type
        : thisOrder.orderType
    ) {
      case "surplace":
        tvas = 10;
        break;
      case "sur place":
        tvas = 10;
        break;
      case "emporter":
        tvas = 5.5;
        break;
      case "livraison":
        tvas = 5.5;
        break;
      default:
        tvas = 10;
        break;
    }
  }
  const handleVerifyCoupon = () => {
 
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/verifyCoupon",
        {
          code: coupon,
          user_id :user_id,
          paidamount:thisOrder?.totalPrice?.toFixed(2)
        }
      )
      .then((res) => {
        let remise = res.data.couponInDb.discount;
   
        let today = new Date().toISOString().slice(0, 10);
        if (res.data.couponInDb.expires_at > today) {
          setAmount(Number(res.data.couponInDb.discount+amount))
          setpaymentType("ticket restaurant")
          Swal.fire({
            icon: "success",
            title: `Coupon validé pour ${remise} euro`,
            showConfirmButton: false,
            timer: 1500,
          });
        
        } else {
          Swal.fire({
            icon: "warning",
            title: `Validité epuisé`,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      })
      .catch((err) =>
        Swal.fire({
          icon: "warning",
          title: `Coupon non valide`,
          showConfirmButton: false,
          timer: 1500,
        })
       
      );
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  let thisDate =
    curr_date +
    "-" +
    curr_month +
    "-" +
    curr_year +
    "-" +
    curr_hour +
    ":" +
    curr_min;

  // let tax = (thisOrder.taxPrice * thisOrder.totalPrice) / 100;
  const handleFinal = () => {
    let restAvoir = (amount- (thisOrder?.totalPrice +
      (thisOrder?.totalPrice * tvas) / 100)).toFixed(2)
      console.log(restAvoir)
    if(restAvoir>0)
    {
      Swal.fire({
        title: "Comment voulez-vous rendre la monnaies ?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Avoir",
        denyButtonText: `Rendre monnaies directement`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isDenied) {
          axios
          .post(
            process.env.REACT_APP_API_HOST +
              ":" +
              process.env.REACT_APP_API_PORT +
              "/api/finalizeorder",
            {
              order: {
                ...thisOrder,
                nbrCouverts: nbrCouverts,
                message: note,
                pay_method: paymentType,
                amount: amount,
                amountPaid: amountPaid,
              },
            }
          )
          .then((res) => {
            console.log(res.data);
               
            console.log(amount);
            console.log(amountPaid);
            setpayments([...payments, { type: paymentType, value: amount }]);
            let paid = ["Glovo", "Just-Eat", "Deliveroo", "Uber Eats","ticket restaurant"].includes(
              paymentType
            );
            setTimeout(() => {
              if (
                amountPaid + amount >=
                (
                  thisOrder?.totalPrice +
                  (thisOrder?.totalPrice * tvas) / 100
                ).toFixed(2)
              ) {
                handleExit();
              }
            }, 1);
            setAmount(0);
          })
          .catch((err) => {
            console.log(err);
          })
              
        }
        else if (result.isConfirmed)
        {
          Swal.fire({
            title: "Client existant ?",
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "Oui",
            denyButtonText: `Non`,
          }).then((reso) => {
if(reso.isDenied)
{
  setisavoir(true)
  setshowform(true)
}
else if(reso.isConfirmed)
{
  setshowtwo(true)
  setisavoir(true)
  
}
          })
        }
        else if (result.isConfirmed&&thisOrder.customer_tel!="")

        {
          setisavoir(true)
          setshowform(true)
        }
        else if (result.isConfirmed&&thisOrder.customer_tel=="")
        {
          setisavoir(true)
          setshowform(true)
        }
        else if(result.isConfirmed) {
          setisavoir(true)
        }
      })
    }else {
  
      {
        axios
        .post(
          process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/finalizeorder",
          {
            order: {
              
              ...thisOrder,
              nbrCouverts: nbrCouverts,
              message: note,
              pay_method: paymentType,
              amount: amount,
              amountPaid: amountPaid,
            },
          }
        )
        .then((res) => {
          console.log(res.data);
             
          console.log(amount);
          console.log(amountPaid);
          setpayments([...payments, { type: paymentType, value: amount }]);
          let paid = ["Glovo", "Just-Eat", "Deliveroo", "Uber Eats","ticket restaurant"].includes(
            paymentType
          );
          setTimeout(() => {
            if (
              amountPaid + amount >=
              (
                thisOrder?.totalPrice +
                (thisOrder?.totalPrice * tvas) / 100
              ).toFixed(2)
            ) {
              handleExit();
            }
          }, 1);
          setAmount(0);
        })
        .catch((err) => {
          console.log(err);
        })
      }
    }
    
  };
  const handleAddition = () => {
    console.log("called");
    handleClose();
    if (part > 1) {
      axios
        .post(
          process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/updatehow_paid",
          {
            type: typeRepart,
            order: thisOrder,
          }
        )
        .then((res) => {
          console.log(res.data);
          if (res.data) {
            navigate(`/checkout2/${table_id}/${typeRepart}/${part}`);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setShowPay(true);
    }
  };

  const handleExit = () => {

    let tva = 0;
    let is_alcool = false;
    let test = thisOrder.orderItems;
    thisOrder.orderItems.forEach((element) => {
      if (element.tva == 20) {
        is_alcool = true;
      }
    });
    if (is_alcool == true) {
      tva = 20;
    } else {
      switch (thisOrder.orderType) {
        case "surplace":
          tva = 10;
          break;
        case "emporter":
          tva = 5.5;
          break;
        case "livraison":
          tva = 5.5;
          break;
        default:
          tva = 10;
          break;
      }
    }
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/printFinalOrder",
        {isavoir,
          user_id: user_id,
          order: {
            ...thisOrder,
            tvas: tva,
            nbrCouverts: nbrCouverts,
            table_number: thisOrder.table || "",
            order_id: thisOrder.order_id,
            Date: new Date(),
            amount:
              amount >=
              thisOrder?.totalPrice -
                ((tvas * 100) / thisOrder?.totalPrice).toFixed(2)
                ? (
                    thisOrder?.totalPrice -
                    (tvas * 100) / thisOrder?.totalPrice
                  ).toFixed(2) - amountPaid
                : amount - amountPaid,
            amountPaid: amount,
            paymentType: paymentType,
          },
          type: "payertout",
        }
      )
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
    if (notefrais == true) {
      axios
        .post(
          process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/printnotefrais",
          {
            user_id: user_id,
            order: {
              ...thisOrder,
              tvas: tva,
              nbrCouverts: nbrCouverts,
              table_number: thisOrder.table || "",
              order_id: thisOrder.order_id,
              Date: new Date(),
              amount:
                amount >=
                thisOrder?.totalPrice +
                  ((thisOrder?.totalPrice * tvas) / 100).toFixed(2)
                  ? (
                      thisOrder?.totalPrice +
                      (thisOrder?.totalPrice * tvas) / 100
                    ).toFixed(2) - amountPaid
                  : amount - amountPaid,
              amountPaid: amount,
              paymentType: paymentType,
            },
          }
        )
        .then((res) => console.log(res.data))
        .catch((err) => console.log(err));
    }
    let restAvoir = (amount- (thisOrder?.totalPrice +
      (thisOrder?.totalPrice * tvas) / 100)).toFixed(2)
     
      let amountss = amount.toFixed(2)
      if (paymentType=="ticket restaurant"||isavoir==true)
      {
        Swal.fire({
          icon: "success",
          title:
            "<h5 >" +
            `le paiement effectué avec succès avec montant: <span style='color:red'>${amountss}€</span> D'avoir:<span style='color:green'>${restAvoir}€</span> ` +
            "</h5>",
          showConfirmButton: false,
          timer: 3000,
        });
        setLoad(false)
        navigate("/main");
        dispatch(deletecheckoutData({ order_id: table_id }));
      }else {
        Swal.fire({
          icon: "success",
          title:
            "<h5 >" +
            `le paiement effectué avec succès avec montant: <span style='color:red'>${amountss}€</span> du reste:<span style='color:green'>${restAvoir}€</span> ` +
            "</h5>",
          showConfirmButton: false,
          timer: 3000,
        });
        setLoad(false)
        navigate("/main");
        dispatch(deletecheckoutData({ order_id: table_id }));

      }
      }
   

  const renderHTML = (rawHTML: string) =>
    React.createElement("div", {
      dangerouslySetInnerHTML: { __html: rawHTML },
    });
  const currency = localStorage.getItem("currency");

  const { t } = useTranslation();
  const handleDisconnect = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    navigate("/");
  };

  //////////////////////CLAVIER///////////////////////////////////////

  const onChange = (input) => {
    let i = 0;
    for (let index = 0; index < input.length; index++) {
      const element = input[index];
      if (element == ",") {
        i++;
        if (i >= 2) {
          break;
        }
      } else if (index == 0 && element == ",") {
        i = 2;
        break;
      }
    }
    function numberFromLocaleString(stringValue, locale) {
      var parts = Number(1111.11)
        .toLocaleString(locale)
        .replace(/\d+/g, "")
        .split("");
      if (stringValue === null) return null;
      if (parts.length == 1) {
        parts.unshift("");
      }
      return Number(
        String(stringValue)
          .replace(new RegExp(parts[0].replace(/\s/g, " "), "g"), "")
          .replace(parts[1], ".")
      );
    }
    if (i < 2) {
      setInput(input);
      console.log("Input changed", input);
      if (selected == "pay") {
        let v = numberFromLocaleString(input, "fr");
        console.log(v);
        setAmount(v);

        /*    setkeyborad(v); */
        setInput("");
      } else {
        setNbrCouverts(input);
        setInput("");
      }
      // let newarr = [...lay];
      // newarr[selected].value = Number(input);
      // setlay(newarr);
      setInput("");
    } else {
      setInput("");
      console.log("Input changed", input);
      if (selected == "pay") {
        setAmount(0);
        keyboard.current.setInput("0");

        /*    setkeyborad(v); */
        setInput("");
      } else {
        setNbrCouverts(input);
        setInput("");
      }
      // let newarr = [...lay];
      // newarr[selected].value = Number(input);
      // setlay(newarr);
      setInput("");
    }
  };

  const onKeyPress = (button) => {
    console.log("Button pressed", button);
    if (button == "{bksp}") {
    }
  };
  const keyboard = useRef();
  const [myLayout, setLayout] = useState([
    "9 8 7",
    "6 5 4",
    "3 2 1",
    "0 , {bksp}",
  ]);
  const onChangeInput = ({ e, index }) => {
    const input = e.target.value;
    setInput(input);
    keyboard.current.setInput(amount);
    // setTotal(calcMontant());
  };

  return (
    <div style={{ backgroundColor: "white" }}>
      
      <Navbar variant="warning" className="navbar">
        <Container className="history-navbar">
          <Navbar.Brand>
            <div class="logo-container">
              <img id="chrome" class="logo" src={logo} />
            </div>
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link onClick={() => navigate("/main")}>
              <img width="45px" src={tableIcon} className="table-icon" />
            </Nav.Link>
            <Nav.Link>
              <h6
                style={{ color: "white", paddingTop: "1rem" }}
                className="agenda"
              >
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  style={{ marginRight: "5px" }}
                />
                Agenda
              </h6>
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/cloture")}>
              <h6
                style={{ color: "white", paddingTop: "1rem" }}
                className="checkout-cassier"
              >
                <FontAwesomeIcon
                  icon={faCashRegister}
                  style={{ marginRight: "5px" }}
                />
                {t("cashier")}
              </h6>
            </Nav.Link>
          </Nav>
          <h6
            className="chekout-server"
            style={{
              color: "white",
              marginLeft: "1rem",
              marginTop: "0.5rem",
              borderLeft: "1px solid white",
              padding: "5px",
            }}
          >
            <img
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
      <Container fluid>
        
        <Row className="row_h">
          <Col xs={8} className="col_h">
            <div
              style={{
                marginTop: "1rem",
                height: "max-content",
                padding: "1rem",
                boxShadow: "rgba(17, 12, 46, 0.15) 0px 48px 100px 0px",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  justifyContent: "space-between",
                  display: "flex",
                }}
              >
                <div className="leftt">
                  <h6 className="checkout-tbd">
                    <b>Commande</b>
                  </h6>
                  <h6 className="checkout-tbd">
                    <FontAwesomeIcon
                      icon={faUtensils}
                      style={{ color: "#ff6b6b", marginRight: "1rem" }}
                    />
                    <b>#{thisOrder.order_id}</b>
                  </h6>
                  <h6 className="checkout-tbd">
                    <FontAwesomeIcon
                      icon={faHistory}
                      style={{ color: "#ff6b6b", marginRight: "1rem" }}
                    />
                    <b>{thisDate}</b>
                  </h6>
                
                  {thisOrder.orderType=="surplace"&&  <h6 className="checkout-tbd">
                    <FontAwesomeIcon
                      icon={faUtensils}
                      style={{ color: "#ff6b6b", marginRight: "1rem" }}
                    />
                    <b>Table {selectedTable.nbr}</b>
                  </h6>}
                </div>
                {Object.keys(clientone).length > 0 ? (
                  <div className="rightt">
                    <h6 className="checkout-tbd">
                      <b>{clientone.name}</b>
                    </h6>
                    <h6 className="checkout-tbd">
                      <FontAwesomeIcon
                        icon={faPhone}
                        style={{ color: "#ff6b6b", marginRight: "1rem" }}
                      />
                      <b>{clientone.phone}</b>
                    </h6>
                    <h6 className="checkout-tbd">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        style={{ color: "#ff6b6b", marginRight: "1rem" }}
                      />
                      <b>{clientone.address}</b>
                    </h6>
                    <h6 className="checkout-tbd">
                      <FontAwesomeIcon
                        icon={faCircle}
                        style={{ color: "#ff6b6b", marginRight: "1rem" }}
                      />
                      <b>{thisOrder.orderType}</b>
                    </h6>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <Table hover>
                <thead className="tbd">
                  <tr>
                    <th>#</th>
                    <th>Article</th>
                    <th>Prix</th>
                    <th>Qt</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody className="ccc">
                  {thisOrder?.orderItems?.map((item, key) => (
                    <tr>
                      <td>{key}</td>
                      <td>
                        {item.name}
                        <br />

                        {/* {item.extras && item.extras.length
                          ? item.extras.map((extra) => <p>{extra.title}</p>)
                          : ""} */}
                      </td>

                      <td style={{ display: "flex" }}>
                        {item.price?.toFixed(2)}{" "}
                        {renderHTML(`<i>${currency}</i>`)}
                      </td>
                      <td>{item.qt}</td>
                      <td style={{ display: "flex" }}>
                        {item.price?.toFixed(2)}{" "}
                        {renderHTML(`<i>${currency}</i>`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Col xs={3}>
                <Table>
                  <tbody
                    className="checkout-tbd"
                    style={{ width: "50%", height: "auto", align: "right" }}
                  >
                    <tr>
                      <td>
                        <h6
                          className="checkout-tbd"
                          style={{ display: "flex", fontWeight: "bold" }}
                        >
                          Total HT :
                        </h6>
                      </td>
                      <td>
                        <span
                          style={{
                            color: "#ff6b6b",
                            display: "flex",
                            marginLeft: "0.5rem",
                            fontWeight: "bold",
                          }}
                        >
                          {thisOrder?.totalPrice?.toFixed(2)}{" "}
                          {renderHTML(`<i>${currency}</i>`)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h6
                          className="checkout-tbd"
                          style={{ display: "flex", fontWeight: "bold" }}
                        >
                          TVA( {tvas}
                          %)
                        </h6>
                      </td>
                      <td>
                        <span
                          style={{
                            color: "#ff6b6b",
                            display: "flex",
                            marginLeft: "0.5rem",
                            fontWeight: "bold",
                          }}
                        >
                          {((thisOrder?.totalPrice * tvas) / 100).toFixed(2)}
                          {renderHTML(`<i>${currency}</i>`)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h6
                          className="checkout-tbd"
                          style={{ display: "flex", fontWeight: "bold" }}
                        >
                          TOTAL TTC :{" "}
                        </h6>
                      </td>
                      <td>
                        <span
                          style={{
                            color: "#ff6b6b",
                            display: "flex",
                            marginLeft: "0.5rem",
                            fontWeight: "bold",
                          }}
                        >
                          {" "}
                          {(
                            thisOrder?.totalPrice +
                            (thisOrder?.totalPrice * tvas) / 100
                          )?.toFixed(2)}{" "}
                          {renderHTML(`<i>${currency}</i>`)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>

              <div className="regler-addition-btns">
                <Button
                  variant="outline-info"
                  onClick={handleShow}
                  className="btn_chee"
                >
                  Régler addition
                </Button>
               {thisOrder?.status!="cooking"&& thisOrder?.status!="ready"?<Button
                  variant="outline-info"
                  onClick={() => navigate("/menu/" + thisOrder?.order_id)}
                  className="btn_chee"
                >
                  <FontAwesomeIcon
                    icon={faEdit}
                    style={{ marginRight: "0.5rem" }}
                  />
                  Modifier la commande
                </Button>:""}
              </div>
            </div>
          </Col>
          <Col xs={4} className="col_h">
            <Ticket order={thisOrder} thisDate={thisDate} />
          </Col>
        </Row>
        <NaviBottom />
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Addition</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col xs={4} style={{ borderRight: "1px solid black" }}>
                <h5>
                  <FontAwesomeIcon
                    icon={faUsers}
                    style={{ color: "#ff6b6b", marginRight: "0.5rem" }}
                  />
                  <b>Nombre de parts :</b>
                </h5>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    marginTop: "15%",
                  }}
                >
                  <FontAwesomeIcon
                    color="#ff6b6b"
                    icon={faAngleLeft}
                    size="2x"
                    onClick={() => {
                      if (part > 1) {
                        setPart(part - 1);
                      }
                    }}
                  />
                  <h3>{part}</h3>
                  <FontAwesomeIcon
                    color="#ff6b6b"
                    icon={faAngleRight}
                    size="2x"
                    onClick={() => {
                      if (part < thisOrder.nbrCouverts) {
                        setPart(part + 1);
                      }
                    }}
                  />
                </div>
              </Col>
              <Col xs={8}>
                <div
                  style={{
                    display: "block",
                    width: "80%",
                    textAlign: "center",
                  }}
                >
                  <h5>Choix de l'addition</h5>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <div
                      onClick={() => settypeRepart("partager")}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faBorderAll}
                        size="6x"
                        color={typeRepart == "partager" ? "#ff6b6b" : "grey"}
                        className="faborder"
                      />
                      <h6>partager</h6>
                    </div>
                    <div
                      onClick={() => settypeRepart("repartir")}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faBorderNone}
                        size="6x"
                        color={typeRepart == "repartir" ? "#ff6b6b" : "grey"}
                        className="faborder"
                      />
                      <h6>Repartir</h6>
                    </div>
                    <Button
                      variant="info"
                      onClick={() => handleAddition()}
                      className="btn_che"
                      style={{ marginLeft: "2rem", backgroundColor: "#ff6b6b" }}
                    >
                      <b>Payer tout</b>
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
            ;
          </Modal.Body>
          <Modal.Footer>
          <Button variant="secondary" onClick={()=>navigate('/main')}>
              Annuler
            </Button>
            <Button variant="secondary" onClick={handleClose}>
              Fermer
            </Button>
            <Button
              className="bgcolor"
              variant="warning"
              onClick={() => handleAddition()}
            >
              Payer
            </Button>
          </Modal.Footer>
        </Modal>
        {/* /////ShowPayModal////// */}
        <Modal show={showPay} onHide={() => setShowPay(false)}>
        {showform?
        <div className="trans_client" >
                   <div className="client_forms">
                   <Form auto>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={clientone.name}
                            type="text"
                            placeholder="nom/prenom"
                            onChange={(e) =>
                              setclientone({ ...clientone, name: e.target.value })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          {clientone.telephone?.length > 0 &&
                          clientone.telephone?.length < 10 ? (
                            <Badge bg="danger">
                              Numero pas valide (10 chiffres obligatoire)
                            </Badge>
                          ) : (
                            ""
                          )}
                          <Typeahead
                            onInputChange={(e) => {
                              setclientone({ ...clientone, phone: e });
                              setOld(false);                       
                            }}
                            onChange={(e) => {
                              handleSelection(e[0]);
                              console.log(e);
                            }}
                            options={clients.map((client) => client.telephone)}
                            placeholder="telephone"
                          />
                        </Col>
                      </Row>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={clientone.message}
                            as="textarea"
                            type="text"
                            placeholder="remarque"
                            onChange={(e) =>
                              setclientone({
                                ...clientone,
                                message: e.target.value,
                              })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={clientone.date}
                            type="date"
                            defaultValue={clientone.date}
                            onChange={(e) =>
                              setclientone({ ...clientone, date: e.target.value })
                            }
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            value={clientone.time}
                            type="time"
                            defaultValue={clientone.time}
                            onChange={(e) =>
                              setclientone({ ...clientone, time: e.target.value })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                  </Form>  
        <Button onClick={()=>handleCreate()}>
          Valider
        </Button>
                   </div>
             
        </div>     
        :""}
         {showtwo?
        <div className="trans_client" >
                   <div className="client_forms">
                   <Form auto>
                   <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          {clientone.telephone?.length > 0 &&
                          clientone.telephone?.length < 10 ? (
                            <Badge bg="danger">
                              Numero pas valide (10 chiffres obligatoire)
                            </Badge>
                          ) : (
                            ""
                          )}
                          <Typeahead
                            onInputChange={(e) => {
                              setclientone({ ...clientone, phone: e });
                              setOld(false);                       
                            }}
                            onChange={(e) => {
                              handleSelection(e[0]);
                              console.log(e);
                            }}
                            options={clients.map((client) => client.telephone)}
                            placeholder="telephone"
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={clientone.name}
                            type="text"
                            placeholder="nom/prenom"
                            onChange={(e) =>
                              setclientone({ ...clientone, name: e.target.value })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                  

          
                   
                  </Form>  
        <Button onClick={()=>handleCreate()}>
          Valider
        </Button>
                   </div>
             
        </div>     
        :""}
          <Modal.Header closeButton>
            <Modal.Title>finaliser Commande</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col xs="5">
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyCoupon();
                  }}
                >
                  <Form.Label>
                    {" "}
                    <b>Paiement Reçu</b>{" "}
                  </Form.Label>
                  <Form.Control
                    onFocus={(e) => {
                      setSelected("pay");
                      keyboard.current.setInput("");
                    }}
                    placeholder="0.00"
                    value={amountPaid}
                    onChange={(e) => {
                      setAmount(e.target.value);
                    }}
                    readOnly
                  />
                </Form>
                <h6 style={{ marginTop: "1rem" }}>
                  {" "}
                  <b>Reste à devoir</b>{" "}
                </h6>
                <h4 style={{ color: "red" }}>
                  <b style={{ display: "flex" }}>
                    {" "}
                    {(
                      thisOrder?.totalPrice +
                      (thisOrder?.totalPrice * tvas) / 100 -
                      amountPaid
                    ).toFixed(2)}
                    {renderHTML(`<i>${currency}</i>`)}
                  </b>
                </h4>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyCoupon();
                  }}
                >
                  <Form.Group
                    style={{ marginTop: "2rem" }}
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                  >
                    <Form.Label>
                      {" "}
                      <b>Details de paiement</b>{" "}
                    </Form.Label>
                    <div style={{ height: "150px", overflow: "auto" }}>
                      {payments.map((e) => (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <h5>{e.type}</h5>
                          <h5>{e.value}€</h5>
                        </div>
                      ))}
                    </div>
                  </Form.Group>
                  <Form.Group
                    style={{ marginTop: "2rem" }}
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                  >
                    <Form.Label>
                      {" "}
                      <b>Scanner code remise</b>{" "}
                    </Form.Label>
                    <Form.Control
                      rows={1}
                      placeholder="*11111111111111*"
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                  </Form.Group>
                </Form>
              </Col>
              <Col xs="5">
                <Form onSubmit={(e) => e.preventDefault()}>
                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>
                      <b>Addition Total</b>
                    </Form.Label>
                    <Form.Control
                      readOnly={true}
                      type="number"
                      placeholder="0.00"
                      value={(
                        thisOrder.totalPrice +
                        (thisOrder?.totalPrice * tvas) / 100
                      ).toFixed(2)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>
                      {" "}
                      <b>Methode de paiement</b>{" "}
                    </Form.Label>
                    <Form.Select
                      aria-label="Default select example"
                      onChange={(e) => setpaymentType(e.target.value)}
                    >
                      <option value="espece">Especes</option>
                      <option value="carte bleu">Carte bleu</option>
                      <option value="ticket restaurant">
                        Ticket restaurant
                      </option>
                      <option value="cheque">Cheque</option>

                      <option value="Glovo">Glovo</option>
                      <option value="Just-Eat">Just-Eat</option>
                      <option value="Deliveroo">Deliveroo</option>
                      <option value="Uber Eats">Uber Eats</option>
                    </Form.Select>
                  </Form.Group>
                </Form>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>
                    <b>Total</b>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </Form.Group>
                <Keyboard
                  theme={"hg-theme-default hg-layout-default myTheme5"}
                  display={{
                    "{bksp}": "EFFACER",
                  }}
                  buttonTheme={[
                    {
                      class: "key_btn3",
                      buttons: "0 1 2 3 4 5 6 7 8 9 , {bksp} {enter}",
                    },
                    {
                      class: "hg-highlight",
                      buttons: "Q q",
                    },
                  ]}
                  keyboardRef={(r) => {
                    console.log(r);
                    keyboard.current = r;
                  }}
                  layoutName={"default"}
                  layout={{
                    default: myLayout,
                  }}
                  onChange={onChange}
                  onKeyPress={onKeyPress}
                />
              </Col>

              <Col xs="2" className="show-pay-modal">
                <Button
                  style={{
                    display: "flex",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "0.5rem",
                    paddingLeft: "2rem",
                  }}
                  onClick={() => {
                    setAmount(amount + 0.5);
                    keyboard.current.setInput(String(amount + 0.5));
                  }}
                >
                  0.5 {renderHTML(`<i>${currency}</i>`)}
                </Button>
                <Button
                  style={{
                    display: "flex",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "0.5rem",
                    paddingLeft: "2rem",
                  }}
                  onClick={() => {
                    setAmount(amount + 1);
                    keyboard.current.setInput(String(amount + 1));
                  }}
                >
                  1 {renderHTML(`<i>${currency}</i>`)}
                </Button>
                <Button
                  style={{
                    display: "flex",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "0.5rem",
                    paddingLeft: "2rem",
                  }}
                  onClick={() => {
                    setAmount(amount + 2);
                    keyboard.current.setInput(String(amount + 2));
                  }}
                >
                  2 {renderHTML(`<i>${currency}</i>`)}
                </Button>
                <Button
                  style={{
                    display: "flex",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "0.5rem",
                    paddingLeft: "2rem",
                  }}
                  onClick={() => {
                    setAmount(amount + 5);
                    keyboard.current.setInput(String(amount + 5));
                  }}
                >
                  5 {renderHTML(`<i>${currency}</i>`)}
                </Button>
                <Button
                  style={{
                    display: "flex",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "0.5rem",
                    paddingLeft: "2rem",
                  }}
                  onClick={() => {
                    setAmount(amount + 10);
                    keyboard.current.setInput(String(amount + 10));
                  }}
                >
                  10 {renderHTML(`<i>${currency}</i>`)}
                </Button>
                <Button
                  style={{
                    display: "flex",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "0.5rem",
                    paddingLeft: "2rem",
                  }}
                  onClick={() => {
                    setAmount(amount + 20);
                    keyboard.current.setInput(String(amount + 20));
                  }}
                >
                  20 {renderHTML(`<i>${currency}</i>`)}
                </Button>
                <Button
                  style={{
                    display: "flex",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "0.5rem",
                    paddingLeft: "2rem",
                  }}
                  onClick={() => {
                    setAmount(amount + 50);
                    keyboard.current.setInput(String(amount + 50));
                  }}
                >
                  50 {renderHTML(`<i>${currency}</i>`)}
                </Button>
                <Button
                  style={{
                    display: "flex",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "0.5rem",
                    paddingLeft: "2rem",
                  }}
                  onClick={() => {
                    setAmount(amount + 100);
                    keyboard.current.setInput(String(amount + 100));
                  }}
                >
                  100 {renderHTML(`<i>${currency}</i>`)}
                </Button>
                <Button
                  style={{
                    display: "flex",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "0.5rem",
                    paddingLeft: "2rem",
                  }}
                  onClick={() => {
                    setAmount(
                      (
                        thisOrder?.totalPrice +
                        (thisOrder?.totalPrice * tvas) / 100
                      ).toFixed(2) - amountPaid
                    );
                    keyboard.current.setInput(
                      String(
                        thisOrder?.totalPrice +
                          (thisOrder?.totalPrice * tvas) / 100 -
                          amountPaid
                      )
                    );
                  }}
                >
                  Payer Tout
                </Button>
                <Button
                  variant="warning"
                  style={{
                    display: "flex",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "0.5rem",
                    paddingLeft: "2rem",
                  }}
                  onClick={() => {
                    setAmount(0);
                    keyboard.current.setInput(String(0));
                  }}
                >
                  Effacer
                </Button>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            {notefrais ? (
              <>
                <Form.Label style={{ fontSize: "24px", fontWeight: "bold" }}>
                  Nbr couverts
                </Form.Label>
                <Form.Control
                  onFocus={(e) => {
                    setSelected("couverts");
                    keyboard.current.setInput("");
                  }}
                  style={{ width: "120px" }}
                  placeholder="1 Couverts"
                  type="number"
                  value={nbrCouverts}
                  onChange={(e) => setNbrCouverts(e.target.value)}
                ></Form.Control>
              </>
            ) : (
              ""
            )}
            <Form.Check
              size="3x"
              type="checkbox"
              label="Note de frais"
              style={{
                fontSize: "24px",
                marginRight: "2rem",
                fontWeight: "bold",
              }}
              onClick={() => setnotefrais(!notefrais)}
            />
            <Button variant="danger" onClick={() => setShowPay(false)}>
              {t("cancel")}
            </Button>
            {!accompte&&!load ? (
              <Button
                variant="success"
                onClick={() => {
                  if (amount > 0) {
                    setamountPaid(amountPaid + amount);
                    handleFinal();
                    keyboard.current.setInput("");
                  } else {
                    console.log("null");
                  }
                }}
              >
                Valider
              </Button>
            ) :load?(
              <Button
                variant="success"
              
              
              >
                 <Spinner animation="border" variant="light" />
              </Button>
            )
            : (
              <Button
                variant="outline-danger"
                onClick={() => {
                  setShowPay(false);
                  handleFinal();
                }}
              >
                Accompte
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Checkout;
