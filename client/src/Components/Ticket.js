import axios from "axios";
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import QRCode from "react-qr-code";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import aprc from "./../Shared/aprc.png";

const Ticket = ({ order, thisDate, ping }) => {
  const address = localStorage.getItem("address");
  const user_id = localStorage.getItem("user_id");
  

  const params = useParams();
  const { table_id } = params;
  const telephone = localStorage.getItem("telephone");
  const [toShowOrder, settoShowOrder] = useState(order);
  const ordersData = useSelector((state) => state.order.checkoutData);
  const currency = localStorage.getItem("currency");
  const [isBusy, setIsBusy] = useState(true);
  const [restaurant, setrestaurant] = useState({});
  // let toShowOrder = ordersData.filter((o) => o.order_id == table_id)[0] || {};

  // useEffect(() => {
  //   if (toShowOrder?.orderItems && toShowOrder?.orderItems.length) {
  //     setIsBusy(false);
  //     console.log(toShowOrder?.orderItems);
  //   }
  // }, [toShowOrder]);

  useEffect(() => {
    axios
      .post("/api/getRestaurantData", { user_id })
      .then((res) => {
       
        setrestaurant(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [toShowOrder]);

  useEffect(() => {
    settoShowOrder(order);
  }, [order]);



  
  
  var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x.value);
      return rv;
    }, {});
  };

  let tvass = groupBy(toShowOrder?.tvas || [], "perc");


  const calcOrder = (order) => {
    let price = order.price;
    let tva = order.tva;
    if (order.extras && order.extras.length) {
    
      order.extras.map((extra) => {
     
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
    return { price: price * order.qt, tva: (price * order.qt * tva) / 100 };
  };

  let tva = 0;
  let is_alcool = false;
  let test = order.orderItems;
  order.orderItems?.forEach((element) => {
    if (element.is_alcool == true) {
      is_alcool = true;
    }
  });
  if (is_alcool == true) {
    tva = 20;
  } else {
    let is = order.orderType == undefined ? order.order_type : order.orderType;
    switch (is) {
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
  // let tax = (toShowOrder.taxPrice * calcTotal(toShowOrder?.orderItems)) / 100;

  const renderHTML = (rawHTML: string) =>
    React.createElement("div", {
      dangerouslySetInnerHTML: { __html: rawHTML },
    });
  // useEffect(() => {
  //   if (order.part > 1) {
  //     let copy = JSON.parse(JSON.stringify(order) || {});
  //     copy = { ...copy };
  //     settoShowOrder(copy);
  //   }
  // }, [ping]);

  return (
    <Container fluid>
      <div className="ticket">
        <div className="ticket_container">
          <h3 style={{ marginTop: "0.5rem" }}>
            <b>Ticket d'encaissement</b>
          </h3>
          <p>
            {restaurant.name} <br />
            {address || "" + "-" + telephone || ""} <br />
            tel: {restaurant.telephone}
          </p>
          <h1>
            <b style={{ fontSize: "56px" }}>{toShowOrder?.order_id}</b>
          </h1>
          <div className="ticket_item" style={{ flexWrap: "wrap" }}>
            <p>Client :{toShowOrder.customer_name}</p>
            <p>Type :{toShowOrder.orderType}</p>
            <p>Numero :{toShowOrder.customer_tel}</p>
            <p>Adresse:{toShowOrder.customer_adress}</p>
          </div>
          <span style={{ marginBottom: "0.5rem" }}>
            -------------------------------------
          </span>
          {toShowOrder.orderItems &&
            toShowOrder.orderItems.map((item, key) => (
              <>
                <div className="ticket_item">
                  <p>{key + 1 + "-" + item?.name}</p>
                  <div
                    style={{
                      display: "flex",
                      width: "30%",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <p>
                      {item?.qt == undefined ? item.quantity : item.qt + "x"}
                    </p>
                    <p>
                      {`  ${item?.price.toFixed(2)} `}{" "}
                      {renderHTML(`<i>${currency}</i>`)}
                    </p>
                  </div>
                </div>
                {item.stepItems && Object.keys(item.stepItems).length ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                    className="step_item"
                  >
                    {Object.keys(item.stepItems).map((key) =>
                      item.stepItems[key].map((el) => (
                        <span style={{ textAlign: "start", color: "grey" }}>
                          -{el.name}
                        </span>
                      ))
                    )}
                  </div>
                ) :item?.steps != []? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                    className="step_item"
                  >
                    {
                      item.steps?.map((el) => (
                        <span style={{ textAlign: "start", color: "grey" }}>
                          -{el.name}
                        </span>
                      ))
                    }
                  </div>
                ): (
                  ""
                )}
                {item?.extras != []
                  ? item?.extras?.map((extra) =>
                      extra.default_quantity > 0 ? (
                        <div className="ticket_extra">
                          <p>+ {extra.title}</p>
                          <div
                            style={{
                              display: "flex",
                              width: "30%",
                              justifyContent: "space-evenly",
                            }}
                          >
                            {" "}
                            <p>{extra.default_quantity + "x"}</p>
                            <p>
                              {`  ${extra.price.toFixed(2)} `}
                              {renderHTML(`<i>${currency}</i>`)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        ""
                      )
                    )
                  : ""}
              </>
            ))}
          <span style={{ marginBottom: "0.5rem" }}>
            -------------------------------------
          </span>
          <div className="ticket_item ticket_last">
            <p>Total HT : </p>
            <div
              style={{
                display: "flex",
                width: "20%",
                justifyContent: "space-evenly",
              }}
            >
              <p>
                {(toShowOrder?.totalPrice /(1+tva/100)).toFixed(2)} {renderHTML(`<i>${currency}</i>`)}
              </p>
            </div>
          </div>
          {/* {Object.keys(tvass).map((key) => (
            <div className="ticket_item ticket_last">
              <p>TVA({key}%):</p>
              <div
                style={{
                  display: "flex",
                  width: "20%",
                  justifyContent: "space-evenly",
                }}
              >
                <p>
                  {tvass[key].reduce((a, b) => a + b).toFixed(2)}{" "}
                  {renderHTML(`<i>${currency}</i>`)}
                </p>
              </div>
            </div>
          ))} */}
          {
            (
            (
              <div className="ticket_item ticket_last">
                <p>
                  TVA(
                  {tva}
                  %):
                </p>
                <div
                  style={{
                    display: "flex",
                    width: "20%",
                    justifyContent: "space-evenly",
                  }}
                >
                  <p>
                    {((toShowOrder?.totalPrice /(1+tva/100))*tva/100).toFixed(2)}
                    {renderHTML(`<i>${currency}</i>`)}
                  </p>
                </div>
              </div>
            ))
          }
          {/* <div className="ticket_item ticket_last">
            <p>
              TVA({(toShowOrder?.taxPrice / toShowOrder?.totalPrice) * 100}%):
            </p>
            <div
              style={{
                display: "flex",
                width: "20%",
                justifyContent: "space-evenly",
              }}
            >
              <p>
                {toShowOrder?.taxPrice.toFixed(2)}{" "}
                {renderHTML(`<i>${currency}</i>`)}
              </p>
            </div>
          </div> */}
          <div className="ticket_item ticket_last">
            <p>Total TTC : </p>
            <div
              style={{
                display: "flex",
                width: "20%",
                justifyContent: "space-evenly",
              }}
            >
              <p>
                {
                  toShowOrder?.totalPrice 
                }
                {renderHTML(`<i>${currency}</i>`)}
              </p>
            </div>
          </div>
          {toShowOrder.paymentsInDb?.length > 0 && (
            <>
              <span style={{ marginBottom: "0.5rem" }}>
                -------------------------------------
              </span>
              {toShowOrder.paymentsInDb?.map((one) => (
                <div className="ticket_item ticket_last">
                  <p>Payé({one.pay_method})</p>
                  <div
                    style={{
                      display: "flex",
                      width: "20%",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <p>
                      {one.amount.toFixed(2)}
                      {renderHTML(`<i>${currency}</i>`)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="ticket_item ticket_last">
                {toShowOrder.paymentsInDb?.reduce(
                  (acc, curr) => acc + curr.amount,
                  0
                ) -
                  (toShowOrder?.totalPrice ) >
                0 ? (
                  <>
                    <p>Rendre monnaie</p>
                    <div
                      style={{
                        display: "flex",
                        width: "20%",
                        justifyContent: "space-evenly",
                      }}
                    >
                      <p>
                        {(
                          toShowOrder.paymentsInDb?.reduce(
                            (acc, curr) => acc + curr.amount,
                            0
                          ) -
                          (toShowOrder?.totalPrice )
                        )?.toFixed(2)}
                        {renderHTML(`<i>${currency}</i>`)}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p>Reste a payer</p>
                    <div
                      style={{
                        display: "flex",
                        width: "20%",
                        justifyContent: "space-evenly",
                      }}
                    >
                      <p>
                        {Math.abs(
                          (
                            toShowOrder.paymentsInDb?.reduce(
                              (acc, curr) => acc + curr.amount,
                              0
                            ) -
                            toShowOrder?.totalPrice 
                              
                          ).toFixed(2)
                        )}
                        {renderHTML(`<i>${currency}</i>`)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          <p>
            <b>
              {toShowOrder?.part && toShowOrder?.type == "partager" ? (
                <p style={{ display: "flex" }}>
                  {`Votre part pour 1/${toShowOrder?.part} personnes est : ${
                    (toShowOrder?.totalPrice /toShowOrder.part
                  ).toFixed(2)}
              `}
                  {renderHTML(`<i>${currency}</i>`)}
                </p>
              ) : (
                ""
              )}
            </b>
          </p>
          <p>{thisDate}</p>
          {/* <QRCode
            value={toShowOrder?.order_id?.toString() || "000"}
            size={100}
          /> */}
          <img
            src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${toShowOrder?.order_id}&choe=UTF-8+`}
            width="40%"
          />
          <p>Scanner le numero de Commande {toShowOrder?.order_id}</p>
        </div>
      </div>
    </Container>
  );
};

export default Ticket;
