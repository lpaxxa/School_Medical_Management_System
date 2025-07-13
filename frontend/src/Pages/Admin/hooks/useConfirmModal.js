import { useState } from 'react';

export const useConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState({
    title: "Xác nhận",
    message: "Bạn có chắc chắn muốn thực hiện thao tác này?",
    confirmText: "Xác nhận",
    cancelText: "Hủy",
    type: "default",
    onConfirm: () => {},
  });

  const showConfirm = (
    title,
    message,
    onConfirm,
    options = {}
  ) => {
    const {
      confirmText = "Xác nhận",
      cancelText = "Hủy",
      type = "default"
    } = options;

    setModalData({
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm,
    });
    setIsOpen(true);
  };

  const hideConfirm = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    modalData,
    showConfirm,
    hideConfirm,
  };
};
