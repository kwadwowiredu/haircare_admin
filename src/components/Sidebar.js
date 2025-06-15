import React from 'react';

const Sidebar = ({ currentPage, setCurrentPage, onLogout, isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <h2>HairCare Admin</h2>
      <ul>
        <li
          className={currentPage === 'Dashboard' ? 'active' : ''}
          onClick={() => { setCurrentPage('Dashboard'); if (isOpen) toggleSidebar(); }}
        >
          <span className="material-icons">home</span>
          Dashboard
        </li>
        <li
          className={currentPage === 'Orders' ? 'active' : ''}
          onClick={() => { setCurrentPage('Orders'); if (isOpen) toggleSidebar(); }}
        >
          <span className="material-icons">shopping_cart</span>
          Orders
        </li>
        <li
          className={currentPage === 'Inventory' ? 'active' : ''}
          onClick={() => { setCurrentPage('Inventory'); if (isOpen) toggleSidebar(); }}
        >
          <span className="material-icons">inventory</span>
          Inventory
        </li>
        <li
          className={currentPage === 'History' ? 'active' : ''}
          onClick={() => { setCurrentPage('History'); if (isOpen) toggleSidebar(); }}
        >
          <span className="material-icons">history</span>
          History
        </li>
      </ul>
      <div className="logout" onClick={() => { onLogout(); if (isOpen) toggleSidebar(); }}>
        <span className="material-icons">logout</span>
        Logout
      </div>
    </div>
  );
};

export default Sidebar;