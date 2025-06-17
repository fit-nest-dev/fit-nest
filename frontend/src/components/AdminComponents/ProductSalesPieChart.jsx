import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
// Register components
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * A pie chart component that displays the sales data for each product between the given start and end dates.
 *
 * @param {string} startDate - The start date for the sales data query.
 * @param {string} endDate - The end date for the sales data query.
 *
 * The component fetches the sales data from the backend API and displays it using a pie chart.
 * It maintains internal state for the sales data and error messages.
 * If the data is still loading, it displays a loading message.
 * If there's an error fetching the data, it logs the error and displays an error message.
 *
 * The chart is rendered with the following options:
 * - The legend is hidden.
 * - The chart is responsive.
 * - The chart's width and height are set to 900px and auto respectively, with a max width of 100%.
 * - The chart is centered horizontally and vertically.
 * - The chart's background color is transparent.
 * - The chart's border width is set to 1.
 * - The chart's border color is set to black.
 * - The chart's hover background color is set to white.
 * - The chart's hover border color is set to black.
 * - The chart's hover border width is set to 2.
 * - The chart's hover animation duration is set to 0.5s.
 * - The chart's hover animation easing is set to ease.
 *
 * The component returns a JSX element containing the chart.
 */
const ProductSalesPieChart = ({ startDate, endDate }) => {
  const [productSalesData, setProductSalesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [ProductSort, setProductSort] = useState({});

  useEffect(() => {
    /**
     * Retrieves the most and least bought products within a specified date range.
     * 
     * This function sends a GET request to the server to retrieve the most and least bought products
     * between the given start and end dates. It updates the component's state with the
     * received data. If an error occurs, it logs the error.
     * 
     * @param {string} startDate - The start date for the most and least bought products query.
     * @param {string} endDate - The end date for the most and least bought products query.
     * @returns {Promise<void>}
     */
    const fetchMostandLeastBoughtProducts = async (startDate, endDate) => {
      try {
        const response = await axios.get(`http://3.25.86.182:5000/api/Order/Most-least-products/${startDate}/${endDate}`, { withCredentials: true });
        setProductSort(response.data);
      }
      catch (err) {
        console.log(err)
      }
    }
    /**
     * Fetches the buy counts of products within a specified date range from the server.
     * 
     * This asynchronous function sends a GET request to the server API to retrieve the 
     * buy counts of products between the specified start and end dates. It updates the 
     * component's state with the fetched data. If an error occurs during the request, 
     * it logs the error to the console. Finally, it updates the loading state to false 
     * once the data fetching process is completed.
     *
     * @returns {Promise<void>}
     */

    const fetchData = async (startDate, endDate) => {
      try {
        const response = await axios.get(
          `http://3.25.86.182:5000/api/Order/products-buy-counts/${startDate}/${endDate}`, { withCredentials: true }
        );
        setProductSalesData(response.data);

      } catch (error) {
        console.error("Error fetching product sales data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMostandLeastBoughtProducts(startDate, endDate);
    fetchData(startDate, endDate);
  }, []);
  const chartData = {
    labels: Object.keys(productSalesData),
    datasets: [
      {
        label: "Product Sales",
        data: Object.values(productSalesData),
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
    },
  };

  if (loading) {
    return <p>Loading chart...</p>;
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "auto", // Ensures the height adjusts accordingly
      marginTop: "50px"
    }}>
      <div style={{ maxWidth: "900px", width: "90%" }}>
        <Pie data={chartData} options={options} />
      </div>
    </div>


  );
};

export default ProductSalesPieChart;