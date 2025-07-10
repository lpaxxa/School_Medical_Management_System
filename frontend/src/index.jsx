import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';
import { StudentDataProvider } from './context/StudentDataContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <StudentDataProvider>
        <App />
      </StudentDataProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();