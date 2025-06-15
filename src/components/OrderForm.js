import React, { useState, useEffect } from 'react';

const OrderForm = ({ order, products, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: '',
    customer: '',
    phone: '',
    product: '',
    quantity: 1,
    amount: '',
    location: '',
    status: 'New',
  });

  useEffect(() => {
    if (order) {
      setFormData({
        date: order.date,
        customer: order.customer,
        phone: order.phone,
        product: order.product,
        quantity: order.quantity || 1,
        amount: order.amount.toString(),
        location: order.location,
        status: order.status,
      });
    } else {
      const currentDate = new Date().toLocaleDateString('en-GB');
      setFormData({
        date: currentDate,
        customer: '',
        phone: '',
        product: '',
        quantity: 1,
        amount: '',
        location: '',
        status: 'New',
      });
    }
  }, [order]);

  useEffect(() => {
    const product = products.find(p => p.name === formData.product);
    if (product) {
      const total = product.price * formData.quantity;
      setFormData(prev => ({ ...prev, amount: total.toFixed(2) }));
    }
  }, [formData.product, formData.quantity, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    onSubmit({
      date: formData.date,
      customer: formData.customer,
      phone: formData.phone,
      product: formData.product,
      quantity: parseInt(formData.quantity, 10),
      amount: parseFloat(formData.amount),
      location: formData.location,
      status: formData.status,
    });
  };

  return (
    <div className="form-container">
      <h2>{order ? 'Edit Order' : 'New Order'}</h2>
      <div className="form-content">
        <label>Customer Name</label>
        <input
          type="text"
          name="customer"
          placeholder="Enter customer name"
          value={formData.customer}
          onChange={handleChange}
        />
        <label>Customer Phone</label>
        <input
          type="text"
          name="phone"
          placeholder="Enter customer phone number"
          value={formData.phone}
          onChange={handleChange}
        />
        <label>Product</label>
        <select name="product" value={formData.product} onChange={handleChange}>
          <option value="">Select a product</option>
          {products.map(product => (
            <option key={product.id} value={product.name}>{product.name} (GHs {product.price})</option>
          ))}
        </select>
        <label>Quantity</label>
        <input
          type="number"
          name="quantity"
          placeholder="Enter quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
        />
        <label>Amount (GHs)</label>
        <input
          type="text"
          name="amount"
          placeholder="Enter amount"
          value={formData.amount}
          onChange={handleChange}
          readOnly
        />
        <label>Delivery Location</label>
        <input
          type="text"
          name="location"
          placeholder="Enter delivery location"
          value={formData.location}
          onChange={handleChange}
        />
        <label>Status</label>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option>New</option>
          <option>Pending</option>
          <option>Delivered</option>
        </select>
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
      </div>
      <div className="form-buttons">
        <button className="cancel" onClick={onClose}>Cancel</button>
        <button className="submit" onClick={handleSubmit}>
          {order ? 'Update' : 'Add'} Order
        </button>
      </div>
    </div>
  );
};

export default OrderForm;