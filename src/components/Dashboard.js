import React, { useState } from 'react';

const Dashboard = ({ orders, products, setShowSalesHistory, salesHistory, clearSalesHistoryForMonth, totalSalesHistory }) => {
  const totalSales = totalSalesHistory; // Reflects all orders immediately
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'Pending').length;
  const completedOrders = orders.filter(order => order.status === 'Delivered').length;

  const lowStockProducts = products.filter(product => product.stock < 10);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p>Welcome back! Here's an overview of your business</p>
      <div className="stats">
        <div className="stat-card">
          <div className='stat-display'>
            <h3>Total Sales</h3>
            <i className='material-icons display-1'>attach_money</i>
          </div>
          <p className='p-one'>
            GHs {totalSales.toFixed(2)}
          </p>
        </div>
        <div className="stat-card">
          <div className='stat-display'>
            <h3>Total Orders</h3>
            <i className='material-icons display-2'>shopping_cart</i>
          </div>
          <p className='p-two'>{totalOrders}</p>
        </div>
        <div className="stat-card">
          <div className='stat-display'>
            <h3>Pending Orders</h3>
            <i className='material-icons display-3'>hourglass_empty</i>
          </div>
          <p className='p-three'>{pendingOrders}</p>
        </div>
        <div className="stat-card">
          <div className='stat-display'>
            <h3>Completed Orders</h3>
            <i className='material-icons display-4'>task_alt</i>
          </div>
          <p className='p-four'>{completedOrders}</p>
        </div>
      </div>

      <div className='dashboard-table'>
        <div className="dashboard-table-content">
          <div className="orders-table-one">
            <h3>Recent Orders</h3>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(-5).map((order, index) => (
                  <tr key={index} className={order.status === 'Delivered' ? 'delivered-order' : ''}>
                    <td>{order.customer}</td>
                    <td>{order.product}</td>
                    <td>GHs {order.amount}</td>
                    <td>
                      <span className={`status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="orders-table-two">
            <h3>Low Stock Alerts</h3>
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product, index) => (
                <p key={index} className="low-stock"><i className="material-icons" style={{ color: 'red' }}>warning</i> {product.name} - Only {product.stock} items left</p>
              ))
            ) : (
              <p>No low stock alerts.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;