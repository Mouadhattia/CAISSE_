import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Table } from "react-bootstrap";
import useTranslation from "./../i18";
import { initClient, setType, storeSelectedTable } from "../Slices/order";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faCheck, faUtensils } from "@fortawesome/free-solid-svg-icons";

const Tables = ({ selectedZone }) => {
  const { t } = useTranslation();
  let rowLayout = [...Array(12).keys()];
  const tables = useSelector((state) => state.data.tables);
  const orders = useSelector((state) => state.order.checkoutData);
  const [selectedTable, setSelectedTable] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [ppl, setPpl] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const table = (e) => {
    return tables
      .filter((t) => t.zone_id == selectedZone)
      .find((table) => table.position == e);
  };
  const onTableClick = (e) => {
    if (table(e) != undefined && table(e).active != 0) {
      setSelectedTable({
        id: table(e).id,
        nbr: table(e).numero,
        ppl: table(e).nbrePersonne,
        libre: table(e).libre,
        nbrCouverts: 1,
      });
      if (table(e).libre == false) {
        let myorder = orders.filter(
          (one) => one.table_number == table(e).id && one.status!="completed"
        )[0];

        navigate(`/checkout/${myorder.order_id}`);
      } else {
        setShowModal(true);
      }
    }
  };
  const toMenu = () => {
    setShowModal(false);
    console.log(selectedTable);
    dispatch(storeSelectedTable({ selectedTable }));
    dispatch(initClient({ client: { type: "sur place" } }));
    dispatch(setType("sur place"))
    setTimeout(() => {
      navigate("/menu");
    }, 300);
  };

  const handleCheckout = () => {
    navigate(`/checkout/${selectedTable.id}`);
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <Table style={{  }}>
          <tbody>
            <tr>
              {rowLayout.map((e) => (
                <td>
                  <Button 
                    className={
                      table(e)?.type == "rond" ? "table_btn round" : "table_btn" 
                    }
                    variant={
                      table(e)
                        ? table(e)?.active
                          ? table(e)?.libre
                            ? "success"
                            : "danger"
                          : "secondary"
                        : "dark"
                    }
                    onClick={() => onTableClick(e)}
                  >
                    {table(e)?.numero}
                  </Button>
                </td>
              ))}
            </tr>
            <tr>
              {rowLayout
                .map((x) => x + 12)
                .map((e) => (
                  <td>
                    <Button
                      className={
                        table(e)?.type == "rond"
                          ? "table_btn round"
                          : "table_btn"
                      }
                      variant={
                        table(e)
                          ? table(e)?.active
                            ? table(e)?.libre
                              ? "success"
                              : "danger"
                            : "secondary"
                          : "dark"
                      }
                      onClick={() => onTableClick(e)}
                    >
                      {table(e)?.numero}
                    </Button>
                  </td>
                ))}
            </tr>
            <tr>
              {rowLayout
                .map((x) => x + 24)
                .map((e) => (
                  <td>
                    <Button
                      className={
                        table(e)?.type == "rond"
                          ? "table_btn round"
                          : "table_btn"
                      }
                      variant={
                        table(e)
                          ? table(e)?.active
                            ? table(e)?.libre
                              ? "success"
                              : "danger"
                            : "secondary"
                          : "dark"
                      }
                      onClick={() => onTableClick(e)}
                    >
                      {table(e)?.numero}
                    </Button>
                  </td>
                ))}
            </tr>
            <tr>
              {rowLayout
                .map((x) => x + 36)
                .map((e) => (
                  <td>
                    <Button
                      className={
                        table(e)?.type == "rond"
                          ? "table_btn round"
                          : "table_btn"
                      }
                      variant={
                        table(e)
                          ? table(e)?.active
                            ? table(e)?.libre
                              ? "success"
                              : "danger"
                            : "secondary"
                          : "dark"
                      }
                      onClick={() => onTableClick(e)}
                    >
                      {table(e)?.numero}
                    </Button>
                  </td>
                ))}
            </tr>
            <tr>
              {rowLayout
                .map((x) => x + 48)
                .map((e) => (
                  <td>
                    <Button
                      className={
                        table(e)?.type == "rond"
                          ? "table_btn round"
                          : "table_btn"
                      }
                      variant={
                        table(e)
                          ? table(e)?.active
                            ? table(e)?.libre
                              ? "success"
                              : "danger"
                            : "secondary"
                          : "dark"
                      }
                      onClick={() => onTableClick(e)}
                    >
                      {table(e)?.numero}
                    </Button>
                  </td>
                ))}
            </tr>
            <tr>
              {rowLayout
                .map((x) => x + 60)
                .map((e) => (
                  <td>
                    <Button
                      className={
                        table(e)?.type == "rond"
                          ? "table_btn round"
                          : "table_btn"
                      }
                      variant={
                        table(e)
                          ? table(e)?.active
                            ? table(e)?.libre
                              ? "success"
                              : "danger"
                            : "secondary"
                          : "dark"
                      }
                      onClick={() => onTableClick(e)}
                    >
                      {table(e)?.numero}
                    </Button>
                  </td>
                ))}
            </tr>
          </tbody>
        </Table>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        {selectedTable.libre == true ? (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                <h5 style={{ fontSize: "24px" }}>
                  <FontAwesomeIcon
                    icon={faUtensils}
                    style={{ marginRight: "1rem" }}
                  />
                  {t("newTable")}
                </h5>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {t("nbrCouverts")}
              {Array.from({ length: selectedTable.ppl }, (_, i) => i + 1).map(
                (e) => (
                  <Button
                    className="ml"
                    onClick={() => {
                      setSelectedTable({ ...selectedTable, nbrCouverts: e });
                      console.log(selectedTable);
                    }}
                    variant={
                      selectedTable?.nbrCouverts == e ? "warning" : "dark"
                    }
                    style={{
                      backgroundColor:
                        selectedTable?.nbrCouverts == e ? "#ff6b6b" : "black",
                      borderColor:
                        selectedTable?.nbrCouverts == e ? "#ff6b6b" : "black",
                    }}
                  >
                    {e}
                  </Button>
                )
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                {t("cancel")}
              </Button>
              <Button
                style={{ backgroundColor: "#ff6b6b", borderColor: "#ff6b6b" }}
                variant="warning"
                onClick={() => toMenu()}
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  style={{ marginRight: "0.5rem" }}
                />
                {t("validate")}
              </Button>
            </Modal.Footer>
          </>
        ) : (
          <Modal.Body>
            <Button variant="danger" onClick={() => handleCheckout()}>
              Checkout !
            </Button>
          </Modal.Body>
        )}
      </Modal>
    </div>
  );
};

export default Tables;
