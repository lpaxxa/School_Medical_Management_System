import React from "react";
import "./SearchBox.css";

const SearchBox = ({ placeholder, value, onChange, onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form className="search-box" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={placeholder || "Tìm kiếm..."}
        value={value}
        onChange={onChange}
        aria-label="Tìm kiếm"
      />
      <button className="search-btn" type="submit" aria-label="Tìm kiếm">
        <i className="fas fa-search"></i>
      </button>
    </form>
  );
};

export default SearchBox;
