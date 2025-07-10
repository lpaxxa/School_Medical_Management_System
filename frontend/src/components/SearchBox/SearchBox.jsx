import React from "react";
import "./SearchBox.css";
import "./SearchBoxVariants.css";

const SearchBox = ({
  placeholder,
  value,
  onChange,
  onSearch,
  className = "",
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  // Map className to variant class names
  const getVariantClass = (className) => {
    switch (className) {
      case "health-guide-search":
        return "health-guide-search-variant";
      case "community-search":
        return "community-search-variant";
      default:
        return "default-search-variant";
    }
  };

  const variantClass = getVariantClass(className);

  return (
    <form
      className={`modern-search-container ${variantClass}`}
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        className="modern-search-input"
        placeholder={placeholder || "Tìm kiếm..."}
        value={value}
        onChange={onChange}
        aria-label="Tìm kiếm"
      />
      <button
        className="modern-search-button"
        type="submit"
        aria-label="Tìm kiếm"
      >
        <i className="fas fa-search"></i>
      </button>
    </form>
  );
};

export default SearchBox;
