import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
 
  faCheck,
  faMinusSquare,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Cursor } from "mongoose";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setNewOrder } from "../Slices/order";

const SuppModal = ({ orderWithSupp,handleAddOrderWithSupp,handleaAddDrink,drinks,suppSelected ,order_id, setShowSupplements,setSuppSelected,setDrinks}) => {
  const [page, setPage] = useState("sauces");
  const dispatch= useDispatch()
  const hadnleClose= ()=>{
    setShowSupplements(false);
    setDrinks(null);
    setSuppSelected([])

  }
  const handleTerminer =()=>{
    dispatch(setNewOrder({
      order: {
        ...orderWithSupp,
        qt: 1,
        stepItems: {},
        remise: 0,
        offert: false,
        new: order_id ? "true" : "false",
      },
    }));
    setShowSupplements(false);
    setDrinks(null);
    setSuppSelected([])

  }
  return (
    <div className="product_with_supp">
      <FontAwesomeIcon icon={faTimes} style={{position:"absolute", right:"3%",top:"6%",fontSize:"1.5rem",cursor:"pointer" }} onClick={()=>hadnleClose()}/>
      <div className="supp_header">
        <div className="supp_img">
          <img width="50px" height="50px" src={orderWithSupp.image} />
          <h5>{orderWithSupp.name} +</h5>
        </div>

        <div className="supp_selected_items">
            {orderWithSupp.suppSelected.map((item,key)=>(
               <div className="selected_item" key={key}>
               <img width="50px" height="50px" src={item.image} />
               <h5>{item.name}</h5>
             </div>
            ))}
        </div>
      </div>
      {page=="sauces"?<div className="supp_body">
        {orderWithSupp.supplement.sauces.map((sauce, key) => (
          <div className={suppSelected.length==3 && suppSelected.findIndex(e=>e.id==sauce.id)==-1 ?"supp_item item_disabled":"supp_item "} key={key} onClick={()=>handleAddOrderWithSupp(sauce)}>
            <img width="60px" height="60px" src={sauce.image} />
            <h5>{sauce.name}</h5>
           { orderWithSupp.suppSelected.findIndex(e=>e.id==sauce.id)!=-1 && <FontAwesomeIcon icon={faMinusSquare} style={{color:"red",fontSize:"1.5rem",position:"absolute" ,bottom:"-9%"}} />}
          </div>
        ))}
      </div>:
      <div className="supp_body">
      {orderWithSupp.supplement.drinks.map((drink, key) => (
        <div className="supp_item" key={key}
        onClick={()=>handleaAddDrink(drink)}
        >
          <img width="60px" height="60px" src={drink.image} />
          <h5>{drink.name}</h5>
          {drinks?.id==drink?.id?<FontAwesomeIcon icon={faCheck} style={{color:"red",fontSize:"1.5rem",position:"absolute" ,bottom:"-15%"}} />:""}
        </div>
      ))}
    </div>
      }
      <div className="supp_footer">
      { page == "sauces" && <button style={{ right: "0" }} onClick={() => setPage("drinks")}>
          {suppSelected.length==0 ? "Non merci" : "Suivant"}
          <FontAwesomeIcon icon={faAngleDoubleRight} />
        </button>}
        {page == "drinks" && (
          <button style={{ right: "0" }} onClick={handleTerminer}>
            
            Terminer
            <FontAwesomeIcon icon={faAngleDoubleRight} />
          </button>
        )}
        {page == "drinks" && (
          <button style={{ left: "0" }}
          onClick={()=>setPage("sauces")}
          >
            <FontAwesomeIcon icon={faAngleDoubleLeft} />
            Précedent
          </button>
        )}
      </div>
    </div>
  );
};

export default SuppModal;
