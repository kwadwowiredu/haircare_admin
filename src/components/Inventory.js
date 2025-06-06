import React, { useState } from 'react';

const Inventory = ({ products, setProducts, onAddProduct, onEditProduct, onDeleteProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="inventory">
      <h2>Inventory Management</h2>
      <p>Manage your hair products inventory</p>
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="add-button" onClick={onAddProduct}>+ Add Product</button>
      </div>
      <div className="inventory-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-header">
              <strong>{product.name}</strong>
              <span className="product-price">${product.price}</span>
            </div>
            <div className="stock-control">
              Stock: {product.stock}
            </div>
            <div className="action-buttons">
              <button onClick={() => onEditProduct(product)}>Edit Product</button>
              <button className="delete" onClick={() => onDeleteProduct(product)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;