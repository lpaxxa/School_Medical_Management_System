import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import "./BackButton.css";

const BackButton = ({ onClick, text = "Quay lại" }) => {
  return (
    <button className="reports-back-button" onClick={onClick}>
      <i className="fas fa-arrow-left"></i>
      {text}
    </button>
  );
};

export default BackButton;
