import React from "react";
import _ from "lodash";

const TicketH = ({ zHistory}) => {
  
 
  return (
    <div className="ticketz">
      <div className="z-head">
        <h3>{zHistory.restaurant?.name}</h3>
        <h1>Ticket Z</h1>
        <p>{zHistory.restaurant?.address}</p>
        <p>Tel : {zHistory.restaurant?.telephone}</p>
      </div>
      <div className="z-body">
        <p>---------------------------------</p>
        <div className="b_el">
          <p>
            <b>Impression :</b>
          </p>
          <p>{zHistory.impression}</p>
        </div>
        <div className="b_el">
          <p>
            <b>Ouverture :</b>
          </p>
          <p>{zHistory.ouverture}</p>
        </div>
        <div className="b_el">
          <p>
            <b>Fermeture :</b>
          </p>
          <p>{zHistory.fermeture}</p>
        </div>
        <p>---------------------------------</p>
        <h6>
          <b>Commandes :</b> {zHistory.commandes}
        </h6>
        <h6>
          <b>Clients :</b> {zHistory.clients}
        </h6>
        <h6>
          <b>Ticket moyen :</b>{" "}
          {zHistory.ticket_moyen}€
         
        </h6>
        <h6>
          <b>Annules :</b>{" "}
          {zHistory.cancledOrders.length || 0}
        </h6>
        <p>---------------------------------</p>
        {zHistory.products?.map((item) => (
          <div className="b_el">
            <p>
              <b>{item.quantity + " X " + item.name}</b>
            </p>
            <p>{item.totalPrice.toFixed(2)}€</p>
          </div>
        ))}
        <p>---------------------------------</p>
        {Object.keys(zHistory.pay_method|| {}).map((key) => (
          <div className="b_el">
            <p>
            
        {zHistory.pay_method[key]?.qt} {zHistory.pay_method[key]?.name} : {zHistory.pay_method[key]?.prix}
            </p>
            
          </div>
        ))}
        <p>---------------------------------</p>
        {Object.keys( zHistory.tvas || {}).map((key) => {
          // tvasum = tvasum + tvas[key];
          return (
            <div className="b_el">
              <p>
                <b>TVA({Number(key).toFixed(2)}%)</b>
              </p>
              <p>{zHistory.tvas[key].toFixed(2)}€</p>
            </div>
          );
        })}
        <div className="b_el">
          <p>
            <b>Total HT</b>
          </p>
          <p>{zHistory.ht}€</p>
        </div>
        <div className="b_el">
          <p>
            <b>Total TTC</b>
          </p>
          <p>{zHistory.ttc}€</p>
        </div>
        <p>---------------------------------</p>
        <div className="b_el">
          <p>
            <b>Fond de caisse initial</b>
          </p>
          <p>{zHistory.fond_initial}€</p>
        </div>
        <div className="b_el">
          <p>
            <b>Fond de caisse final</b>
          </p>
          <p>
            {zHistory.fond_final}€
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketH;
