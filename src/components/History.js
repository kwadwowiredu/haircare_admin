import React, { useState } from 'react';

const History = ({ orders, salesHistory, clearSalesHistoryForMonth }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const availableMonths = [...new Set(salesHistory.map(entry => entry.month))].sort((a, b) => {
    const [aMonth, aYear] = a.split(' ');
    const [bMonth, bYear] = b.split(' ');
    return new Date(bYear, getMonthNumber(bMonth)) - new Date(aYear, getMonthNumber(aMonth));
  });

  function getMonthNumber(monthName) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName);
  }

  const filteredHistory = salesHistory.find(entry => entry.month === selectedMonth) || { month: selectedMonth, orders: [], actions: [] };

  const totalSales = filteredHistory.orders.reduce((sum, order) => sum + (order.amount || 0), 0).toFixed(2);
  const allOrderIds = [...new Set(salesHistory.flatMap(entry => entry.orders.map(o => o.id)))];
  const cancelledOrderIds = [...new Set(salesHistory.flatMap(entry => entry.actions.filter(a => a.type === 'canceled').map(a => a.orderId)))];
  const totalOrders = allOrderIds.filter(id => !cancelledOrderIds.includes(id)).length;
  const completedOrders = filteredHistory.orders.filter(order => order.status === 'Delivered').length;
  const canceledOrders = filteredHistory.actions.filter(action => action.type === 'canceled').length;

  const toggleExpandOrder = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="history">
      <h2>Sales History</h2>
      <div className="month-selector">
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {availableMonths.length > 0 ? (
            availableMonths.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))
          ) : (
            <option value={selectedMonth}>{selectedMonth}</option>
          )}
        </select>
      </div>
      <div className="stats">
        <div className="stat-card">
          <div className="stat-display">
            <h3>Total Sales</h3>
            <i className="material-icons display-1">attach_money</i>
          </div>
          <p className="p-one">GHs {totalSales}</p>
        </div>
        <div className="stat-card">
          <div className="stat-display">
            <h3>Total Orders</h3>
            <i className="material-icons display-2">shopping_cart</i>
          </div>
          <p className="p-two">{totalOrders}</p>
        </div>
        <div className="stat-card">
          <div className="stat-display">
            <h3>Completed Orders</h3>
            <i className="material-icons display-4">task_alt</i>
          </div>
          <p className="p-four">{completedOrders}</p>
        </div>
        <div className="stat-card">
          <div className="stat-display">
            <h3>Canceled Orders</h3>
            <i className="material-icons display-3">cancel</i>
          </div>
          <p className="p-three">{canceledOrders}</p>
        </div>
      </div>
      <div className="orders-table">
        {filteredHistory.orders.length > 0 ? (
          filteredHistory.orders.map((order) => (
            <div
              key={order.id}
              className={`order-card ${expandedOrderId === order.id ? 'expanded' : ''} ${order.status === 'Delivered' ? 'delivered-order' : ''} ${order.status === 'Cancelled' ? 'cancelled-order' : ''}`}
              onClick={() => toggleExpandOrder(order.id)}
            >
              <div className="order-card-header">
                <div className="order-card-info">
                  <h4>{order.customer}</h4>
                  <p>{order.product}</p>
                  <p>{order.location}</p>
                </div>
                <span className={`status-button status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              {expandedOrderId === order.id && (
                <div className="order-card-details">
                  <p><strong>Date:</strong> {order.timestamp ? order.timestamp.split(',')[0] : 'N/A'}</p>
                  <p><strong>Customer:</strong> {order.customer}</p>
                  <p><strong>Product:</strong> {order.product}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p><strong>Amount:</strong> GHs {order.amount}</p>
                  <p><strong>Location:</strong> {order.location}</p>
                  <p><strong>Status:</strong> <span className={`status-${order.status.toLowerCase()}`}>{order.status}</span></p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="no-sales-notice">No sales yet for {selectedMonth}.</p>
        )}
        <button
          className="clear-history"
          onClick={() => clearSalesHistoryForMonth(selectedMonth)}
        >
          Clear History for {selectedMonth}
        </button>
      </div>
    </div>
  );
};

export default History;