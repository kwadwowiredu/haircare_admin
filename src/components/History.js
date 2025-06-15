import React, { useState } from 'react';

const History = ({ orders, salesHistory, clearSalesHistoryForDay }) => {
  const [timeFilter, setTimeFilter] = useState('day');
  const currentDate = new Date().toLocaleDateString('en-GB');
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentYear = new Date().getFullYear();

  const filteredHistory = salesHistory.filter(entry => {
    const entryDate = new Date(entry.date);
    if (timeFilter === 'day') return entry.date === currentDate;
    if (timeFilter === 'month') return entryDate.getMonth() === new Date().getMonth() && entryDate.getFullYear() === new Date().getFullYear();
    if (timeFilter === 'year') return entryDate.getFullYear() === currentYear;
    return true;
  });

  const totalSales = filteredHistory.reduce((sum, entry) => sum + entry.orders.reduce((acc, order) => acc + order.amount, 0), 0).toFixed(2);
  const totalOrders = filteredHistory.reduce((sum, entry) => sum + entry.orders.length, 0);
  const completedOrders = filteredHistory.reduce((sum, entry) => sum + entry.orders.filter(order => order.status === 'Delivered').length, 0);
  const pendingOrders = filteredHistory.reduce((sum, entry) => sum + entry.orders.filter(order => order.status === 'Pending').length, 0);

  return (
    <div className="history">
      <h2>Sales History</h2>
      <div className="history-filter">
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}>
          <option value="day">Today</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
      <div className="history-stats">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p>GHs {totalSales}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Orders</h3>
          <p>{completedOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p>{pendingOrders}</p>
        </div>
      </div>
      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.flatMap(entry =>
              entry.orders.map((order, idx) => (
                <tr key={`${entry.date}-${idx}`}>
                  <td>{entry.date}</td>
                  <td>{order.customer}</td>
                  <td>{order.product}</td>
                  <td>GHs {order.amount}</td>
                  <td>
                    <span className={`status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;