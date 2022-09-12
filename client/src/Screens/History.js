import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Nav, Navbar, Table } from "react-bootstrap";
import {
 
  faCalendarAlt,
  faCashRegister,
  faCheckSquare,
  
  faEdit,
  faGlobe,
 
  faSignOutAlt,
  faTimes,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router";
import tableIcon from "./../Shared/table.png";
import useTranslation from "./../i18";
import NaviBottom from "../Components/NaviBottom";
import { useDispatch, useSelector } from "react-redux";
import logo from "./../Shared/logo.png";
import serveur from "./../Shared/serveur.png";
import cc from "./../Shared/cc.png";
import delivery from "./../Shared/delivery.png";
import takeout from "./../Shared/takeout.png";
import cash from "./../Shared/cash.jpg";
import surplace from "./../Shared/surplace.png";
import borne from "./../Shared/borne.png";
import $ from "jquery";
import Ticket from "../Components/Ticket";
import _, { now } from "lodash";
import { TokenExpiredError } from "jsonwebtoken";
import axios from "axios";
import { addNewcheckoutData, setCheckoutChange } from "../Slices/order";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import updateSound from "../Shared/updateorder.wav";
import bornSound from "../Shared/born-sound.mp3";
const socket = io.connect(process.env.REACT_APP_API_SOCKET);
const History = () => {
  const [audioBorn, setaudioBorn] = useState(new Audio(bornSound));
  const username = localStorage.getItem("username") || "";
  const tables = useSelector((state) => state.data.tables);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState({});
  const tva_mode = useSelector((state) => state.data.tva_mode);
  const [rab_tva, setRab_tva] = useState(0);
  const [newOrders, setnewOrders] = useState([]);
  const user_id = localStorage.getItem("user_id");
  var curr = new Date();
  var date = curr.toISOString().substring(0, 10);
  var time = curr.getHours() + ":" + curr.getMinutes();
  console.log(date, time);
  const dispatch = useDispatch();

  var myTime = curr.getTime();
  console.log(myTime);

  const params = useParams();
  const { type } = params;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const orders = useSelector((state) => state.data.orderHistory) || [];
  
  let checkoutData = useSelector((state) => state.order.checkoutData);
  /**
   * @typedef {string} string
   */

  console.log("za",checkoutData);
  const renderHTML = (rawHTML: string) =>
    React.createElement("div", {
      dangerouslySetInnerHTML: { __html: rawHTML },
    });
  const currency = localStorage.getItem("currency");

  const table = ({ e }) => {
    console.log(e);
    return tables.find((table) => table.id == e);
  };
  
  const handleDisconnect = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    navigate("/");
  };

  const handleEditOrder = (id) => {
    navigate("/menu/" + id);
  };
  const handlePreview = ({ order }) => {
    let toOrder = _.clone(order);
    toOrder = {
      ...toOrder,
      order_id: toOrder.id,
      taxPrice: toOrder.tva,
      totalPrice: toOrder.price,
    };
    toOrder.orderItems = toOrder.orderItems.map((item) => ({
      ...item,
      qt: item.quantity,
    }));
    setSelectedOrder(toOrder);
    setShowPreview(true);
  };
  var groupBy = function (xs, key) {
    return xs?.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x.value);
      return rv;
    }, {});
  };

  // const calcOrder = (order) => {
  //   let price = order.price;
  //   let tva = order.tva;
  //   if (
  //     selectedOrder.order_type == "surplace" ||
  //     selectedOrder.order_type == "livraison"
  //   ) {
  //     tva = tva_mode.find((e) => e.nom == "surplace").valeur;
  //   } else if (selectedOrder.order_type == "emporter") {
  //     tva = tva_mode.find((e) => e.nom == "emporter").valeur;
  //   }
  //   if (rab_tva > 0) {
  //     tva = rab_tva;
  //   }
  //   if (order.extras && order.extras.length) {
  //     console.log("has extra");
  //     order.extras.map((extra) => {
  //       console.log(extra.price, extra.default_quantity);
  //       price += extra.price * extra.default_quantity;
  //     });
  //   }
  //   if (order.stepItems && order.stepItems != {}) {
  //     Object.keys(order.stepItems).map((e) => {
  //       order.stepItems[e].map((item) => {
  //         price += item.price;
  //       });
  //     });
  //   }

  //   if (order.offert == true) {
  //     return 0;
  //   } else
  //     return {
  //       dbPrice: price,
  //       price: price * order.qt,
  //       tva: (price * order.qt * tva) / 100,
  //       item_tva: tva,
  //     };
  // };

  let b = [];
  useEffect(() => {
    let copy = _.clone(selectedOrder?.orderItems || [{}]);
    console.log("salaaam", copy);
    setnewOrders(copy);
    selectedOrder.orderItems?.map((order) => {
      if (order.is_alcool == true) {
        let tva_alcool = tva_mode.find((e) => e.nom == "alcool").valeur;
        console.log(tva_alcool);
        setRab_tva(tva_alcool);
      }
    });
  }, [selectedOrder]);
  const calcTotal = () => {
    let tot = 0;
    let tva = 0;
    let tvas = [];
    newOrders.map((order) => {
      tot += order.price;
      tva += order.tva;
      tvas.push({
        value: order.tva,
        perc: (order.tva / order.price) * 100,
      });
    });
    return { tot, tva, tvas };
  };

  const handlePrint = () => {
    setShowPreview(false);
    let order = {
      from_kiosk:false,
      table: selectedOrder?.table_number || "",
      client_id: selectedOrder?.customer_id || 0,
      order_id: selectedOrder.id,
      message: selectedOrder.message || "aucune",
      customer_name: selectedOrder?.customer_name || "",
      customer_company: selectedOrder?.customer_company || "",
      code1: selectedOrder?.code1 || "",
      code2: selectedOrder?.code2 || "",
      interphone: selectedOrder?.interphone || "",
      etage: selectedOrder?.etage || "",
      table_number: selectedOrder?.table_number || 0,
      customer_tel: selectedOrder?.customer_tel || "",
      customer_adress: selectedOrder?.customer_adress,
      status: selectedOrder?.status,
      orderType: selectedOrder?.order_type,
      paymentType: selectedOrder?.pay_method,
      totalPrice: selectedOrder?.price,
      taxPrice: selectedOrder?.tva,
      tvas: calcTotal().tvas,
      orderItems: [],
      date: selectedOrder?.date,
      time: selectedOrder?.time,
    };
    console.log(calcTotal().tvas);
    newOrders.map((one) => {
      order.orderItems.push({
        ...one,
        price: one.price,
        tva: one.tva,
      });
    });

    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/printOrder",
        {
          kitchen: false,
          user_id: user_id,
          order: {
            new: false,
            ...order,
            tvas: groupBy(calcTotal().tvas, "perc"),
            Date: new Date(),
            nbrCouverts: 1,
          },
        }
      )
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
  };

  //kitchen update order

  const [soundUpdate, setSoundUpdate] = useState(new Audio(updateSound));
  
  // useEffect(() => {
    
  //   socket.on(`ping${user_id}`, (data) => {
  // console.log("data",data)
  //     audioBorn.play()
  //     Swal.fire({
  //       icon: "success",
  //       title: 
  //       "<h5 >" +
  //       `Une commande a eté ajouter ` +
  //       "</h5>",
  //       showConfirmButton: false,
  //       timer: 2500,
  //     });
  // })
  //   socket.on(`ping${user_id}`, (order) => {
  //    console.log("zezea",order)
  //     soundUpdate.play()
  //     dispatch(setCheckoutChange({order:order}))
  //     if(order.status=="cooking"){
  //       Swal.fire({
  //         icon: "success",
  //         title: 
  //         "<h5 >" +
  //         `La commande <span style='color:green'>${order.order_id}€</span> en préparation` +
  //         "</h5>",
          
  //         showConfirmButton: false,
  //         timer: 2500,
  //       });
  //     } else {
  //       Swal.fire({
  //         icon: "success",
  //         title: 
  //         "<h5 >" +
  //         `La commande <span style='color:green'>${order.order_id}€</span> a été prêtée` +
  //         "</h5>",
  //         showConfirmButton: false,
  //         timer: 2500,
  //       });
        
  //     }
      
    
  //   })
  
  //  console.log("orders",checkoutData)
  // }, [socket])
  

  return (
    <div className="main_bg">
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
                className="caiss-h6"
              >
                <FontAwesomeIcon
                  icon={faCashRegister}
                  style={{ marginRight: "5px" }}
                />
                {t("cashier")}
              </h6>
            </Nav.Link>
            <Nav.Link onClick={() => handleDisconnect()}>
              <h6
                style={{ color: "white", paddingTop: "1rem" }}
                className="log-out"
              >
                <FontAwesomeIcon
                  icon={faSignOutAlt}
                  style={{ marginRight: "5px" }}
                />
                {t("disconnect")}
              </h6>
            </Nav.Link>
          </Nav>
          <h6
            className="server-icon"
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
      <Col  style={{ backgroundColor: "white" }} fluid>
        <Table hover className="ttt">
          <thead className="tbds">
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Table</th>
              <th>date</th>
              <th>order</th>
              <th>Prix</th>
              {type == "all" ? <th>Reglement</th> : ""}
              {type == "encours" ? <th>statut</th> : ""}
              <th>Paiement </th>
            </tr>
          </thead>
          <tbody className="scro">
            {type == "encours" 
              ? checkoutData
                  ?.slice()
                  ?.sort((a, b) => b.id - a.id)
                  ?.filter((e) =>
                    
                      
                       (e.status == "pending"||e.status == "cooking"||e.status == "ready") && e.date == date
                  )
                  .map((order, key) => {
                    let tva = 0;
                    let is_alcool = false;
                    let test = order.orderItems;
                    order?.orderItems?.forEach((element) => {
                      if (element.is_alcool == true) {
                        is_alcool = true;
                      }
                    });
                    if (is_alcool == true) {
                      tva = 20;
                    } else {
                      switch (order.orderType) {
                        case "surplace":
                          tva = 10;
                          break;
                          case "sur place":
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
                    return (
                      <tr>
                        <td>
                          {order.status == "pending" ? (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-evenly",
                              }}
                            >
                              <FontAwesomeIcon
                                size="2x"
                                style={{ cursor: "pointer" }}
                                icon={faEdit}
                                color="#42d4cb"
                                onClick={() =>
                                  handleEditOrder(
                                    order.order_id == undefined
                                      ? order.id
                                      : order.order_id
                                  )
                                }
                              />
                              <FontAwesomeIcon
                                size="2x"
                                style={{ cursor: "pointer" }}
                                icon={faCashRegister}
                                color="#ff6b6b"
                                onClick={() =>
                                  navigate(
                                    "/checkout/" +
                                      (order.order_id == undefined
                                        ? order.id
                                        : order.order_id)
                                  )
                                }
                              />
                            </div>
                          ) :order.status == "cooking"?
                          (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-evenly",
                              }}
                            >
                              <FontAwesomeIcon
                                size="2x"
                                style={{ cursor: "pointer" }}
                                icon={faUtensils}
                                color="#42d4cb"
                            
                              />
                              <FontAwesomeIcon
                                size="2x"
                                style={{ cursor: "pointer" }}
                                icon={faCashRegister}
                                color="#ff6b6b"
                                onClick={() =>
                                  navigate(
                                    "/checkout/" +
                                      (order.order_id == undefined
                                        ? order.id
                                        : order.order_id)
                                  )
                                }
                              />
                            </div>
                          ) :order.status == "ready"?
                          (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-evenly",
                              }}
                            >
                                <FontAwesomeIcon
                              icon={faCheckSquare}
                              color="green "
                            />
                              <FontAwesomeIcon
                                size="2x"
                                style={{ cursor: "pointer" }}
                                icon={faCashRegister}
                                color="#ff6b6b"
                                onClick={() =>
                                  navigate(
                                    "/checkout/" +
                                      (order.order_id == undefined
                                        ? order.id
                                        : order.order_id)
                                  )
                                }
                              />
                            </div>
                          )                          
                          :  (
                            <FontAwesomeIcon
                              icon={faCheckSquare}
                              color="green "
                            />
                          )}
                        </td>
                        <td>
                          {order?.orderType==undefined? "de borne":order.orderType}
                          {order.orderType == "surplace" ? (
                            <img
                              src={surplace}
                              width={32}
                              height={32}
                              style={{ marginLeft: "0.5rem" }}
                            />
                          ) :order.orderType == "emporter" ?
                          (
                            <img
                              src={takeout}
                              width={32}
                              height={32}
                              style={{ marginLeft: "0.5rem" }}
                            />
                          ):order.orderType == "livraison" ?(
                            <img
                              src={delivery}
                              width={32}
                              height={32}
                              style={{ marginLeft: "0.5rem" }}
                            />
                          ):(
                            <img
                              src={borne}
                              width={40}
                              height={40}
                              style={{ marginLeft: "0.5rem" }}
                            /> 
                          )}
                        </td>
                        <td>
                          Table : {table({ e: order.table_number })?.numero}
                        </td>
                        <td>{order.date + "-" + order.time}</td>
                        <td>
                          {"#" +
                            (order.order_id == undefined
                              ? order.id
                              : order.order_id)}
                        </td>
                        <td>
                          <b style={{ display: "flex", color: "red" }}>
                            {}
                            {order.totalPrice == undefined
                              ? order.price + order.taxPrice
                              : order.totalPrice+order.taxPrice}{" "}
                            {renderHTML(`<i>${currency}</i>`)}
                          </b>
                        </td>
                        <td>
                          {order.status=="pending"?
                          <b>En attente</b>:
                           order.status=="cooking"?
                           <b style={{color:"orange"}}> En préparation</b>:
                           <b style={{color:"green"}}> Prête</b>
                          
                          }
                        </td>
                        <td>
                          <b>En cours</b>
                       
                        
                        </td>
                       
                      </tr>
                    );
                  })
              :
              type=="annules"?
              checkoutData
              ?.slice()
              ?.sort((a, b) => b.id - a.id)
              ?.filter((e) =>
                type == "avenir"
                  ? e.date > date
                  : e.status == "rejected" && e.date == date
              )
              .map((order, key) => {
                let tva = 0;
                let is_alcool = false;
                let test = order.orderItems;
                order.orderItems.forEach((element) => {
                  if (element.is_alcool == true) {
                    is_alcool = true;
                  }
                });
                if (is_alcool == true) {
                  tva = 20;
                } else {
                  switch (order.orderType) {
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
                      tva = 5.5;
                      break;
                  }
                }
                return (
                  <tr>
                    <td>
                      {order.status == "pending" ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-evenly",
                          }}
                        >
                          <FontAwesomeIcon
                            size="2x"
                            style={{ cursor: "pointer" }}
                            icon={faEdit}
                            color="#42d4cb"
                            onClick={() =>
                              handleEditOrder(
                                order.order_id == undefined
                                  ? order.id
                                  : order.order_id
                              )
                            }
                          />
                          <FontAwesomeIcon
                            size="2x"
                            style={{ cursor: "pointer" }}
                            icon={faCashRegister}
                            color="#ff6b6b"
                            onClick={() =>
                              navigate(
                                "/checkout/" +
                                  (order.order_id == undefined
                                    ? order.id
                                    : order.order_id)
                              )
                            }
                          />
                        </div>
                      ) : (
                        <FontAwesomeIcon
                          icon={faTimes}
                          color="red"
                        />
                      )}
                    </td>
                    <td>
                      {order.orderType}
                      {order.orderType == "surplace" ? (
                        <img
                          src={surplace}
                          width={32}
                          height={32}
                          style={{ marginLeft: "0.5rem" }}
                        />
                      ) :order.orderType == "emporter" ?
                      (
                        <img
                          src={takeout}
                          width={32}
                          height={32}
                          style={{ marginLeft: "0.5rem" }}
                        />
                      )
                      : (
                        <img
                          src={delivery}
                          width={32}
                          height={32}
                          style={{ marginLeft: "0.5rem" }}
                        />
                      )}
                    </td>
                    <td>
                      Table : {table({ e: order.table_number })?.numero}
                    </td>
                    <td>{order.date + "-" + order.time}</td>
                    <td>
                      {"#" +
                        (order.order_id == undefined
                          ? order.id
                          : order.order_id)}
                    </td>
                    <td>
                      <b style={{ display: "flex", color: "red" }}>
                        {}
                        {order.totalPrice == undefined
                          ? order.price + (order.tva*order.price/100)
                          : order.totalPrice+order.taxPrice}{" "}
                        {renderHTML(`<i>${currency}</i>`)}
                      </b>
                    </td>
                    <td>
                      <b>Annuler</b>
                      {/* {order.paymentType == "espece" ? (
                      <img
                        src={cash}
                        width={32}
                        height={32}
                        style={{ marginLeft: "0.5rem" }}
                      />
                    ) : order.paymentType == "Carte Bancaire" ? (
                      <img
                        src={cc}
                        width={32}
                        height={32}
                        style={{ marginLeft: "0.5rem" }}
                      />
                    ) : (
                      ""
                    )} */}
                    
                    </td>
                  </tr>
                );
              })
              :type== "avenir"? ""
              : orders
                  ?.slice()
                  ?.sort((a, b) => b.id - a.id)
                  .filter(
                    (item) => item.paymentsInDb && item.paymentsInDb.length > 0
                  )
                  .map((order, key) => {
                    let tva = 0;
                    let is_alcool = false;
                    let test = order.orderItems;
                    order.orderItems.forEach((element) => {
                      if (element.is_alcool == true) {
                        is_alcool = true;
                      }
                    });
                    if (is_alcool == true) {
                      tva = 20;
                    } else {
                      let iss =
                        order.orderType == undefined
                          ? order.order_type
                          : order.orderType;
                      switch (iss) {
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
                    return (
                      <tr onClick={() => handlePreview({ order })}>
                        <td>
                          {order.source == 1 ? (
                            <>
                              <FontAwesomeIcon
                                icon={faGlobe}
                                color="blue"
                                style={{ marginRight: "0.5rem" }}
                              />
                              <b>Enligne</b>
                            </>
                          ) : (
                            <FontAwesomeIcon
                              icon={faCheckSquare}
                              color="green"
                            />
                          )}
                        </td>
                        <td style={{ display: "flex" }}>
                          {order.order_type}
                          {order.order_type == "surplace" ? (
                            <img
                              src={surplace}
                              width={32}
                              height={32}
                              style={{ marginLeft: "0.5rem" }}
                            />
                          ) : order.order_type == "emporter" ? (
                            <img
                              src={takeout}
                              width={32}
                              height={32}
                              style={{ marginLeft: "0.5rem" }}
                            />
                          ) : (
                            <img
                              src={delivery}
                              width={32}
                              height={32}
                              style={{ marginLeft: "0.5rem" }}
                            />
                          )}
                        </td>
                        <td>
                          Table :{" "}
                          {table({ e: order.table_number })?.numero || "N/A"}
                        </td>
                        <td>{order.date + "-" + order.time}</td>
                        <td>{"#" + order.id}</td>
                        <td>
                          <b style={{ display: "flex", color: "#ff6b6b" }}>
                            {order.source != 3
                              ? (
                                  order.price +
                                  (order.price * tva) / 100
                                ).toFixed(2)
                              : order.price + (order.tva*order.price/100)}{" "}
                            {renderHTML(`<i>${currency}</i>`)}
                          </b>
                        </td>
                        <td>
                          <b style={{ display: "flex", color: "#ff6b6b" }}>
                            {order.how_paid}
                          </b>
                        </td>
                        <td>
                          {[
                            ...new Set(
                              order.paymentsInDb.map(
                                (words) => words.pay_method
                              )
                            ),
                          ].map((pay) => {
                          

                            /*  const sumWithInitial = array1.reduce(
                              (previousValue, currentValue) =>
                                previousValue + currentValue,
                              initialValue
                            );*/
                            return <b>{pay}-</b>;
                          })}
                          {/* <b>
                          {order.pay_method == "espece"
                            ? "Especes"
                            : order.pay_method == "Carte Bancaire" ||
                              order.pay_method == 1
                            ? "Carte Bancaire"
                            : "Especes"}
                        </b>
                        {order.pay_method == "espece" ||
                        order.pay_method == 2 ? (
                          <img
                            src={cash}
                            width={32}
                            height={32}
                            style={{ marginLeft: "0.5rem" }}
                          />
                        ) : order.pay_method == "Carte Bancaire" ||
                          order.pay_method == 1 ? (
                          <img
                            src={cc}
                            width={32}
                            height={32}
                            style={{ marginLeft: "0.5rem" }}
                          />
                        ) : (
                          ""
                        )} */}
                        </td>
                      </tr>
                    );
                  })}
          </tbody>
        </Table>
        {showPreview && (
          <div className="preview">
            <FontAwesomeIcon
              onClick={() => setShowPreview(false)}
              icon={faTimes}
              size="2x"
              style={{ position: "absolute", right: "5px" }}
            />
            <div className="scr">
              <Ticket order={selectedOrder} />
            </div>
            <Button
              onClick={handlePrint}
              variant="danger"
              style={{
                height: "50px",
                width: "100%",
                bottom: "0",
                position: "absolute",
              }}
            >
              Imprimer
            </Button>
          </div>
        )}
      </Col >
      <NaviBottom />
    </div>
  );
};

export default History;
