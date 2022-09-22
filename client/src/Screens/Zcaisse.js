import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { storeDataz} from "../Slices/data";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Button, Modal } from 'react-bootstrap';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { TextField } from '@mui/material';
import AutorenewSharpIcon from '@mui/icons-material/AutorenewSharp';
const Zcaisse = () => {
 
  const dataZ = useSelector((state) => state.data.dataZ);
  const [dateSelected, setdateSelected] = useState("")
  const [cherchId, setcherchId] = useState(0)
  const [el, setel] = useState({})
  const createPDF = async () => {   
    const pdf = new jsPDF("portrait", "pt", "a4"); 
    const data = await html2canvas(document.querySelector("#pdf"));
    const img = data.toDataURL("image/png");  
    const imgProperties = pdf.getImageProperties(img);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Zcaisse.pdf");
  };
  const handlePrintHistory=(PrintData)=>{
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/printzcaisse",
        { PrintData, user_id }
      )
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
  }
  const [value, setValue] = React.useState(dayjs('2014-08-18T21:11:54'));

  const handleChange = (newValue) => {
    let month=""
    setValue(newValue);
    if(newValue.$M<10)
    {
month="0"+ String(parseInt(newValue.$M) + 1)
    }
    setdateSelected(newValue.$y+"-"+month+"-"+newValue.$D)
    console.log("date selected",dateSelected)
    console.log(dataZ[0].data.ouverture)
    console.log(value)
  };
  const [show, setshow] = useState(false)
  const user_id = localStorage.getItem("user_id") || "";
  const [ping, setping] = useState(false)
  const dispatch=useDispatch()
  const handleshow = (data)=>{
    console.log(data)
 
    setshow(true)
    setel(data)
  }
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const submitCreds = () => {
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/initZcaisse",
        {
          ...credentials,
        }
      )
      .then((res) => {
        localStorage.setItem("user_id",res.data.user.id)
        dispatch(storeDataz({dataZ:res.data.history}))
       console.log(res.data)
       console.log(dataZ)
      })
     
    }
    const handlereload = ()=>{
      axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/getHistoriqueZcaisse",
        { user_id }
      )
      .then((res) => 
      dispatch(storeDataz({dataZ:res.data.allHistorique}))
      )
      .catch((err) => console.log(err));
      console.log(dataZ)
    }
    useEffect(() => {

      axios
            .post(
              process.env.REACT_APP_API_HOST +
                ":" +
                process.env.REACT_APP_API_PORT +
                "/api/getHistoriqueZcaisse",
              { user_id }
            )
            .then((res) => 
            dispatch(storeDataz({dataZ:res.data.allHistorique}))
            )
            .catch((err) => console.log(err));
            console.log(dataZ)
    }, [])

  
  return (
    <div className="zcaisse_body">
  
      
      {<Modal  show={show} onHide={() => setshow(false)} className="modal_ZZ" >
        <div className='head_zcaisse'>
        <h1>Zcaisse</h1>
        </div>
       
        <Modal.Body  className="modals">
        <div className='pdf_Z' id="pdf">         
       <div style={{border:"solid 1px" ,padding:"1rem",backgroundColor:"white",width:"95%",height:"100%"}}>            
       <div className='text_body' >
       <div style={{display:"flex",justifyContent:'center',alignItmes:"center",height:"4%"}}>
        <h5  >{el.ouverture}/{el.fermeture}</h5>
        </div>
          {el.cancledOrders?.length!=0?<h5>Commandes Annulés{""}:</h5>:""}
         {el.cancledOrders?.map((o,key)=><div className='cmd_annuler' key={key}>
          <h5>Annuler par {o.rejectedFrom}:</h5>       
{el.cancledOrders.length!=0?o.orderItems.map((i,key)=><div className='item_annuler' key={key}>

<h5>{i.qt}</h5>
<h5>{i.name}</h5>
</div>

):""}

<hr style={{width:"100%"}} />





         </div>)}
         {el.products?.length!=0?<h5>Liste Des Produits{""}:</h5>:""}
          {el.products?.map((p,key)=><div>
            <div classNam="prod_z">
            <h6 >-{p.name}</h6>
            </div>



</div>)}

<div>
<hr style={{width:"100%"}} />
{el.pay_method?.map((m,key)=><div key={key}>
  <h5>{m.name}:<b style={{marginLeft:"1rem"}}>{m.qt}</b></h5>
</div>)}

<hr style={{width:"100%"}} />
<h5>Annuler:<b style={{marginLeft:"1rem"}}>{el.cancledOrders?.length}</b></h5>
<h5>Commandes:<b style={{marginLeft:"1rem"}}>{el.commandes}</b></h5>
<h5>Ticket Moyen:<b style={{marginLeft:"1rem"}}>{el.clients}</b></h5>
<hr style={{width:"100%"}} />

<h5>De Borne:<b style={{marginLeft:"1rem"}}>{el.ordersType?.borne}</b></h5>
<h5>Emporter:<b style={{marginLeft:"1rem"}}>{el.ordersType?.emporter}</b></h5>
<h5>Sur Place:<b style={{marginLeft:"1rem"}}>{el.ordersType?.surPlace}</b></h5>
<h5>Livraison:<b style={{marginLeft:"1rem"}}>{el.ordersType?.livraison}</b></h5>
<hr style={{width:"100%"}} />
<h5>Ticket Moyen:<b style={{marginLeft:"1rem"}}>{el.ticket_moyen}£</b></h5>
<h5>Total TTC:<b style={{marginLeft:"1rem"}}>{el.ttc}£</b></h5>
<h5>Total HT:<b style={{marginLeft:"1rem"}}>{el.ht}£</b></h5>
<hr style={{width:"100%"}} />
<h5>Fond Initial:<b style={{marginLeft:"1rem"}}>{el.fond_initial}£</b></h5>
<h5>Fond Final:<b style={{marginLeft:"1rem"}}>{el.fond_final}£</b></h5>
          </div>
          </div>
       </div>
        </div>
        
        </Modal.Body>
        <Button variant="success" onClick={() => createPDF()} >
            Telecharger PDF
          </Button>
      </Modal>}
      <div className='Zcaisse_header'>
      <h1>Zcaisse Historiques</h1> 
        </div>      
      
     <div className="zcaisse_container">   
     
     <div className='filter_z'>
    
     <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MobileDatePicker
          label="Date Zcaisse"
          inputFormat="MM/DD/YYYY"
          value={value}
          onChange={handleChange}
          renderInput={(params) => <TextField {...params} />}
        />
      </LocalizationProvider>
      <AutorenewSharpIcon fontSize="large" color='inherit' className='relo' onClick={()=>handlereload()}/>
     </div>


     <div className='zCaisse'>
     {dataZ.length!=0?dataZ?.filter((el)=>el.data.ouverture.includes(dateSelected)).map((e,key)=>(
      <div className='history' key={key}>
        
        <b>{e.id}</b>
<b>{e.data.ouverture}</b>
<b>{e.data.fermeture}</b>
<b><button style={{backgroundColor:"#08C18A",color:"white"}} onClick={()=>handleshow(e.data)}>Afficher</button></b>
<b><button style={{backgroundColor:"transparent", color:"#08C18A"}} onClick={() => handlePrintHistory(e.data)}>imprimer</button></b>
      </div>
      
     )):""} 
     </div>
     
      {user_id?"":(
        <div className='login_modal'>
      
           <div className='Login_zcaisse'>
          <h2>Login</h2>
<input type="text" onChange={(e)=>setCredentials({...credentials,username:e.target.value,})} placeholder="Nom utilisateur"/>
<input type="password" onChange={(e)=>setCredentials({...credentials,password:e.target.value,})} placeholder="Mot de passe" />
<button onClick={()=>submitCreds()}>se connecter</button>
        </div>
        </div>
       
      )}
     </div>
    </div>
  )
}

export default Zcaisse