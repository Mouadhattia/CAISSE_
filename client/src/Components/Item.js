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
import useTranslation from "./../i18";
import { useDispatch, useSelector } from "react-redux";
import { setNewOrder } from "../Slices/order";
import axios from "axios";
import Swal from "sweetalert2";
import { updateProduct } from "../Slices/data";
import { ToastContainer, toast } from "react-toastify";
import SuppModal from "./SuppModal";
import { set } from "mongoose";

const Item = ({ product, setAlert, order_id,setconfirmed,confirmed }) => {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const nsteps = useSelector((state) => state.data.nSteps);
  const products = useSelector((state) => state.data.products);
  const [step, setstep] = useState(1);
  const [selected, setselected] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [showSupplements, setShowSupplements] = useState(false);

  const [newProduct, setnewProduct] = useState(undefined);
  const [showstock, setshowstock] = useState(false);
  const [tva, setTva] = useState(null);
  const client = useSelector((state) => state.order.client);
  const tva_mode = useSelector((state) => state.data.tva_mode);
  const [rab_tva, setRab_tva] = useState(0);
  const [orderWithSupp, setOrderWithSupp] = useState({
    active:product?.active,
    cat_id:product?.cat_id,
    description:product?.description,
    extras:product?.extras,
    id:product?.id,
    image:product?.image,
    isComp:product?.isComp,
    is_alcool:product?.is_alcool,
    is_cold:product?.is_cold,
    is_hot: product?.is_hot,
    is_supp:product?.is_supp,
    name:product?.name,
    nsteps:product?.nsteps,
    price:product?.price,
    tva:product?.tva,
    drink_id:"",
    suaces_ids:[],
    suppSelected:[],
    qt:1,
    supplement:{
      drinks:[],
      sauces:[]
    }
   
 
  })
  const [suppSelected, setSuppSelected] = useState([])
  const [drinks, setDrinks] = useState(null)
  useEffect(() => {
    
   
    let supplements
    if(drinks==null){
      supplements=[...suppSelected]
    }else{
      supplements=[...suppSelected,drinks]
     
    }
    let saucesIds =suppSelected.map(e=>e.id)
    
    setOrderWithSupp({...orderWithSupp,suppSelected:supplements,suaces_ids:saucesIds})
  
  }, [suppSelected,drinks])

  var check
  const handleAddOrderWithSupp= async (sauce)=>{
       check= suppSelected.findIndex(e=>e.id==sauce.id)
       if(check!=-1){
        let filtred=  suppSelected.filter(e=>e.id!=sauce.id)
     
      
     setSuppSelected(filtred);
  
     
       }else{
        if(suppSelected.length<3)
      { setSuppSelected([...suppSelected,sauce]);}
      
        
    
       }
    
  }
const  handleaAddDrink =(drink)=>{
if(drink==drinks){
  setDrinks(null)
  setOrderWithSupp({...orderWithSupp,drink_id:drink.id,price:product.price})
}  
else{
  setDrinks(drink)
  setOrderWithSupp({...orderWithSupp,drink_id:drink.id,price:product.price+drink.price})
}


  }
  useEffect(() => {
    let tva;
    if (client.type == "surplace" || client.type == "livraison") {
      tva = tva_mode.find((e) => e.nom == "surplace").valeur;
      setTva(tva);
    } else if (client.type == "emporter") {
      tva = tva_mode.find((e) => e.nom == "emporter").valeur;
      setTva(tva);
    }
    if (rab_tva > 0) {
      tva = rab_tva;
      setTva(tva);
    }
    console.log(tva);
  }, []);

  const selectProduct = () => {
    setconfirmed(false)
    if (
      product?.extras?.length == 0 &&
      product?.nsteps == 0 &&
      product?.isComp == false &&
      product?.is_supp == false
    ) {
      toast("Ajoutée !", {
        position: "bottom-center",
        autoClose: 1000,
        type: "success",
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      dispatch(
        setNewOrder({
          order: {
            ...product,
            qt: 1,
            stepItems: {},
            remise: 0,
            offert: false,
            new: order_id ? "true" : "false",
          },
        })
      );
    }else if(product?.is_supp){
      setShowSupplements(true)
      setOrderWithSupp(
        {
          active:product?.active,
    cat_id:product?.cat_id,
    description:product?.description,
    extras:product?.extras,
    id:product?.id,
    image:product?.image,
    isComp:product?.isComp,
    is_alcool:product?.is_alcool,
    is_cold:product?.is_cold,
    is_hot: product?.is_hot,
    is_supp:product?.is_supp,
    name:product?.name,
    nsteps:product?.nsteps,
    price:product?.price,
    tva:product?.tva,
    drink_id:"",
    suaces_ids:[],
    suppSelected:[],
    qt:1,
    supplement:{
      drinks:[...product?.supplement?.drinks],
      sauces:[...product?.supplement?.sauces]
    }
        }
      )
    }
    else {
      setShowPreview(true);
      setnewProduct({
        ...product,
        qt: 1,
        stepItems: {},
        remise: 0,
        offert: false,
      });
    }
  };

  const handleSlotSelect = ({ slotKey, id }) => {
    console.log(slotKey, id);
    let copy = JSON.parse(JSON.stringify(newProduct) || {});
    copy.slots[slotKey].products.forEach((prod) => {
      prod.id == id ? (prod.checked = true) : (prod.checked = false);
      console.log(prod.name);
    });
    setnewProduct(copy);
  };

  const handleExtra = ({ extraKey, sign }) => {
    console.log("handleExtra", { extraKey, sign });
    let copy = JSON.parse(JSON.stringify(newProduct) || {});
    if (sign == "+" && copy.extras[extraKey].default_quantity < 1) {
      copy.extras[extraKey].default_quantity += 1;
      console.log(copy);
      setnewProduct(copy);
    } else {
      if (copy.extras[extraKey].default_quantity > 0) {
        copy.extras[extraKey].default_quantity -= 1;
        console.log(copy);
        setnewProduct(copy);
      }
    }
  };

  const handleAlert = ({ show, msg, type }) => {
    setAlert({ show, msg, type });
    setTimeout(() => {
      setAlert({ show: false, msg: "", type: "" });
    }, 1500);
  };

  const handleNewOrderToCart = () => {
    toast("Ajoutée !", {
      position: "bottom-center",
      autoClose: 1000,
      type: "success",
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    dispatch(
      setNewOrder({
        order: {
          ...newProduct,
          new: order_id ? "true" : "false",
        },
      })
    );
    handleAlert({ show: true, msg: t("added"), type: "success" });
    setShowPreview(false);
  };

  const handleNewOrderWithStepsToCart = () => {
    toast("Ajoutée !", {
      position: "bottom-center",
      autoClose: 1000,
      type: "success",
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    dispatch(
      setNewOrder({
        order: {
          ...newProduct,
          new: order_id ? "true" : "false",
        },
      })
    );
    handleAlert({ show: true, msg: t("added"), type: "success" });
    setShowPreview(false);
    setstep(1);
  };

  const findProductWithId = (id) => {
    return products.find((prod) => prod.id == id) || {};
  };

  const handleStepSelect = ({ id, STP }) => {
    console.log("stp",STP);
    setselected(step);
    let copy = JSON.parse(JSON.stringify(newProduct) || {});
    let max_select = STP.max_select;
    if (copy.stepItems[step] == undefined) {
      copy.stepItems[step] = [];
      console.log(copy);
    }
    if (copy.stepItems[step].length < max_select) {
      if (!copy.stepItems[step].find((el) => el.id == id)) {
        console.log("will push now");
        copy.stepItems[step].push(findProductWithId(id)); 
      }
    }
    {
      if (!copy.stepItems[step].find((el) => el.id == id)) {
        copy.stepItems[step] = [];
        copy.stepItems[step].push(findProductWithId(id));
      }
    }
    setnewProduct(copy);
    console.log("done");
    console.log(copy);
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
          title: "produit mis hors stock !",
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
      <div className="item_container">
        <p>
          <b>{product.name.substring(0, 21)}</b>
        </p>
        <img src={product.image} onClick={selectProduct} className="prod_img" />
        <div className="price">
          {`${product.price.toFixed(2)}`}
          {renderHTML(`<i>${currency}</i>`)}
        </div>
        <FontAwesomeIcon
          onClick={(e) => setshowstock(true)}
          icon={faTimes}
          size="1x"
          style={{
            position: "absolute",
            top: "0px",
            right: "5px",
            color: "red",
            backgroundColor: "white",
            borderRadius: "25%",
          }}
        />
      </div>
        <div className="supp_modal">
         { showSupplements? <SuppModal setDrinks={setDrinks} setSuppSelected={setSuppSelected} setShowSupplements={setShowSupplements} handleaAddDrink={handleaAddDrink} suppSelected={suppSelected} drinks={drinks} handleAddOrderWithSupp={handleAddOrderWithSupp} orderWithSupp={orderWithSupp} order_id ={order_id}/>:""}
        </div>
      <Modal
        dialogClassName="modal_body"
        show={showPreview}
        onHide={() => {
          setShowPreview(false);
          setstep(1);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <img width="30px" height="30px" src={product.image} />
            {newProduct?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{newProduct?.description}</p>

          {newProduct?.extras && newProduct?.extras.length ? (
            newProduct?.extras.map((extra, key) => (
              <tr
                style={{
                  display: "flex",
                  width: "50%",
                }}
              >
                <td
                  style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    height: "30px",
                    width: "25%",
                    marginRight: "1rem",
                  }}
                >
                  <FontAwesomeIcon
                    onClick={() => handleExtra({ extraKey: key, sign: "-" })}
                    icon={faMinusCircle}
                    color="#ff6b6b"
                  />
                  <h5>
                    <b>{extra.default_quantity}</b>
                  </h5>
                  <FontAwesomeIcon
                    onClick={() => handleExtra({ extraKey: key, sign: "+" })}
                    icon={faPlusCircle}
                    color="#ff6b6b"
                  />
                </td>
                <td style={{ marginRight: "1rem" }}>
                  {" "}
                  <h5>
                    <b>{extra.title}</b>
                  </h5>
                </td>
                <td>
                  {" "}
                  <h5>
                    <b style={{ display: "flex", color: "#ff6b6b" }}>
                      {extra.price.toFixed(2)}{" "}
                      {renderHTML(`<i>${currency}</i>`)}
                    </b>
                  </h5>
                </td>
              </tr>
            ))
          ) : newProduct?.isComp ? (
            // <Table>
            //   <thead className="comphead">
            //     <tr>
            //       {Object.keys(newProduct?.slots || {}).map((slotKey) => (
            //         <td>{slotKey}</td>
            //       ))}
            //     </tr>
            //   </thead>
            //   <tbody>
            //     {Object.keys(newProduct?.slots || {}).map((slotKey) => (
            //       <td>
            //         {newProduct?.slots[slotKey].products.map((prod) => (
            //           <div
            //             style={{
            //               cursor: "pointer",
            //               position: "relative",
            //             }}
            //             // className={prod.checked ? "checked" : "not"}
            //             onClick={() =>
            //               handleSlotSelect({ slotKey, id: prod.id })
            //             }
            //           >
            //             <h6>
            //               <b
            //                 style={{
            //                   color: prod.checked ? "#ff6b6b" : "black",
            //                 }}
            //               >
            //                 {prod.name}
            //               </b>
            //             </h6>
            //             <img
            //               src={prod.image}
            //               width="50px"
            //               height="50px"
            //               style={{
            //                 borderRadius: "50%",
            //                 borderColor: prod.checked ? "#ff6b6b" : "black",
            //               }}
            //             />
            //             {/* <div className="price">
            //               {`${prod.price}`} {renderHTML(`<i>${currency}</i>`)}
            //             </div> */}
            //             {prod.checked ? (
            //               <FontAwesomeIcon
            //                 icon={faCheck}
            //                 color="#ff6b6b"
            //                 style={{
            //                   position: "absolute",
            //                   top: "5px",
            //                   right: "5px",
            //                 }}
            //               />
            //             ) : (
            //               ""
            //             )}
            //           </div>
            //         ))}
            //       </td>
            //     ))}
            //   </tbody>
            // </Table>
            <Carousel variant="dark">
               {Object.keys(newProduct?.slots || {}).map((slotKey) => (
              
                     <Carousel.Item  style={{ height:"15rem",width:"100%" ,textAlign:"center"}} className="chejm" >
                      <h3> {slotKey}</h3>
                      <div style={{display:"flex",justifyContent:"space-around", display:"flex",
                          alignItems:"center",marginTop:"2rem"
                           }}>
                      {newProduct?.slots[slotKey].products.map((prod) => (
                      <div
                        style={{
                          cursor: "pointer",
                          position: "relative",
                          
                      
                          
                         
                         
                        }}
                        // className={prod.checked ? "checked" : "not"}
                        onClick={() =>
                          handleSlotSelect({ slotKey, id: prod.id })
                        }
                      >
                        <h6>
                          <b
                            style={{
                              color: prod.checked ? "#ff6b6b" : "black",
                            }}
                          >
                            {prod.name}
                          </b>
                        </h6>
                        <img
                          src={prod.image}
                          width="50px"
                          height="50px"
                          style={{
                            borderRadius: "50%",
                            borderColor: prod.checked ? "#ff6b6b" : "black",
                          }}
                        />
                        {/* <div className="price">
                          {`${prod.price}`} {renderHTML(`<i>${currency}</i>`)}
                        </div> */}
                        {prod.checked ? (
                          <FontAwesomeIcon
                            icon={faCheck}
                            color="#ff6b6b"
                            style={{
                              position: "absolute",
                              top: "50px",
                              right: "20px",
                            }}
                          />
                        ) : (
                          ""
                        )}
                      </div>
                    ))} </div>
               
                     {/* <Carousel.Caption>
                       <h5>First slide label</h5>
                       <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                     </Carousel.Caption> */}
                   </Carousel.Item>
                  ))}
         
          </Carousel>   
          ) : newProduct?.nsteps > 0 ? (
            <div>
              <h6>
                <b>
                  {
                    nsteps.filter(
                      (nstep) => nstep?.menu_id == newProduct?.id
                    )[0][step]?.nom_etape
                  }
                </b>
              </h6>
              <div className="steps_cont">
                {nsteps
                  .filter((nstep) => nstep.menu_id == newProduct?.id)[0]
                  [step]?.choice.map((slot) => (
                    <div
                      className={
                        newProduct?.stepItems[step]?.find((el) => el.id == slot)
                          ? "prod_sel prod"
                          : "prod"
                      }
                      onClick={() =>
                        handleStepSelect({
                          id: slot,
                          STP: nsteps.filter(
                            (nstep) => nstep.menu_id == newProduct?.id
                          )[0][step],
                        })
                      }
                    >
                      <img
                        src={findProductWithId(slot).image}
                        alt=""
                        height="70px"
                        width="70px"
                      />
                      <h6 style={{ display: "flex" }}>
                        <b>{findProductWithId(slot).name} </b>
                        <span>
                          <b
                            style={{
                              display: "flex",
                              marginLeft: "1rem",
                              marginRight: "1rem",
                              color: "#ff6b6b",
                            }}
                          >
                            {findProductWithId(slot).price}{" "}
                            {renderHTML(`<i>${currency}</i>`)}
                          </b>
                        </span>{" "}
                      </h6>
                      <p>{findProductWithId(slot).description}</p>
                      {/* {newProduct?.stepItems[step]?.find(
                          (el) => el.id == slot
                        )
                          ? "selected"
                          : "not"} */}
                    </div>
                  ))}
              </div>
              {newProduct?.nsteps >= step && step > 0 ? (
                <Button
                  style={{ marginRight: "1rem" }}
                  variant="outline-secondary"
                  onClick={() => {
                    if (step > 1) {
                      setstep(step - 1);
                    }
                  }}
                >
                  Retour
                </Button>
              ) : (
                ""
              )}
              {newProduct?.nsteps > step && step > 0 ? (
                <Button
                  variant="outline-warning"
                  onClick={() => {
                    if (newProduct?.nsteps > step && selected == step) {
                      setstep(step + 1);
                    }
                  }}
                >
                  Suivant
                </Button>
              ) : (
                ""
              )}
              {newProduct?.nsteps == step ? (
                <Button
                  variant="outline-warning"
                  onClick={() => {
                    if (selected == step) {
                      handleNewOrderWithStepsToCart();
                    }
                  }}
                >
                  Finir
                </Button>
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* <div>
            <h3>
              <FontAwesomeIcon
                icon={faPencilAlt}
                style={{ width: "24", marginRight: "0.5rem" }}
              />
              Remarque
            </h3>
            <Form.Control
              type="textarea"
              as="textarea"
              placeholder="note"
              style={{ width: "300px", marginRight: "300px" }}
              onChange={(e) =>
                setnewProduct({ ...newProduct, note: e.target.value })
              }
            ></Form.Control>
          </div> */}

          <Button
            variant="secondary"
            onClick={() => {
              setShowPreview(false);
              setstep(1);
            }}
          >
            {t("cancel")}
          </Button>
          {newProduct?.nsteps == 0 || newProduct?.isComp ? (
            <Button
              style={{ backgroundColor: "#ff6b6b", borderColor: "#ff6b6b" }}
              variant="warning"
              onClick={() => handleNewOrderToCart()}
            >
              {t("aded")}
            </Button>
          ) : (
            ""
          )}
        </Modal.Footer>
      </Modal>
     
      <Modal show={showstock} onHide={() => setshowstock(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Gestion de stock</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setshowstock(false)}>
            Retour au tables
          </Button>
          <Button variant="danger" onClick={() => handleStock()}>
            Hors stock
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Item;
