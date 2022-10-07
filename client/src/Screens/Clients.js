import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
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
import { storeClients } from "../Slices/data";

const History = () => {
  const username = localStorage.getItem("username") || "";
  const user_id = localStorage.getItem("user_id");
  const clients = useSelector((state) => state.data.clients);
  const orders = useSelector((state) => state.data.orderHistory) || [];
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

  const handleEditClient = () => {
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/updateClient",
        {
          client_id: editClient.id,
          client: editClient,
        }
      )
      .then((res) => setping(!ping))
      .catch((err) => console.log(err));
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
  }, [ping]);

  const handleDisconnect = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    navigate("/");
  };

  const renderHTML = (rawHTML: string) =>
    React.createElement("div", {
      dangerouslySetInnerHTML: { __html: rawHTML },
    });
  const currency = localStorage.getItem("currency");
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
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Container>
      </Navbar>
      <Container style={{ backgroundColor: "white" }} fluid>
        <Table hover className="ttt">
          <thead className="tbds">
            {id ? (
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Table</th>
                <th>date</th>
                <th>order</th>
                <th>Prix</th>
                <th>Paiement </th>
              </tr>
            ) : (
              <tr>
                <th>#</th>
                <th>Nom/Prenom</th>
                <th>Telephone</th>
                <th>Email</th>
                <th>Adresse</th>
                <th>Ville</th>
                <th>Code postal</th>
              </tr>
            )}
          </thead>
          <tbody className="scro">
            {id
              ? orders
                  ?.slice()
                  ?.sort((a, b) => b.id - a.id)
                  .filter((el) => el.customer_id == id)
                  .map((order, key) => (
                    <tr>
                      <td>
                        <FontAwesomeIcon icon={faCheckSquare} color="green" />
                      </td>
                      <td style={{ display: "flex" }}>
                        {order.order_type}
                        {order.order_type == "sur place" ? (
                          <img
                            src={surplace}
                            width={32}
                            height={32}
                            style={{ marginLeft: "0.5rem" }}
                          />
                        ) : (
                          <img
                            src={delivery}
                            width={32}
                            height={32}
                            style={{ marginLeft: "0.5rem" }}
                          />
                        )}
                      </td>
                      <td>
                        Table :{" "}
                        {table({ e: order.table_number })?.numero || "N/A"}
                      </td>
                      <td>{order.date + "-" + order.time}</td>
                      <td>{"#" + order.id}</td>
                      <td>
                        <b style={{ display: "flex", color: "#ff6b6b" }}>
                          {order.price} {renderHTML(`<i>${currency}</i>`)}
                        </b>
                      </td>
                      <td>
                        <b>
                          {order.pay_method == "espece"
                            ? "Especes"
                            : order.pay_method == "Carte Bancaire" ||
                              order.pay_method == 1
                            ? "Carte Bancaire"
                            : "Especes"}
                        </b>
                        {order.pay_method == "espece" ||
                        order.pay_method == 2 ? (
                          <img
                            src={cash}
                            width={32}
                            height={32}
                            style={{ marginLeft: "0.5rem" }}
                          />
                        ) : order.pay_method == "Carte Bancaire" ||
                          order.pay_method == 1 ? (
                          <img
                            src={cc}
                            width={32}
                            height={32}
                            style={{ marginLeft: "0.5rem" }}
                          />
                        ) : (
                          ""
                        )}
                      </td>
                    </tr>
                  ))
              : clients
                  .filter(
                    (client) =>
                      client.nom_prenom
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||                     
                      client.telephone.includes(search)
                  )
                  .map((client, key) => (
                    <tr className="client-tr">
                      <td>
                        <FontAwesomeIcon
                          icon={faEdit}
                          color="#ff6b6b"
                          size="2x"
                          onClick={() => {
                            setEditClient(client);
                            console.log(client);
                            setShowEdit(true);
                          }}
                        />
                      </td>
                      <td onClick={() => navigate("/clients/" + client.id)}>
                        {client.nom_prenom || "N/A"}
                      </td>
                      <td>{client.telephone || "N/A"}</td>
                      <td>{client.email || "N/A"}</td>
                      <td>{client.adresse || "N/A"}</td>
                      <td>{client.ville || "N/A"}</td>
                      <td>{client.code_postal || "N/A"}</td>
                    </tr>
                  ))}
          </tbody>
        </Table>
      </Container>
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <Form auto>
              <Form.Group className="mb-3">
                <Row>
                  <Col>
                    <Form.Control
                      value={editClient.nom_prenom}
                      type="text"
                      placeholder="nom/prenom"
                      onChange={(e) =>
                        setEditClient({
                          ...editClient,
                          nom_prenom: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group className="mb-3">
                <Row>
                  <Col>
                    {editClient.telephone?.length > 0 &&
                    editClient.telephone?.length < 10 ? (
                      <Badge bg="danger">
                        Numero pas valide (10 chiffres obligatoire)
                      </Badge>
                    ) : (
                      ""
                    )}
                    <Form.Control
                      value={editClient.telephone}
                      type="tel"
                      placeholder="telephone"
                      onChange={(e) =>
                        setEditClient({
                          ...editClient,
                          telephone: e.target.value,
                        })
                      }
                    />
                  </Col>

                  <Col>
                    <Form.Control
                      value={editClient.email}
                      type="email"
                      placeholder="Email"
                      onChange={(e) =>
                        setEditClient({ ...editClient, email: e.target.value })
                      }
                    />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group className="mb-3">
                <Row>
                  <Col>
                    <Form.Control
                      value={editClient.adresse}
                      as="textarea"
                      type="text"
                      placeholder="adresse"
                      onChange={(e) =>
                        setEditClient({
                          ...editClient,
                          adresse: e.target.value,
                        })
                      }
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      value={editClient.societe}
                      type="text"
                      placeholder="société"
                      onChange={(e) =>
                        setEditClient({
                          ...editClient,
                          societe: e.target.value,
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
                      value={editClient.code_1}
                      type="text"
                      placeholder="code 1"
                      onChange={(e) =>
                        setEditClient({ ...editClient, code_1: e.target.value })
                      }
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      value={editClient.code_2}
                      type="text"
                      placeholder="code 2"
                      onChange={(e) =>
                        setEditClient({ ...editClient, code_2: e.target.value })
                      }
                    />
                  </Col>

                  <Col xs="6">
                    <Form.Control
                      value={editClient.ville}
                      type="text"
                      placeholder="Ville"
                      onChange={(e) =>
                        setEditClient({ ...editClient, ville: e.target.value })
                      }
                    />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group className="mb-3">
                <Row>
                  <Col>
                    <Form.Control
                      value={editClient.interphone}
                      type="text"
                      placeholder="interphone"
                      onChange={(e) =>
                        setEditClient({
                          ...editClient,
                          interphone: e.target.value,
                        })
                      }
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      value={editClient.etage}
                      type="text"
                      placeholder="etage"
                      onChange={(e) =>
                        setEditClient({ ...editClient, etage: e.target.value })
                      }
                    />
                  </Col>
                  <Col xs="6">
                    <Form.Control
                      value={editClient.code_postal}
                      type="postal"
                      placeholder="Code postal"
                      onChange={(e) =>
                        setEditClient({
                          ...editClient,
                          code_postal: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
              </Form.Group>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Annuler
          </Button>
          <Button
            style={{ backgroundColor: "#ff6b6b", borderColor: "#ff6b6b" }}
            variant="primary"
            onClick={() => {
              setShowEdit(false);
              handleEditClient();
            }}
          >
            Terminer
          </Button>
        </Modal.Footer>
      </Modal>
      <NaviBottom />
    </div>
  );
};

export default History;
