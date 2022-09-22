import axios from "axios";
import Keyboard from "react-simple-keyboard";
import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import CartMenu from "../Components/CartMenu";
import Category from "../Components/Category";
import MenuItems from "../Components/MenuItems";
import { storeCategories, storeNSteps, storeProducts } from "../Slices/data";
import useTranslation from "./../i18";
import tableIcon from "./../Shared/table.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "./../Shared/logo.png";
import {
  faGlobe,
  faSearch,
  faSignOutAlt,
  faTimes,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import serveur from "./../Shared/serveur.png";
import NaviBottom from "../Components/NaviBottom";
import { clearOrders } from "../Slices/order";

import Modal from "react-bootstrap/Modal";
import $ from "jquery";
import Item from "../Components/Item";
import Product from "../Components/Product";

const Menu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [shows, setShows] = useState(false);
  function handleClose(){
    setShows(false)
  }
  function handleShow() {
    setShows(true);
  }

  const selectedTable = useSelector((state) => state.order.selectedTable);
  const params = useParams();
  const user_id = localStorage.getItem("user_id");
  const { order_id } = params;
  const categories = useSelector((state) => state.data.categories);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id);
  const [alert, setAlert] = useState({ show: false, msg: "", type: "" });
  const username = localStorage.getItem("username") || "";
  const [date, setDate] = useState(new Date().toLocaleTimeString("fa-IR"));
  const [battery, setBattery] = useState({ level: 0, charging: false });
  const [confirmed, setconfirmed] = useState(false);

  const [serachbar, setSerachbar] = useState("");

  const products = useSelector((state) => state.data.products);

  // const handleChange = ({ target: { level, charging } }) => {
  //   setBattery({ level, charging });
  // };

  // useEffect(() => {
  //   let battery;
  //   navigator.getBattery().then((bat) => {
  //     battery = bat;
  //     battery.addEventListener("levelchange", handleChange);
  //     battery.addEventListener("chargingchange", handleChange);
  //     handleChange({ target: battery });
  //   });
  //   return () => {
  //     battery.removeEventListener("levelchange", handleChange);
  //     battery.removeEventListener("chargingchange", handleChange);
  //   };
  // }, []);

  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);
    
    return () => {
      clearInterval(timerID);
   
    };
    
  }, []);

  const tick = () => {
    setDate(new Date().toLocaleTimeString("fr-fr").replace(/(.*)\D\d+/, "$1"));
  };

  const dispatch = useDispatch();
  useEffect(() => {
    // if (selectedTable.nbr == undefined) {
    //   navigate("/main");
    // }

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

  // useEffect(() => {
  //   axios
  //     .post(process.env.REACT_APP_API_HOST+":"+process.env.REACT_APP_API_PORT+"/api/products", { user_id, category: selectedCategory })
  //     .then((res) => dispatch(storeProducts({ products: res.data })));
  // }, [selectedCategory]);
  const handleDisconnect = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    navigate("/");
  };
  //keypord
  const [myLayout, setLayout] = useState("default");
  const [filter, setFilter] = useState("");
  const keyboard = useRef();
  const onChange = (input) => {
    setFilter(input)
  };
  const onKeyPress = (button) => {
    console.log("Button pressed", button);
    if(button=="{lock}"&&myLayout=="default"){
      setLayout("shift")
    }
    if(button=="{lock}"&&myLayout=="shift"){
      setLayout("default")
    }
  };

  return (
    <div>
      <Navbar
        style={{ backgroundColor: "#0dcaf0", height: "70px" }}
        variant="warning"
      >
        <Container>
          <Navbar.Brand>
            <div class="logo-container">
              <img id="chrome" class="logo" src={logo} />
            </div>
          </Navbar.Brand>
          <div onClick={()=>handleShow()} style={{cursor:"pointer"}}>
          <h6
           
            style={{
              color: "white",
              marginLeft: "1rem",
              marginTop: "0.5rem",
              padding: "5px",
            }}
          >
             
            <b>Rechercher</b>
            <FontAwesomeIcon icon={faSearch}  style={{marginLeft:"0.5rem"}} />
            </h6>
          </div>
          <Nav className="ms-auto">
            <Nav.Link
              onClick={() => {
                navigate("/main");
                dispatch(clearOrders());
              }}
            >
              <img width="45px" src={tableIcon} className="table-icon" />
            </Nav.Link>
          </Nav>
          <h6
            className="menu-server-logout"
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
      <div className="cont_my">
        <Row
          style={{
            height: "85vh",
            paddingRight: "0 !important",
            backgroundColor: "white",
          }}
        >
          <Col xs={2}>
            <Category
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
            />
          </Col>
          <Col xs={7}>
            <MenuItems
              order_id={order_id}
              categories={categories}
              selectedCategory={selectedCategory}
              setAlert={setAlert}
              confirmed={confirmed}
              setconfirmed={setconfirmed}
            />
          </Col>
          <Col xs={3}>
            <CartMenu
              selectedTable={selectedTable}
              confirmed={confirmed}
              setconfirmed={setconfirmed}
            />
          </Col>
          <NaviBottom />
        </Row>
      </div>
      {shows ? (
        <div className="all-produc-menu" >
          <div className="modal-heade">
            <div className="input-search-product" >
              
              <input type="text" placeholder="Rehercher un produit..."  value={filter}/>
              <FontAwesomeIcon icon={faSearch} className="Sm" />
            </div>

            <FontAwesomeIcon icon={faTimes} className="xm" onClick={()=>handleClose()} />
          </div>
          <div className="modal-bodys">
            {
              products.filter(e=>e.name.toLowerCase().includes(filter.toLowerCase())||e.code.includes(filter)).map((product,key)=><Product order_id={order_id} setAlert={setAlert} setconfirmed={setconfirmed} product={product} />

              )
              
            }
          </div>
          <div className="keyboard">
            <Keyboard
       
            layoutName={myLayout}
                  
              onChange={onChange}
              onKeyPress={onKeyPress}
            />
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Menu;
