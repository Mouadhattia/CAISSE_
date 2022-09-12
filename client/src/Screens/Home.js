import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import Auth from "../Components/Auth";
import Navi from "../Components/Navi";
import "./Styles.css";
import axios from "axios";
import { Container, Nav, Navbar } from "react-bootstrap";

const Home = () => {
  return (
    <div className="my_container">
      <Navi title="connect" />
      <Auth />
      <Navbar bg="light" variant="light" fixed="bottom">
        <Container>
          <Navbar.Brand href="#home">
            Tous droits reservées <b>CAISSECONNECT.FR</b> © 2022
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#home"></Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
};

export default Home;
