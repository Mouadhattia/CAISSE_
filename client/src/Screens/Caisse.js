import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setInitialValue, setMonnaies } from "../Slices/caisse";
import { Button, Container, FormControl, Nav, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router";
import Navi from "../Components/Navi";
import coin from "./../Shared/coin.png";
import billet from "./../Shared/billet.png";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import Swal from "sweetalert2";
import aud from "./../Shared/sound.mp3";

const Caisse = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [audio, setaudio] = useState(new Audio(aud));

  useEffect(() => {
    audio.play();
  }, []);

  const caisse_open = localStorage.getItem("caisse_open");
  const caisse_id = localStorage.getItem("caisse_id");
  const user_id = localStorage.getItem("user_id");
  const user = localStorage.getItem("username");
  const monnaies = useSelector((state) => state.caisse.monnaies);
  const [historique_monnaie, setHistorique_monnaie] = useState([]);
  const [total, setTotal] = useState(0);
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
  const [selected, setSelected] = useState(0);
  const [lay, setlay] = useState([
    { value: 0, real: 0.02 },
    { value: 0, real: 0.05 },
    { value: 0, real: 0.1 },
    { value: 0, real: 0.2 },
    { value: 0, real: 0.5 },
    { value: 0, real: 1 },
    { value: 0, real: 5 },
    { value: 0, real: 10 },
    { value: 0, real: 20 },
    { value: 0, real: 50 },
    { value: 0, real: 100 },
    { value: 0, real: 200 },
    { value: 0, real: 2 },
    { value: 0, real: 0.2 },
    { value: 0, real: 0.1 },
  ]);

  const onChange = (input) => {
    setInput(input);
    console.log("Input changed", input);
    let newarr = [...lay];
    newarr[selected].value = Number(input);
    setlay(newarr);
    setInput("");
  };

  const onKeyPress = (button) => {
    console.log("Button pressed", button);
  };

  const onChangeInput = ({ e, index }) => {
    const input = e.target.value;
    setInput(input);
    let newarr = [...lay];
    newarr[selected].value = Number(input);
    setlay(newarr);
    keyboard.current.setInput(input);
    setTotal(calcMontant());
  };

  ////////////////////////

  useEffect(() => {
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/getMonnaie",
        {
          user_id,
        }
      )
      .then((res) => {
        dispatch(setMonnaies({ monnaies: res.data }));
      });
  }, []);
  useEffect(() => {
    audio.play();
    console.log(audio);
    if (caisse_open == true) {
      let date = new Date();
      let dateStr =
        ("00" + (date.getMonth() + 1)).slice(-2) +
        "/" +
        ("00" + date.getDate()).slice(-2) +
        "/" +
        date.getFullYear() +
        " " +
        ("00" + date.getHours()).slice(-2) +
        ":" +
        ("00" + date.getMinutes()).slice(-2) +
        ":" +
        ("00" + date.getSeconds()).slice(-2);
      Swal.fire({
        icon: "success",
        title: "caisse Ouvert !",
        text: "Date ouverture :" + dateStr,
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/main");
    }
  }, [ping]);

  const handleHistoriqueMonnaie = ({ key, qt, monnaie }) => {
    let copy = JSON.parse(JSON.stringify(historique_monnaie) || []);
    copy[key] = {
      value: monnaie.value,
      type: monnaie.id,
      qt: qt,
    };
    setHistorique_monnaie(copy);
  };

  const calcMontant = () => {
    let montant = 0;
    lay.map((el) => {
      montant += el.value * el.real;
      console.log(montant);
    });
    return montant;
  };

  const handleOpenCaisse30 = () => {
    let historiquePrint = {
      caisse_id: caisse_id,
      date: Date.now(),
      montant: 30,
      type: "open",
    };
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/OpenCaisse",
        {
          user_id,
          user,
          montant: 30,
          historiquePrint,
          historique_monnaie,
        }
      )
      .then((res) => {
        console.log(res.data);
        let caisse_initial_value = res.data.historiquePrint?.montant;
        dispatch(setInitialValue({ montant: caisse_initial_value }));
        localStorage.setItem("caisse_open", 1);
        setping(!ping);
      });
  };

  const handleOpenCaisse = () => {
    if (calcMontant() > 0) {
      console.log(historique_monnaie);
      console.log(calcMontant());
      let historiquePrint = {
        caisse_id: caisse_id,
        date: Date.now(),
        montant: calcMontant(),
        type: "open",
      };
      console.log(historiquePrint);
      axios
        .post(
          process.env.REACT_APP_API_HOST +
            ":" +
            process.env.REACT_APP_API_PORT +
            "/api/OpenCaisse",
          {
            user_id,
            user,
            montant: calcMontant(),
            historiquePrint,
            historique_monnaie,
          }
        )
        .then((res) => {
          console.log(res.data);
          let caisse_initial_value = res.data.historiquePrint?.montant;
          dispatch(setInitialValue({ montant: caisse_initial_value }));
          localStorage.setItem("caisse_open", 1);
          setping(!ping);
        });
    } else {
      Swal.fire({
        icon: "error",
        title: "Fond initial est 0 !",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const renderHTML = (rawHTML: string) =>
    React.createElement("div", {
      dangerouslySetInnerHTML: { __html: rawHTML },
    });

  return (
    <div className="my_container">
      <Navi title="cashierr" />
      <div className="toOpenCaisse">
        {/* <h1
          style={{
            backgroundColor: "#ff6b6b",
            width: "100%",
            textAlign: "center",
          }}
        >
          Monnaies
        </h1> */}
        <div className="mon_cont">
          {/* {monnaies.map((monnaie, key) => (
            <div className="monn">
              <div>
                <p>{`${monnaie.type} ${monnaie.name}`}</p>
                <input
                  type="number"
                  placeholder="0"
                  onChange={(e) =>
                    handleHistoriqueMonnaie({
                      monnaie,
                      key,
                      qt: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          ))} */}
          <div className="piece">
            <img
              className="piece-img-coin"
              src={coin}
              width={64}
              height={64}
              style={{ position: "absolute" }}
            />
            <div className="mon">
              <span className="flex">2 {renderHTML(`<i>${currency}</i>`)}</span>
              <FormControl
                value={lay[12].value}
                onFocus={() => {
                  setSelected(12);
                  keyboard.current.setInput("");
                }}
                onChange={(e) => {
                  onChangeInput({ e, index: 12 });
                }}
                type="number"
                className="moninput"
              />
              <span className="flex">
                {lay[12].value * lay[12].real}{" "}
                {renderHTML(`<i>${currency}</i>`)}
              </span>
            </div>
            <div className="mon">
              <span className="flex">1 {renderHTML(`<i>${currency}</i>`)}</span>
              <FormControl
                onFocus={() => {
                  setSelected(5);
                  keyboard.current.setInput("");
                }}
                value={lay[5].value}
                onChange={(e) => onChangeInput({ e, index: 5 })}
                type="number"
                className="moninput"
              />
              <span className="flex">
                {lay[5].value * lay[5].real} {renderHTML(`<i>${currency}</i>`)}
              </span>
            </div>
            <div className="mon">
              <span className="flex">
                0.5 {renderHTML(`<i>${currency}</i>`)}
              </span>
              <FormControl
                value={lay[4].value}
                onFocus={() => {
                  setSelected(4);
                  keyboard.current.setInput("");
                }}
                onChange={(e) => onChangeInput({ e, index: 4 })}
                type="number"
                className="moninput"
              />
              <span className="flex">
                {lay[4].value * lay[4].real} {renderHTML(`<i>${currency}</i>`)}
              </span>
            </div>
            <div className="mon">
              <span className="flex">
                0.2 {renderHTML(`<i>${currency}</i>`)}
              </span>
              <FormControl
                value={lay[13].value}
                onFocus={() => {
                  setSelected(13);
                  keyboard.current.setInput("");
                }}
                onChange={(e) => onChangeInput({ e, index: 13 })}
                type="number"
                className="moninput"
              />
              <span className="flex">
                {lay[13].value * lay[13].real}{" "}
                {renderHTML(`<i>${currency}</i>`)}
              </span>
            </div>
            <div className="mon">
              <span className="flex">
                0.1 {renderHTML(`<i>${currency}</i>`)}
              </span>
              <FormControl
                value={lay[14].value}
                onFocus={() => {
                  setSelected(14);
                  keyboard.current.setInput("");
                }}
                onChange={(e) => onChangeInput({ e, index: 14 })}
                type="number"
                className="moninput"
              />
              <span className="flex">
                {lay[14].value * lay[14].real}{" "}
                {renderHTML(`<i>${currency}</i>`)}
              </span>
            </div>

            <Keyboard
              theme={"hg-theme-default hg-layout-default myTheme2"}
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
          <div className="billet">
            <img
              src={billet}
              width={64}
              height={64}
              style={{ position: "absolute" }}
            />
            <div className="mon">
              <span className="flex">
                200 {renderHTML(`<i>${currency}</i>`)}
              </span>
              <FormControl
                value={lay[11].value}
                onFocus={() => {
                  setSelected(11);
                  keyboard.current.setInput("");
                }}
                onChange={(e) => onChangeInput({ e, index: 11 })}
                type="number"
                className="moninput"
              />
              <span className="flex">
                {lay[11].value * lay[11].real}{" "}
                {renderHTML(`<i>${currency}</i>`)}
              </span>
            </div>
            <div className="mon">
              <span className="flex">
                100 {renderHTML(`<i>${currency}</i>`)}
              </span>
              <FormControl
                value={lay[10].value}
                onFocus={() => {
                  setSelected(10);
                  keyboard.current.setInput("");
                }}
                onChange={(e) => onChangeInput({ e, index: 10 })}
                type="number"
                className="moninput"
              />
              <span className="flex">
                {lay[10].value * lay[10].real}{" "}
                {renderHTML(`<i>${currency}</i>`)}
              </span>
            </div>
            <div className="mon">
              <span className="flex">
                50 {renderHTML(`<i>${currency}</i>`)}
              </span>
              <FormControl
                value={lay[9].value}
                onFocus={() => {
                  setSelected(9);
                  keyboard.current.setInput("");
                }}
                onChange={(e) => onChangeInput({ e, index: 9 })}
                type="number"
                className="moninput"
              />
              <span className="flex">
                {lay[9].value * lay[9].real} {renderHTML(`<i>${currency}</i>`)}
              </span>
            </div>
            <div className="mon">
              <span className="flex">
                20 {renderHTML(`<i>${currency}</i>`)}
              </span>
              <FormControl
                value={lay[8].value}
                onFocus={() => {
                  setSelected(8);
                  keyboard.current.setInput("");
                }}
                onChange={(e) => onChangeInput({ e, index: 8 })}
                type="number"
                className="moninput"
              />
              <span className="flex">
                {lay[8].value * lay[8].real} {renderHTML(`<i>${currency}</i>`)}
              </span>
            </div>
            <div className="mon">
              <span className="flex">
                10 {renderHTML(`<i>${currency}</i>`)}
              </span>
              <FormControl
                value={lay[7].value}
                onFocus={() => {
                  setSelected(7);
                  keyboard.current.setInput("");
                }}
                onChange={(e) => onChangeInput({ e, index: 7 })}
                type="number"
                className="moninput"
              />
              <span className="flex">
                {lay[7].value * lay[7].real} {renderHTML(`<i>${currency}</i>`)}
              </span>
            </div>
            <div className="mon">
              <span className="flex">5 {renderHTML(`<i>${currency}</i>`)}</span>
              <FormControl
                value={lay[6].value}
                onFocus={() => {
                  setSelected(6);
                  keyboard.current.setInput("");
                }}
                onChange={(e) => onChangeInput({ e, index: 6 })}
                type="number"
                className="moninput"
              />
              <span className="flex">
                {lay[6].value * lay[6].real} {renderHTML(`<i>${currency}</i>`)}
              </span>
            </div>
            <div className="caisse-ovrir-caisse">
              <h4 className="grand-total">
                <b>
                  Grand Total : <br />
                  <span style={{ display: "flex" }}>
                    {calcMontant().toFixed(2)}
                    {renderHTML(`<i>${currency}</i>`)}
                  </span>
                </b>
              </h4>
              <Button
                onClick={() => handleOpenCaisse()}
                variant="warning"
                className="open_btn"
                size="lg"
              >
                Ouvrir Caisse
              </Button>
              <Button
            
                onClick={() => handleOpenCaisse30()}
                variant="warning"
                className="open_btn-30"
                size="lg"
              >
               Ouvrir avec 30€
              </Button>
            </div>
          </div>
        </div>
      </div>

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

export default Caisse;
