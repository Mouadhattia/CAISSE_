import React, { useState, useEffect } from "react";
import mimic from "./../mimic.json";
import "./testStyle.css";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";
const Test = () => {
  const dataLocal = useSelector((state) => state.data);

  const [data, setData] = useState({
    products: dataLocal.products,
    categories: dataLocal.categories,
    nsteps: dataLocal.nSteps,
  });

  console.log(data);

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedProduct, setselectedProduct] = useState(0);
  const [step, setStep] = useState(0);

  const handleAddChoice = () => {};

  const findProductWithId = (id) => {
    return data.products.find((prod) => prod.id == id) || {};
  };

  useEffect(() => {
    console.log("cat", selectedCategory);
    console.log("prod", selectedProduct);
    console.log("step", step);
    console.log(
      data.nsteps.filter((nstep) => nstep.product_id == selectedProduct)[0]
    );
  }, [selectedProduct, selectedCategory, step]);

  return (
    <div className="all">
      <div className="cats">
        {data.categories
          .filter((cat) => cat.id == 746)
          .map((cat) => (
            <div
              className="cat"
              onClick={() => {
                setSelectedCategory(cat.id);
                setStep(0);
              }}
            >
              <img src={cat.picture} alt="" height="70px" height="70px" />
              <h6>{cat.name}</h6>
            </div>
          ))}
      </div>
      <div className="prods">
        {step == 0
          ? data.products
              .filter((prods) => prods.cat_id == selectedCategory)
              .map((prod) => (
                <div
                  className="prod"
                  onClick={() => {
                    setselectedProduct(prod.id);
                    if (prod.nsteps > step) {
                      setStep(step + 1);
                    }
                  }}
                >
                  <img src={prod.image} alt="" height="70px" height="70px" />
                  <h6>
                    {prod.name} <span>- {prod.price} $</span>{" "}
                  </h6>
                  <p>{prod.description}</p>
                </div>
              ))
          : data.nsteps
              .filter((nstep) => nstep.menu_id == selectedProduct)[0]
              [step].choice.map((slot) => (
                <div className="prod">
                  <img
                    src={findProductWithId(slot).image}
                    alt=""
                    height="70px"
                    height="70px"
                  />
                  <h6>
                    {findProductWithId(slot).name}{" "}
                    <span>- {findProductWithId(slot).price} $</span>{" "}
                  </h6>
                  <p>{findProductWithId(slot).description}</p>
                </div>
              ))}
        {findProductWithId(selectedProduct).nsteps >= step && step > 0 ? (
          <Button onClick={() => setStep(step - 1)}>retour</Button>
        ) : (
          ""
        )}
        {findProductWithId(selectedProduct).nsteps > step && step > 0 ? (
          <Button
            onClick={() => {
              console.log(findProductWithId(selectedProduct));
              if (findProductWithId(selectedProduct).nsteps > step) {
                setStep(step + 1);
              }
            }}
          >
            suivant
          </Button>
        ) : (
          ""
        )}
        {findProductWithId(selectedProduct).nsteps == step ? (
          <Button>finir</Button>
        ) : (
          ""
        )}
      </div>
      <div className="cart"></div>
    </div>
  );
};

export default Test;
