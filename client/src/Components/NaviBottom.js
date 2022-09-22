import React, { useEffect, useState } from "react";
import {
  Badge,
  Breadcrumb,
  Button,
  Col,
  Container,
  Form,
  FormGroup,
  Modal,
  Nav,
  Navbar,
  Row,
  Tab,
  Tabs,
} from "react-bootstrap";

import Swal from "sweetalert2";

import {
  storeCategories,
  storeNSteps,
  storeOrderHistory,
  storeProducts,
  storeTvaMode,
} from "../Slices/data";
import { addNewcheckoutDataFromDB, setType } from "../Slices/order";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import {
  clearOrders,
  deleteClientandTable,
  initClient,
  setRemarque,
  storeSelectedTable,
} from "../Slices/order";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faCheckSquare,
  faEdit,
  faHistory,
  faLockOpen,
  faPlus,
  faPrint,
  faStickyNote,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import timespan from "jsonwebtoken/lib/timespan";
import { Typeahead } from "react-bootstrap-typeahead";
import axios from "axios";
import { storeClients } from "../Slices/data";
import loading from "../Shared/loading.gif";
import { BiTransfer } from "react-icons/bi";

const NaviBottom = () => {
  const user_id = localStorage.getItem("user_id");
  const zones = useSelector((state) => state.data.zones);
  const [selectedZone, setSelectedZone] = useState("");
  const tables = useSelector((state) => state.data.tables);
  const ordersHistory = useSelector((state) => state.data.orderHistory);
  const checkoutData = useSelector((state) => state.order.checkoutData);
  const clients = useSelector((state) => state.data.clients);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let freeTables = tables?.filter((table) => table.libre == true)?.length;

  let busyTables = tables?.filter((table) => table.libre == false)?.length;

  const [show, setShow] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showHistoryButton, setshowHistoryButton] = useState(false);

  const [note, setnote] = useState("");

  var ID = function () {
    return Number(
      Math.floor(Math.random() * Date.now())
        .toString()
        .substring(11)
    );
  };

  const path = window.location.hash;

  let clientsData = clients.map((client) => client.nom_prenom);
  const orders = useSelector((state) => state.data.orderHistory) || [];

  var curr = new Date();
  var date = curr.toISOString().substr(0, 10);
  var time = curr.getHours() + ":" + curr.getMinutes();
  let avenir = checkoutData?.filter((e) => e.date > date)?.length || 0;
  let enCours =
    checkoutData?.filter((e) => (e.status == "pending" ||e.status=="cooking"||e.status=="ready")&& e.date == date)
      ?.length || 0;
  let annuler =
    checkoutData?.filter((e) => e.status == "rejected")?.length || 0;

  let orderNbr =
    ordersHistory?.filter((e) => e.status == "completed")?.length || 0;
  const handleAddNote = () => {
    dispatch(setRemarque({ remarque: note }));
    setShowNote(false);
  };

  useEffect(() => {
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/getclients",
        {
          user_id,
        }
      )
      .then((res) => {
        dispatch(storeClients({ clients: res.data.clients }));
      });
  }, []);
  const [orderHistory, setOrderHistory] = useState([]);

  const [orderLoding, setOrderLoding] = useState(false);
  const [selectedTable, setSelectedTable] = useState({});
  const [newClient, setnewClient] = useState({});
  const [showHistory, setshowHistory] = useState(false);
  const [Table_nbr, setTable_nbr] = useState(0);
  const [old, setOld] = useState(false);
  const [textorder_id, settextorder_id] = useState("");

  const [client, setClient] = useState({
    prenom: "",
    company: "",
    code1: "",
    code2: "",
    etage: "",
    interphone: "",
    name: "",
    phone: "",
    address: "",
    post: "",
    city: "",
    message: "",
    email: "",
    type: "emporter",
    nbrCouverts: 1,
    id: ID(),
    date: date,
    time: time,
  });

  const table = (e) => {
    return tables.find((table) => table.numero == e);
  };

  const handleClose = () => {
    setShow(false);
    setshowHistory(false);
  };
  const handleShow = () => setShow(true);

  const handleNewOrder = () => {
    dispatch(deleteClientandTable());
    handleShow();
  };

  const handleGetOrders = async () => {
    setOrderLoding(true);
    const caisse_id = localStorage.getItem("caisse_id");
    await axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/getallorders",
        {
          user_id,
          caisse_id,
          customer_id: client.id,
        }
      )
      .then((res) => {
        console.log({ zboub: res.data });
        setOrderHistory(res.data);
        setOrderLoding(false);
      })
      .catch((err) => console.log(err));
  };

  // const handleCreate = async () => {
  //   if (old == false) {
  //     await axios
  //       .post("/api/createClient", {
  //         user_id,
  //         client: {
  //           etage: client.etage || 0,
  //           interphone: client.interphone || 0,
  //           supprimer: 0,
  //           societe: client.company || "",
  //           nom_prenom: client.name || "",
  //           telephone: client.phone || "",
  //           adresse: client.address || "",
  //           code_postal: client.post || 0,
  //           ville: client.city || "",
  //           email: client.email || "",
  //           code_1: client.code1 || "",
  //           code_2: client.code2 || "",
  //         },
  //       })
  //       .then((res) => {
  //         setClient({ ...client, id: res.data.id });
  //        console.log({ client: client.id, data: res.data });
  //       })
  //       .catch((err) => console.log(err));
  //   }
  //   if (client?.type == "surplace") {
  //     console.log(table(Table_nbr).id);
  //     dispatch(
  //       storeSelectedTable({
  //         selectedTable: {
  //           id: table(Table_nbr).id,
  //           nbr: table(Table_nbr).numero,
  //           ppl: table(Table_nbr).nbrePersonne,
  //           libre: table(Table_nbr).libre,
  //           nbrCouverts: 1,
  //         },
  //       })
  //     );
  //     handleClose();
  //     navigate("/menu");
  //   }
  //   dispatch(initClient({ client }));

  // };
  const handleCreate = () => {
    if (old == false) {
      axios
        .post(
          process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/createClient",
          {
            user_id,
            client: {
              etage: client.etage || 0,
              interphone: client.interphone || 0,
              supprimer: 0,
              societe: client.company || "",
              nom_prenom: client.name || "",
              telephone: client.phone || "",
              adresse: client.address || "",
              code_postal: client.post || 0,
              ville: client.city || "",
              email: client.email || "",
              code_1: client.code1 || "",
              code_2: client.code2 || "",
            },
          }
        )
        .then((res) => {

          setClient({ ...client, id: res.data.id });
          dispatch(initClient({ client: { ...client, id: res.data.id } }));
        })
        .catch((err) => console.log(err));
    } else {
      dispatch(initClient({ client }));
    }
    if (client.type == "surplace") {
      
    if (Table_nbr==0)
    {
      Swal.fire({
        title: "Selectioner une table !",
      });
    }
    else{
      dispatch(
        storeSelectedTable({
          selectedTable: {
            id: table(Table_nbr).id,
            nbr: table(Table_nbr).numero,
            ppl: table(Table_nbr).nbrePersonne,
            libre: table(Table_nbr).libre,
            nbrCouverts: 1,
          },
        })
      );
      handleClose();
      
      navigate("/menu");
    }     
    }
if(client.type!="surplace")
{
  handleClose();
    navigate("/menu");
}
    
  };

  const handleSelection = (x) => {
    setshowHistoryButton(true);
    setOld(true);
    let selectedClient = clients?.filter(
      (e) =>
        e.nom_prenom?.toLowerCase().includes(x?.toLowerCase()) ||
        e.telephone?.toLowerCase().includes(x?.toLowerCase()) ||
        e.email?.toLowerCase().includes(x?.toLowerCase())
    )[0];

   
    if (selectedClient) {
      setClient({
        ...client,
        id: selectedClient.id,
        prenom: selectedClient.nom_prenom,
        company: selectedClient.societe,
        code1: selectedClient.code_1,
        code2: selectedClient.code_2,
        etage: selectedClient.etage,
        interphone: selectedClient.interphone,
        name: selectedClient.nom_prenom,
        phone: selectedClient.telephone,
        address: selectedClient.adresse,
        post: selectedClient.code_postal,
        city: selectedClient.ville,
        email: selectedClient.email,
      });
    }
  };
  //test

  const handlePrint = (newOrder) => {
    
    let order = {
      table: newOrder?.table_number || "",
      client_id: newOrder?.customer_id || 0,
      order_id: newOrder.id,
      message: newOrder.message || "aucune",
      customer_name: newOrder?.customer_name || "",
      customer_company: newOrder?.customer_company || "",
      code1: newOrder?.code1 || "",
      code2: newOrder?.code2 || "",
      interphone: newOrder?.interphone || "",
      etage: newOrder?.etage || "",
      table_number: newOrder?.table_number || 0,
      customer_tel: newOrder?.customer_tel || "",
      customer_adress: newOrder?.customer_adress,
      status: newOrder?.status,
      orderType: newOrder?.order_type,
      paymentType: newOrder?.pay_method,
      totalPrice: newOrder?.price,
      taxPrice: newOrder?.tva,
      tvas: (newOrder?.price * newOrder?.tva) / 100,
      orderItems: newOrder?.orderItems,
      date: newOrder?.date,
      time: newOrder?.time,
    };
    // console.log(calcTotal().tvas);
    // newOrders.map((one) => {
    //   order.orderItems.push({
    //     ...one,
    //     price: one.price,
    //     tva: one.tva,
    //   });
    // });

    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/printOrder",
        {
          kitchen: false,
          user_id: user_id,
          order: {
            new: false,
            ...order,

            // Date: new Date(),
            nbrCouverts: 1,
          },
        }
      )
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
  };

  console.log("path", path);
  return (
    <div>
      <Navbar bg="light" variant="light" fixed="bottom" className="nav-buttom">
        <Container>
          <Nav className="me-auto">
            <Nav.Link>
              <Button variant="success" className="nav-buttom-button">
                Libres <Badge bg="success">{freeTables}</Badge>
              </Button>
            </Nav.Link>
            <Nav.Link>
              <Button
                variant="danger"
                onClick={() => {
                  dispatch(clearOrders());
                  navigate("/history/encours");
                }}
                className="nav-buttom-button"
              >
                Encours<Badge bg="danger"> {enCours}</Badge>
              </Button>
            </Nav.Link>
            <Nav.Link>
              <Button variant="info" className="nav-buttom-button">
                Livrés <Badge bg="info">0</Badge>
              </Button>
            </Nav.Link>
            <Nav.Link>
              <Button
                variant="warning"
                className="nav-buttom-button"
                onClick={() => {
                  dispatch(clearOrders());
                  navigate("/history/annules");
                }}
              >
                Annulées <Badge bg="warning">{annuler}</Badge>
              </Button>
            </Nav.Link>
            <Nav.Link>
              <Button
                className="nav-buttom-button"
                variant="dark"
                onClick={() => {
                  dispatch(clearOrders());
                  navigate("/history/avenir");
                }}
              >
                Commandes a Venir <Badge bg="dark">{avenir}</Badge>
              </Button>
            </Nav.Link>
            <Nav.Link>
              <Button
                className="nav-buttom-button"
                variant="primary"
                onClick={() => {
                  dispatch(clearOrders());
                  navigate("/history/all");
                }}
              >
                Terminées <Badge bg="primary">{orderNbr}</Badge>
              </Button>
            </Nav.Link>
          
            <Nav.Link>
              <Button
                variant="warning"
                className="nav-buttom-button"
                onClick={() => {
                  axios
                    .post(
                      process.env.REACT_APP_API_HOST +
                        ":" +
                        process.env.REACT_APP_API_PORT +
                        "/api/getorder",
                      {
                        user_id: user_id,
                        order_id: textorder_id,
                      }
                    )
                    .then((res) => {
                      // dispatch(storeClients({ clients: res.data.clients }));
                      console.log(res.data);
                      if (res.data == "no data") {
                        Swal.fire({
                          icon: "warning",
                          title: `pas de commande avec cet identifiant`,
                          showConfirmButton: false,
                          timer: 1500,
                        });
                      }else if(res.data[0].status=="completed"){
                        Swal.fire({
                          icon: "warning",
                          title: `la commande est terminée `,
                          showConfirmButton: false,
                          timer: 1500,
                        });
                      }
                       else  {
                        console.log(res.data[0].status);
                        navigate(`/checkout/${textorder_id}`);
                      }
                    });
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </Nav.Link>
            <Nav.Link>
              <Form.Control
                 className="order_id_input"
                type="text"
                placeholder="Order_id"
                onChange={(e) => {
                  console.log(e.target.value);
                  settextorder_id(e.target.value);
                }}
              />
            </Nav.Link>
          </Nav>
          <Button
            className="nav-buttom-button nouvelle-cmd-btn"
            style={{ borderRadius: "50px !important" }}
            variant="success"
            size="lg"
            onClick={() => handleNewOrder()}
          >
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: "1rem" }} />
            Nouvelle Commande
          </Button>
          {path.includes("menu") ? (
            <Button
              className="nav_butoons-note"
              onClick={() => setShowNote(true)}
              style={{
                borderRadius: "50px !important",
                display: "flex",
                alignItems: "center",
                borderColor: "#d63031",
                backgroundColor: "transparent",
                marginLeft: "0.5rem",
              }}
              variant="secondary"
              size="lg"
            >
              <FontAwesomeIcon icon={faStickyNote} color="#d63031" />
            </Button>
          ) : (
            ""
          )}
        </Container>

        <Modal show={showNote} onHide={() => setShowNote(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Remarque</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <h3>
                <FontAwesomeIcon
                  icon={faStickyNote}
                  color="#d63031"
                  style={{ marginRight: "1rem" }}
                />
                Note
              </h3>
              <Form.Control
                onChange={(e) => setnote(e.target.value)}
                as="textarea"
                type="text"
                placeholder="Remarque ..."
              ></Form.Control>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNote(false)}>
              Annuler
            </Button>
            <Button
              variant="warning"
              style={{ backgroundColor: "#ff6b6b", borderColor: "#ff6b6b" }}
              onClick={handleAddNote}
            >
              Ajouter
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={show}
          onHide={handleClose}
          style={{ zIndex: 1050, left: -120, top: 50 }}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <div style={{ width: "100%" }}>
                <h5>Choix du mode de consommation</h5>
                {user_id!='150'?<Button
                  size="lg"
                  variant={
                    client?.type == "emporter" ? "light" : "outline-warning"
                  }
                  style={{
                    borderColor: "#ff6b6b",
                    color: "#ff6b6b",
                    marginRight: "2rem",
                  }}
                  onClick={() => {dispatch(setType("emporter")) ;setClient({ ...client, type: "emporter" })}}
                >
                  A emporter
                </Button>:''}
                

{user_id!='150'? <Button
                  size="lg"
                  variant={
                    client?.type == "livraison" ? "light" : "outline-warning"
                  }
                  style={{
                    borderColor: "#ff6b6b",
                    color: "#ff6b6b",
                    marginRight: "2rem",
                  }}
                  onClick={() => {dispatch(setType("livraison")) ;setClient({ ...client, type: "livraison" })}}
                >
                  Livraison
                </Button>:""}
               
                <Button
                  size="lg"
                  variant={
                    client?.type == "surplace" ? "light" : "outline-warning"
                  }
                  style={{ borderColor: "#ff6b6b", color: "#ff6b6b" }}
                  onClick={() => {dispatch(setType("surplace"))  ;setClient({ ...client, type: "surplace" })}}
                >
                  sur place
                </Button>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {showHistory && (
              <div className="histo">
                <h1 style={{ textAlign: "center" }}>
                  {" "}
                  <b>Historique Client</b>{" "}
                  <FontAwesomeIcon
                    onClick={() => {
                      setshowHistory(false);
                      setOrderHistory([]);
                    }}
                    className="times"
                    icon={faTimes}
                  />
                </h1>
                <div className="hhead">
                  <h3 className="wid">Type</h3>
                  <h3 className="wid">Date</h3>
                  <h3 className="wid">Order</h3>
                  <h3 className="wid">Prix</h3>
                  <h3 className="wid">Paiement</h3>
                </div>
                <div className="hbody">
                  {orderHistory.length == 0 && !orderLoding ? (
                    <h1>Aucune Commande trouvée</h1>
                  ) : orderLoding ? (
                    <div style={{ display: "flex" }}>
                      <h3>Chargement en cours</h3>
                      <img src={loading} alt="loading" width={30} />
                    </div>
                  ) : (
                    ""
                  )}
                  {orderHistory?.map((order, key) => (
                    <div className="el">
                      <h5 className="wid">{order?.order_type}</h5>
                      <h5 className="wid">{order?.date}</h5>
                      <h5 className="wid">#{order?.id}</h5>
                      <h5 className="wid">{order?.price?.toFixed(2)}€</h5>
                      <h5 className="wid">{order?.pay_method}</h5>
                      <FontAwesomeIcon
                        icon={faPrint}
                        onClick={() => handlePrint(order)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  ))}
                </div>
                {/* <Button className="impr_btn" style={{ marginBottom: "1rem" }}>
                  Imprimer
                </Button> */}
              </div>
            )}
            <div>
              {client?.type == "livraison" ? (
                <div>
                  <Form auto>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={client.name}
                            type="text"
                            placeholder="nom/prenom"
                            onChange={(e) =>
                              setClient({ ...client, name: e.target.value })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          {client.telephone?.length > 0 &&
                          client.telephone?.length < 10 ? (
                            <Badge bg="danger">
                              Numero pas valide (10 chiffres obligatoire)
                            </Badge>
                          ) : (
                            ""
                          )}
                          <Typeahead
                            onInputChange={(e) => {
                              setClient({ ...client, phone: e });
                              
                            }}
                            onChange={(e) => {
                              handleSelection(e[0]);
                              console.log(e);
                            }}
                            options={clients.map((client) => client.telephone)}
                            placeholder="telephone"
                            type="number"
                            min="1"
                            max="5"
                          />
                        </Col>

                        <Col>
                          <Form.Control
                            value={client.email}
                            type="email"
                            placeholder="Email"
                            onChange={(e) =>
                              setClient({ ...client, email: e.target.value })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={client.address}
                            as="textarea"
                            type="text"
                            placeholder="Addresse"
                            onChange={(e) =>
                              setClient({
                                ...client,
                                address: e.target.value,
                              })
                            }
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            value={client.company}
                            type="text"
                            placeholder="société"
                            onChange={(e) =>
                              setClient({
                                ...client,
                                company: e.target.value,
                              })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={client.code1}
                            type="text"
                            placeholder="code 1"
                            onChange={(e) =>
                              setClient({ ...client, code1: e.target.value })
                            }
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            value={client.code2}
                            type="text"
                            placeholder="code 2"
                            onChange={(e) =>
                              setClient({ ...client, code2: e.target.value })
                            }
                          />
                        </Col>

                        <Col xs="6">
                          <Form.Control
                            value={client.city}
                            type="text"
                            placeholder="Ville"
                            onChange={(e) =>
                              setClient({ ...client, city: e.target.value })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={client.interphone}
                            type="text"
                            placeholder="interphone"
                            onChange={(e) =>
                              setClient({
                                ...client,
                                interphone: e.target.value,
                              })
                            }
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            value={client.etage}
                            type="text"
                            placeholder="etage"
                            onChange={(e) =>
                              setClient({ ...client, etage: e.target.value })
                            }
                          />
                        </Col>
                        <Col xs="6">
                          <Form.Control
                            value={client.post}
                            type="postal"
                            placeholder="Code postal"
                            onChange={(e) =>
                              setClient({ ...client, post: e.target.value })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={client.message}
                            as="textarea"
                            type="text"
                            placeholder="remarque"
                            onChange={(e) =>
                              setClient({
                                ...client,
                                message: e.target.value,
                              })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={client.date}
                            type="date"
                            defaultValue={client.date}
                            onChange={(e) =>
                              setClient({ ...client, date: e.target.value })
                            }
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            value={client.time}
                            type="time"
                            defaultValue={client.time}
                            onChange={(e) =>
                              setClient({ ...client, time: e.target.value })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                  </Form>
                </div>
              ) : client?.type == "emporter" ? (
                <div>
                  <Form auto>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={client.name}
                            type="text"
                            placeholder="nom/prenom"
                            onChange={(e) =>
                              setClient({ ...client, name: e.target.value })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          {client.telephone?.length > 0 &&
                          client.telephone?.length < 10 ? (
                            <Badge bg="danger">
                              Numero pas valide (10 chiffres obligatoire)
                            </Badge>
                          ) : (
                            ""
                          )}
                          <Typeahead
                            onInputChange={(e) => {
                              setClient({ ...client, phone: e });
                              setOld(false);
                              setshowHistory(false);
                            }}
                            onChange={(e) => {
                              handleSelection(e[0]);
                              console.log(e);
                            }}
                            options={clients.map((client) => client.telephone)}
                            placeholder="telephone"
                          />
                        </Col>
                      </Row>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={client.message}
                            as="textarea"
                            type="text"
                            placeholder="remarque"
                            onChange={(e) =>
                              setClient({
                                ...client,
                                message: e.target.value,
                              })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={client.date}
                            type="date"
                            defaultValue={client.date}
                            onChange={(e) =>
                              setClient({ ...client, date: e.target.value })
                            }
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            value={client.time}
                            type="time"
                            defaultValue={client.time}
                            onChange={(e) =>
                              setClient({ ...client, time: e.target.value })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                  </Form>
                </div>
              ) : (
                <div>
                  <Form auto>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Typeahead
                            onInputChange={(e) => {
                              setClient({ ...client, name: e });
                              setOld(false);
                              setshowHistory(false);
                            }}
                            onChange={(e) => handleSelection(e[0])}
                            options={clients.map((client) => client.nom_prenom)}
                            placeholder="nom/prenom"
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                        >
                          <h3>Zones :</h3>
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
                        </Col>
                      </Row>
                      <Row>
                        <Col
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <h3>Tables :</h3>
                          {tables
                            .filter((e) => e.active == true && e.libre == true && e.zone_id == selectedZone)
                            .map((el) => (
                              <div
                                className={
                                  el.numero == Table_nbr ? "tbl sel" : "tbl"
                                }
                                onClick={() => setTable_nbr(el.numero)}
                              >
                                <h6>
                                  <b>{el.numero}</b>
                                </h6>
                              </div>
                            ))}
                          {/* <Form.Control
                              value={Table_nbr}
                              type="number"
                              placeholder="Numero de la table"
                              onChange={(e) => setTable_nbr(e.target.value)}
                            /> */}
                        </Col>
                      </Row>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Control
                            value={client.message}
                            as="textarea"
                            type="text"
                            placeholder="remarque"
                            onChange={(e) =>
                              setClient({ ...client, message: e.target.value })
                            }
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                  </Form>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            {showHistoryButton ? (
              <Button
                variant="warning"
                style={{ backgroundColor: "#ff6b6b", borderColor: "#ff6b6b" }}
                onClick={() => {
                  setshowHistory(!showHistory);
                  handleGetOrders();
                }}
              >
                <FontAwesomeIcon
                  icon={faHistory}
                  style={{ marginRight: "5px" }}
                />
                Historiques
              </Button>
            ) : (
              ""
            )}
            <Button variant="outline-secondary" onClick={handleClose}>
              Annuler
            </Button>
            <Button
              variant="warning"
              style={{ backgroundColor: "#ff6b6b", borderColor: "#ff6b6b" }}
              onClick={() => handleCreate()}
            >
              <FontAwesomeIcon
                icon={faCheckSquare}
                style={{ marginRight: "5px" }}
              />
              Créer la vente
            </Button>
          </Modal.Footer>
        </Modal>
      </Navbar>
      {/* <div>
            <h3>
              <FontAwesomeIcon
                icon={faPencilAlt}
                style={{ width: "24", marginRight: "0.5rem" }}
              />
              Remarque
            </h3>
            <Form.Control
              type="textarea"
              as="textarea"
              placeholder="note"
              style={{ width: "300px", marginRight: "300px" }}
              onChange={(e) =>
                setnewProduct({ ...newProduct, note: e.target.value })
              }
            ></Form.Control>
          </div> */}
    </div>
  );
};

export default NaviBottom;
