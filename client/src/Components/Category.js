import React from "react";
import { Stack } from "react-bootstrap";

const Category = ({ setSelectedCategory, categories, selectedCategory }) => {
  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <div className="cat_container">
      {categories
        .filter((cat) => cat.state == true)
        .map((category) => (
          <div
            style={{ background: `${category.color}` }}
            className={
              selectedCategory == category.id
                ? "cat_item cat_item_selected"
                : "cat_item"
            }
            onClick={() => {
              setSelectedCategory(category.id);
            }}
          >
            <img width="50px" height="50px" src={category.picture} className="category_img"/>
            <h6 className="cat_name"> 
              {category.name.substring(0, 13) + "..."}
            </h6>
          </div>
        ))}
    </div>
  );
};

export default Category;
