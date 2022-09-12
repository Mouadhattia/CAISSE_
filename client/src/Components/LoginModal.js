import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCogs,
  faSignInAlt,
  faTimes,
  faTrash,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { login } from "../Slices/auth";
import { useNavigate } from "react-router";
import useTranslation from "./../i18";
import Swal from "sweetalert2";

const LoginModal = ({ user, setShowLogin, setClickable }) => {
  const { t } = useTranslation();

  const [input, setInput] = useState("");
  const [layout, setLayout] = useState("default");
  const keyboard = useRef();
  const [myLayout, setMyLayout] = useState([]);

  let caise_open = localStorage.getItem("caisse_open");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = () => {
    localStorage.setItem("username", user);
    dispatch(login({ username: user, password: input }))
      .unwrap()
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: `Connectée`,
          showConfirmButton: false,
          timer: 1000,
        });
        caise_open == true ? navigate("/main") : navigate("/caisse");
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: `Verifier Mot de passe`,
          showConfirmButton: false,
          timer: 1000,
        });
      });
  };
  const randomize = () => {
    let table = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " ", " "];
    let x = "";
    let final = [];

    let i = 0;
    let j = 0;
    do {
      do {
        let randomIndex = Math.floor(Math.random() * table.length);
        var randomItem = table[randomIndex];
        if (randomItem != " ") {
          x = x + randomItem + " ";
        } else {
          x = x + randomItem;
        }

        i += 1;
        table.splice(randomIndex, 1);
        console.log("inner");
      } while (i != 3);
      final.push(x);
      x = "";
      i = 0;
      j += 1;
      console.log("outter");
    } while (j != 4);
    console.log(final);
    setMyLayout([...final]);
  };
  const onChange = (input) => {
    if (input.length < 12) {
      setInput(input);
    }
    console.log("Input changed", input);
  };

  const onKeyPress = (button) => {
    console.log("Button pressed", button);
  };

  const onChangeInput = (event) => {
    const input = event.target.value;
    setInput(input);
    keyboard.current.setInput(input);
  };
  useEffect(() => {
    randomize();
  }, []);
  return (
    <div className="login_container">
      <div style={{ display: "flex" }}>
        <div className="mdp_container">
          <FontAwesomeIcon icon={faUnlock} className="mdp_icon" color="white" />
          <div className="input">
            {input.split("").map((e) => (
              <h1 style={{ color: "white" }}>*</h1>
            ))}
          </div>
        </div>
        <FontAwesomeIcon
          style={{ marginRight: "1.2rem" }}
          icon={faTimes}
          onClick={() => {
            setShowLogin(false);
            setClickable(true);
          }}
          size="3x"
        />
      </div>

      <Keyboard
        theme={"hg-theme-default hg-layout-default myTheme"}
        buttonTheme={[
          {
            class: "key_btn",
            buttons: "0 1 2 3 4 5 6 7 8 9  ",
          },
          {
            class: "hg-highlight",
            buttons: "Q q",
          },
        ]}
        keyboardRef={(r) => (keyboard.current = r)}
        layoutName={layout}
        layout={{
          default: myLayout,
        }}
        onChange={onChange}
        onKeyPress={onKeyPress}
      />

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "3rem" }}
      >
        <Button className="my_btn x5" onClick={() => handleLogin()}>
          <FontAwesomeIcon
            icon={faSignInAlt}
            size="1x"
            color="#0dcaf0"
            style={{ marginRight: "0.5rem" }}
          />
          {t("connecter")}
        </Button>
        <Button
          className="my_btn x5"
          onClick={() => {
            setInput("");
            keyboard.current.setInput("");
          }}
        >
          <FontAwesomeIcon
            icon={faTrash}
            size="1x"
            color="#0dcaf0"
            style={{ marginRight: "0.5rem" }}
          />
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
};

export default LoginModal;
