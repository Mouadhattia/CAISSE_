import React, { useEffect, useState } from "react";
import { Container, Form, Button, Alert, FloatingLabel } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router";
import useTranslation from "./../i18";
import video from "./../Shared/initbg.mp4";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "./../Shared/logo.png";
import { faEye, faEyeDropper, faEyeSlash, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { storeClients } from "../Slices/data";

import "./Styles.css";
const Init = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ show: false, variant: "", msg: "" });
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [session, setSession] = useState(false)
  const [showPassword, setShowPassword] = useState("password")


  useEffect(() => {
  let sessionActive = localStorage.getItem("session")
  let user_id = localStorage.getItem("user_id")
  if(sessionActive&&user_id){
    navigate("/main")
  }
  
  
  }, [])
  
  const submitCreds = () => {
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/init",
        {
          ...credentials,
        }
      )
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("staff", res.data.staff);
        localStorage.setItem("user_id", res.data.user_id);
        localStorage.setItem("session",session)
        localStorage.setItem("currency", res.data.currency);
        dispatch(storeClients({ clients: res.data.clients }));
        setAlert({ show: true, msg: t("success"), variant: "success" });
        axios
          .post(
            process.env.REACT_APP_API_HOST +
              ":" +
              process.env.REACT_APP_API_PORT +
              "/api/getCaisse",
            {
              user_id: res.data.user_id,
            }
          )
          .then((res) => {
            localStorage.setItem("caisse_id", res.data.id);
            localStorage.setItem(
              "caisse_open",
              res.data.is_open == true ? 1 : 0
            );
          });
        setTimeout(() => {
          navigate("/");
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
        localStorage.removeItem("staff");
        setAlert({
          show: true,
          msg: t("verifyUserAndPassword"),
          variant: "danger",
        });
      });
  };

  return (
    <div className="authincation h-100 c">
      <div className="container h-100">
        <div className="row justify-content-center h-100 align-items-center">
          <div className="col-md-6" >
            <div className="authincation-content" >
              <div className="row no-gutters" >
                <div className="col-xl-12" style={{position:"relative"}} >
                  <div className="row" >
                    <div className="col-5 mx-auto top">
                      <br />
                      <div className="text-center " >
                        <img
                          className="logo-compact "
                          src={logo}
                          width="100%"
                          alt=""
                        />
                        <h1 style={{color:"red",textAlign:"center",fontSize:"small",marginTop:"1rem",fontWeight:"700",width:"100%"}} >Assistant:ILAN <br/> + 33 6 25 25 54 52</h1>
                      </div>

                    </div>
                  </div>
                  <div className="auth-form">
                    <h4 className="text-center mb-4">
                      Connectez-vous à votre compte
                    </h4>
                    <form>
                      <div className="form-group">
                        <label className="mb-1 pull-left">
                          <strong>{t("username")}</strong>
                        </label>
                        <input
                          onChange={(e) =>
                            setCredentials({
                              ...credentials,
                              username: e.target.value,
                            })
                          }
                          type="text"
                          className="form-control"
                          placeholder="Nom d'utilisateur"
                          autocomplete="off"
                        />
                      </div>
                      <div className="form-group" >
                        <label className="mb-1 pull-left">
                          <strong>{t("password")}</strong>
                        </label>
                        {showPassword=="password"?<FontAwesomeIcon icon={faEye} onClick={()=>setShowPassword("text")} style={{position:"absolute",right:"4%" ,bottom:"27.5%"}} />:
                        <FontAwesomeIcon icon={faEyeSlash} onClick={()=>setShowPassword("password")}  style={{position:"absolute",right:"4%" ,bottom:"27.5%"}}/>
                        }
                        <input
                          onChange={(e) =>
                            setCredentials({
                              ...credentials,
                              password: e.target.value,
                            })
                          }
                          type={showPassword}
                          className="form-control"
                          placeholder="Mot de passe"
                          autocomplete="new-password"
                          v-model="User.MotDePasse"
                          
                        />
                       
                      </div>
                      <div className="form-row d-flex justify-content-between mt-4 mb-2">
                        <div className="form-group">
                          <div className="custom-control custom-checkbox ml-1">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="basic_checkbox_1"
                              onChange={(e)=>setSession(e.target.checked)}
                            />
                            <label
                              className="custom-control-label"
                              for="basic_checkbox_1"
                            >
                              Gardez-moi connecté
                            </label>
                          </div>
                        </div>
                      </div>
                      <div
                        className="alert alert-danger alert-dismissible fade show hidden"
                        id="error"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          stroke="currentColor"
                          stroke-width="2"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          className="mr-2"
                        >
                          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <strong id="errorMessage"></strong>
                      </div>
                    </form>
                    <div className="text-center col-12">
                      <Button
                        variant="warning"
                        size="lg"
                        onClick={() => submitCreds()}
                      >
                        <FontAwesomeIcon icon={faLockOpen} /> Se connecter
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {alert.show ? (
              <Alert variant={alert.variant}>{alert.msg}</Alert>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Init;
