import { Box, Typography } from '@mui/material';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, Person as PersonIcon } from '@mui/icons-material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import React, { useEffect, useState } from 'react';
import BarChartComponent from './BarChartComponent';
import ProductSalesPieChart from './ProductSalesPieChart';
import axios from 'axios';
import { FaChartLine, FaShoppingCart } from "react-icons/fa";
/**
 * This component renders the dashboard page of the admin panel.
 * It displays the following data:
 * - Current month's sales
 * - Current year's sales
 * - Inactive members
 * - Sales by product
 * The component fetches the data from the server and renders it in a grid layout.
 * The component has a loading state and displays a loading animation while the data is being fetched.
 * @returns {JSX.Element}
 */
const Dashboard = () => {
  const [CurrentMonthSales, setCurrentMonthSales] = useState(null);
  const [YearlySales, setYearlySales] = useState(null);
  const [inactiveMembers, setInactiveMembers] = useState(null);
  const [salesByProduct, setSalesByProduct] = useState(null);
  const [productsMap, setProductsMap] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://3.25.86.182:5000/api/products/AllProducts', { withCredentials: true });
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
   * Fetches total sales for a given date range and updates the corresponding state.
   *
   * Sends a GET request to the server to retrieve total sales data for the 
   * specified start and end dates. Depending on the 'type' parameter, it updates
   * the state for either the current month's sales or the current year's sales.
   *
   * @param {string} startDate - The start date for the sales data query.
   * @param {string} endDate - The end date for the sales data query.
   * @param {string} type - The type of sales data to update ('monthly' or 'yearly').
   */
  const fetchTotalSales = async (startDate, endDate, type) => {
    try {
      const response = await axios.get(
        `http://3.25.86.182:5000/api/Order/TotalSales/${startDate}/${endDate}`, { withCredentials: true }
      );
      if (type === 'monthly') {
        setCurrentMonthSales(response.data.totalSales);
      } else if (type === 'yearly') {
        setYearlySales(response.data.totalSales);
      }
    } catch (err) {
      console.error('Error fetching total sales:', err);
    }
  };

  /**
   * Retrieves all inactive members from the database.
   * 
   * This function sends a GET request to the server to retrieve all inactive members
   * and updates the inactiveMembers state with the response.
   * If an error occurs during the process, it logs an error message to the console.
   *
   * @returns {Promise<void>}
   */
  const fetchInactiveMembers = async () => {
    try {
      const response = await axios.get('http://3.25.86.182:5000/api/users/inactive-members', { withCredentials: true });
      setInactiveMembers(response.data);
    }
    catch (err) {
      console.log(err);
    }
  }
  /**
   * Retrieves the total sales and total quantity of each product between the provided start and end dates.
   * Excludes refunded orders.
   * Optionally, sorts the results by total sales in descending order.
   * Returns a JSON array of objects with the keys: productId, totalSales, totalQuantity.
   * If an error occurs, logs the error and returns a 500 status code with an error message.
   * @param {string} startDate - The start date for the sales data query.
   * @param {string} endDate - The end date for the sales data query.
   * @returns {Promise<void>}
   */
  const fetchSalesByProduct = async (startDate, endDate) => {
    try {
      const response = await axios.get(`http://3.25.86.182:5000/api/Admin/getSalesDataByProduct/${startDate}/${endDate}`
        , { withCredentials: true }
      );
      setSalesByProduct(response.data);
    }
    catch (err) {
      console.log(err)
    }
  }
  /**
   * Fetches the total sales for the current month and updates the CurrentMonthSales state.
   * It calculates the start and end dates for the current month and calls the fetchTotalSales
   * function with the start and end dates, and the 'monthly' type.
   */
  const handleFetchMonthlySales = () => {
    const currentDate = new Date();
    const MonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const MonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    fetchTotalSales(formatDate(MonthStartDate), formatDate(MonthEndDate), 'monthly');
  };
  /**
   * A helper function that fetches both products and sales data for the current month.
   * It's called when the component mounts and when the user navigates to the dashboard.
   * @returns {Promise<void>}
   */
  const handleHelper = async () => {
    fetchProducts();
    fetchSalesByProduct(formatDate(MonthStartDate), formatDate(MonthEndDate));
  }
  /**
   * Fetches the total sales for the current year and updates the CurrentYearSales state.
   * It calculates the start and end dates for the current year and calls the fetchTotalSales
   * function with the start and end dates, and the 'yearly' type.
   */
  const handleFetchYearlySales = () => {
    const currentDate = new Date();
    const YearStartDate = new Date(currentDate.getFullYear(), 0, 1);
    const YearEndDate = new Date(currentDate.getFullYear(), 11, 31);

    /**
     * Formats a Date object as a string in the format 'YYYY-MM-DD'.
     * @param {Date} date - The Date object to format.
     * @returns {string} The formatted string.
     */
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    fetchTotalSales(formatDate(YearStartDate), formatDate(YearEndDate), 'yearly');
  };
  const currentDate = new Date();
  const MonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const MonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  useEffect(() => {
    setLoading(true);
    handleFetchMonthlySales()
    handleFetchYearlySales()
    fetchInactiveMembers();
    fetchSalesByProduct(formatDate(MonthStartDate), formatDate(MonthEndDate));
    handleHelper();
    setLoading(false);
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
      </div>
    )
  }

  return (



    <div className=" overflow-y-auto bg-black p-2 rounded-lg shadow-lg">
      <Box sx={{ padding: "20px", backgroundColor: "#121212" }}>
        {/* Dashboard Title */}
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            color: "#ffffff",
            marginBottom: 4,
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          DASHBOARD
        </Typography>

        {/* Weekly, Monthly Sales & Product Chart Section */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 4,
            marginBottom: 6,
          }}
        >
          {/* Weekly Sales */}
          <Box
            sx={{
              backgroundColor: "linear-gradient(135deg, #1f1f1f, #3c3c3c)",
              borderRadius: "20px",
              padding: 3,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
              },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff" }}>
              <BarChartIcon sx={{ fontSize: 28, marginRight: 1 }} /> Weekly Sales
            </Typography>
            <BarChartComponent type="week" />
          </Box>

          {/* Monthly Sales */}
          <Box
            sx={{
              backgroundColor: "linear-gradient(135deg, #1f1f1f, #3c3c3c)",
              borderRadius: "20px",
              padding: 3,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
              },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff" }}>
              <BarChartIcon sx={{ fontSize: 28, marginRight: 1 }} /> Monthly Sales
            </Typography>
            <BarChartComponent type="month" />
          </Box>

          {/* Product Sales Pie Chart */}
          <Box
            sx={{
              backgroundColor: "linear-gradient(135deg, #1f1f1f, #3c3c3c)",
              borderRadius: "20px",
              padding: 3,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
              },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff" }}>
              <PieChartIcon sx={{ fontSize: 28, marginRight: 1 }} /> Product Sales
            </Typography>
            <ProductSalesPieChart startDate={formatDate(MonthStartDate)} endDate={formatDate(MonthEndDate)} />
          </Box>
        </Box>

        {/* Divider */}
        <Box sx={{ borderBottom: "1px solid #444", marginBottom: 6 }} />

        {/* Sales Data Display */}

        <div
          style={{
            backgroundColor: "#1f1f1f", // Dark background for the container
            borderRadius: "15px",
            padding: "30px",
            boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)",
            width: "80%",
            maxWidth: "700px",
            margin: "50px auto",
            textAlign: "center",
            transition: "all 0.3s ease-in-out",
            fontFamily: "'Roboto', sans-serif", // Font for the whole component
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#ffffff", // White color for the header text
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "30px",
              fontSize: "32px",
            }}
          >
            <FaShoppingCart
              style={{
                fontSize: "36px",
                marginRight: "15px",
                color: "#32CD32", // Green icon color
              }}
            />
            Sales Data
          </Typography>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "30px",
              gap: "50px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                backgroundColor: "#2d2d2d", // Dark background for each card
                padding: "20px 25px",
                borderRadius: "12px",
                width: "250px",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
                transition: "all 0.3s ease-in-out",
                cursor: "pointer", // Pointer cursor to indicate interactivity
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = "0 8px 20px rgba(0, 255, 0, 0.5)"; // Hover effect for box
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.3)"; // Reset shadow for box
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#ffffff", // White color for text
                  display: "flex",
                  alignItems: "center",
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                <FaChartLine
                  style={{
                    fontSize: "28px",
                    marginRight: "10px",
                    color: "#32CD32", // Green icon color
                  }}
                />
                Current Month
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#ffffff", // White color for sales data
                  fontSize: "22px",
                  fontWeight: "bold",
                }}
              >
                {CurrentMonthSales !== null ? `₹${CurrentMonthSales}` : "No data available"}
              </Typography>
            </div>

            <div
              style={{
                backgroundColor: "#2d2d2d", // Dark background for each card
                padding: "20px 25px",
                borderRadius: "12px",
                width: "250px",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
                transition: "all 0.3s ease-in-out",
                cursor: "pointer", // Pointer cursor to indicate interactivity
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = "0 8px 20px rgba(0, 255, 0, 0.5)"; // Hover effect
                e.target.style.border = "none"; // Border on hover
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.3)"; // Reset shadow
                e.target.style.border = "none"; // Reset border
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#ffffff", // White color for text
                  display: "flex",
                  alignItems: "center",
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                <FaChartLine
                  style={{
                    fontSize: "28px",
                    marginRight: "10px",
                    color: "#32CD32", // Green icon color
                  }}
                />
                Current Year
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#ffffff", // White color for sales data
                  fontSize: "22px",
                  fontWeight: "bold",
                }}
              >
                {YearlySales !== null ? `₹${YearlySales}` : "No data available"}
              </Typography>
            </div>
          </div>
        </div>


        {/* Divider */}
        <Box sx={{ borderBottom: "1px solid #444", marginBottom: 6 }} />

        {/* Inactive Members Section */}

        <div
          style={{
            backgroundColor: "#333", // Dark background for the container
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "600px",
            margin: "30px auto",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            transition: "all 0.3s ease-in-out",
            fontFamily: "'Roboto', sans-serif", // Font for the whole component
            cursor: "pointer", // Add pointer to show interactivity
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = "0 8px 20px rgba(0, 255, 0, 0.5)"; // Green shadow on hover
            e.target.style.transform = "scale(1.05)"; // Slight zoom-in effect
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)"; // Reset shadow
            e.target.style.transform = "scale(1)"; // Reset zoom
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#ffffff", // White text color for title
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "20px",
              fontSize: "24px",
            }}
          >
            <PersonIcon
              sx={{
                fontSize: "32px", // Icon size
                marginRight: "15px",
                color: "#32CD32", // Green icon color
              }}
            />
            Inactive Members
          </Typography>

          <div
            style={{
              backgroundColor: "#2d2d2d", // Slightly darker background for the content
              padding: "20px 25px",
              borderRadius: "10px",
              width: "100%",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "#ffffff", // White text color
                fontSize: "18px",
                fontWeight: "normal",
                marginBottom: "15px",
              }}
            >
              {inactiveMembers && inactiveMembers.length > 0
                ? ` ${inactiveMembers
                  .map(
                    (member) =>
                      `${member.first_name} ${member.last_name}`
                  )
                  .join(", ")}`
                : "No inactive members available."}
            </Typography>
          </div>
        </div>

        {/* Divider */}
        <Box sx={{ borderBottom: "1px solid #444", marginBottom: 6 }} />

        {/* Sales by Product Section */}
        <div
          style={{
            backgroundColor: "#333", // Dark background for the container
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "900px",
            margin: "30px auto",
            textAlign: "center",
            fontFamily: "'Roboto', sans-serif", // Font for the whole component
            cursor: "pointer", // Add pointer to show interactivity
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#ffffff", // White text color for title
              marginBottom: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "24px",
            }}
          >
            <ShoppingCartIcon
              sx={{
                fontSize: "32px", // Icon size
                marginRight: "15px",
                color: "#32CD32", // Green icon color
              }}
            />
            Sales By Product
          </Typography>

          <Box
  sx={{
    backgroundColor: "#2d2d2d",
    padding: "20px 25px",
    borderRadius: "12px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
    "@media (max-width: 600px)": {
      gridTemplateColumns: "1fr",
      padding: "10px",
    },
  }}
>
  {salesByProduct && salesByProduct.length > 0 ? (
    salesByProduct.map((sale) => (
      <Box
        key={sale._id}
        sx={{
          backgroundColor: "#444",
          borderRadius: "16px",
          padding: "20px",
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            backgroundColor: "#555",
            transform: "scale(1.05)",
          },
          "@media (max-width: 600px)": {
            padding: "15px",
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: "bold",
            color: "#ffffff",
            marginBottom: "10px",
            fontSize: "16px",
            "@media (max-width: 600px)": {
              fontSize: "14px",
            },
          }}
        >
          Product Name:{" "}
          <span style={{ color: "#f1f1f1", fontStyle: "italic" }}>
            {productsMap[sale._id]?.product_name}
          </span>
        </Typography>
        <Typography
          sx={{
            color: "#ccc",
            fontSize: "14px",
            marginBottom: "10px",
            "@media (max-width: 600px)": {
              fontSize: "12px",
            },
          }}
        >
          Sold Quantity:{" "}
          <span style={{ color: "#f1f1f1" }}>{sale.totalQuantity}</span>
        </Typography>
        <Typography
          sx={{
            color: "#ccc",
            fontSize: "14px",
            "@media (max-width: 600px)": {
              fontSize: "12px",
            },
          }}
        >
          Total Sales:{" "}
          <span style={{ color: "#f1f1f1" }}>{sale.totalSales}</span>
        </Typography>
      </Box>
    ))
  ) : (
    <Typography sx={{ color: "#ccc", marginLeft: "5px" }}>
      No sales data available.
    </Typography>
  )}
</Box>

        </div>
      </Box>


    </div>


  );
};

export default Dashboard;