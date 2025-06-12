
import React, { useContext, useEffect, useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import axios from 'axios'
import * as XLSX from 'xlsx';  // Import xlsx library for Excel parsing
import { SocketContext } from '../../context/SocketContext';
import EditProductDialog from './EditProductDialog';
import toast from 'react-hot-toast';
/**
 * Component that renders a list of products with filtering and sorting options.
 * Allows Admins to add, edit, or delete products. Allows users to add products to cart.
 * Utilizes the SocketContext to receive live updates from the server when products are added, updated, or deleted.
 * @category Components
 * @subcategory AdminComponents
 * @module AdminProductListing
 */
const AdminProductListing = () => {
  const { Authuser } = useAuthContext();
  const [outOfStockFilter, setOutOfStockFilter] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false); // State to manage dialog visibility
  const [inStockFilter, setInStockFilter] = useState(false);
  const [sortOption, setSortOption] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [productsMap, setProductsMap] = useState({});
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);  // Dialog state
  const [editingProduct, setEditingProduct] = useState(null);
  const { socket } = useContext(SocketContext);
  const [fileName, setFileName] = useState('');
  useEffect(() => {
    socket.on('ProductChanges', (product) => {
      if (product.operationType === 'insert') {
        setProducts(prevProducts => [...prevProducts, product.fullDocument]);
      } else if (product.operationType === 'delete') {
        const product_id = product.documentKey._id;
        setProducts(prevProducts => prevProducts.filter(product => product._id !== product_id));
      }
    });
    socket.on('ProductUpdates', (product) => {
      setProducts(prevProducts => prevProducts.map(p => p._id === product._id ? product : p));
    });
    socket.on('CartUpdates', (product) => {
      setcartItems(prevProducts => prevProducts.map(p => p._id === product._id ? product : p));
    })
    return () => {
      socket.off('ProductChanges');
      socket.off('ProductUpdates');
      socket.off('CartUpdates');
    }
  }, [socket]);
  useEffect(() => {
    fetchProducts();
  }, []);
  /**
   * Handles the search query by updating the component state with the new search query.
   * This triggers a re-render of the component with the new search query.
   * @param {string} query The search query to search for in the product list.
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  const [newImageUrl, setNewImageUrl] = useState(''); // Temporary input for new image URL
  const [productData, setProductData] = useState({
    product_name: '',
    product_category: '',
    price: '',
    description: '',
    MRP: '',
    stock_quantity: '',
    image_url: [],
  });
  /**
 * Fetches all products from the database and stores them in state
 * @returns {Promise<void>}
 */
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/AllProducts', { withCredentials: true });
      setProducts(response.data); // Store the products in state
      const map = {};
      response.data.forEach(product => {
        map[product._id] = product;
      });
      setProductsMap(map);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  /**
 * Handles changes to the product data form by updating the state.
 * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input element
 */
  const handleProductDataChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setProductData((prevState) => ({
        ...prevState,
        image_url: [...prevState.image_url, newImageUrl.trim()],
      }));
      setNewImageUrl(''); // Clear the input field
    }
  };
  const handleRemoveImageUrl = (index) => {
    setProductData((prevState) => ({
      ...prevState,
      image_url: prevState.image_url.filter((_, i) => i !== index),
    }));
  };

  /**
   * Adds products from the Excel data to the database.
   * Iterates over the excelData array and sends a POST request for each product
   * to add it to the database. If successful, it logs the response and refreshes
   * the product list. Closes the dialog after attempting to add all products.
   * Catches and logs any errors encountered during the process.
   */
  const handleAddFromExcel = async () => {
    try {
      const addProductPromises = [];
      for (let i = 0; i < excelData.length; i++) {
        const product = excelData[i];
        const { product_name, product_category, price, MRP,description, stock_quantity, image_url } = product;
        // Collect promises for each product addition
        addProductPromises.push(
          axios.post(
            'http://localhost:5000/api/products/AddProduct',
            { product_name, product_category, price, description,MRP, image_url, stock_quantity },
            { withCredentials: true }
          )
        );
      }
      // Wait for all product addition requests to complete
      const responses = await Promise.all(addProductPromises);
      // Check if all responses are successful
      if (responses.every(response => response.status === 200)) {
        fetchProducts(); // Refresh the product list once after all products are added
        setExcelData([]); // Clear the Excel data after adding products
        setFileName(''); // Clear the file name
        setOpenDialog(false); // Close the dialog after adding products
      }
      else {
        toast.error('Error adding products from Excel, please try again');
      }
    } catch (error) {
      console.error('Error adding products from Excel:', error);
    }
    setOpenDialog(false); // Close the dialog after adding products
  };

  /**
 * Deletes a product from the database.
 * Sends a DELETE request to the server with the product ID in the request URL.
 * If successful, it removes the product from the products state.
 * If the server returns an error, it fetches the products again to refresh the state.
 * Catches and logs any errors encountered during the process.
 * @param {string} id - The ID of the product to delete.
 */
  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      axios.delete(`http://localhost:5000/api/products/deleteProduct/${id}`, { withCredentials: true })
        .then(response => {
          if (response.data.message === 'Product deleted successfully') {
            setProducts(prevProducts => prevProducts.filter(product => product._id !== id));
          } else {
            fetchProducts();
          }
        })
        .catch(error => {
          console.error('Error deleting product:', error);
        });
    }
  };
  const handleDialogCloseEdit = () => {
    setEditDialogOpen(false);
    setEditingProduct(null);
  };
  /**
 * Increments the stock quantity of a product by one.
 * Sends a PUT request to the server with the product ID in the request URL.
 * If successful, it updates the product list with the new stock quantity.
 * If the server returns an error, it fetches the product list again.
 * Catches and logs any errors encountered during the process.
 * @param {string} id - The ID of the product to increment.
 */
  const handleIncrementProduct = async (id) => {
    if (window.confirm('Are you sure you want to increment the stock of this product?')) {
      try {
        const response = await axios.put(`http://localhost:5000/api/products/incrementProduct/${id}`, {}, { withCredentials: true });
        if (response.data.message === 'Product stock updated') {
          setProducts(prevProducts => prevProducts.map(product => {
            if (product._id === response.data.updatedProduct._id) {
              return response.data.updatedProduct;
            }
            return product;
          }));
        } else {
          fetchProducts();
        }
      } catch (error) {
        console.error('Error incrementing product stock:', error);
      }
    }
  };
  /**
 * Decrements the stock quantity of a product by one.
 * Sends a PUT request to the server with the product ID in the request URL.
 * If successful, it updates the product list with the new stock quantity.
 * If the server returns an error, it fetches the product list again.
 * Catches and logs any errors encountered during the process.
 * @param {string} id - The ID of the product to decrement.
 */
  const handleDecrementProduct = async (id) => {
    if (window.confirm('Are you sure you want to decrement the stock of this product?')) {
      try {
        const response = await axios.put(`http://localhost:5000/api/products/decrementProduct/${id}`, {}, { withCredentials: true });
        if (response.data.message === 'Product stock updated') {
          setProducts(prevProducts => prevProducts.map(product => {
            if (product._id === response.data.updatedProduct._id) {
              return response.data.updatedProduct;
            }
            return product;
          }));
        } else {
          fetchProducts();
        }
      } catch (error) {
        console.error('Error decrementing product stock:', error);
      }
    }
  };
  /**
 * Opens the edit dialog with the given product
 * @param {Object} product The product to be edited
 */
  const handleEditProduct = (product) => {
    if (window.confirm('Are you sure you want to edit this product?')) {
      setEditingProduct(product);
      setEditDialogOpen(true);
    }
  };
  /**
   * Adds a product to the database.
   * Sends a POST request to the server with the product data in the request body.
   * If successful, it logs the response and refreshes the product list. Closes
   * the dialog after attempting to add the product. Catches and logs any errors
   * encountered during the process.
   */
  const handleAddProductManual = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/products/AddProduct', productData, { withCredentials: true });
      if (response.data) {
        fetchProducts(); // Refresh the product list
      }
      setOpenDialog(false); // Close the dialog after adding the product
      setProductData({
        product_name: '',
        product_category: '',
        price: '',
        description: '',
        stock_quantity: '',
        image_url: [],
      })
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };
  const handleAddProduct = () => {
    setOpenDialog(true); // Open the dialog when clicking Add Product
  };
  /**
   * Closes the add product dialog and resets the Excel data and filename state.
   */
  const handleDialogClose = () => {
    setOpenDialog(false); // Close the dialog
    setExcelData([]);
    setFileName('');
  };
  /**
 * Handles the file upload event to read the Excel file and convert it to JSON data,
 * then saves the data in the state.
 * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input element
 */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name); // Save the filename to state
      const reader = new FileReader();
      // When the file is loaded, convert it to a JSON object and save it in the state.
      // This function is called by the FileReader when the file is loaded.
      // It reads the file as a binary string, converts it to an Excel workbook using XLSX,
      // extracts the first sheet, converts it to a JSON object, and saves it in the state.
      reader.onload = () => {
        const binaryString = reader.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);  // Convert the sheet to JSON
        setExcelData(data);  // Save the data in the state
      };
      reader.readAsBinaryString(file);
    }
  };
  /**
   * Updates a product in the products state with the given updated product data.
   * Finds the product by its ID and merges the updated data with the existing product.
   *
   * @param {string} id - The ID of the product to update.
   * @param {object} updatedProduct - The updated product data to merge.
   */
  const handleUpdateProduct = (id, updatedProduct) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === id ? { ...product, ...updatedProduct } : product
      )
    );
  };
  /**
   * Closes the edit dialog and resets the product being edited to null
   */
  const highlightQuery = (name, query) => {
    if (!query) return name;
    const regex = new RegExp(`(${query})`, 'i'); // Case-insensitive match
    const parts = name.split(regex);
    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} style={{ color: 'green', fontWeight: 'bold' }}>
              {part}
            </span>
          ) : (
            <span key={index} style={{ color: 'black' }}>
              {part}
            </span>
          )
        )}
      </span>
    );
  };
  return (
    <>
      <div className='bg-black shadow-lg overflow-y-auto p-2  w-full  h-auto rounded-xl'>
        <h3 className='text-4xl font-bold text-white mb-6'>All Products</h3>

        {/* Search Container */}
        <div className="flex mb-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input border border-gray-300 rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <i className="fas fa-search"></i>
            </span>
          </div>
        </div>

        {/* Filter and Sort Options */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-white">Show Out of Stock Only</label>
            <input
              type="checkbox"
              checked={outOfStockFilter}
              onChange={(e) => setOutOfStockFilter(e.target.checked)}
              className="ml-2"
            />
          </div>
          <div>
            <label className="text-white">Show In Stock Only</label>
            <input
              type="checkbox"
              checked={inStockFilter}
              onChange={(e) => setInStockFilter(e.target.checked)}
              className="ml-2"
            />
          </div>

          <div className='flex flex-row gap-4'>
            {/* Sorting Options */}
            <div>
              <label className="text-white">Sort By:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-gray-700 text-white p-2 rounded-full w-full mt-2"
              >
                <option value="">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock-asc">Stock: Low to High</option>
                <option value="stock-desc">Stock: High to Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-white">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700 text-white p-2 rounded-full w-full mt-2"
              >
                <option value="">All</option>
                {[...new Set(products.map(product => product.product_category))].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="flex space-x-4">
              <div>
                <label className="text-white">Min Price:</label>
                <input
                  type="number"
                  placeholder="Min"
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: Number(e.target.value) || 0 })
                  }
                  className="w-full mt-2 p-2 rounded-full bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="text-white">Max Price:</label>
                <input
                  type="number"
                  placeholder="Max"
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value === "" ? Infinity : Number(e.target.value) })
                  }
                  className="w-full mt-2 p-2 rounded-full bg-gray-700 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Add Product Button */}
        <div className="mb-6 flex justify-start">
          <button
            onClick={handleAddProduct}
            className="btn btn-primary relative text-2xl text-white bg-green-600 hover:bg-green-700 transition duration-300 py-1.5 px-2.5"
          >
            Add Product
          </button>
        </div>

        {/* Product List */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-semibold">
          {products.length > 0 ? products
            .filter(product => product.product_name.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(product => !inStockFilter || product.stock_quantity > 0)
            .filter(product => !outOfStockFilter || product.stock_quantity === 0)
            .filter(product => !selectedCategory || product.product_category === selectedCategory)
            .filter(product => priceRange.min === 0 || product.price >= priceRange.min)
            .filter(product => priceRange.max === Infinity || product.price <= priceRange.max)
            .sort((a, b) => {
              if (sortOption === 'price-asc') return a.price - b.price;
              if (sortOption === 'price-desc') return b.price - a.price;
              if (sortOption === 'stock-asc') return a.stock_quantity - b.stock_quantity;
              if (sortOption === 'stock-desc') return b.stock_quantity - a.stock_quantity;
              return 0;
            })
            .map(product => (
              <li
                key={product?._id}
                className={`p-4 rounded-xl shadow-md transition-all ${product?.stock_quantity === 0
                    ? 'bg-gray-800 border border-gray-500'
                    : 'bg-gray-800 border border-gray-600 hover:shadow-lg'
                  }`}
              >
                {/* Product Image */}
                <div className="flex justify-center mb-4 relative">
                  {product?.image_url ? (
                    <img
                      src={product?.image_url}
                      // onClick={handleClickOpenImage}
                      alt="Product"
                      className="w-40 h-40 object-contain rounded-lg hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center bg-gray-600 text-gray-300 rounded-lg">
                      No Image
                    </div>
                  )}
                </div>
                {/* Product Details */}
                <div className="text-gray-200 text-sm space-y-2">
                  <div>
                    <span className="text-gray-400">Name:</span>{' '}
                    {highlightQuery(product?.product_name, searchQuery)}
                  </div>
                  <div>
                    {product?.stock_quantity === 0 ? (
                      <span className="text-red-500 font-medium">Out of Stock</span>
                    ) : (
                      <span className="text-teal-400 font-medium">In Stock</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400">Category:</span> {product?.product_category}
                  </div>
                  <div>
                    <span className="text-gray-400">Price:</span> ₹{product?.price}
                  </div>
                  <div>
                    <span className="text-gray-400">MRP:</span> ₹{product?.MRP }
                  </div>
                  {Authuser.isAdmin && (
                    <>
                      <div>
                        <span className="text-gray-400">Stock:</span>{' '}
                        {product?.stock_quantity}
                      </div>
                      <div>
                        <span className="text-gray-400">Created:</span>{' '}
                        {new Date(product?.created_at).toDateString()}
                      </div>
                      <div>
                        <span className="text-gray-400">Updated:</span>{' '}
                        {new Date(product?.updated_at).toDateString()}
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex justify-between items-center">
                  {/* Add to Cart Button */}
                  {!Authuser.isAdmin && (
                    <button
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg disabled:bg-gray-500 transition"
                      onClick={() => handleAddToCart(product)}
                      disabled={product?.stock_quantity === 0}
                    >
                      <i className="fas fa-cart-plus mr-2"></i>Add to Cart
                    </button>
                  )}

                  {/* Admin Buttons */}
                  {Authuser.isAdmin && (
                    <div className="flex gap-3 items-center">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                        onClick={() => handleEditProduct(product)}
                      >

                        <i className="fas fa-pen"></i>
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                      <button
                        className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg transition"
                        onClick={() => handleIncrementProduct(product?._id)}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                      <button
                        className={`p-2 rounded-lg ${product?.stock_quantity === 0
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-yellow-600 hover:bg-yellow-700 text-white transition'
                          }`}
                        onClick={() => handleDecrementProduct(product?._id)}
                        disabled={product?.stock_quantity === 0}
                      >
                        <i
                          className={`fas ${product?.stock_quantity === 0 ? 'fa-ban' : 'fa-minus'
                            }`}
                        ></i>
                      </button>
                    </div>
                  )}
                </div>
              </li>

            )) : (
            <p className="text-white text-center col-span-full">No products available</p>
          )}
        </ul>
        {editingProduct && (
          <EditProductDialog
            open={editDialogOpen}
            onClose={handleDialogCloseEdit}
            product={editingProduct}
            onUpdate={handleUpdateProduct}
          />
        )}

        {/* Add Product Dialog */}
        <Dialog open={openDialog} onClose={handleDialogClose} PaperProps={{ style: { backgroundColor: "black", color: "white" } }}>
          <DialogTitle className="text-2xl" style={{ color: "white" }}>Add Product</DialogTitle>
          <DialogContent>
            <Button
              variant="outlined"
              component="label"
              sx={{ marginBottom: '16px', color: "green", borderColor: "green" }}
            >
              Upload Excel
              <input
                type="file"
                hidden
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
            </Button>
            <div style={{ color: "white" }}>
              Upload the excel file having columns: [product_name, product_category, price, MRP, description,stock_quantity,image_url]
            </div>
            {fileName && (
              <div style={{ marginTop: '8px', fontStyle: 'italic', color: 'gray' }}>
                Selected file: {fileName}
              </div>
            )}
            <TextField
              label="Product Name"
              fullWidth
              margin="normal"
              name="product_name"
              value={productData.product_name}
              onChange={handleProductDataChange}
              InputProps={{
                style: { color: "white" }, // Sets text color
              }}
              InputLabelProps={{
                style: { color: "white" }, // Sets label color
              }}
              sx={{
                backgroundColor: "black", // Sets background color
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white", // Border color
                  },
                  "&:hover fieldset": {
                    borderColor: "gray", // Hover border color
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white", // Focused border color
                  },
                },
              }}
            />
            <TextField
              label="Product Category"
              fullWidth
              margin="normal"
              name="product_category"
              value={productData.product_category}
              onChange={handleProductDataChange}
              InputProps={{
                style: { color: "white" }, // Sets text color
              }}
              InputLabelProps={{
                style: { color: "white" }, // Sets label color
              }}
              sx={{
                backgroundColor: "black", // Sets background color
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white", // Border color
                  },
                  "&:hover fieldset": {
                    borderColor: "gray", // Hover border color
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white", // Focused border color
                  },
                },
              }}
            />
            <TextField
              label="Price"
              fullWidth
              margin="normal"
              name="price"
              value={productData.price}
              onChange={handleProductDataChange}
              type="number"
              InputProps={{
                style: { color: "white" }, // Sets text color
              }}
              InputLabelProps={{
                style: { color: "white" }, // Sets label color
              }}
              sx={{
                backgroundColor: "black", // Sets background color
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white", // Border color
                  },
                  "&:hover fieldset": {
                    borderColor: "gray", // Hover border color
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white", // Focused border color
                  },
                },
              }}
            />
            <TextField
              label="MRP"
              fullWidth
              margin="normal"
              name="MRP"
              value={productData.MRP}
              onChange={handleProductDataChange}
              type="number"
              InputProps={{
                style: { color: "white" }, // Sets text color
              }}
              InputLabelProps={{
                style: { color: "white" }, // Sets label color
              }}
              sx={{
                backgroundColor: "black", // Sets background color
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white", // Border color
                  },
                  "&:hover fieldset": {
                    borderColor: "gray", // Hover border color
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white", // Focused border color
                  },
                },
              }}
            />
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              name="description"
              value={productData.description}
              onChange={handleProductDataChange}
              InputProps={{
                style: { color: "white" }, // Sets text color
              }}
              InputLabelProps={{
                style: { color: "white" }, // Sets label color
              }}
              sx={{
                backgroundColor: "black", // Sets background color
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white", // Border color
                  },
                  "&:hover fieldset": {
                    borderColor: "gray", // Hover border color
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white", // Focused border color
                  },
                },
              }}
            />
            <TextField
              label="Stock Quantity"
              fullWidth
              margin="normal"
              name="stock_quantity"
              value={productData.stock_quantity}
              onChange={handleProductDataChange}
              InputProps={{
                style: { color: "white" }, // Sets text color
              }}
              InputLabelProps={{
                style: { color: "white" }, // Sets label color
              }}
              sx={{
                backgroundColor: "black", // Sets background color
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white", // Border color
                  },
                  "&:hover fieldset": {
                    borderColor: "gray", // Hover border color
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white", // Focused border color
                  },
                },
              }}
            />
            {/* <TextField
      label="Image Url"
      fullWidth
      margin="normal"
      name="image_url"
      value={productData.image_url}
      onChange={handleProductDataChange}
      InputProps={{
        style: { color: "white" }, // Sets text color
      }}
      InputLabelProps={{
        style: { color: "white" }, // Sets label color
      }}
      sx={{
        backgroundColor: "black", // Sets background color
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "white", // Border color
          },
          "&:hover fieldset": {
            borderColor: "gray", // Hover border color
          },
          "&.Mui-focused fieldset": {
            borderColor: "white", // Focused border color
          },
        },
      }}
/> */}
            <div style={{ marginBottom: "16px" }}>
              <TextField
                label="Add Image URL"
                fullWidth
                margin="normal"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "white" } }}
                sx={{
                  backgroundColor: "black",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "white" },
                    "&:hover fieldset": { borderColor: "gray" },
                    "&.Mui-focused fieldset": { borderColor: "white" },
                  },
                }}
              />
              <Button
                onClick={handleAddImageUrl}
                style={{ marginTop: "8px", backgroundColor: "green", color: "white" }}
              >
                Add Image
              </Button>
            </div>

            {/* List of Image URLs */}
            {productData.image_url.length > 0 && (
              <div>
                <div style={{ color: "white", marginBottom: "8px" }}>Added Images:</div>
                <ul>
                  {productData.image_url.map((url, index) => (
                    <li key={index} style={{ marginBottom: "8px" }}>
                      <span style={{ color: "white" }}>{url}</span>
                      <Button
                        onClick={() => handleRemoveImageUrl(index)}
                        style={{
                          marginLeft: "8px",
                          backgroundColor: "red",
                          color: "white",
                        }}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} style={{ color: "green" }}>
              Cancel
            </Button>
            <Button onClick={handleAddFromExcel} style={{ backgroundColor: "green", color: "white" }} disabled={!fileName}>

              Add EXCEL
            </Button>
            <Button onClick={handleAddProductManual} style={{ backgroundColor: "green", color: "white" }}>
              Add Manually
            </Button>
          </DialogActions>
        </Dialog>

      </div>
    </>

  )
}

export default AdminProductListing
