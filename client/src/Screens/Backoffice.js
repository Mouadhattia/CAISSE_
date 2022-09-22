import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import loading from "../Shared/loading.gif";
import {
  Badge,
  Button,
  Container,
  Form,
  FormGroup,
  Modal,
  Nav,
  Navbar,
  Row,
  Table,
  Col,
} from "react-bootstrap";
import {
  faCalendarAlt,
  faCashRegister,
  faCheckSquare,
  faEdit,
  faSignOutAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router";
import tableIcon from "./../Shared/table.png";
import useTranslation from "./../i18";
import NaviBottom from "../Components/NaviBottom";
import { useDispatch, useSelector } from "react-redux";
import logo from "./../Shared/logo.png";
import serveur from "./../Shared/serveur.png";
import cc from "./../Shared/cc.png";
import delivery from "./../Shared/delivery.png";
import takeout from "./../Shared/takeout.png";
import cash from "./../Shared/cash.jpg";
import surplace from "./../Shared/surplace.png";
import $ from "jquery";
import axios from "axios";
import { storeCategories, storeCoupon, storeNSteps, storeProducts } from "../Slices/data";

import ProductStock from "../Components/ProductStock";

const History = () => {
 const   chej=[];
 const [filter, setFilter] = useState("");
  const username = localStorage.getItem("username") || "";
  const user_id = localStorage.getItem("user_id");
  const [date, setDate] = useState(new Date().toLocaleTimeString("fa-IR"));
  const [alert, setAlert] = useState({ show: false, msg: "", type: "" });
  const caisse_id = localStorage.getItem("caisse_id");
  const coupons = useSelector((state) => state.data.coupons);
  const tables = useSelector((state) => state.data.tables);
  const [editClient, setEditClient] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [ping, setping] = useState(false);
  const [search, setSearch] = useState("");
  const params = useParams();
  const navigate = useNavigate();
  const { id } = params;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.data.products);
  const categories = useSelector((state) => state.data.categories);

  const [storeid, setstoreid] = useState("")

  const tick = () => {
    setDate(new Date().toLocaleTimeString("fr-fr").replace(/(.*)\D\d+/, "$1"));
  };


  useEffect(() => {
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
      console.log(categories)
  }, []);
 

  const handleDisconnect = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    navigate("/");
  };

  const renderHTML = (rawHTML: string) =>
    React.createElement("div", {
      dangerouslySetInnerHTML: { __html: rawHTML },
    });
  const currency = localStorage.getItem("currency").replace(/;/g, '').replace(/&/g, '');
  
  const table = ({ e }) => {
    console.log(e);
    return tables.find((table) => table.id == e);
  };

  return (
    <div className="navbar">
      <Navbar
        style={{  height: "60px" }}
        variant="warning"
      >
        <Container className="history-navbar">
          <Navbar.Brand>
            <div class="logo-container">
              <img id="chrome" class="logo" src={logo} />
            </div>
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link onClick={() => navigate("/main")}>
              <img width="45px" src={tableIcon} className="table-icon" />
            </Nav.Link>
            <Nav.Link>
              <h6
                style={{ color: "white", paddingTop: "1rem" }}
                className="agenda"
              >
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  style={{ marginRight: "5px" }}
                />
                Agenda
              </h6>
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/cloture")}>
              <h6
                style={{ color: "white", paddingTop: "1rem" }}
                className="caiss-h6"
              >
                <FontAwesomeIcon
                  icon={faCashRegister}
                  style={{ marginRight: "5px" }}
                />
                {t("cashier")}
              </h6>
            </Nav.Link>
            <Nav.Link onClick={() => handleDisconnect()}>
              <h6
                style={{ color: "white", paddingTop: "1rem" }}
                className="log-out"
              >
                <FontAwesomeIcon
                  icon={faSignOutAlt}
                  style={{ marginRight: "5px" }}
                />
                {t("disconnect")}
              </h6>
            </Nav.Link>
          </Nav>
          <h6
            className="client-server-icon"
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
          <div className="client-search">
            <label>
              <FontAwesomeIcon icon={faSearch} />
            </label>
            <input
              type="text"
              placeholder="Chercher..."
              onChange={(e) => setFilter(e.target.value)}
              value={filter}
            />
          </div>
        </Container>
      </Navbar>
      <div className="backoffice">
        <div className="B_header">
       
            <select name="" id="b_office_select"  onChange={(e)=>{setstoreid(e.target.value) }} >
             {categories.map((e,key)=><option  key={key} value={e.id}>{e.name}</option>)} 
            </select>
         
        </div>
      <div className="all-produc-menus" >    
        {products.length!=0? <div className="modal-bodyss">
            {
             
              products.filter(e=>storeid!=''?e.cat_id==storeid:e.cat_id).filter(e=>e.name.toLowerCase().includes(filter.toLowerCase())||e.code.includes(filter)).map((product,key)=><ProductStock setAlert={setAlert}  product={product} />

              )
              
            }
          </div>:<div className="loadingProd">
   
   <h1>Chargement des produits...</h1>
   <img src={loading} alt="loading" />
 </div>  }       
        </div>
        </div>    
      <NaviBottom />
    </div>
  );
};

export default History;
