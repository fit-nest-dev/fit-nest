import { useState, useEffect, useContext } from "react"
import Fuse from "fuse.js"
import { FaShoppingCart, FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa"
import { useAuthContext } from "../../context/AuthContext"
import axios from "axios"
import { FaSearch } from "react-icons/fa"
import "@fortawesome/fontawesome-free/css/all.min.css"
import { SocketContext } from "../../context/SocketContext"
import { useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { ShoppingCartIcon } from "@heroicons/react/24/outline"
import toast from "react-hot-toast"
import mbkLogo from "../../assets/mbk.png"

const Home = () => {
  const { Authuser } = useAuthContext()
  const [products, setProducts] = useState([])
  const { socket } = useContext(SocketContext)
  const [isCartOpen, setCartOpen] = useState(false)

  const [isOrdersOpen, setOrdersOpen] = useState(false)
  const [productsMap, setProductsMap] = useState({})
  const { cartItems, setCartItems } = useCart()
  const [outOfStockFilter, setOutOfStockFilter] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [inStockFilter, setInStockFilter] = useState(false)
  const [sortOption, setSortOption] = useState("")
  const [fuzzyResults, setFuzzyResults] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  useEffect(() => {
    const fuseOptions = {
      keys: ["product_name", "product_category"], // Fields to search in
      threshold: 0.2, // Adjust sensitivity (lower means stricter matching)
    }
    const fuse = new Fuse(products, fuseOptions)
    // Perform fuzzy search only if there is a search query
    if (searchQuery) {
      const results = fuse.search(searchQuery).map((result) => result.item)
      setFuzzyResults(results) // Update state with fuzzy search results
    } else {
      setFuzzyResults([]) // Clear results when searchQuery is empty
    }
  }, [searchQuery, products]) // Re-run whenever searchQuery or products change
  // Debugging: Log fuzzy search results
  const handleSearch = (query) => {
    setSearchQuery(query)
  }
  const navigate = useNavigate()
  const [priceRange, setPriceRange] = useState({ min: 0, max: Number.POSITIVE_INFINITY })
  const handleRemoveFromCart = async (productId) => {
    try {
      const response = await axios.delete(
        `http://3.25.86.182:5000/api/Cart/DeleteFromCart/${Authuser._id}/${productId}`,
        { withCredentials: true },
      )
      if (response.data.message === "Product deleted from cart successfully") {
        setCartItems((prevItems) => prevItems.filter((item) => item.cart.product !== productId))
      }
    } catch (error) { }
  }
  useEffect(() => {
    socket.on("ProductChanges", (product) => {
      if (product.operationType === "insert") {
        setProducts((prevProducts) => [...prevProducts, product.fullDocument])
      } else if (product.operationType === "delete") {
        const product_id = product.documentKey._id
        setProducts((prevProducts) => prevProducts.filter((product) => product._id !== product_id))
      }
    })
    socket.on("ProductUpdates", (product) => {
      setProducts((prevProducts) => prevProducts.map((p) => (p._id === product._id ? product : p)))
    })
    socket.on("CartUpdates", (product) => {
      setCartItems((prevProducts) => prevProducts.map((p) => (p._id === product._id ? product : p)))
    })
    return () => {
      socket.off("ProductChanges")
      socket.off("ProductUpdates")
      socket.off("CartUpdates")
    }
  }, [socket, setCartItems]) // Added setCartItems to dependencies
  const addProductsToCartFromLocalStorage = async (data, AuthUserId) => {
    if (data.length === 0) {
      return
    }
    try {
      for (const item of data) {
        const productId = item.cart.product
        const count = item.cart.count

        // Add the product `count` times to the cart
        for (let i = 0; i < count; i++) {
          const response = await axios.put(
            `http://3.25.86.182:5000/api/Cart/AddToCart-from-local-storage/${AuthUserId}/${productId}`,
            {},
            { withCredentials: true },
          )

          if (response.data.message === "Product added to cart successfully") {
          } else {
            console.warn(`Failed to add product ${productId} to cart:`, response.data)
          }
        }
      }
      localStorage.removeItem("LocalCart")
    } catch (error) {
      console.error("Error adding products to cart:", error)
    }
  }
  const [loading, setloading] = useState(false)
  const fetchProducts = async () => {
    try {
      setloading(true)
      const response = await axios.get("http://3.25.86.182:5000/api/products/AllProducts", { withCredentials: true })
      setProducts(response.data) // Store the products in state
      const map = {}
      response.data.forEach((product) => {
        map[product._id] = product
      })
      setProductsMap(map)
    } catch (error) {
      setloading(false)
      console.error("Error fetching products:", error)
    } finally {
      setloading(false)
    }
  }
  const [loadinCart, setLoadingCart] = useState(true)
  const fetchCartProductsOfUser = async (id) => {
    if (id === null) {
      setCartItems(JSON.parse(localStorage.getItem("LocalCart") || "[]"))
      return
    }
    try {
      setLoadingCart(true)
      const response = await axios.get(`http://3.25.86.182:5000/api/Cart/GetCarts/${id}`, { withCredentials: true })
      setCartItems(response.data)
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoadingCart(false)
    }
  }
  useEffect(() => {
    fetchProducts()

    if (Authuser) {
      fetchCartProductsOfUser(Authuser._id).then(() => {
        const localCart = JSON.parse(localStorage.getItem("LocalCart") || "[]")
        if (localCart.length > 0) {
          addProductsToCartFromLocalStorage(localCart, Authuser._id)
        }
      })
    } else {
      fetchCartProductsOfUser(null)
    }
  }, [Authuser]) // Added Authuser to dependencies
  useEffect(() => {
    fetchCartProductsOfUser(Authuser ? Authuser._id : null)
  }, [Authuser])

  const handleAddToCart = async (product) => {
    if (!Authuser) {
      try {
        // Get the current cart from local storage or initialize an empty array
        const localCart = JSON.parse(localStorage.getItem("LocalCart")) || []

        // Check if the product is already in the cart
        const existingProductIndex = localCart.findIndex((item) => item.cart.product === product._id)
        if (existingProductIndex !== -1) {
          // Send the existing cart item to the API
          const cartItem = localCart[existingProductIndex]
          const response = await axios.put(
            `http://3.25.86.182:5000/api/products/decrementProduct-guest/${product._id}`,
            { cartItem },
            { withCredentials: true },
          )
          if (response.data.message === "Product stock updated") {
            toast.success("Added to cart")
            localCart[existingProductIndex].cart.count += 1
          }
        } else {
          // Create a new cart item and send it to the API
          const newCartItem = {
            cart: { product: product._id, count: 0 },
          }
          const response = await axios.put(
            `http://3.25.86.182:5000/api/products/decrementProduct-guest/${product._id}`,
            { cartItem: newCartItem },
            { withCredentials: true },
          )
          if (response.data.message === "Product stock updated") {
            toast.success("Added to cart")
            newCartItem.cart.count = 1
          }
          // If the response is successful, add the new item to local storage
          localCart.push(newCartItem)
        }

        // Save the updated cart back to local storage
        localStorage.setItem("LocalCart", JSON.stringify(localCart))
      } catch (error) {
        toast.error(error.response.data.error)
        console.error("Error decrementing product stock:", error)
      }
      return
    }

    try {
      const response = await axios.put(`http://3.25.86.182:5000/api/Cart/AddToCart/${Authuser._id}/${product._id}`, {})
      if (response.data.message === "Product added to cart successfully") {
        toast.success("Product added to cart successfully")
        const { cartItem } = response.data
        // Use the ProductId-to-Product mapping to get full product details
        const detailedProduct = productsMap[cartItem.cart.product]
        if (detailedProduct) {
          // Create a new cart item object
          const newCartItem = {
            cart: { ...cartItem.cart },
          }
        }
        fetchCartProductsOfUser(Authuser._id)
      }
    } catch (error) {
      toast.error(error.response.data.error)
      console.error("Error adding product to cart:", error)
    }
  }
  const highlightQuery = (name, query) => {
    if (!query) return name
    const regex = new RegExp(`(${query})`, "i") // Case-insensitive match
    const parts = name.split(regex)
    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} style={{ color: "green", fontWeight: "bold" }}>
              {part}
            </span>
          ) : (
            <span key={index} style={{ color: "white" }}>
              {part}
            </span>
          ),
        )}
      </span>
    )
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-green-500"></div>
      </div>
    )
  }
  return (
    <div className="flex flex-col sm:flex w-full bg-black  sm:overflow-auto  bg-clip-padding backdrop-filter backdrop-blur-lg  ">
<div className="w-full bg-gray-800 p-6 mb-8 rounded-lg shadow-lg border border-gray-600 relative overflow-hidden">
  {/* Cut-out effect */}
  <div className="absolute top-0 left-0 w-full h-full border-dashed border-4 border-gray-600 rounded-lg pointer-events-none"></div>

  <div className="flex flex-col sm:flex-row items-center justify-between">
    <div className="flex-1 mb-4 sm:mb-0 flex flex-col items-center sm:items-start">
      <div className="bg-white bg-opacity-90 p-4 rounded-md shadow-md flex items-center">
        <i className="fas fa-tag text-blue-500 mr-2"></i>
        <p className="text-gray-800 font-semibold text-base tracking-tight text-center sm:text-left">
          Get up to <span className="text-blue-500 font-bold">Rs. 150 Cashback</span> on paying via
          <span className="text-blue-500 font-bold"> MobiKwik Wallet</span> on a minimum of
          <span className="text-blue-500 font-bold"> Rs. 1500/-</span>
        </p>
      </div>
    </div>
    <div className="flex-shrink-0 mt-4 sm:mt-0 ml-4">
      <img src={mbkLogo || "/placeholder.svg"} alt="MobiKwik Logo" className="h-14 sm:h-16 transition-transform duration-300 transform hover:scale-105" />
    </div>
  </div>
</div>


      <div className="bg-black p-4 mb-8">
      <div className="flex flex-row justify-between items-center gap-4 p-4 bg-black rounded-md shadow-lg mb-12">
          {/* Left side: Search Bar */}
          <div className="flex-grow max-w-full relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search product by name/category"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-[250px] border border-gray-300 bg-white rounded-full p-2.1 pl-12 text-black focus:ring-1 focus:ring-gray-200 focus:outline-none transition-all duration-300 ease-in-out hover:shadow-lg text-sm leading-5 ml-1.5"
              style={{ lineHeight: '1.5rem' }}
              // Adding styles to make it expand on focus
              onFocus={(e) => e.target.style.width = '400px'}
              onBlur={(e) => e.target.style.width = '250px'}
            />
          </div>
         {/* Centered All Products */}
<div className="absolute left-1/2 transform -translate-x-1/2 w-full sm:w-auto">
  <h1 className="text-white text-2xl sm:text-4xl font-extrabold py-5 text-center hidden sm:block">
    All Products
  </h1>
</div>
          {/* Right side: Drawer Toggle Button, Sort Dropdown, and Cart */}
          <div className="flex items-center gap-4">
            {/* Categories Button (Visible on medium and larger screens) */}
            <div className="hidden sm:block">
              {/* Categories Dropdown */}
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-200"
                style={{ width: '100px', fontSize: '0.700rem' }} // Matches "Sort By" size
              >
                <option value="">Categories</option>
                {[...new Set(products.map((product) => product.product_category))].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {/* Sort Dropdown */}
            <div className="hidden sm:block">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-0 py-1 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-200"
                style={{
                  width: '100px',
                  fontSize: '0.700rem',
                  textAlign: 'center',
                  paddingRight: '1rem',
                }}
              >
                <option value="" disabled>
                  Sort By:
                </option>
                <option value="">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
            {true && (
              <div className="relative flex items-center">
                <div className="p-2 bg-gray-200 rounded-full shadow-lg cursor-pointer transition-transform duration-300 hover:shadow-2xl">
                  <ShoppingCartIcon
                    onClick={() => {
                      navigate(`/checkout`, { state: { cartItems: cartItems ? cartItems : JSON.parse(localStorage.getItem('LocalCart') || '[]') } });
                      fetchCartProductsOfUser(Authuser._id);
                    }}
                    className="w-8 h-8 text-gray-700 hover:text-green-500 transition-colors"
                  />
                  {(cartItems.length || JSON.parse(localStorage.getItem('LocalCart') || '[]').length) >= 0 && (
                    <div className="absolute top-0 right-0 h-[20px] w-[20px] bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {/* {cartItems.length || JSON.parse(localStorage.getItem('LocalCart') || '[]').length} */}
                      {Authuser ? loadinCart ? 0 : cartItems.length : JSON.parse(localStorage.getItem('LocalCart') || '[]').length}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">

        <ul className="grid mb-10 bg-black grid-cols-1 mx-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 font-bold">
          {products.length > 0 ? (
            products
              .filter(
                (product) =>
                  (!searchQuery ||
                    product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.product_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    fuzzyResults.some((result) => result._id === product._id)) && // Check if the product exists in fuzzyResults
                  (!inStockFilter || product.stock_quantity > 0) &&
                  (!outOfStockFilter || product.stock_quantity === 0) &&
                  (selectedCategory === "" || product.product_category === selectedCategory) &&
                  (priceRange.min === 0 || product.price >= priceRange.min) &&
                  (priceRange.max === Number.POSITIVE_INFINITY || product.price <= priceRange.max),
              )
              .sort((a, b) => {
                if (sortOption === "price-asc") return a.price - b.price
                if (sortOption === "price-desc") return b.price - a.price
                if (sortOption === "stock-asc") return a.stock_quantity - b.stock_quantity
                if (sortOption === "stock-desc") return b.stock_quantity - a.stock_quantity
                return 0
              })
              .map((product) => (
                <li
                  onClick={() => navigate("/description", { state: { product: product } })}
                  key={product?._id}
                  className={` shadow-lg overflow-hidden transform transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-green-800 ${product?.stock_quantity === 0 ? "bg-red-200" : "bg-black"}`}
                >
                  <div className="flex flex-col items-center space-y-4 p-4 bg-black shadow-lg">
                    {/* Product Image */}
                    <div
                      className="w-56 h-46 bg-black rounded-lg overflow-hidden flex items-center justify-center"
                      style={{ width: "300px", height: "300px" }}
                    >
                      {product?.image_url ? (
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-500 text-sm">Image Not Available</div>
                      )}
                    </div>
                    {/* Product Details */}
                    <div className="flex flex-col space-y-2 w-full">
                      {/* Product Name */}
                      <div className="text-lg font-roboto text-white flex items-center">
                        <div
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {highlightQuery(
                            product?.product_name,
                            fuzzyResults.some((result) => result._id === product._id)
                              ? fuzzyResults.find((result) => result._id === product._id)?.product_name
                              : searchQuery, // Highlight if it's a fuzzy match
                          )}{" "}
                        </div>
                      </div>
                      {/* Product Category */}
                      <div className="text-sm text-white flex items-center">
                        <FaInfoCircle className="mr-2" />{" "}
                        {highlightQuery(
                          product?.product_category,
                          fuzzyResults.some((result) => result._id === product._id)
                            ? fuzzyResults.find((result) => result._id === product._id)?.product_category
                            : searchQuery, // Highlight if it's a fuzzy match
                        )}
                      </div>
                      {/* Stock Status */}
                      <div
                        className={`${product?.stock_quantity > 0 ? "text-green-500" : "text-red-500"} text-sm font-medium flex items-center`}
                      >
                        {product?.stock_quantity > 0 ? (
                          <>
                            <FaCheckCircle className="mr-2" /> In Stock
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="mr-2" /> Out of Stock
                          </>
                        )}
                      </div>
                      {/* Product Price */}
                      <div className="text-xl font-bold text-white flex items-center">₹ {product?.price}</div>
                    </div>
                    {true && (
                      <button
                        className="w-full bg-white text-black font-bold py-2 flex items-center justify-center hover:bg-green-500 transition duration-200 rounded"
                        onClick={(e) => {
                          e.stopPropagation() // Prevent navigation
                          handleAddToCart(product)
                        }}
                        disabled={product?.stock_quantity === 0}
                      >
                        <FaShoppingCart className="mr-2" /> ADD TO CART
                      </button>
                    )}
                  </div>
                </li>
              ))
          ) : (
            <div className="text-white text-2xl font-bold py-5 pl-5">No products found</div>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Home
