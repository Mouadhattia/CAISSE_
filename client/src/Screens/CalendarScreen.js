import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import tableIcon from "./../Shared/table.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "./../Shared/logo.png";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import serveur from "./../Shared/serveur.png";
import { clearOrders } from "../Slices/order";
import _ from "lodash";

const CalendarScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "";

  const handleDisconnect = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    navigate("/"); 
  };
  return (
    <div>
      <Navbar
        style={{ backgroundColor: "#ff6b6b", height: "70px" }}
        variant="warning"
      >
        <Container>
          <Navbar.Brand>
            <div class="logo-container">
              <img id="chrome" class="logo" src={logo} />
            </div>
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link
              onClick={() => {
                navigate("/main");
                dispatch(clearOrders());
              }}
            >
              <img width="45px" src={tableIcon} />
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
      <div id="calendar" style={{ height: "800px" }}></div>
    </div>
  );
};

export default CalendarScreen;
