import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Inventory from './components/Inventory';
import OrderForm from './components/OrderForm';
import ProductForm from './components/ProductForm';
import History from './components/History';
import './styles/App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const [showDeleteWithOrderModal, setShowDeleteWithOrderModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSalesHistory, setShowSalesHistory] = useState(false);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]); // Empty inventory on launch
  const [salesHistory, setSalesHistory] = useState([]); // Initialize as empty array

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('Dashboard');
  };

  const handleAddOrder = () => {
    setEditOrder(null);
    setShowOrderForm(true);
  };

  const handleEditOrder = (order) => {
    setEditOrder(order);
    setShowOrderForm(true);
  };

  const handleAddProduct = () => {
    setEditProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setShowProductForm(true);
  };

  const addOrder = (newOrder) => {
    const product = products.find(p => p.name === newOrder.product);
    let shouldCheckStock = false;

    if (editOrder) {
      const quantityDifference = newOrder.quantity - editOrder.quantity;
      if (quantityDifference > 0) shouldCheckStock = true;
    } else {
      shouldCheckStock = true;
    }

    if (shouldCheckStock && product && product.stock < newOrder.quantity) {
      setShowOrderForm(false); // Close order form when out of stock
      setShowOutOfStockModal(true);
      return;
    }

    if (product) {
      if (editOrder) {
        const quantityDifference = newOrder.quantity - editOrder.quantity;
        if (quantityDifference !== 0) {
          setProducts(products.map(p =>
            p.name === newOrder.product ? { ...p, stock: p.stock - quantityDifference } : p
          ));
        }
        const updatedOrder = { ...newOrder, id: editOrder.id, timestamp: new Date().toLocaleString('en-GB') };
        setOrders(orders.map(order => order.id === editOrder.id ? updatedOrder : order));
        updateSalesHistory(updatedOrder, editOrder);
      } else {
        setProducts(products.map(p =>
          p.name === newOrder.product ? { ...p, stock: p.stock - newOrder.quantity } : p
        ));
        const newOrderWithId = { ...newOrder, id: orders.length + 1, timestamp: new Date().toLocaleString('en-GB') };
        setOrders([...orders, newOrderWithId]);
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        setSalesHistory(prevHistory => {
          const existingMonth = prevHistory.find(entry => entry.month === currentMonth);
          if (existingMonth) {
            return prevHistory.map(entry =>
              entry.month === currentMonth ? { ...entry, orders: [...entry.orders, newOrderWithId], actions: [...entry.actions, { type: 'created', orderId: newOrderWithId.id, timestamp: newOrderWithId.timestamp }] } : entry
            );
          } else {
            return [{ month: currentMonth, orders: [newOrderWithId], actions: [{ type: 'created', orderId: newOrderWithId.id, timestamp: newOrderWithId.timestamp }] }, ...prevHistory];
          }
        });
      }
    }
    setShowOrderForm(false);
  };

  const addProduct = (newProduct) => {
    if (editProduct) {
      setProducts(products.map(product => product.id === editProduct.id ? { ...newProduct, id: product.id } : product));
    } else {
      setProducts([...products, { ...newProduct, id: products.length + 1 }]);
    }
    setShowProductForm(false);
  };

  const confirmDelete = (item, type) => {
    if (type === 'product') {
      const hasOrders = orders.some(order => order.product === item.name);
      if (hasOrders) {
        setDeleteItem(item);
        setDeleteType(type);
        setShowDeleteWithOrderModal(true);
        return;
      }
    }
    setDeleteItem(item);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (deleteType === 'order') {
      const deletedOrder = orders.find(order => order.id === deleteItem.id);
      setOrders(orders.filter(order => order.id !== deleteItem.id));
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      setSalesHistory(prevHistory => prevHistory.map(entry =>
        entry.month === currentMonth ? {
          ...entry,
          orders: entry.orders.filter(order => order.id !== deletedOrder.id),
          actions: [...entry.actions, { type: 'deleted', orderId: deletedOrder.id, timestamp: new Date().toLocaleString('en-GB') }]
        } : entry
      ).filter(entry => entry.orders.length > 0 || entry.actions.length > 0));
    } else if (deleteType === 'product') {
      setProducts(products.filter(product => product.id !== deleteItem.id));
    }
    setShowDeleteConfirm(false);
    setDeleteItem(null);
    setDeleteType('');
  };

  const confirmCancel = (order) => {
    setCancelOrder(order);
    setShowCancelConfirm(true);
  };

  const handleCancel = () => {
    const canceledOrder = cancelOrder;
    setOrders(orders.filter(order => order.id !== canceledOrder.id));
    const product = products.find(p => p.name === canceledOrder.product);
    if (product) {
      setProducts(products.map(p =>
        p.name === canceledOrder.product ? { ...p, stock: p.stock + canceledOrder.quantity } : p
      ));
    }
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    setSalesHistory(prevHistory => prevHistory.map(entry =>
      entry.month === currentMonth ? {
        ...entry,
        orders: entry.orders.filter(order => order.id !== canceledOrder.id),
        actions: [...entry.actions, { type: 'canceled', orderId: canceledOrder.id, timestamp: new Date().toLocaleString('en-GB') }]
      } : entry
    ).filter(entry => entry.orders.length > 0 || entry.actions.length > 0));
    setShowCancelConfirm(false);
    setCancelOrder(null);
  };

  const updateSalesHistory = (newOrder, oldOrder = null) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    setSalesHistory(prevHistory => {
      const existingMonth = prevHistory.find(entry => entry.month === currentMonth);
      if (existingMonth) {
        if (oldOrder) {
          const updatedOrders = existingMonth.orders.map(order => order.id === oldOrder.id ? newOrder : order);
          const action = { type: 'status_changed', orderId: newOrder.id, from: oldOrder.status, to: newOrder.status, timestamp: new Date().toLocaleString('en-GB') };
          return prevHistory.map(entry =>
            entry.month === currentMonth ? { ...entry, orders: updatedOrders, actions: [...entry.actions, action] } : entry
          );
        } else {
          return prevHistory; // Creation handled in addOrder
        }
      } else {
        return prevHistory; // Creation handled in addOrder
      }
    });
  };

  const updateSalesHistoryOnDelete = (deletedOrder) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    setSalesHistory(prevHistory => prevHistory.map(entry =>
      entry.month === currentMonth ? {
        ...entry,
        orders: entry.orders.filter(order => order.id !== deletedOrder.id),
        actions: [...entry.actions, { type: 'deleted', orderId: deletedOrder.id, timestamp: new Date().toLocaleString('en-GB') }]
      } : entry
    ).filter(entry => entry.orders.length > 0 || entry.actions.length > 0));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const clearSalesHistoryForMonth = (month) => {
    setSalesHistory(salesHistory.filter(entry => entry.month !== month));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.hamburger-menu') && window.innerWidth <= 767) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSidebarOpen]);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <button className="hamburger-menu" onClick={toggleSidebar}>
        <span className="material-icons">{isSidebarOpen ? 'close' : 'menu'}</span>
      </button>
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {currentPage === 'Dashboard' && (
          <Dashboard
            orders={orders.slice(-5)}
            products={products}
            setShowSalesHistory={setShowSalesHistory}
            salesHistory={salesHistory}
            clearSalesHistoryForMonth={clearSalesHistoryForMonth}
          />
        )}
        {currentPage === 'Orders' && (
          <Orders
            orders={orders}
            setOrders={setOrders}
            onAddOrder={handleAddOrder}
            onEditOrder={handleEditOrder}
            onDeleteOrder={(order) => confirmDelete(order, 'order')}
            onCancelOrder={confirmCancel}
          />
        )}
        {currentPage === 'Inventory' && (
          <Inventory
            products={products}
            setProducts={setProducts}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={(product) => confirmDelete(product, 'product')}
          />
        )}
        {currentPage === 'History' && (
          <History
            orders={orders}
            salesHistory={salesHistory}
            clearSalesHistoryForMonth={clearSalesHistoryForMonth}
          />
        )}
        {(showOrderForm || showProductForm) && (
          <div className="modal-overlay">
            <div className="form-wrapper">
              {showOrderForm && (
                <OrderForm
                  order={editOrder}
                  products={products}
                  onClose={() => setShowOrderForm(false)}
                  onSubmit={addOrder}
                />
              )}
              {showProductForm && (
                <ProductForm
                  product={editProduct}
                  onClose={() => setShowProductForm(false)}
                  onSubmit={addProduct}
                />
              )}
            </div>
          </div>
        )}
        {showDeleteConfirm && (
          <div className="delete-confirm">
            <div className="delete-confirm-content">
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this {deleteType}?</p>
              <div className="delete-confirm-buttons">
                <button className="cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button className="delete" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}
        {showCancelConfirm && (
          <div className="delete-confirm">
            <div className="delete-confirm-content">
              <h3>Confirm Cancellation</h3>
              <p>Are you sure you want to cancel this order?</p>
              <div className="delete-confirm-buttons">
                <button className="cancel" onClick={() => setShowCancelConfirm(false)}>Cancel</button>
                <button className="delete" onClick={handleCancel}>Cancel Order</button>
              </div>
            </div>
          </div>
        )}
        {showOutOfStockModal && (
          <div className="delete-confirm out-of-stock-modal">
            <div className="delete-confirm-content">
              <h3>Out of Stock</h3>
              <p>The selected product is out of stock. Please refill the stock.</p>
              <div className="delete-confirm-buttons">
                <button className="cancel" onClick={() => setShowOutOfStockModal(false)}>OK</button>
              </div>
            </div>
          </div>
        )}
        {showDeleteWithOrderModal && (
          <div className="delete-confirm">
            <div className="delete-confirm-content">
              <h3>Cannot Delete Product</h3>
              <p>This product has existing orders and cannot be deleted.</p>
              <div className="delete-confirm-buttons">
                <button className="cancel" onClick={() => setShowDeleteWithOrderModal(false)}>OK</button>
              </div>
            </div>
          </div>
        )}
        {showSalesHistory && (
          <div className="sales-history-modal">
            <div className="sales-history-content">
              <button className="close-button" onClick={() => setShowSalesHistory(false)}>x</button>
              <h3>Sales History</h3>
              {salesHistory.map((month, index) => (
                <div key={index} className="sales-day">
                  <h4>{month.month}</h4>
                  {month.orders.length > 0 ? (
                    <table className="sales-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Amount</th>
                          <th>Location</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {month.orders.map((order, idx) => (
                          <tr key={idx}>
                            <td>{order.customer}</td>
                            <td>{order.product}</td>
                            <td>{order.quantity}</td>
                            <td>GHs {order.amount}</td>
                            <td>{order.location}</td>
                            <td>
                              <span className={`status-${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No orders for this month.</p>
                  )}
                  <button
                    className="clear-history"
                    onClick={() => clearSalesHistoryForMonth(month.month)}
                  >
                    Clear History for {month.month}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;