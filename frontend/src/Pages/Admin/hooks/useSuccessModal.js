import { useState } from 'react';

export const useSuccessModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState({
    title: "Thành công!",
    message: "",
    details: "",
  });

  const showSuccess = (title, message, details = "", autoClose = true, autoCloseDelay = 3000) => {
    setModalData({ title, message, details, autoClose, autoCloseDelay });
    setIsOpen(true);
  };

  const hideSuccess = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    modalData,
    showSuccess,
    hideSuccess,
  };
};
