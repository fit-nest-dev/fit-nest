"use client"

import { useState, useEffect } from "react"
import "@fortawesome/fontawesome-free/css/all.min.css"
import Typewriter from "typewriter-effect"
import { Link, useNavigate } from "react-router-dom"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { useAuthContext } from "../context/AuthContext"
import axios from "axios"
import MapImg from "../assets/MAP1.jpg"
import toast from "react-hot-toast"
const Home1 = () => {
  const { Authuser } = useAuthContext()
  const navigate = useNavigate()
  const { productsMap } = useAuthContext()
  const [loading, setLoading] = useState(false)
  // const [suggestedProducts,setSuggestedProducts]=useState([]);
  const [resources, setResources] = useState([])
  // Function to get Month Name
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
            `http://localhost:5000/api/products/decrementProduct-guest/${product._id}`,
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
            `http://localhost:5000/api/products/decrementProduct-guest/${product._id}`,
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
      const response = await axios.put(`http://localhost:5000/api/Cart/AddToCart/${Authuser._id}/${product._id}`, {})
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
        //  fetchCartProductsOfUser(Authuser._id);
      }
    } catch (error) {
      toast.error(error.response.data.error)
      console.error("Error adding product to cart:", error)
    }
  }
  // Function to get Ordinal Suffix
  function getOrdinalSuffix(day) {
    const dayString = day.toString() // Ensure it's a string
    if (dayString.endsWith("1") && !dayString.endsWith("11")) {
      return "st"
    } else if (dayString.endsWith("2") && !dayString.endsWith("12")) {
      return "nd"
    } else if (dayString.endsWith("3") && !dayString.endsWith("13")) {
      return "rd"
    } else {
      return "th"
    }
  }
  const getAllResources = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:5000/api/Admin/AllResources`)
      setResources(response.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getAllResources()
  }, [])
  if (loading) {
    return <div>Loading...</div>
  }
  return (
    <div className="bg-black text-white font-sans">
      {/* Full-Screen Video Section */}
      {/* Full-Screen Video Section */}
      <section className="flex justify-center items-center h-screen bg-black">
        <div className="w-full h-screen flex justify-center items-center bg-black">
          <img
            className="w-full h-full object-contain"
            src={resources.find((resource) => resource.title === "HOME_PAGE_VIDEO")?.resourceLink || "/placeholder.svg"}
            alt="Home Logo"
          />
        </div>
      </section>

      <section className="bg-black py-12 px-6 ">
        <h2 className="text-white text-center text-5xl font-extrabold mb-20 relative">
          <span className="relative z-10">Best Transformation</span>
          <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-green-500"></span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources
            .filter((resource) => resource.title === "EVENTS") // Filter resources for EVENTS
            .flatMap((eventResource) => eventResource.customResource).length === 0 ? ( // Flatten to get events
            <div className="text-center font-roboto text-white col-span-full">
              <Typewriter
                options={{
                  strings: ["Hold on! We'll be back with some amazing events."],
                  autoStart: true,
                  loop: true,
                }}
              />
            </div>
          ) : (
            resources
              .filter((resource) => resource.title === "EVENTS")
              .map((eventResource) =>
                eventResource.customResource.map((event, index) => (
                  <div
                    key={index}
                    className="relative h-[540px] overflow-hidden shadow-md shadow-green-50/50 transition-transform transform hover:scale-105 hover:shadow-lg hover:shadow-green-300 hover:border hover:border-green-600 group"
                  >
                    {/* Event Image */}
                    <img
                      src={event.imageLink || "https://via.placeholder.com/300x200?text=Event+Image"}
                      alt={event.title || "Event Image"}
                      className="w-68 m-auto object-cover h-57 "
                    />

                    {/* Card Content */}
                    <div className="p-6 bg-black bg-opacity-90 flex flex-col items-center">
                      {/* Horizontal Flex Container */}
                      <div className="flex items-center justify-between w-full mb-4">
                        {/* Date */}
                        <div className="text-green-600 font-bold text-center flex flex-col items-center">
                          {/* Month, Day, and Year */}
                          <span className="block text-xs text-white"></span>

                          {/* Year */}
                          <span className="text-4xl text-green-600">{event.date.split("-")[0] || "2024"}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-center text-white  transition-colors duration-300 ml-4">
                          {event.title || "EVENT NAME"}
                        </h3>
                      </div>
                    </div>
                  </div>
                )),
              )
          )}
        </div>
      </section>
      {/* Suggested Products Section 
<section className="px-6 py-8 bg-black mt-8 mb-20">
   {resources?.length === 0 ? (
    <h2 className="text-white text-center text-5xl font-extrabold mb-20">
      No Suggested Products
    </h2>
  ) : (
    <h2 className="text-white text-center text-5xl font-extrabold mb-20">
      Suggested Products
    </h2>
  )}

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    {resources
      ?.find((resource) => resource.title === 'SUGGESTED_PRODUCTS')
      ?.customResource?.map((product) => (
        <div
          key={product._id}
          onClick={() => navigate('/description', { state: { product: product } })}
          className="relative overflow-hidden shadow-md shadow-green-50/50 transition-transform transform hover:scale-105 hover:shadow-lg hover:shadow-green-300 group flex flex-col"
        >
          {/* Product Image with increased height 
          <img
            src={product.image_url || "https://via.placeholder.com/300x200.png?text=Product+Image"}
            alt={product.product_name}
            className="w-full h-80 object-cover"  // Increased height of the image (h-80)
          />
          <div className="flex flex-col py-2 px-4 h-full"> {/* Reduced padding here */}
      {/* Product Name with Truncation 
            <h3
              className="text-lg font-semibold text-white mb-2 font-roboto flex items-center"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.product_name}
            </h3>
            {/* Product Description 
            <p className="text-sm mb-2 font-lato text-gray-400 truncate flex items-center">
              <i className="fas fa-info-circle mr-2 text-gray-500"></i>
              {product.product_category}
            </p>
            {/* Product Price 
            <p className="text-xl font-bold text-green-500 mb-2 font-lato flex items-center">
              <img
                src={ruppee || "/placeholder.svg"}
                width={16}
                height={5}
                className="mt-[4px]"
                alt=""
              />
              {product.price}
            </p>
            {/* Buy Now Button 
            <div className="mt-auto">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#388e3c",
                  color: "#fff",
                  padding: "8px 16px", // Reduced padding for a more compact button
                  fontWeight: "bold",
                  fontSize: "14px", // Reduced font size for better balance
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 8px rgba(76, 175, 80, 0.3)", // Lighter shadow for a subtler effect
                  "&:hover": {
                    backgroundColor: "#388e3c",
                    boxShadow: "0 6px 12px rgba(56, 142, 60, 0.4)",
                    transform: "translateY(-2px)", // Slight lift effect on hover
                  },
                  "&:active": {
                    backgroundColor: "#2e7d32",
                    boxShadow: "0 2px 4px rgba(46, 125, 50, 0.4)", // Subtle active effect
                    transform: "translateY(0)",
                  },
                  mt: 2, // Added margin-top for spacing
                }}
                onClick={async (e) => {
                   e.stopPropagation();
                  await handleAddToCart(product); // Wait for the product to be added to the cart
                  navigate("/checkout");
                  window.scrollTo({ top: 0, behavior: "smooth" }); // Navigate to the checkout page
                }}
              >
                BUY NOW
              </Button>
            </div>
          </div>
        </div>
      ))}
  </div>

  {resources.find((resource) => resource.title === "SUGGESTED_PRODUCTS")?.customResource?.length >
    2 && (
    <div className="mt-6 flex justify-end">
      <button
        onClick={() => {
          navigate("/shop");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="text-white font-semibold py-2 px-6 rounded-lg transition duration-300 hover:text-green flex items-center justify-center gap-2"
      >
        <i className="fas fa-arrow-down"></i> {/* Arrow icon 
        Show More Products
      </button>
    </div>
  )}
</section>   */}

      {/* Content Section */}

      {/* Why Choose Us Section - Modern Design */}
      <section className="py-16 px-4 bg-black">
        <div className="w-full">
          <h2 className="text-white text-center text-5xl font-extrabold mb-16 relative">
            <span className="relative z-10">Why Choose Us</span>
            <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-green-500"></span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Jerai Fitness */}
            <div className="group relative overflow-hidden rounded-xl shadow-2xl transition-all duration-500 hover:shadow-green-500/30 border border-gray-800 hover:border-green-500/50">
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90 z-10"></div>
              <img
                src="/images/jerai.avif"
                alt="Jerai Fitness Equipment"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="relative z-20 p-8 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">
                  Jerai Fitness AKA Being Strong
                </h3>
                <p className="text-gray-300 mb-6 group-hover:text-white transition-colors duration-300">
                  Inspiring Strength. Delivering Excellence
                </p>
                <div className="mt-auto flex justify-end">
                  <img
                    src="https://jeraifitness.com/cdn/shop/files/jerai-fitness-logo_200x.png?v=1613712145"
                    alt=""
                    className="h-12 object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Floor Area */}
            <div className="group relative overflow-hidden rounded-xl shadow-2xl transition-all duration-500 hover:shadow-green-500/30 border border-gray-800 hover:border-green-500/50">
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90 z-10"></div>
              <img
                src="/images/floor.avif"
                alt="Gym Floor Area"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="relative z-20 p-8 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">
                  Floor Area
                </h3>
                <p className="text-gray-300 mb-6 group-hover:text-white transition-colors duration-300">
                  Spread in an area of around 2,500 sq. ft. consisting of gym area around 2,000 sq. ft., 500 sq. ft. of
                  washroom.
                </p>
              </div>
            </div>

            {/* Certified Trainers */}
            <div className="group relative overflow-hidden rounded-xl shadow-2xl transition-all duration-500 hover:shadow-green-500/30 border border-gray-800 hover:border-green-500/50">
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90 z-10"></div>
              <img
                src="/images/certified.avif"
                alt="Certified Trainers"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="relative z-20 p-8 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">
                  Certified Trainers
                </h3>
                <p className="text-gray-300 mb-6 group-hover:text-white transition-colors duration-300">
                  Bringing you the mix of certification with experience and a perfect blend to bring out the best in
                  you.
                </p>
              </div>
            </div>

            {/* Music by Yamaha */}
            <div className="group relative overflow-hidden rounded-xl shadow-2xl transition-all duration-500 hover:shadow-green-500/30 border border-gray-800 hover:border-green-500/50">
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90 z-10"></div>
              <img
                src="/images/yamaha.avif"
                alt="Music System"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="relative z-20 p-8 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">
                  Music by Yamaha
                </h3>
                <p className="text-gray-300 mb-6 group-hover:text-white transition-colors duration-300">
                  From warm-up to cooldown, Yamaha sound keeps you motivated, focused, and thriving through every rep.
                </p>
                <div className="mt-auto flex justify-end">
                  <img
                    src="https://www.yamaha.com/yamahavgn/PIM/Images/19027_12073_1_1200x1200_80813a1a8aec6b9760e7ac5cc4a8c6a3.jpg"
                    alt=""
                    className="h-12 object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap px-4 sm:px-6 py-6 sm:py-8 bg-black relative">
        {/* Left Column - Name, Description, and Buttons */}
        <div className="w-full md:w-1/2 mb-6 md:mb-0 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-green-600 mb-4 font-poppins">
            <Typewriter
              options={{
                strings: ["FIT NEST", "Your Fitness Journey Begins Here!"],
                autoStart: true,
                loop: true,
              }}
            />
          </h1>
          <p className="text-lg sm:text-xl mb-4 font-roboto text-gray-300">Where fitness meets family!</p>
          <p className="text-gray-400 font-lato mb-6">
            Experience training in a supportive, community-driven environment. Achieve your goals while feeling at home.
          </p>
          <div className="border-t border-gray-600 my-6 w-full"></div>
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-md">
            {/* Contact Us Button - Linked to the contact page */}
            <a
              href="tel:+919008255804"
              className="relative flex items-center justify-center bg-black text-white font-semibold py-2 px-6 shadow-lg border border-white transition duration-300 w-full transform hover:scale-105 hover:shadow-white/50"
            >
              <i className="fas fa-phone text-white mr-2"></i>
              <span>Contact Us</span>
            </a>

            {/* Membership Button - Linked to the membership page */}
            <Link
              to="/members"
              className="relative flex items-center justify-center bg-green-600 to-green-700 text-white font-semibold py-2 px-6 shadow-lg transition-transform duration-300 w-full transform hover:scale-105 hover:shadow-green-500/50"
            >
              <i className="fas fa-users text-white mr-2"></i>
              <span>Membership</span>
            </Link>
          </div>
        </div>

        {/* Right Column - Google Map with Button */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className="relative w-full max-w-md transition-all duration-300">
            <img src={MapImg || "/placeholder.svg"} width={800} height={800} alt="" />
            <a
              href="https://www.google.com/maps/place/Fit+Nest+-+Top+Rated+Gym+In+Boring+Road/@25.6104738,85.1154629,17z/data=!3m1!4b1!4m6!3m5!1s0x39ed593ba6c93ac9:0x95a8243da486cbca!8m2!3d25.610469!4d85.1180378!16s%2Fg%2F11h2p6j35n?entry=ttu&g_ep=EgoyMDI0MTIxMS4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex justify-center items-center text-white font-semibold py-2 px-4 opacity-0 hover:opacity-100 transition-opacity duration-300"
            >
              <span className="flex items-center text-black bg-white">See Location</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home1
//hi
