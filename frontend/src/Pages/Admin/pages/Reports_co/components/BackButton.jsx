import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import "./BackButton.css";

const BackButton = ({ onClick, text = "Quay lại" }) => {
  return (
    <div className="back-button-container">
      <button className="back-button" onClick={onClick}>
        <FaArrowLeft /> {text}
      </button>
    </div>
  );
};

export default BackButton;
