import React, { useState } from 'react';

const Orders = ({ orders, setOrders, onAddOrder, onEditOrder, onDeleteOrder, onCancelOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = statusFilter === 'All Status' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleExpandOrder = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const toggleStatusDropdown = (orderId) => {
    setShowStatusDropdown(showStatusDropdown === orderId ? null : orderId);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    setShowStatusDropdown(null);
  };

  return (
    <div className="orders">
      <h2>Orders Management</h2>
      <p>Manage and track all customer orders</p>
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search orders by customer, product, status, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          <option>Delivered</option>
          <option>New</option>
          <option>Pending</option>
        </select>
        <button className="add-button" onClick={onAddOrder}>+ New Order</button>
      </div>
      <div className="orders-table">
        <table className="desktop-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className={order.status === 'Delivered' ? 'delivered-order' : ''}>
                <td>{order.date}</td>
                <td>{order.customer}<br/>{order.phone}</td>
                <td>{order.product}</td>
                <td>{order.quantity}</td>
                <td>GHs {order.amount}</td>
                <td>{order.location}</td>
                <td>
                  <button
                    className={`status-button status-${order.status.toLowerCase()}`}
                    onClick={() => toggleStatusDropdown(order.id)}
                  >
                    {order.status}
                  </button>
                  {showStatusDropdown === order.id && (
                    <div className="status-dropdown">
                      <button onClick={() => updateOrderStatus(order.id, 'New')}>New</button>
                      <button onClick={() => updateOrderStatus(order.id, 'Pending')}>Pending</button>
                      <button onClick={() => updateOrderStatus(order.id, 'Delivered')}>Delivered</button>
                    </div>
                  )}
                </td>
                <td className="action-buttons">
                  <button onClick={() => onEditOrder(order)}>Edit</button>
                  <button className="delete" onClick={() => onDeleteOrder(order)}>
                    <span className="material-icons">delete</span>
                  </button>
                  <button className="cancel" onClick={() => onCancelOrder(order)}>
                    <span className="material-icons">cancel</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mobile-orders">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`order-card ${expandedOrderId === order.id ? 'expanded' : ''} ${order.status === 'Delivered' ? 'delivered-order' : ''}`}
              onClick={() => toggleExpandOrder(order.id)}
            >
              <div className="order-card-header">
                <div className="order-card-info">
                  <h4>{order.customer}</h4>
                  <p>{order.product}</p>
                  <p>{order.location}</p>
                </div>
                <button
                  className={`status-button status-${order.status.toLowerCase()}`}
                  onClick={(e) => { e.stopPropagation(); toggleStatusDropdown(order.id); }}
                >
                  {order.status}
                </button>
                {showStatusDropdown === order.id && (
                  <div className="status-dropdown">
                    <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'New'); }}>New</button>
                    <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'Pending'); }}>Pending</button>
                    <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'Delivered'); }}>Delivered</button>
                  </div>
                )}
              </div>
              {expandedOrderId === order.id && (
                <div className="order-card-details">
                  <p><strong>Date:</strong> {order.date}</p>
                  <p><strong>Customer:</strong> {order.customer}</p>
                  <p><strong>Phone:</strong> {order.phone}</p>
                  <p><strong>Product:</strong> {order.product}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p><strong>Amount:</strong> GHs {order.amount}</p>
                  <p><strong>Location:</strong> {order.location}</p>
                  <p><strong>Status:</strong> <span className={`status-${order.status.toLowerCase()}`}>{order.status}</span></p>
                  <div className="order-card-actions">
                    <button onClick={(e) => { e.stopPropagation(); onEditOrder(order); }}>Edit</button>
                    <button className="delete" onClick={(e) => { e.stopPropagation(); onDeleteOrder(order); }}>
                      <span className="material-icons">delete</span>
                    </button>
                    <button className="cancel" onClick={(e) => { e.stopPropagation(); onCancelOrder(order); }}>
                      <span className="material-icons">cancel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;