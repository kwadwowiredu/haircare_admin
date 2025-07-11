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
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [monthToClear, setMonthToClear] = useState('');

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]); // Empty inventory on launch
  const [salesHistory, setSalesHistory] = useState([]); // Initialize as empty array
  const [totalSalesDashboard, setTotalSalesDashboard] = useState(0); // Track sales for Dashboard
  const [totalSalesHistory, setTotalSalesHistory] = useState(0); // Track sales for History

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
      setShowOrderForm(false);
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
        updateSales(updatedOrder, editOrder);
      } else {
        setProducts(products.map(p =>
          p.name === newOrder.product ? { ...p, stock: p.stock - newOrder.quantity } : p
        ));
        const newOrderWithId = { ...newOrder, id: orders.length + 1, timestamp: new Date().toLocaleString('en-GB') };
        setOrders([...orders, newOrderWithId]);
        setTotalSalesDashboard(prev => prev + (newOrderWithId.amount || 0)); // Add to Dashboard sales immediately
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
      setSalesHistory(prevHistory => {
        const existingMonth = prevHistory.find(entry => entry.month === currentMonth);
        if (existingMonth) {
          return prevHistory.map(entry =>
            entry.month === currentMonth ? { ...entry, orders: [...entry.orders, { ...deletedOrder, status: 'Delivered', amount: deletedOrder.amount }], actions: [...entry.actions, { type: 'completed', orderId: deletedOrder.id, timestamp: new Date().toLocaleString('en-GB') }] } : entry
          );
        } else {
          return [{ month: currentMonth, orders: [{ ...deletedOrder, status: 'Delivered', amount: deletedOrder.amount }], actions: [{ type: 'completed', orderId: deletedOrder.id, timestamp: new Date().toLocaleString('en-GB') }] }, ...prevHistory];
        }
      });
      // Only revert from Dashboard if not delivered, retain if delivered
      if (deletedOrder.status !== 'Delivered') {
        setTotalSalesDashboard(prev => prev - (deletedOrder.amount || 0));
      }
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
    setTotalSalesDashboard(prev => prev - (canceledOrder.amount || 0)); // Revert from Dashboard sales
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    setSalesHistory(prevHistory => {
      const existingMonth = prevHistory.find(entry => entry.month === currentMonth);
      if (existingMonth) {
        return prevHistory.map(entry =>
          entry.month === currentMonth ? { ...entry, orders: [...entry.orders, { ...canceledOrder, status: 'Cancelled', amount: canceledOrder.amount }], actions: [...entry.actions, { type: 'canceled', orderId: canceledOrder.id, timestamp: new Date().toLocaleString('en-GB') }] } : entry
        );
      } else {
        return [{ month: currentMonth, orders: [{ ...canceledOrder, status: 'Cancelled', amount: canceledOrder.amount }], actions: [{ type: 'canceled', orderId: canceledOrder.id, timestamp: new Date().toLocaleString('en-GB') }] }, ...prevHistory];
      }
    });
    setShowCancelConfirm(false);
    setCancelOrder(null);
  };

  const updateSales = (newOrder, oldOrder = null) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    setSalesHistory(prevHistory => {
      const existingMonth = prevHistory.find(entry => entry.month === currentMonth);
      if (existingMonth) {
        if (oldOrder && oldOrder.status !== newOrder.status) {
          if (newOrder.status === 'Delivered') {
            setTotalSalesHistory(prev => prev + (newOrder.amount || 0)); // Add to History sales on delivery
            setTotalSalesDashboard(prev => prev + (newOrder.amount || 0) - (oldOrder.amount || 0)); // Adjust Dashboard if changed
            return prevHistory.map(entry =>
              entry.month === currentMonth ? { ...entry, orders: [...entry.orders, { ...newOrder, amount: newOrder.amount }], actions: [...entry.actions, { type: 'completed', orderId: newOrder.id, timestamp: new Date().toLocaleString('en-GB') }] } : entry
            );
          } else if (oldOrder.status === 'Delivered' && newOrder.status !== 'Delivered') {
            setTotalSalesHistory(prev => prev - (oldOrder.amount || 0)); // Subtract from History if reverted
            setTotalSalesDashboard(prev => prev - (oldOrder.amount || 0)); // Subtract from Dashboard if reverted
            setSalesHistory(prev => prev.map(entry =>
              entry.month === currentMonth ? { ...entry, orders: entry.orders.filter(o => o.id !== newOrder.id) } : entry
            ));
            return prevHistory; // Removed from history
          } else if (newOrder.status === 'Cancelled') {
            return prevHistory.map(entry =>
              entry.month === currentMonth ? { ...entry, orders: [...entry.orders, { ...newOrder, amount: newOrder.amount }], actions: [...entry.actions, { type: 'canceled', orderId: newOrder.id, timestamp: new Date().toLocaleString('en-GB') }] } : entry
            );
          }
        }
      } else if (newOrder.status === 'Delivered') {
        setTotalSalesHistory(prev => prev + (newOrder.amount || 0)); // Add to History sales on delivery
        return [{ month: currentMonth, orders: [{ ...newOrder, amount: newOrder.amount }], actions: [{ type: 'completed', orderId: newOrder.id, timestamp: new Date().toLocaleString('en-GB') }] }, ...prevHistory];
      } else if (newOrder.status === 'Cancelled') {
        return [{ month: currentMonth, orders: [{ ...newOrder, amount: newOrder.amount }], actions: [{ type: 'canceled', orderId: newOrder.id, timestamp: new Date().toLocaleString('en-GB') }] }, ...prevHistory];
      }
      return prevHistory;
    });
  };

  const updateSalesHistoryOnDelete = (deletedOrder) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    setSalesHistory(prevHistory => prevHistory.map(entry =>
      entry.month === currentMonth ? {
        ...entry,
        orders: [...entry.orders, { ...deletedOrder, status: 'Delivered', amount: deletedOrder.amount }],
        actions: [...entry.actions, { type: 'completed', orderId: deletedOrder.id, timestamp: new Date().toLocaleString('en-GB') }]
      } : entry
    ).filter(entry => entry.orders.length > 0 || entry.actions.length > 0));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const clearSalesHistoryForMonth = (month) => {
    setMonthToClear(month);
    setShowClearConfirm(true);
  };

  const confirmClearHistory = () => {
    setSalesHistory(salesHistory.filter(entry => entry.month !== monthToClear));
    setShowClearConfirm(false);
    setMonthToClear('');
  };

  const cancelClearHistory = () => {
    setShowClearConfirm(false);
    setMonthToClear('');
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
            orders={orders}
            products={products}
            setShowSalesHistory={setShowSalesHistory}
            salesHistory={salesHistory}
            clearSalesHistoryForMonth={clearSalesHistoryForMonth}
            totalSalesHistory={totalSalesDashboard} // Use Dashboard-specific total
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
            isDeleteVisible={(order) => order.status === 'Delivered'} // Hide trash icon until delivered
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
            totalSalesHistory={totalSalesHistory} // Use History-specific total
            confirmDelete={confirmDelete}
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
                              <span className={`status-button status-${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-sales-notice">No sales yet for {month.month}.</p>
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
        {showClearConfirm && (
          <div className="delete-confirm clear-confirm-modal">
            <div className="delete-confirm-content">
              <h3>Confirm Clear History</h3>
              <p>Are you sure you want to clear the history for {monthToClear}? This action cannot be undone.</p>
              <div className="delete-confirm-buttons">
                <button className="cancel" onClick={cancelClearHistory}>Cancel</button>
                <button className="delete" onClick={confirmClearHistory}>Clear</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;