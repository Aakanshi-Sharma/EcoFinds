import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });
  const [sorting, setSorting] = useState({
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, [filters, sorting]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      // Add sorting
      params.append('sortBy', sorting.sortBy);
      params.append('sortOrder', sorting.sortOrder);
      
      const response = await axios.get(`/api/products?${params.toString()}`);
      setProducts(response.data.products || response.data);
      setPagination(response.data.pagination || {});
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('/api/products/meta/filters');
      setCategories(response.data.categories || []);
      setConditions(response.data.conditions || []);
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    setSorting(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      search: ''
    });
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Browse Products</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
        {/* Filters */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Filters</h2>
            <button 
              onClick={clearFilters}
              style={{ 
                background: 'none', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                padding: '0.25rem 0.5rem', 
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
          
          {/* Search */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search products..."
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
            <select 
              name="category" 
              value={filters.category} 
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Condition</label>
            <select 
              name="condition" 
              value={filters.condition} 
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All Conditions</option>
              {conditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>
          
          {/* Price Range */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price Range</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min"
                style={{ width: '50%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max"
                style={{ width: '50%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>
        
        {/* Products */}
        <div>
          {/* Sorting and Results Info */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem',
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <div>
              {pagination.totalCount && (
                <span style={{ color: '#666' }}>
                  Showing {products.length} of {pagination.totalCount} products
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ fontWeight: '500' }}>Sort by:</label>
              <select
                name="sortBy"
                value={sorting.sortBy}
                onChange={handleSortChange}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="created_at">Date Added</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
              
              <select
                name="sortOrder"
                value={sorting.sortOrder}
                onChange={handleSortChange}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#c33' }}>
              <p>{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No products match your filters. Try adjusting your criteria.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;