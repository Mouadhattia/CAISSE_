import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Zones from "../Components/Zones";
import { Container, Nav, Navbar } from "react-bootstrap";
import TableStats from "../Components/TableStats";
import useTranslation from "./../i18";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "./../Shared/logo.png";
import bg from "./../Shared/bg.jpeg";
import io, { Socket } from "socket.io-client";

import "./Styles.css";

import {
  faCalendarAlt,
  faCashRegister,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import NaviBottom from "../Components/NaviBottom";
import { useDispatch } from "react-redux";
import {
  addNewcheckoutDataFromDB,
  deleteClientandTable,
} from "../Slices/order";
import {
  storeCategories,
  storeNSteps,
  storeOrderHistory,
  storeProducts,
  storeTvaMode,
} from "../Slices/data";
import serveur from "./../Shared/serveur.png";
import $ from "jquery";

const socket =io.connect("http://localhost:5002")
const Main = () => {
  const { t } = useTranslation();
  const currentToken = localStorage.getItem("user");
  const username = localStorage.getItem("username") || "";
  const user_id = localStorage.getItem("user_id");
  const dispatch = useDispatch();
  const navigate = useNavigate();

useEffect(() => {
  socket.on("a",(data)=>{
    console.log(data)
  })
}, [socket])

  useEffect(() => {
    
    

    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/categories",
        {
          user_id,
        }
      )
      .then((res) =>
        dispatch(
          storeCategories({
            categories: res.data.sort((a, b) => a.cat_order - b.cat_order),
          })
        )
      );
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/products",
        {
          user_id,
          category: 0,
        }
      )
      .then((res) => {
        dispatch(storeProducts({ products: res.data.products }));
        dispatch(storeNSteps({ nSteps: res.data.menuSteps }));
      });
  }, []);

  useEffect(() => {
    const caisse_id = localStorage.getItem("caisse_id");
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/getorders",
        {
          user_id,
          caisse_id,
        }
      )
      .then((res) => {
        dispatch(storeOrderHistory({ orderHistory: res.data }));
        console.log(res.data);
        let newData = res.data.map((order) => ({
          ...order,
          table_number: order.table_number || order.order_id,
          order_id: order.id,
        }));
        /*  .filter((order) => order.order_type == "surplace"); */
        console.log("got data", newData);
        newData.map((data) => {
          dispatch(addNewcheckoutDataFromDB({ order: data }));
        });
      });

    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/gettva"
      )
      .then((res) => {
        dispatch(storeTvaMode({ tva_mode: res.data }));
      });
  }, []);



  const handleDisconnect = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="main_bg">
      <Navbar variant="warning" className="navbar">
        <Container className="main-container">
          <Navbar.Brand>
            <div class="logo-container">
              <img id="chrome" class="logo" src={logo} />
            </div>
          </Navbar.Brand>
          <Navbar.Brand>
            {/* <div
              id="circle"
              style={{ background: connect ? "green" : "red" }}
            ></div> */}
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link>
              <h6
                className="nav_link-h6"
                style={{ color: "white", paddingTop: "5px" }}
                // onClick={() => navigate("/calendar")}
              >
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  style={{ marginRight: "5px" }}
                  className="ico2"
                />
                Agenda
              </h6>
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/cloture")}>
              <h6
                style={{ color: "white", paddingTop: "5px" }}
                className="nav_link-h6"
              >
                <FontAwesomeIcon
                  icon={faCashRegister}
                  style={{ marginRight: "5px" }}
                  className="ico1"
                />
                {t("cashier")}
              </h6>
            </Nav.Link>
            <Nav.Link onClick={() => handleDisconnect()}>
              <h6
                style={{ color: "white", paddingTop: "5px" }}
                className="nav_link-h6"
              >
                <FontAwesomeIcon
                  icon={faSignOutAlt}
                  style={{ marginRight: "5px" }}
                  className="ico"
                />
                {t("disconnect")}
              </h6>
            </Nav.Link>
          </Nav>
          <h6
            style={{
              color: "white",
              marginLeft: "1rem",
              marginTop: "0.5rem",
              borderLeft: "1px solid white",
              padding: "5px",
            }}
            className="nav-link"
          >
            <img
              src={serveur}
              width={32}
              height={32}
              style={{ marginRight: "0.5rem" }}
              className="server-img"
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
      <div className="x2">
      
        <Zones />
        <NaviBottom />
      </div>
    </div>
  );
};

export default Main;
