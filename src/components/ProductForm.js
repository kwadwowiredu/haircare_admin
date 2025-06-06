import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
      });
    } else {
      setFormData({
        name: '',
        price: '',
        stock: '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    onSubmit({
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
    });
  };

  return (
    <div className="form-container">
      <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
      <label>Product Name</label>
      <input
        type="text"
        name="name"
        placeholder="Enter product name"
        value={formData.name}
        onChange={handleChange}
      />
      <label>Price ($)</label>
      <input
        type="text"
        name="price"
        placeholder="Enter price"
        value={formData.price}
        onChange={handleChange}
      />
      <label>Stock Quantity</label>
      <input
        type="text"
        name="stock"
        placeholder="Enter stock quantity"
        value={formData.stock}
        onChange={handleChange}
      />
      <div className="form-buttons">
        <button className="cancel" onClick={onClose}>Cancel</button>
        <button className="submit" onClick={handleSubmit}>
          {product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </div>
  );
};

export default ProductForm;