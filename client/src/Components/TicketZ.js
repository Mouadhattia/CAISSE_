import React from "react";
import _ from "lodash";

const TicketZ = ({ data, recap, selectedDate, products, tvas , tvasum}) => {
  let ouvDate = recap?.lastOuverture?.date.substr(0, 10);
  let ouvTime = recap?.lastOuverture?.date.substr(11, 5);
  var curr = new Date();
  let nowTime = curr.toISOString().substr(11, 5);
  let ouverture = ouvDate + "  " + ouvTime;
  console.log(recap.today?.tva);
  // var tvasum = 0;
 
  // let tvas = _.groupBy(recap.today?.orderItems, function (b) {
  //   return b.tva_perc;
  // });
  // console.log(recap.today?.orderItems);
  // Object.keys(tvas).forEach(
  //   (key) => (tvas[key] = tvas[key].reduce((acc, curr) => acc + curr.tva, 0))
  // );
  // console.log(tvas);
  return (
    <div className="ticketz">
      <div className="z-head">
        <h3>{recap.Restaurant?.name}</h3>
        <h1>Ticket Z</h1>
        <p>{recap.Restaurant?.address}</p>
        <p>Tel : {recap.Restaurant?.telephone}</p>
      </div>
      <div className="z-body">
        <p>---------------------------------</p>
        <div className="b_el">
          <p>
            <b>Impression :</b>
          </p>
          <p>{selectedDate + " " + nowTime}</p>
        </div>
        <div className="b_el">
          <p>
            <b>Ouverture :</b>
          </p>
          <p>{ouverture}</p>
        </div>
        <div className="b_el">
          <p>
            <b>Fermeture :</b>
          </p>
          <p>{selectedDate + " " + nowTime}</p>
        </div>
        <p>---------------------------------</p>
        <h6>
          <b>Commandes :</b> {recap.today?.nbr}
        </h6>
        <h6>
          <b>Clients :</b> {Object.keys(recap.today?.clientGroups || {}).length}
        </h6>
        <h6>
          <b>Ticket moyen :</b>{" "}
          {Number(
            (
              (recap.today?.total + recap.today?.tva) /
              recap.today?.nbr
            ).toFixed(2)
          ) || 0}
          €
        </h6>
        <h6>
          <b>Annules :</b>{" "}
          {recap.today?.logs?.filter((e) => e.title_log == "Annulation")
            .length || 0}
        </h6>
        <p>---------------------------------</p>
        {products?.map((item) => (
          <div className="b_el">
            <p>
              <b>{item.quantity + " X " + item.name}</b>
            </p>
            <p>{item.totalPrice.toFixed(2)}€</p>
          </div>
        ))}
        <p>---------------------------------</p>
        {Object.keys(recap.today?.groups || {}).map((key) => (
          <div className="b_el">
            <p>
              <b>{recap.today?.groups[key].length} X </b>
              <b>{key == 1 ? "Carte Bancaire" : key == 2 ? "Espéces" : key}</b>
            </p>
            <p>
              {recap.today?.groups[key]
                .reduce(
                  (acc, curr) =>
                    acc + (curr.price + (curr.price * curr.tva) / 100),
                  0
                )
                .toFixed(2) + "€"}
            </p>
          </div>
        ))}
        <p>---------------------------------</p>
        {Object.keys(tvas || {}).map((key) => {
          // tvasum = tvasum + tvas[key];
          return (
            <div className="b_el">
              <p>
                <b>TVA({Number(key).toFixed(2)}%)</b>
              </p>
              <p>{tvas[key].toFixed(2)}€</p>
            </div>
          );
        })}
        <div className="b_el">
          <p>
            <b>Total HT</b>
          </p>
          <p>{recap.today?.total.toFixed(2)}€</p>
        </div>
        <div className="b_el">
          <p>
            <b>Total TTC</b>
          </p>
          <p>{(recap.today?.total +tvasum).toFixed(2)}€</p>
        </div>
        <p>---------------------------------</p>
        <div className="b_el">
          <p>
            <b>Fond de caisse initial</b>
          </p>
          <p>{recap.lastOuverture?.montant.toFixed(2)}€</p>
        </div>
        <div className="b_el">
          <p>
            <b>Fond de caisse final</b>
          </p>
          <p>
            {(
              recap.lastOuverture?.montant +
              recap.today?.total +
              tvasum 
            ).toFixed(2)}
            €
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketZ;
