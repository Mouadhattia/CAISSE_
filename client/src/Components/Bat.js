import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import {
  faTrashAlt,
  faPercent,
  faStickyNote,
  faSortNumericUpAlt,
  faEdit,
  faChevronCircleLeft,
  faBatteryFull,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
const Bat = () => {
  const [battery, setBattery] = useState({ level: 0, charging: false });
  const [date, setDate] = useState(new Date().toLocaleTimeString("fa-IR"));
  const handleChange = ({ target: { level, charging } }) => {
    setBattery({ level, charging });
  };

  useEffect(() => {
    let battery;
    navigator.getBattery().then((bat) => {
      battery = bat;
      battery.addEventListener("levelchange", handleChange);
      battery.addEventListener("chargingchange", handleChange);
      handleChange({ target: battery });
    });
    return () => {
      battery.removeEventListener("levelchange", handleChange);
      battery.removeEventListener("chargingchange", handleChange);
    };
  }, []);

  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);
    return () => {
      clearInterval(timerID);
    };
  }, []);

  const tick = () => {
    setDate(new Date().toLocaleTimeString("fr-fr").replace(/(.*)\D\d+/, "$1"));
  };
  return (
    <Navbar
      bg="warning"
      variant="light"
      fixed="bottom"
      style={{ height: "50px" }}
    >
      <Container>
        <Navbar.Brand href="#home"></Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="#home" style={{ display: "flex" }}>
            <h5 style={{ paddingTop: "5px", marginRight: "10px" }}>
              <b> {battery.level}%</b>
              {/* <b>{battery.charing ? "charging" : "not charging"}</b> */}
            </h5>
            <FontAwesomeIcon icon={faBatteryFull} size="2x" />
          </Nav.Link>
          <Nav.Link
            href="#features"
            style={{ display: "flex", marginLeft: "2rem" }}
          >
            <FontAwesomeIcon icon={faClock} size="2x" />
            <h5 style={{ paddingTop: "5px", marginLeft: "10px" }}>
              <b> {date}</b>
            </h5>
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Bat;
