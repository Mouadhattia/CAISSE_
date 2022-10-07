import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Screens/Home";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Init from "./Screens/Init";
import Main from "./Screens/Main";
import Backoffice from "./Screens/Backoffice";
import Menu from "./Screens/Menu";
import Caisse from "./Screens/Caisse";
import Avoires from "./Screens/Avoires";
import Cloture from "./Screens/Cloture";
import Test from "./Screens/Test";
import { Button } from "react-bootstrap";
import Checkout from "./Screens/Checkout";
import CheckoutTwo from "./Screens/CheckoutTwo";
import History from "./Screens/History";
import Clients from "./Screens/Clients";
import CalendarScreen from "./Screens/CalendarScreen";
import io from "socket.io-client";
import { useDispatch } from "react-redux";
import { setCheckoutChange } from "./Slices/order";
import Swal from "sweetalert2";
import updateSound from "./Shared/updateorder.wav";
import bornSound from "./Shared/born-sound.mp3";
import Zcaisse from "./Screens/Zcaisse";

const socket = io.connect(process.env.REACT_APP_API_SOCKET);
function App() {
  let today = new Date()
  var time = today.getHours() + ":" + today.getMinutes() 


const MINUTE_MS = 60000;

useEffect(() => {
  const interval = setInterval(() => {
    console.log("kol d9i9a")
    if(time =="11:55"){
      Swal.fire({
        icon: "success",
        title: 
        "<h5 >" +
        `w9yet` +
        "</h5>",
        
        showConfirmButton: false,
        timer: 2500,
      });
    }
  }, MINUTE_MS);

  return () => clearInterval(interval); 
}, [])
  

  useEffect(() => {
  
    const unloadCallback = (event) => {
      event.preventDefault();
      event.returnValue = "";
     
    };
  
    window.addEventListener("beforeunload", unloadCallback);
    return () => window.removeEventListener("beforeunload", unloadCallback);
  }, []);
 
  const [soundUpdate, setSoundUpdate] = useState(new Audio(updateSound));
  const [audioBorn, setaudioBorn] = useState(new Audio(bornSound));
  const dispatch = useDispatch()
  const user_id =localStorage.getItem("user_id")
   socket.on(`update${user_id}`, (order) => {
    soundUpdate.play()
    if(order.status=="cooking"){
    
      Swal.fire({
        icon: "success",
        title: 
        "<h5 >" +
        `La commande <span style='color:green'>${order.order_id}</span> en préparation` +
        "</h5>",
        
        showConfirmButton: false,
        timer: 2500,
      });
    }else if(order.status=="ready"){
      Swal.fire({
        icon: "success",
        title: 
        "<h5 >" +
        `La commande <span style='color:green'>${order.order_id}€</span> et préte` +
        "</h5>",
        
        showConfirmButton: false,
        timer: 2500,
      });
    } else{
      Swal.fire({
        icon: "success",
        title: 
        "<h5 >" +
        `La commande <span style='color:green'>${order.order_id}€</span> a été annulé` +
        "</h5>",
        
        showConfirmButton: false,
        timer: 2500,
      });
    }
   
     dispatch(setCheckoutChange({order:order}))
    
    })
  
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/init" element={<Init />} />
        <Route path="/main" element={<Main />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/:order_id" element={<Menu />} />
        <Route path="/caisse" element={<Caisse />} />
        <Route path="/cloture" element={<Cloture />} />
        <Route path="/calendar" element={<CalendarScreen />} />
        <Route path="/history/:type" element={<History />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/data/zcaisse" element={<Zcaisse />} />
        <Route path="/avoires" element={<Avoires />} />
        <Route path="/backoffice" element={<Backoffice />} />
        <Route path="/clients/:id" element={<Clients />} />
        
        <Route
          path="/checkout2/:table_id/:type/:part"
          element={<CheckoutTwo />}
        />
         
        <Route path="/checkout/:table_id" element={<Checkout />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </div>
  );
}

export default App;
