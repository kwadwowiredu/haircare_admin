import React, { useState } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Inventory from './components/Inventory';
import OrderForm from './components/OrderForm';
import ProductForm from './components/ProductForm';
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
  const [products, setProducts] = useState([
    { id: 1, name: 'Hydrating Shampoo', price: 25.99, stock: 45 },
    { id: 2, name: 'Curl Defining Cream', price: 18.5, stock: 32 },
    { id: 3, name: 'Anti-Frizz Serum', price: 32.99, stock: 28 },
    { id: 4, name: 'Deep Conditioning Mask', price: 35.5, stock: 15 },
    { id: 5, name: 'Scalp Treatment Oil', price: 45, stock: 12 },
  ]);

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
      // When editing, check stock only if quantity has increased
      const quantityDifference = newOrder.quantity - editOrder.quantity;
      if (quantityDifference > 0) {
        shouldCheckStock = true;
      }
    } else {
      // For new orders, always check stock
      shouldCheckStock = true;
    }

    if (shouldCheckStock && product && product.stock < newOrder.quantity) {
      setShowOutOfStockModal(true);
      return;
    }

    if (product) {
      if (editOrder) {
        // Adjust stock based on quantity difference
        const quantityDifference = newOrder.quantity - editOrder.quantity;
        if (quantityDifference !== 0) {
          setProducts(products.map(p =>
            p.name === newOrder.product ? { ...p, stock: p.stock - quantityDifference } : p
          ));
        }
        setOrders(orders.map(order => order.id === editOrder.id ? { ...newOrder, id: order.id } : order));
      } else {
        setProducts(products.map(p =>
          p.name === newOrder.product ? { ...p, stock: p.stock - newOrder.quantity } : p
        ));
        const newOrderWithId = { ...newOrder, id: orders.length + 1 };
        setOrders([...orders, newOrderWithId]);
        setSalesHistory([{ date: '06/02/2025', orders: [newOrderWithId] }]); // Add to sales history with current date
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
      setOrders(orders.filter(order => order.id !== deleteItem.id));
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
    setShowCancelConfirm(false);
    setCancelOrder(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const clearSalesHistoryForDay = (date) => {
    setSalesHistory(salesHistory.filter(entry => entry.date !== date));
  };

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
            clearSalesHistoryForDay={clearSalesHistoryForDay}
          />
        )}
        {currentPage === 'Orders' && (
          <Orders
            orders={orders}
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
          <div className="delete-confirm">
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
              {salesHistory.map((day, index) => (
                <div key={index} className="sales-day">
                  <h4>{day.date}</h4>
                  {day.orders.length > 0 ? (
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
                        {day.orders.map((order, idx) => (
                          <tr key={idx}>
                            <td>{order.customer}</td>
                            <td>{order.product}</td>
                            <td>{order.quantity}</td>
                            <td>${order.amount}</td>
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
                    <p>No orders for this day.</p>
                  )}
                  <button
                    className="clear-history"
                    onClick={() => clearSalesHistoryForDay(day.date)}
                  >
                    Clear History
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