import React, { Fragment, useEffect, useState } from "react";
import { Modal, Button, Table, Carousel } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEdit,
  faMinusCircle,
  faMinusSquare,
  faPencilAlt,
  faPlusCircle,
  faPlusSquare,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import hs from "./../Shared/hs.png";
import useTranslation from "./../i18";
import { useDispatch, useSelector } from "react-redux";
import { setNewOrder } from "../Slices/order";
import axios from "axios";
import Swal from "sweetalert2";
import { updateProduct } from "../Slices/data";
import { ToastContainer, toast } from "react-toastify";


const ProductStock = ({ product, setAlert, order_id,setconfirmed,confirmed }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch(); 
  const [selected, setselected] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [newProduct, setnewProduct] = useState(undefined);
  const [showstock, setshowstock] = useState(false);
  useEffect(() => {
   console.log(product)
  }, []);
  const handleStockD = () => {
    setshowstock(false);
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/bringwarehouse",
        { prod_id: product.id }
      )
      .then((res) => {
        console.log(res.data);
        dispatch(updateProduct({ id: product.id }));
        Swal.fire({
          icon: "success",
          title: "produit mis à jours !",
          showConfirmButton: false,
          timer: 1500,
        });
      });
  };
  const handleStock = () => {
    setshowstock(false);
    axios
      .post(
        process.env.REACT_APP_API_HOST +
          ":" +
          process.env.REACT_APP_API_PORT +
          "/api/resetwarehouse",
        { prod_id: product.id }
      )
      .then((res) => {
        console.log(res.data);
        dispatch(updateProduct({ id: product.id }));
        Swal.fire({
          icon: "success",
          title: "produit mis ajours!",
          showConfirmButton: false,
          timer: 1500,
        });
      });
  };

  const renderHTML = (rawHTML: string) =>
    React.createElement("div", {
      dangerouslySetInnerHTML: { __html: rawHTML },
    });
  const currency = localStorage.getItem("currency");
  return (
    <>
    <ToastContainer />
   <div className="item_container"onClick={(e) => setshowstock(true)}>
      <p>
        <b>{product.name.substring(0, 21)}</b>
      </p>
      {product.active==1?<div>
      <img src={product.image}  className="prod_img" />
      <div className="price">
        {`${product.price.toFixed(2)}`}
        {renderHTML(`<i>${currency}</i>`)}
      </div>
      </div>: <img src={hs}  className="prod_imgs" />}
      
    
     
      
    </div>
       
    <Modal show={showstock} onHide={() => setshowstock(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Gestion de stock</Modal.Title>
      </Modal.Header>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setshowstock(false)}>
          Retour au tables
        </Button>
     {product.active==1?<Button variant="danger" onClick={() => handleStock()}>
          Hors stock
        </Button>:<Button variant="primary" onClick={() => handleStockD()}>
          Disponible
        </Button>}
        
      </Modal.Footer>
    </Modal>
  </>
  )
}

export default ProductStock