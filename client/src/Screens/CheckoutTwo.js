import axios from "axios";
import React, { useEffect, useRef, useState, useId } from "react";
import {
  Button,
  Container,
  Form,
  Modal,
  Row,
  Col,
  Nav,
  Navbar,
} from "react-bootstrap";
import tableIcon from "./../Shared/table.png";
import serveur from "./../Shared/serveur.png";
import Keyboard from "react-simple-keyboard";

import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router";
import Ticket from "../Components/Ticket";
import { clearOrdersPartage, deletecheckoutData, editordersPartage, setOrderPartage, setPartNotPaid, updateReapartirItems } from "../Slices/order";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import useTranslation from "./../i18";
import logo from "./../Shared/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faBorderAll,
  faBorderNone,
  faCalendarAlt,
  faCashRegister,
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
import Swal from "sweetalert2";
const CheckoutTwo = () => {
  const [payments, setpayments] = useState([]);
  const username = localStorage.getItem("username") || [];

  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { type, part, table_id } = params;
  const ordersData = useSelector((state) => state.order.checkoutData);
  const orderesPartage = useSelector((state) => state.order.ordersPartage);
  const partNotPaid = useSelector((state) => state.order.partNotPaid);
  let thisOrder = ordersData.filter((o) => o.order_id == table_id)[0] || {};
  let check=orderesPartage?.map(e=>Number(e.amountPaid)).reduce((a,b)=>a+b,0)>0;

  const [theseOrders, settheseOrders] = useState([]);
  const [list, setList] = useState([]);
  const [ping, setPing] = useState(true);
  const [show, setShow] = useState(type=="repartir"&&!check);
  const [amount, setAmount] = useState(0);
  const [amountPaid, setamountPaid] = useState(0);
  const [note, setNote] = useState("");
  const [paymentType, setpaymentType] = useState("espece");
  const [showPay, setShowPay] = useState(false);
  const [getkeyborad, setkeyborad] = useState("");
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState("pay");
  const [nbrCouverts, setNbrCouverts] = useState(1);
  const [accompte, setAccompte] = useState(false);
  const [oredertopay, setordertopay] = useState({});
  const [orederpartage, P] = useState([]);
  const [orederepartir, setorederepartir] = useState([]);
 

  const [getclient, setclient] = useState(0);

  const onKeyPress = (button) => {
 
    if (button == "{bksp}") {
      setkeyborad(getkeyborad.slice(0, -1));
      setAmount(Number(amount.toString().slice(0, -1)));
    }
  };
  const keyboard = useRef();
  const [myLayout, setLayout] = useState([
    "9 8 7",
    "6 5 4",
    "3 2 1",
    "0 , {bksp}",
  ]);
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
      setkeyborad(
        Number(
          String(stringValue)
            .replace(new RegExp(parts[0].replace(/\s/g, " "), "g"), "")
            .replace(parts[1], ".")
        ).toString()
      );
      return Number(
        String(stringValue)
          .replace(new RegExp(parts[0].replace(/\s/g, " "), "g"), "")
          .replace(parts[1], ".")
      );
    }
    setInput(input);
   
    if (i < 2) {
      setInput(input);
     
      if (selected == "pay") {
        let v = numberFromLocaleString(input, "fr");
      
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
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  // let tax = (thisOrder.taxPrice * thisOrder.totalPrice) / 100;
  const partageorder = [];
  let tvas = 0;
  let is_alcool = false;
  let test = thisOrder.orderItems;
  thisOrder.orderItems.forEach((element) => {
    if (element.tva == 20) {
      is_alcool = true;
    }
  });
  if (is_alcool == true) {
    tvas = 20;
  } else {
    switch (thisOrder.orderType) {
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
  ////jdid////
  
  const handlefinish = ()=>{
    setShow(false)
let nbr=orderesPartage.filter(e=>e.amount==0).length
dispatch(setPartNotPaid(partNotPaid-nbr))
  }
  useEffect(() => {
  if(type == "partager"){
    let partageorder = []
    for (let i = 1; i <= part; i++){
      let ids = Math.floor((1 + Math.random()) * 0x10000)
      partageorder=[...partageorder,{
        ...thisOrder,
        totalPrice: (thisOrder.totalPrice/part).toFixed(2),
        partId : ids,
        amount: (thisOrder.totalPrice/part).toFixed(2),
        amountPaid: 0,
        payments:[]
       }]
   
    }
    if(orderesPartage.length==0){
      dispatch(setOrderPartage(partageorder))
    }
  }else if (type == "repartir"){
    let items = [];
    thisOrder.orderItems.map(e=>{
        for(let i=1;i<=e.qt;i++){
          let ids = Math.floor((1 + Math.random()) * 0x10000)
          items = [...items,{...e,repatirId:ids}]
        }
    })
    
   
    //////////////////////////////////////////

    let repartirOrder = []
    for (let i = 1; i <= part; i++){
      let ids = Math.floor((1 + Math.random()) * 0x10000)
      repartirOrder=[...repartirOrder,{
        ...thisOrder,
        totalPrice: 0,
        partId : ids,
        amount: 0,
        amountPaid: 0,
        payments:[],
        orderItems:[]
       }]
   
    }
    if(orderesPartage.length==0){
      repartirOrder[0]={...repartirOrder[0],orderItems:[...items],totalPrice:thisOrder.totalPrice,amount:thisOrder.totalPrice}
      dispatch(setOrderPartage(repartirOrder))
     
    }
/////////////////////////    
    
  }
  
 
  
 
 

  
  }, [])
  const handleprint = (order)=>{

    axios.post(
      process.env.REACT_APP_API_HOST +
        ":" +
        process.env.REACT_APP_API_PORT +
        "/api/printorder",
      {
        order: {
          ...order,
          message: note,
        },
      user_id:user_id
      }
    )
  }

  useEffect(() => {
    let totalamount = orderesPartage?.map(e=>Number(e.amount)).reduce((a,b)=>a+b,0)
    let totalamountPaid = orderesPartage?.map(e=>Number(e.amountPaid)).reduce((a,b)=>a+b,0)
 if(partNotPaid==0){
  axios
  .post(
    process.env.REACT_APP_API_HOST +
      ":" +
      process.env.REACT_APP_API_PORT +
      "/api/finalizeorder",
    {
      order: {
        ...thisOrder,
        message: note,
        pay_method: paymentType,
        amount:  totalamountPaid,
        amountPaid: totalamount,
      },
    }
  )
  .then((res) => {
    Swal.fire({
      icon: "success",
      title: "Le paiement effectué avec succès",
      showConfirmButton: false,
      timer: 1000,
    });
    handleExit()
    dispatch(clearOrdersPartage())
   })
 
 }
  }, [partNotPaid])
  
const handlePayment =()=>{

  setordertopay({...oredertopay,amountPaid:oredertopay.amountPaid+amount,amount:(oredertopay.amount-amount).toFixed(2),payments:[...oredertopay.payments,{type:paymentType,value:amount}]})
  dispatch(editordersPartage({...oredertopay,amountPaid:oredertopay.amountPaid+amount,amount:(oredertopay.amount-amount).toFixed(2),payments:[...oredertopay.payments,{type:paymentType,value:amount}]}))
  setAmount(0)
  const orderToPrint ={
    ...oredertopay,
    amountPaid:oredertopay.amountPaid+amount,
    amount:oredertopay.amount-amount,
    payments:[...oredertopay.payments,{type:paymentType,value:amount}],
    nbrCouverts: nbrCouverts,
    message: note,
    pay_method: paymentType,
  }
  if(orderToPrint.amount<=orderToPrint.amountPaid){
    let newPayment = orderToPrint.payments.map(e=>{
       return {amount: e.value,pay_method:e.type}
       
    })

  setShowPay(false)
    axios
        .post(
          process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/printFinalOrder",
          {
            user_id: user_id,
            order: {...orderToPrint,payments:newPayment},
            type: "payertout",
          }
        ).catch((err) => console.log(err));

  }
  
}


  //////////////////////////////////

  // useEffect(() => {
   
  //   if (type == "partager" || "repartir") {
  //     let newOrders = [];
  //     var i = 0;
  //     var t = [];
  //     thisOrder?.orderItems?.forEach((element) => {
  //       const newObj = Object.assign({ ids: i }, element);
      
  //       t.push(newObj);
  //       i++;
  //     });
     
  //     let listData = [t];
     
  //     let vs = [];
  //     var ids;
  //     for (let i = 1; i <= part; i++) {
  //       newOrders.push({
  //         ...thisOrder,
  //         totalPrice: thisOrder.totalPrice,
  //         taxPrice: (thisOrder?.totalPrice * tvas) / 100,
  //         part: part,
  //         type: type,
  //         client: i,
  //         ids: i,
  //       });
  //       if (type == "partager") {
  //         vs.push(
  //           (thisOrder.totalPrice + (thisOrder?.totalPrice * tvas) / 100) / part
  //         );
  //       }
  //     }
  //     localStorage.setItem("partageorder", partageorder);
  //     P(vs);

  //     for (let i = 1; i < part; i++) {
  //       listData = [...listData, []];
  //     }
  //     setList(listData);
  
  //     settheseOrders(newOrders);
   
  //   }
  // }, []);
  const user_id = localStorage.getItem("user_id");

  const handleExit = () => {
    

    // theseOrders.map((lot) => {
     

    //   axios
    //     .post(
    //       process.env.REACT_APP_API_HOST +
    //         ":" +
    //         process.env.REACT_APP_API_PORT +
    //         "/api/printFinalOrder",
    //       {
    //         user_id: user_id,
    //         order: {
    //           ...lot,
    //           tvas: tvas,
    //           nbrCouverts: lot.nbrCouverts,
    //           table_number: lot.table || "",
    //           order_id: lot.order_id,
    //           Date: new Date(),
    //           amount:
    //             amount > lot?.totalPrice + (lot?.totalPrice * tvas) / 100
    //               ? lot?.totalPrice +
    //                 ((lot?.totalPrice * tvas) / 100).toFixed(2) -
    //                 amountPaid
    //               : amount - amountPaid,
    //           amountPaid: amount,
    //           paymentType: paymentType,
    //           numbrpayment: payments[lot.client - 1],
    //         },
    //         type: type,
    //         part: part,
    //         pricepart: lot.pricepart,
    //       }
    //     )
    //     .then((res) => {})
    //     .catch((err) => console.log(err));
    //   setShowPay(false);
    // });
    navigate("/main");
    dispatch(deletecheckoutData({ order_id: table_id }));
  };

  const handleFinal = (arryofswitch, client) => {
    

    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/finalizeorder",
        {
          order: {
            ...thisOrder,
            message: note,
            pay_method: paymentType,
            amount: amount,
            amountPaid: amountPaid,
          },
        }
      )
      .then((res) => {
        
        axios
        .post(
          process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/printFinalOrder",
          {
            user_id: user_id,
            order: {
              ...thisOrder,
            nbrCouverts: nbrCouverts,
            message: note,
            pay_method: paymentType,
            amount: amount/part,
            amountPaid: amountPaid,
            totalPrice:thisOrder.totalPrice/part
            },
            type: type,
            part: part,
            pricepart: thisOrder.totalPrice/part,
          }
        )
        .then((res) => {})
        .catch((err) => console.log(err));
        setamountPaid(0);
        setShowPay(true);

        for (let index = 0; index <= part - 1; index++) {
          if (payments.length == 0) {
            let ts = [];
            for (let i = 0; i <= part - 1; i++) {
              ts.push([]);
            }
          
            if (index == oredertopay.client - 1) {
              ts[index] = [{ type: paymentType, value: amount }];
              setpayments(ts);
            }
          } else {
            let t = payments;
            if (index == oredertopay.client - 1) {
              t[index] = [...t[index], { type: paymentType, value: amount }];
              setpayments(t);
            }
          }
        }
       

        const isAllZero = arryofswitch.every((item) => item === 0);
        if (arryofswitch[client] == 0) {
          setShowPay(false);
        } else {
          console.log("not paid yet");
        }
        if (isAllZero) {
          handleExit();
        }
        /*  if (amountPaid >= thisOrder.totalPrice + thisOrder.taxPrice) {
          handleExit();
        } */
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const renderHTML = (rawHTML: string) =>
    React.createElement("div", {
      dangerouslySetInnerHTML: { __html: rawHTML },
    });
  const currency = localStorage.getItem("currency");

  const { t } = useTranslation();
  const handleFinalize = () => {
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/finalizeorder",
        {
          order: thisOrder,
        }
      )
      .then((res) => {
       
        dispatch(deletecheckoutData({ table_id: table_id }));
        navigate("/main");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //DRAG /////////////////////

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };
  
  const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};

    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;
    return result;
  };

  const grid = 8;

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "grey",

    // styles we need to apply on draggables
    ...draggableStyle,
  });
  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 250,
  });

  function onDragEnd(result) {
   
     dispatch(updateReapartirItems(result))
    // dropped outside the list
    
  }

  // const handleRepart = () => {
  //   let copy = theseOrders.map((order, key) => ({
  //     ...order,
  //     orderItems: [...list[key]],
  //   }));

  //   var repatir = [];
  //   var tax = [];
  //   var sums = [];
  //   for (let indexs = 0; indexs < copy.length; indexs++) {
  //     const element = copy[indexs];
     
  //     let sum = 0;
  //     let sum2 = 0;
  //     let tva = 0;
  //     for (let index1 = 0; index1 < element.orderItems.length; index1++) {
  //       const element1 = element.orderItems[index1];
  //       sum = sum + element1.price + (element1.tva / 100) * element1.price;
  //       sum2 = sum2 + element1.price;
  //       tva = tva + (element1.tva / 100) * element1.price;
  //     }
  //     repatir.push(sum);
  //     tax.push(tva);
  //     sums.push(sum2);
  //   }

  //   P(repatir);
   
  //   var y = [];
  //   for (let index = 0; index < repatir.length; index++) {
  //     const element = repatir[index];
  //     const newObj = Object.assign({ pricepart: element }, copy[index]);
  //     newObj.totalPrice = sums[index];
  //     newObj.taxPrice = tax[index];
  //     y.push(newObj);
  //   }
  //   settheseOrders(y);

  //   handleClose();
  //   setPing(!ping);
  // };
  return (
    <div
      style={{
        backgroundColor: "white",
        width: "100%",
        // height: "100vh",
      }}
    >
      <Navbar
        variant="warning"
        style={{ backgroundColor: "#ff6b6b", height: "70px" }}
      >
        <Container>
          <Navbar.Brand>
            <div class="logo-container">
              <img id="chrome" class="logo" src={logo} />
            </div>
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link onClick={() => {navigate("/main");dispatch(clearOrdersPartage())}}>
              <img width="45px" src={tableIcon} />
            </Nav.Link>
            <Nav.Link>
              <h6
                style={{ color: "white", paddingTop: "1rem" }}
                className="checkout-2-agenda"
              >
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  style={{ marginRight: "5px" }}
                />
                Agenda
              </h6>
            </Nav.Link>
            {!check&&type=="repartir"?<Nav.Link>
              <h6
                style={{ color: "white", paddingTop: "1rem" }}
                className="checkout-2-agenda"
                onClick={()=>setShow(true)}
              >
                <FontAwesomeIcon
                  icon={faEdit}
                  style={{ marginRight: "5px" }}
                />
                Repartir
              </h6>
            </Nav.Link>:''}
            
            <Nav.Link onClick={() => navigate("/cloture")}>
              <h6
                style={{ color: "white", paddingTop: "1rem" }}
                className="checkout-2-chasier"
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
            className="checkout-2-server"
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
            {/* <FontAwesomeIcon
              onClick={() => handleDisconnect()}
              size="2x"
              icon={faSignOutAlt}
              style={{ marginLeft: "0.5rem", paddingTop: "0.5rem" }}
            /> */}
          </h6>
        </Container>
      </Navbar>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Repartir</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: "flex" }}>
            <DragDropContext onDragEnd={onDragEnd}>
              {orderesPartage?.map((el, ind) => (
                <Droppable key={ind} droppableId={ind?.toString()}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                      {...provided.droppableProps}
                    >
                      <h6>{`personne ${ind + 1}`}</h6>
                      {el.orderItems.map((item, index) => (
                        <Draggable
                          key={item.repatirId}
                          draggableId={item.repatirId?.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-around",
                                }}
                              >
                                {item.name}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </DragDropContext>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary"  onClick={()=>handlefinish()} >
            Terminer
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="co2">
        {orderesPartage?.map((order) =>
     <div className="checkout2">
     <Ticket order={order} ping={ping} />
     {order.amount>order.amountPaid?
     <Button
       variant="success"
       className="c2btn"
       onClick={() => {
         setordertopay(order);
         setShowPay(true);
        
        
       }}
     >
       Impayé
     </Button>:
     <Button
       variant="disabled"
       className="c2btn"
     
     >
       Payée
     </Button>
    
      }
       <Button onClick={()=>handleprint(order)}
       variant="primary"
       className="c2btn"
     
     >
       imprimer
     </Button>
     
   </div>
           
          // ) : (
          //   <div className="checkout2">
          //     <Ticket order={order} ping={ping} />
          //     <Button
          //       variant="outlined"
          //       color="error"
          //       className="c2btn"
          //       startIcon={<FcPaid />}
          //       Disabled
          //     >
          //       payé
          //     </Button>
          //   </div>
          
        )}
      </div>
      {/* <Button variant="success" onClick={() => handleFinalize()}>
        Finaliser
      </Button> */}
      {/* /////ShowPayModal////// */}
      <Modal show={showPay} onHide={() => setShowPay(false)}>
        <Modal.Header closeButton>
          <Modal.Title>finaliser Commande</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col xs="5">
              <Form onSubmit={(e) => e.preventDefault()}>
                <Form.Label>Paiement Reçu</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  value={oredertopay.amountPaid}
                  // onChange={(e) => {setAmount(e.target.value)}}
                />
              </Form>
              <h6 style={{ marginTop: "1rem" }}>Monnaie</h6>
              <h4 style={{ color: "red" }}>
                <b>
                  {oredertopay.amount}
               
                </b>
              </h4>
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
                  {oredertopay?.payments?.map((e) => (
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
            </Col>
            <Col xs="5">
              <Form onSubmit={(e) => e.preventDefault()}>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Paiement total</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0.00"
                    value={
                      oredertopay.totalPrice
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Methode de paiement</Form.Label>
                  <Form.Select
                    aria-label="Default select example"
                    onChange={(e) => setpaymentType(e.target.value)}
                  >
                    <option value="espece">Especes</option>
                    <option value="carte bleu">Carte bleu</option>
                    <option value="ticket restaurant">Ticket restaurant</option>
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
                  onChange={(e)=>setAmount(Number(e.target.value))}
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
                keyboardRef={(r) => (keyboard.current = r)}
                layoutName={"default"}
                layout={{
                  default: myLayout,
                }}
                onChange={onChange}
                onKeyPress={onKeyPress}
              />
            </Col>

            <Col xs="2">
              <h4>Cash</h4>
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
                  setkeyborad((amount + 0.5).toString());
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
                  setkeyborad((amount + 1).toString());
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
                  setkeyborad((amount + 2).toString());
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
                  setkeyborad((amount + 5).toString());
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
                  setkeyborad((amount + 10).toString());
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
                  setkeyborad((amount + 20).toString());
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
                  setkeyborad((amount + 50).toString());
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
                  setkeyborad((amount + 100).toString());
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
                   
                  }}
                  onClick={() => {
                    
                    setAmount(
                      Number(oredertopay?.amount).toFixed(2)
                    );
                    // setkeyborad(((orederpartage[oredertopay.client - 1]).toFixed(2)).toString());
                  }}
                >
                  Payer Tout
                </Button>
              <Button
                variant="danger"
                style={{
                  display: "flex",
                  width: "100%",
                  textAlign: "center",
                  marginBottom: "0.5rem",
                  paddingLeft: "2rem",
                }}
                onClick={() => {setAmount(0);setkeyborad((0).toString())}}
              >
                Effacer
              </Button>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowPay(false)}>
            {t("cancel")}
          </Button>
          {!accompte ? (
            <Button
              variant="success"
              onClick={()=>handlePayment()}
               
            >
              Valider
            </Button>
          ) : (
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
    </div>
  );
};

export default CheckoutTwo;
