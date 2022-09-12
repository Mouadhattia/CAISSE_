import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Table, Button, Alert, Modal, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import image from "./../Shared/bgg.png";
import cartbg from "./../Shared/cartbg.png";
import {
  addNewcheckoutData,
  cancelOrder,
  clearOrders,
  deletecheckoutData,
  deleteOrder,
  setCheckoutChange,
  setNewCurrentOrder,
  setNewOrder,
  setOrderChange,
} from "../Slices/order";
import useTranslation from "./../i18";
import {
  faCheck,
  faMinusCircle,
  faMinusSquare,
  faPlusCircle,
  faPlusSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import axios from "axios";
import useLongPress from "./useLongPress";
import RemiseModal from "./RemiseModal";
// import { forEach } from "lodash";
// import e from "cors";
import io from "socket.io-client";

const CartMenu = ({ selectedTable, setconfirmed, confirmed }) => {
  const username = localStorage.getItem("username")
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { nbr, nbrCouverts } = selectedTable;
  const [total, setTotal] = useState(0);
  const [step, setstep] = useState(1);
  const nsteps = useSelector((state) => state.data.nSteps);
  const [selected, setselected] = useState(0);
  const table_number = useSelector((state) => state.order.selectedTable.id);
  const client = useSelector((state) => state.order.client);
  const remarque = useSelector((state) => state.order.remarque);

  const params = useParams();
  const { order_id } = params;
  const checkOutData = useSelector((state) => state.order.checkoutData || []);
  const [late_order_id, setlate_order_id] = useState(0);

  const orders = useSelector((state) => state.order.orders || []);

  const [newOrders, setnewOrders] = useState([]);
  const [orderTo, setOrderTo] = useState({ order: {}, key: 0 });
  const [ShowModifyModal, setShowModifyModal] = useState(false);

  const tva_mode = useSelector((state) => state.data.tva_mode);
  const orderType = useSelector((state) => state.order.orderType);
  const [rab_tva, setRab_tva] = useState(0);
  const products = useSelector((state) => state.data.products);
  const user_id = localStorage.getItem("user_id");
  const user = localStorage.getItem("username");
  const [newCommande, setNewCommande] = useState({})
  const currentOrder = checkOutData.filter((e) => e.order_id == order_id)[0];
  // const tva = localStorage.getItem("tva");

  useEffect(() => {

    if (order_id != undefined) {
      console.log(currentOrder);
      currentOrder?.orderItems?.map((item) => {
        dispatch(setNewOrder({ order: item }));
      });
    }
  }, []);

  const findProductWithId = (id) => {
    return products.find((prod) => prod.id == id) || {};
  };

  const calcOrder = (order) => {
    //test

    let price;
    if (order?.finalPrice) {
      price = order.finalPrice;
    } else if (order?.finalPrice == 0) {
      price = 0;
    } else {
      price = order.price;
    }
    //

    let tva = order.tva;
    if (orderType == "surplace" || orderType == "livraison") {
      tva = tva_mode.find((e) => e.nom == "surplace").valeur;
    } else if (orderType == "emporter") {
      tva = tva_mode.find((e) => e.nom == "emporter").valeur;
    }
    if (rab_tva > 0) {
      tva = rab_tva;
    }
    if (order.extras && order.extras.length) {
     
      order.extras.map((extra) => {
        console.log(extra.price, extra.default_quantity);
        price += extra.price * extra.default_quantity;
      });
    }
    if (order.stepItems && order.stepItems != {}) {
      Object.keys(order.stepItems).map((e) => {
        order.stepItems[e].map((item) => {
          price += item.price;
        });
      });
    }

    if (order.offert == true) {
      return 0;
    } else
      return {
        dbPrice: price,
        price: price * order.qt,
        tva: (price * order.qt * tva) / 100,
        item_tva: tva,
      };
  };

  useEffect(() => {
    let copy = JSON.parse(JSON.stringify(orders) || [{}]);
   
    setnewOrders(copy);
    orders.map((order) => {
      if (order.is_alcool == true) {
        let tva_alcool = tva_mode.find((e) => e.nom == "alcool").valeur;
        console.log(tva_alcool);
        setRab_tva(tva_alcool);
      }
    });
  }, [orders]);

  const calcTotal = () => {
    let tot = 0;
    let tva = 0;
    let tvas = [];
    newOrders.map((order) => {
      tot += calcOrder(order).price;
      tva += calcOrder(order).tva;
      tvas.push({
        value: calcOrder(order).tva,
        perc: calcOrder(order).item_tva,
      });
    });
    return { tot, tva, tvas };
  };

  var groupBy = function (xs, key) {
    return xs?.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x.value);
      return rv;
    }, {});
  };

  const handlePlusOrMinus = ({ key, order, sign }) => {
    console.log({ order, sign });
    if (sign == "+") {
      let newOrder = { ...order, qt: order.qt + 1 };
      console.log(newOrder);
      dispatch(setOrderChange({ key, order: newOrder }));
    } else {
      if (order.qt == 1) {
        dispatch(deleteOrder({ key }));
      } else {
        let newOrder = { ...order, qt: order.qt - 1 };
        dispatch(setOrderChange({ key, order: newOrder }));
      }
    }
  };

  const handleClose = () => setShowModifyModal(false);

  const handleExtra = ({ extraKey, sign }) => {
    let copy = JSON.parse(JSON.stringify(orderTo.order) || {});
    if (sign == "+" && copy.extras[extraKey].default_quantity < 1) {
      copy.extras[extraKey].default_quantity += 1;
      console.log(copy);
      setOrderTo({ ...orderTo, order: copy });
    } else {
      if (copy.extras[extraKey].default_quantity > 0) {
        copy.extras[extraKey].default_quantity -= 1;
        console.log(copy);
        setOrderTo({ ...orderTo, order: copy });
      }
    }
  };

  const handleSlotSelect = ({ slotKey, id }) => {
    console.log(slotKey, id);
    let copy = JSON.parse(JSON.stringify(orderTo.order) || {});
    copy.slots[slotKey].products.forEach((prod) => {
      prod.id == id ? (prod.checked = true) : (prod.checked = false);
      console.log(prod.name);
    });
    setOrderTo({ ...orderTo, order: copy });
  };

  const handleStepSelect = ({ id, STP }) => {
    console.log(STP);
    setselected(step);
    let copy = JSON.parse(JSON.stringify(orderTo.order) || {});
    let max_select = STP.max_select;
    if (copy.stepItems[step] == undefined) {
      copy.stepItems[step] = [];
      console.log(copy);
    }
    if (copy.stepItems[step].length < max_select) {
      if (!copy.stepItems[step].find((el) => el.id == id)) {
        console.log("will push now");
        copy.stepItems[step].push(findProductWithId(id));
      }
    }
    {
      if (!copy.stepItems[step].find((el) => el.id == id)) {
        copy.stepItems[step] = [];
        copy.stepItems[step].push(findProductWithId(id));
      }
    }

    setOrderTo({ ...orderTo, order: copy });
    console.log("done");
    console.log(copy);
  };

  const handleUpdateOrder = () => {
    dispatch(setOrderChange({ key: orderTo.key, order: orderTo.order }));
    setShowModifyModal(false);
    setshowRemise(false);
  };

  var curr = new Date();
  var date = curr.toISOString().substr(0, 10);
  var time = curr.getHours() + ":" + curr.getMinutes();


  const handleConfirm = () => {
    if (confirmed == true) {
      handleFinish();
    } else if (calcTotal().tot == 0) {
      Swal.fire({
        title: "Attention le montant de la commande est 0 € !",
      });
    } else {
      Swal.fire({
        title: "confirmer la commande ?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "confirmer",
        denyButtonText: `annuler`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          handlePlaceOrder();
          Swal.fire({
            icon: "success",
            title: "commande confirmée",
            showConfirmButton: false,
            timer: 1500,
          });
          setconfirmed(true);
        }
      });
    }
    // setconfirmed(true);
  };

  const handlePlaceOrder = () => {
    
    let order = {
      table: nbr || "",
      server:username,
      from_kiosk:false,
      client_id: client?.id,
      id: order_id ? order_id : "",
      message: remarque || client?.message || "aucune",
      customer_name: client?.name || "",
      customer_company: client?.company || "",
      code1: client?.code1 || "",
      code2: client?.code2 || "",
      interphone: client?.interphone || "",
      etage: client?.etage || "",
      table_number: table_number || 0,
      customer_tel: client?.phone || "",
      customer_adress: client?.address
        ? `${client?.address} - ${client?.city} - ${client?.post}
      code 1 : ${client?.code1 || ""} | code2 : ${client?.code2 || ""}
       interphone : ${client?.interphone || ""} | etage : ${client?.etage || ""
        }`
        : "",
      status: "pending",
      orderType: orderType || "surplace",
      paymentType: "Especes",
      totalPrice: calcTotal().tot,
      taxPrice: calcTotal().tva,
      tvas: calcTotal().tvas,
      orderItems: [],
      date: client?.date || date,
      time: client?.time || time,
    };
  
    newOrders.map((one) => {
      order.orderItems.push({
        ...one,
        price: one.finalPrice || calcOrder(one).dbPrice,
        tva: calcOrder(one).item_tva,
      });
    });
  

    if (order_id) {
      setlate_order_id(order_id);

      axios
        .post(
          process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/updateorder",
          {
            order: order,
            user_id: user_id,
          }
        )
        .then((res) => {
          console.log(res.data);
          axios
            .post(
              process.env.REACT_APP_API_HOST +
              ":" +
              process.env.REACT_APP_API_PORT +
              "/api/printOrder",
              {
                kitchen: true,
                user_id: user_id,
                order: {
                  new: true,
                  ...order,
                  tvas: "aspa",
                  table_number: order.table || "",
                  order_id: order_id,
                  Date: new Date(),
                  nbrCouverts: client?.nbrCouverts || nbrCouverts,
                },
              }
            )
            .then((res) => console.log(res.data))
            .catch((err) => console.log(err));
          dispatch(
            setCheckoutChange({
              order: {
                ...order,
                table_number:
                  table_number || currentOrder.table_number || client?.id,
                order_id: order_id,
                Date: new Date(),
                nbrCouverts: client?.nbrCouverts || nbrCouverts,
              },
            })
          );
          console.log({
            order: {
              ...order,
              order_id: res.data.id,
              Date: new Date(),
              nbrCouverts: client?.nbrCouverts || nbrCouverts,
            },
          });
          const socket = io.connect(process.env.REACT_APP_API_SOCKET);
          socket.emit(`accept${user_id}`, {
            order: {
              ...order,
              order_id: order_id,
              Date: new Date(),
              nbrCouverts: client?.nbrCouverts || nbrCouverts,
            },
          });
        });
    } else if (newCommande.order_id) {
      setlate_order_id(newCommande.order_id);

      axios
        .post(
          process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/updateorder",
          {
            order: order,
            user_id: user_id,
          }
        )
        .then((res) => {
          console.log(res.data);
          axios
            .post(
              process.env.REACT_APP_API_HOST +
              ":" +
              process.env.REACT_APP_API_PORT +
              "/api/printOrder",
              {
                kitchen: true,
                user_id: user_id,
                order: {
                  new: true,
                  ...order,
                  tvas: "aspa",
                  table_number: order.table || "",
                  order_id: newCommande.order_id,
                  Date: new Date(),
                  nbrCouverts: client?.nbrCouverts || nbrCouverts,
                },
              }
            )
            .then((res) => console.log(res.data))
            .catch((err) => console.log(err));
          dispatch(
            setCheckoutChange({
              order: {
                ...order,
                table_number:
                  table_number || currentOrder?.table_number || client?.id,
                order_id: newCommande.order_id,
                Date: new Date(),
                nbrCouverts: client?.nbrCouverts || nbrCouverts,
              },
            })
          );
          console.log({
            order: {
              ...order,
              order_id: res.data.id,
              Date: new Date(),
              nbrCouverts: client?.nbrCouverts || nbrCouverts,
            },
          });
          const socket = io.connect(process.env.REACT_APP_API_SOCKET);
          socket.emit(`accept${user_id}`, {
            order: {
              ...order,
              order_id: newCommande.order_id,
              Date: new Date(),
              nbrCouverts: client?.nbrCouverts || nbrCouverts,
            },
          });
        });
    }

    else {
      axios
        .post(
          process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/orders",
          {
            client,
            order: order,
            how_paid: "tout",
            user_id: user_id,
          }
        )
        .then((res) => {
          setlate_order_id(res.data.id);
    
          axios
            .post(
              process.env.REACT_APP_API_HOST +
              ":" +
              process.env.REACT_APP_API_PORT +
              "/api/printOrder",
              {
                kitchen: true,
                user_id: user_id,
                order: {
                  new: false,
                  ...order,
                  tvas: groupBy(calcTotal().tvas, "perc"),
                  table_number: nbr || "",
                  order_id: res.data.id,
                  Date: new Date(),
                  nbrCouverts: client?.nbrCouverts || nbrCouverts,
                },
              }
            )
            .then((res) => console.log(res.data))
            .catch((err) => console.log(err));
          dispatch(
            addNewcheckoutData({
              order: {
                ...order,
                table_number: table_number || client?.id,
                order_id: res.data.id,
                Date: new Date().getTime(),
                nbrCouverts: client?.nbrCouverts || nbrCouverts,
              },
            })
          );
          let socket = io.connect(process.env.REACT_APP_API_SOCKET);
          socket.emit(`accept${user_id}`, {
            order: {
              ...order,
              order_id: res.data.id,
              Date: new Date(),
              nbrCouverts: client?.nbrCouverts || nbrCouverts,
            },
          });
          setNewCommande({

            ...order,
            order_id: res.data.id,
            Date: new Date(),
            nbrCouverts: client?.nbrCouverts || nbrCouverts,

          });
        })
        .catch((err) => console.log(err));
    }
  };

  const handleFinish = () => {
    if (late_order_id != 0) {
      navigate("/checkout/" + late_order_id);
      dispatch(clearOrders());
    }
    // console.log(order_id);
    // if (selectedTable.nbr || order_id) {
    //   console.log("nbr", table_number);
    //   console.log("order", order_id);
    //   console.log("late_order", late_order_id);
    //   navigate("/checkout/" + table_number || order_id);
    // } else {
    //   console.log("else =======>");
    //   navigate(`/checkout/${client?.id}`);
    // }
  };
  const renderHTML = (rawHTML: string) =>
    React.createElement("div", {
      dangerouslySetInnerHTML: { __html: rawHTML },
    });
  const currency = localStorage.getItem("currency");
  ///////////////////////////////////////////////////////////
  const onLongPress = () => {
    console.log("longpress is triggered");
  };

  const onClick = () => {
    console.log("click is triggered");
  };

  const defaultOptions = {
    shouldPreventDefault: false,
    delay: 500,
  };
  const longPressEvent = useLongPress(onLongPress, onClick, defaultOptions);

  const [showRemise, setshowRemise] = useState(false);

  const handleTiroir = () => {
    Swal.fire({
      title: "Ouvrir la caisse pour :",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Faire la monnaie",
      denyButtonText: `Sans motif`,
      cancelButtonText: "Annuler",
    }).then((result) => {
      console.log(result);
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        axios.post(
          process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/pushlog",
          {
            user_id: user_id,
            user: user,
            faire: "pour Faire la monnaie",
            title: "Ouverture de tiroir",
            content: "ouverture de la caisse par le serveur",
          }
        );

        Swal.fire({
          icon: "success",
          title: "Ouvert pour faire la monnaie",
          showConfirmButton: false,
          timer: 1000,
        });
      } else if (result.isDenied) {
        axios.post(
          process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/pushlog",
          {
            user_id: user_id,
            user: user,
            faire: "sans motif",
            title: "Ouverture de tiroir",
            content: "ouverture de la caisse par le serveur",
          }
        );

        Swal.fire({
          icon: "success",
          title: "Ouvert sans motif",
          showConfirmButton: false,
          timer: 1000,
        });
      }
    });
  };

  const handleAnnuler = () => {
    Swal.fire({
      title: "Motif d'annulation ",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Aucun",
      denyButtonText: `Impayé`,
      cancelButtonText: "Fermer",
    }).then((result) => {
    

      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        if (order_id) {
          axios.post(
            process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/cancelorder",
            {
              order: currentOrder,
            }
          );
          const socket = io.connect(process.env.REACT_APP_API_SOCKET);
          socket.emit(`accept${user_id}`, {
            order: {
              ...currentOrder

            },
          });

          dispatch(setCheckoutChange({order:{...currentOrder,status:"rejected",timeRejection:time,rejectedFrom:username,rejected:"Aucun"} }));
        }
        if (newCommande.order_id) {
          axios.post(
            process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/cancelorder",
            {
              order: newCommande,
            }
          );
          const socket = io.connect(process.env.REACT_APP_API_SOCKET);
          socket.emit(`accept${user_id}`, {
            order: {
              ...newCommande

            },
          });

          dispatch(setCheckoutChange({order:{...currentOrder,status:"rejected",timeRejection:time,rejectedFrom:username,rejected:"Aucun"} }));
        }
        axios.post(
          process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/pushlog",
          {
            user_id: user_id,
            user: user,
            faire: "Aucun",
            title: "Annulation",
            content: "Annulation de commande par le serveur",
          }
        );
        Swal.fire({
          icon: "success",
          title: "Annulé (Aucun)",
          showConfirmButton: false,
          timer: 1000,
        });

        dispatch(clearOrders());
        navigate("/main");
      } else if (result.isDenied) {
        if (order_id) {
          axios.post(
            process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/cancelorder",
            {
              order: currentOrder,
            }
          );
          const socket = io.connect(process.env.REACT_APP_API_SOCKET);
          socket.emit(`accept${user_id}`, {
            order: {
              ...currentOrder

            },
          });


          dispatch(setCheckoutChange({order:{...currentOrder,status:"rejected",timeRejection:time,rejectedFrom:username,rejected:"Impayé"} }));
        }
        if (newCommande.order_id) {
          axios.post(
            process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/cancelorder",
            {
              order: newCommande,
            }
          );
          const socket = io.connect(process.env.REACT_APP_API_SOCKET);
          socket.emit(`accept${user_id}`, {
            order: {
              ...newCommande

            },
          });

          dispatch(setCheckoutChange({order:{...currentOrder,status:"rejected",timeRejection:time,rejectedFrom:username,rejected:"Impayé"} }));
        }


        axios.post(
          process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/pushlog",
          {
            user_id: user_id,
            user: user,
            faire: "Impayé",
            title: "Annulation",
            content: "Annulation de commande par le serveur",
          }
        );

        Swal.fire({
          icon: "success",
          title: "Annulé (Impayé)",
          showConfirmButton: false,
          timer: 1000,
        });
        dispatch(clearOrders());
        navigate("/main");
      }
    });
  };

  return (
    <div className="cart-menu">
      {selectedTable.nbr ? (
        <h6 className="cart-menu-table-nbr">{`table ${nbr} - ${nbrCouverts} ${t(
          "couverts"
        )}`}</h6>
      ) : client.name ? (
        <h6 className="cart-menu-table-nbr">{`Client ${client.name} - ${client.type}
          `}</h6>
      ) : 
        order_id?<b>Commande # {order_id}</b>:<br/>
      }
      <Table className="ttt2">
        <thead className="tbds2">
          <tr>
            <th>{t("article")}</th>
            <th>Qte</th>
            <th>{t("price")}</th>
          </tr>
        </thead>
        <tbody
          className="scro2 "
          style={{ backgorunImage: `url(${cartbg}) !important` }}
        >
          {newOrders?.map((order, key) => (
            <tr
              className="catt"
              style={{
                backgroundColor:
                  order.new == "true" || confirmed == true
                    ? "#55efc4"
                    : "transparent",
                color:
                  order.new == "true" || confirmed == true ? "white" : "black",
              }}
            >
              <td className="mytd">
                <p
                  onClick={() => {
                    setOrderTo({ order, key });
                    setshowRemise(true);
                  }}
                  className="mytd_order-name"
                >
                  {order.name}
                </p>
                {order.extras && order.extras.length
                  ? order.extras
                    .filter((el) => el.default_quantity > 0)
                    .map((extra) => (
                      <span className="boba">{extra.title}-</span>
                    ))
                  : ""}
                {order.stepItems && Object.keys(order.stepItems).length ? (
                  <div>
                    {Object.keys(order.stepItems).map((key) =>
                      order.stepItems[key].map((el) => (
                        <span
                          style={{
                            textAlign: "start",
                            color: "#ff6b6b",
                          }}
                        >
                          -{el.name}
                        </span>
                      ))
                    )}
                  </div>
                ) : order.is_supp ? (
                  <div className="order_with_supp_item">

                    {order?.suppSelected.map((key, el) => (
                      <span 
                      key={key}
                        style={{
                          textAlign: "start",
                          color: "#ff6b6b",
                        }}
                      >
                     - {order?.suppSelected.at(el).name}
                      </span>
                    ))}



                  </div>
                )

                  : order?.slots ? (
                    <div>
                      <span
                        style={{
                          textAlign: "start",
                          color: "grey",
                        }}
                      >
                        {
                          Object.entries(order.slots)[0]?.[1]?.products?.filter(
                            (e) => e.checked
                          )[0]?.name
                        }
                      </span>
                      <br />
                      <span
                        style={{
                          textAlign: "start",
                          color: "grey",
                        }}
                      >
                        {
                          Object.entries(order.slots)[1]?.[1]?.products?.filter(
                            (e) => e.checked
                          )[0]?.name
                        }
                      </span>
                      <br />
                      <span
                        style={{
                          textAlign: "start",
                          color: "grey",
                        }}
                      >
                        {
                          Object.entries(order.slots)[2]?.[1]?.products?.filter(
                            (e) => e.checked
                          )[0]?.name
                        }
                      </span>
                    </div>
                  ) : (
                    ""
                  )}
              </td>
              <td
                style={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  height: "30px",
                }}
              >
                <FontAwesomeIcon
                  icon={faMinusCircle}
                  color="#ff6b6b"
                  onClick={() => handlePlusOrMinus({ order, key, sign: "-" })}
                />
                <p
                  className="mytd_order-qty"
                  onClick={() => {
                    setOrderTo({ order, key });
                    setShowModifyModal(true);
                  }}
                  {...longPressEvent}
                >
                  <b>{order.qt}</b>
                </p>

                <FontAwesomeIcon
                  icon={faPlusCircle}
                  color="#ff6b6b"
                  onClick={() => handlePlusOrMinus({ order, key, sign: "+" })}
                  variant="success"
                />
              </td>
              <td
                style={{
                  height: "30px",
                }}
              >
                <p
                  className="mytd_order-qty"
                  style={{
                    fontWeight: "bold",
                    display: "flex",
                  }}
                >
                  {calcOrder(order).price.toFixed(2)}{" "}
                  {renderHTML(`<i>${currency}</i>`)}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
        {/* <div class="zigzag-section"></div> */}
      </Table>

      <div
        style={{
          width: "25%",
          height: "200px",
          backgroundColor: "#f1f1f1",
          position: "absolute",
          bottom: "0",
        }}
      >
        <div
          style={{
            borderBottom: "1px solid white",
            display: "flex",
            alignItems: "center",
            position: "relative",
            backgroundImage: `url(${image})`,
            objectFit: "contain",
            width: "100%",
            height: "50px",
            paddingTop: "5px",
          }}
        >
          <h2
            className="dig"
            style={{
              zIndex: "999",
              color: "#00b894",
              display: "flex",
              paddingLeft: "1rem",
              fontFamily: "DS-DIGIT !important",
            }}
          >
            {`Total : ${(calcTotal().tot + calcTotal().tva).toFixed(2)}`}{" "}
            {renderHTML(`<i >${currency}</i>`)}
          </h2>
        </div>
        <div
          style={{
            display: "flex",
          }}
        >
          <Button
            className="cart_btn btn4"
            variant={confirmed == true ? "danger" : "warning"}
            onClick={() => {
              if (orders && orders.length > 0) {
                handleConfirm();
              }
            }}
          >
            {confirmed == true ? (
              <>
                {late_order_id == 0 && (
                  <Spinner animation="border" variant="light" />
                )}{" "}
                Finir
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} /> Confirmer
              </>
            )}
          </Button>
          <Button
            className="cart_btn"
            variant="success"
            onClick={() => handleTiroir()}
          >
            {t("tiroir")}
          </Button>
          <Button className="cart_btn" variant="danger" onClick={handleAnnuler}>
            {t("cancel")}
          </Button>
        </div>
      </div>

      <Modal
        dialogClassName="modal_body"
        show={ShowModifyModal}
        onHide={() => {
          handleClose();
          setstep(1);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{orderTo.order?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{orderTo.order?.description}</p>
          {orderTo.order?.extras && orderTo.order?.extras.length ? (
            orderTo.order?.extras.map((extra, key) => (
              <tr
                style={{
                  display: "flex",
                  width: "50%",
                }}
              >
                <td
                  style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    height: "30px",
                    width: "25%",
                    marginRight: "1rem",
                  }}
                >
                  <FontAwesomeIcon
                    onClick={() => handleExtra({ extraKey: key, sign: "-" })}
                    icon={faMinusCircle}
                    color="#ff6b6b"
                  />
                  <h5>
                    <b>{extra.default_quantity}</b>
                  </h5>
                  <FontAwesomeIcon
                    onClick={() => handleExtra({ extraKey: key, sign: "+" })}
                    icon={faPlusCircle}
                    color="#ff6b6b"
                  />
                </td>
                <td style={{ marginRight: "1rem" }}>
                  {" "}
                  <h5>
                    <b>{extra.title}</b>
                  </h5>
                </td>
                <td>
                  {" "}
                  <h5>
                    <b style={{ display: "flex", color: "#ff6b6b" }}>
                      {extra.price.toFixed(2)}{" "}
                      {renderHTML(`<i>${currency}</i>`)}
                    </b>
                  </h5>
                </td>
              </tr>
            ))
          ) : orderTo.order?.isComp ? (
            <Table striped bordered>
              <thead>
                <tr>
                  {Object.keys(orderTo.order?.slots || {}).map((slotKey) => (
                    <td>{slotKey}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(orderTo.order?.slots || {}).map((slotKey) => (
                  <td>
                    {orderTo.order?.slots[slotKey].products.map((prod) => (
                      <div
                        style={{ display: "flex", cursor: "pointer" }}
                        className={prod.checked ? "checked" : "not"}
                        onClick={() =>
                          handleSlotSelect({ slotKey, id: prod.id })
                        }
                      >
                        <img src={prod.image} width="30px" height="30px" />
                        <div>
                          <h6>{prod.name}</h6>
                          <p>{prod.description}</p>
                        </div>
                        <p>
                          {prod.price} {renderHTML(`<i>${currency}</i>`)}
                        </p>
                      </div>
                    ))}
                  </td>
                ))}
              </tbody>
            </Table>
          ) : orderTo.order?.nsteps > 0 ? (
            <div>
              <h6>
                <b>
                  {
                    nsteps.filter(
                      (nstep) => nstep.menu_id == orderTo.order?.id
                    )[0][step]?.nom_etape
                  }
                </b>
              </h6>
              <div className="steps_cont">
                {nsteps
                  .filter((nstep) => nstep.menu_id == orderTo.order?.id)[0]
                [step].choice.map((slot) => (
                  <div
                    className={
                      orderTo.order?.stepItems[step]?.find(
                        (el) => el.id == slot
                      )
                        ? "prod prod_sel"
                        : "prod"
                    }
                    onClick={() =>
                      handleStepSelect({
                        id: slot,
                        STP: nsteps.filter(
                          (nstep) => nstep.menu_id == orderTo.order?.id
                        )[0][step],
                      })
                    }
                  >
                    <img
                      src={findProductWithId(slot).image}
                      alt=""
                      height="70px"
                      width="70px"
                    />
                    <h6 style={{ display: "flex" }}>
                      <b> {findProductWithId(slot).name} </b>
                      <span>
                        <b
                          style={{
                            display: "flex",
                            marginLeft: "1rem",
                            color: "#ff6b6b",
                          }}
                        >
                          {findProductWithId(slot).price}{" "}
                          {renderHTML(`<i>${currency}</i>`)}
                        </b>
                      </span>{" "}
                    </h6>
                    <p>{findProductWithId(slot).description}</p>
                  </div>
                ))}
              </div>
              {orderTo.order?.nsteps >= step && step > 0 ? (
                <Button
                  style={{ marginRight: "1rem" }}
                  variant="outline-secondary"
                  onClick={() => {
                    if (step > 1) {
                      setstep(step - 1);
                    }
                  }}
                >
                  retour
                </Button>
              ) : (
                ""
              )}
              {orderTo.order?.nsteps > step && step > 0 ? (
                <Button
                  variant="outline-warning"
                  onClick={() => {
                    if (orderTo.order?.nsteps > step && selected == step) {
                      setstep(step + 1);
                    }
                  }}
                >
                  suivant
                </Button>
              ) : (
                ""
              )}
              {orderTo.order?.nsteps == step ? (
                <Button
                  variant="outline-warning"
                  onClick={() => {
                    if (selected == step) {
                      handleUpdateOrder();
                    }
                  }}
                >
                  finir
                </Button>
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => {
              dispatch(deleteOrder({ key: orderTo.key }));
              handleClose();
              setstep(1);
            }}
          >
            Supprimer
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              handleClose();
              setstep(1);
            }}
          >
            {t("cancel")}
          </Button>
          {orderTo.order?.nsteps == 0 || orderTo.order?.isComp ? (
            <Button variant="warning" onClick={() => handleUpdateOrder()}>
              {t("aded")}
            </Button>
          ) : (
            ""
          )}
        </Modal.Footer>
      </Modal>
      {showRemise && (
        <RemiseModal
          setshowRemise={setshowRemise}
          orderTo={orderTo}
          setOrderTo={setOrderTo}
          handleUpdateOrder={handleUpdateOrder}
          calcOrder={calcOrder}
        />
      )}
    </div>
  );
};

export default CartMenu;
