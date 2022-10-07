import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { storeTables, storeZones } from "../Slices/data";
import { Button, Offcanvas, Stack } from "react-bootstrap";
import Tables from "./Tables";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faBars,
  faBorderAll,
  faCashRegister,
  faDesktop,
  faHistory,
  faMotorcycle,
  faStickyNote,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";

const Zones = () => {
  const ping = useSelector((state) => state.data.ping);
  const user_id = localStorage.getItem("user_id");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState("");
  const zones = useSelector((state) => state.data.zones);
  const checkoutData = useSelector((state) => state.order.checkoutData);
  const [show, setShow] = useState(false);
  

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/getUserZones",
        {
          user_id,
        }
      )
      .then((res) => {
      
        dispatch(storeZones({ zones: res.data.zones }));
        dispatch(storeTables({ tables: res.data.tables }));
        setSelectedZone(zones[0]?.id);
      });
  }, [checkoutData,ping]);

  return (
    <div>
      <FontAwesomeIcon
        icon={faBars}
        style={{
          position: "absolute",
          right: "1rem",
          top: "1rem",
          cursor: "pointer",
        }}
        size="2x"
        color="white"
        onClick={handleShow}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "1.5rem",
          height: "45px",
        }}
      >
        <h2 className="plan-restuarnat"  style={{ position: "absolute", left: "3.5%" }}>
          <b>Plan du Restaurant</b>
        </h2>
        {zones.map((zone) => (
          <Button
          className="zone_button"
            style={{ marginLeft: "1rem" }}
            onClick={() => setSelectedZone(zone.id)}
            variant={selectedZone == zone.id ? "dark" : "outline-dark"}
          >
            {zone.nom}
          </Button>
        ))}
      </div>
      <Tables selectedZone={selectedZone} />
      <Offcanvas placement="end" show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="my_offcanvas">
            <div className="offcanvas_item" onClick={()=>navigate("/backoffice")}>
              <FontAwesomeIcon icon={faDesktop} />
              <p>Accéder aux back-Office</p>
            </div>
            <div
              className="offcanvas_item"
              onClick={() => navigate("/clients")}
            >
              <FontAwesomeIcon icon={faUsers} />
              <p>Gestion des clients</p>
            </div>
            <div className="offcanvas_item">
              <FontAwesomeIcon icon={faMotorcycle} />
              <p>Commandes a livrer</p>
            </div>
            <div className="offcanvas_item">
              <FontAwesomeIcon icon={faAddressBook} />
              <p>Commandes a emporter</p>
            </div>
            <div className="offcanvas_item" onClick={()=>navigate("/avoires")}>
              <FontAwesomeIcon icon={faStickyNote} />
              <p>Gestion des avoirs</p>
            </div>
            <div className="offcanvas_item" onClick={()=>navigate("/cloture")}>
              <FontAwesomeIcon icon={faCashRegister} />
              <p>Cloture de caisse</p>
            </div>
            <div className="offcanvas_item">
              <FontAwesomeIcon icon={faBorderAll} />
              <p>Cumuler les tables</p>
            </div>
            <div className="offcanvas_item">
              <FontAwesomeIcon icon={faHistory} />
              <p>Rappel ticket</p>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default Zones;
