import React, { useState } from 'react';
import './ReceiveMedicineMain.css';
import MedicineReceipts from './MedicineReceipts/MedicineReceipts';
import MedicationHistory from './MedicationHistory/MedicationHistory';
// Ensure we import the service directly
import receiveMedicineService from '../../../../services/receiveMedicineService';

const ReceiveMedicineMain = () => {
  const [activeTab, setActiveTab] = useState('receipts');

  return (
    <div className="receive-medicine-main">
      <div className="page-header">
        <h1>Quản lý nhận thuốc</h1>
        <p>Quản lý đơn nhận thuốc và lịch sử dùng thuốc của học sinh</p>
      </div>

      <div className="navigation-tabs">
        <button 
          className={`tab-button ${activeTab === 'receipts' ? 'active' : ''}`}
          onClick={() => setActiveTab('receipts')}
        >
          <i className="fas fa-prescription-bottle-alt"></i>
          Đơn nhận thuốc
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <i className="fas fa-history"></i>
          Lịch sử dùng thuốc
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'receipts' && <MedicineReceipts />}
        {activeTab === 'history' && <MedicationHistory />}
      </div>
    </div>
  );
};

export default ReceiveMedicineMain;
