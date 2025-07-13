import { useState } from 'react';

export const useErrorModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState({
    title: "Có lỗi xảy ra!",
    message: "",
    details: "",
  });

  const showError = (title, message, details = "", autoClose = false, autoCloseDelay = 5000) => {
    setModalData({ title, message, details, autoClose, autoCloseDelay });
    setIsOpen(true);
  };

  const hideError = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    modalData,
    showError,
    hideError,
  };
};
