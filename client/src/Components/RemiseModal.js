import React, { useEffect, useRef, useState } from "react";
import { Button, Form, FormGroup } from "react-bootstrap";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import {
  faCheck,
  faCross,
  faMinusCircle,
  faMinusSquare,
  faPlus,
  faPlusCircle,
  faPlusSquare,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";

const RemiseModal = ({
  handleUpdateOrder,
  orderTo,
  setOrderTo,
  setshowRemise,
  calcOrder,
}) => {
  const currency = localStorage.getItem("currency");
  const [ping, setping] = useState(true);
  const [input, setInput] = useState("");
  const [myLayout, setLayout] = useState([
    "9 8 7",
    "6 5 4",
    "3 2 1",
    "0 {bksp}",
  ]);
  const keyboard = useRef();
  const [remisePerc, setremisePerc] = useState(0);
  const [remise, setremise] = useState(0);
  const [libre, setlibre] = useState(0);
  const [offert, setoffert] = useState(false);
  const [selected, setselected] = useState("");

  const handleRemise = () => {
    let copy = JSON.parse(JSON.stringify(orderTo.order) || {});
    let finalPrice = 0;
    if (offert == true) {
      finalPrice = 0;
      console.log("offert", finalPrice,copy);
    } else if (remisePerc > 0) {
      finalPrice =
      orderTo.order?.price -
        (orderTo.order?.price * remisePerc) / 100;
      console.log("perc", finalPrice);
    } else if (remise > 0) {
      finalPrice = orderTo.order?.price - remise;
      console.log("remise", finalPrice);
     
    } else if (libre > 0) {
      finalPrice = libre;
      console.log("libre", finalPrice);
    }
    console.log("nothing");
    copy = { ...copy, finalPrice };
    setOrderTo({ ...orderTo, order: copy });
  };

  useEffect(() => {
    handleRemise();
  }, [offert, remise, remisePerc, libre]);

  const onChange = (input) => {
    setInput(input);
    console.log("Input changed", input);
    switch (selected) {
      case "remisePerc":
        if (Number(input) > 100) {
          Swal.fire({
            icon: "warning",
            title: "faut etre inferieur a 100%",
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          setremisePerc(Number(input));
          console.log(remisePerc);
          setremise(0);
          setlibre(0);
          setoffert(false);
        }
        break;
      case "remise":
        if (Number(input) > orderTo.order?.price) {
          Swal.fire({
            icon: "warning",
            title: `faut etre inferieur a ${calcOrder(orderTo.order).price} €`,
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          setremisePerc(0);
          setremise(Number(input));
          console.log(remise);
          setlibre(0);
          setoffert(false);
        }
        break;
      case "libre":
        setremisePerc(0);
        setremise(0);
        setlibre(Number(input));
        console.log(libre);
        setoffert(false);
        break;
    }

    // handleRemise();
    // let newarr = [...lay];
    // newarr[selected].value = Number(input);
    // setlay(newarr);
    setInput("");
  };

  const onKeyPress = (button) => {
    console.log("Button pressed", button);
  };

  const onChangeInput = ({ e, index }) => {
    const input = e.target.value;
    setInput(input);
    keyboard.current.setInput(input);
    // setTotal(calcMontant());
  };

  const renderHTML = (rawHTML: string) =>
    React.createElement("div", {
      dangerouslySetInnerHTML: { __html: rawHTML },
    });
  return (
    <div className="remise_modal">
      <div className="uper">
        <h3>Remise</h3>
        <FontAwesomeIcon
          style={{ position: "absolute", top: "5px", right: "8px" }}
          onClick={() => setshowRemise(false)}
          icon={faTimes}
          size="2x"
        />
      </div>
      <div className="con">
        <FormGroup style={{ display: "flex" }}>
          <Form.Label className="remise_input">
            <b>Remise (%)</b>
          </Form.Label>
          <Form.Control
            onChange={(e) => onChangeInput({ e, index: 5 })}
            className="remise_input"
            value={`${remisePerc} %`}
            onFocus={() => {
              setselected("remisePerc");
              keyboard.current.setInput("");
            }}
          ></Form.Control>
        </FormGroup>
        <FormGroup style={{ display: "flex" }}>
          <Form.Label className="remise_input">
            <b>Remise (€)</b>
          </Form.Label>
          <Form.Control
            onChange={(e) => onChangeInput({ e, index: 5 })}
            className="remise_input"
            value={`${remise?.toFixed(2)} €`}
            onFocus={() => {
              setselected("remise");
              keyboard.current.setInput("");
            }}
          ></Form.Control>
        </FormGroup>
        <FormGroup style={{ display: "flex" }}>
          <Form.Label className="remise_input">
            <b>Montant libre (€)</b>
          </Form.Label>
          <Form.Control
            onChange={(e) => onChangeInput({ e, index: 5 })}
            value={`${libre?.toFixed(2)} €`}
            className="remise_input"
            onFocus={() => {
              setselected("libre");
              keyboard.current.setInput("");
            }}
          ></Form.Control>
        </FormGroup>
        <FormGroup style={{ display: "flex", marginTop: "1rem" }}>
          <Button
            variant={offert ? "success" : "danger"}
            onClick={() => {
              setoffert(!offert);
              setremisePerc(Number(input));
              setremise(0);
              setlibre(0);
              handleRemise();
            }}
            style={{
              width: "150px",
            }}
          >
            <FontAwesomeIcon
              icon={offert ? faCheck : faTimes}
              style={{ marginRight: "2.2rem" }}
            />
            Offert !
          </Button>
        </FormGroup>
        <FormGroup style={{ display: "flex", marginTop: "0.5rem" }}>
          <Button
            onClick={() => handleUpdateOrder()}
            variant={"success"}
            style={{
              width: "150px",
              height: "80px",
            }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: "1rem" }} />
            Confirmer
          </Button>
        </FormGroup>
      </div>
      <div className="off">
        <h5>
          <b>
            {"Prix initial : " +
              orderTo.order?.price.toFixed(2) +
              "€"}
          </b>
        </h5>
        <h5>
          <b>
            {"Nouveau Prix : " + orderTo.order.finalPrice?.toFixed(2) ||
              0 + "€"}
          </b>
        </h5>
      </div>
      <Keyboard
        theme={"hg-theme-default hg-layout-default myTheme3"}
        display={{
          "{bksp}": "EFFACER",
        }}
        buttonTheme={[
          {
            class: "key_btn2",
            buttons: "0 1 2 3 4 5 6 7 8 9 {bksp} {enter}",
          },
          {
            class: "hg-highlight",
            buttons: "Q q",
          },
        ]}
        keyboardRef={(r) => (keyboard.current = r)}
        layoutName={"default"}
        layout={{
          default: myLayout,
        }}
        onChange={onChange}
        onKeyPress={onKeyPress}
      />
    </div>
  );
};

export default RemiseModal;
