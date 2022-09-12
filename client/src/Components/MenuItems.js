import React, { useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import Item from "./Item";

const MenuItems = ({ selectedCategory, setAlert, categories, order_id,setconfirmed,confirmed }) => {
  const products = useSelector((state) => state.data.products);
  let category = categories.filter((cat) => cat.id == selectedCategory)[0];

  return (
    <div className="meni-iteams">
      <h5 style={{ width: "100%" }}>
        <b>{category?.name}</b>
      </h5>
      {products
        .filter((e) => e.cat_id == selectedCategory && e.active == true)
        .sort((a, b) => a.position - b.position)
        .map((product) => (
          <Item order_id={order_id} product={product} setAlert={setAlert} confirmed={confirmed} setconfirmed={setconfirmed} />
        ))}
    </div>
  );
};

export default MenuItems;
