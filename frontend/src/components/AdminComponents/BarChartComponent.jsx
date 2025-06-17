import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * A bar chart component that displays either weekly or monthly total sales data.
 *
 * @param {string} type - Determines the type of sales data to display. 
 *                        If 'week', the chart displays weekly sales data for the past 4 weeks.
 *                        If 'month', the chart displays monthly sales data for the current year.
 *
 * The component fetches sales data from the backend API and displays it using a bar chart.
 * It maintains internal state for weekly and monthly sales data as well as error messages.
 * 
 * The chart's x-axis labels are dynamically set based on the `type` prop, showing either 
 * week numbers or month names.
 *
 * Dependencies:
 * - Uses `axios` for HTTP requests to fetch sales data.
 * - Utilizes `react-chartjs-2` library for rendering the bar chart.
 */

const BarChartComponent = ({ type }) => {
  const [weeklySales, setWeeklySales] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [error, setError] = useState("");
  /**
   * Fetches weekly total sales data from the backend API and updates the `weeklySales` state.
   * 
   * It fetches the total sales for the past 4 weeks, with each week's start and end dates
   * calculated based on the current date. The data is then stored in the `weeklySales` state
   * in reverse order, with the most recent week's sales data first.
   * 
   * If there is an error fetching the data, the `error` state is updated with an error message.
   */
  const ComputeWeeklySales = async () => {
    try {
      setError(""); // Clear previous errors
      const weeklyData = [];
      for (let i = 0; i < 4; i++) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - i * 7); // End date for the week
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 6); // Start date for the week

        const response = await axios.get(
          `http://3.25.86.182:5000/api/Order/TotalSales/${startDate.toISOString()}/${endDate.toISOString()}`, { withCredentials: true }
        );

        weeklyData.push(
          response.data.totalSales || 0,
        );
      }
      setWeeklySales(weeklyData.reverse());
    } catch (error) {
      console.error("Error fetching weekly sales:", error);
      setError("Failed to fetch weekly sales. Please try again.");
    }
  };

  // Function to fetch monthly sales (12 months of the year)
  const ComputeMonthlySales = async () => {
    try {
      setError(""); // Clear previous errors
      const monthlyData = [];
      const currentYear = new Date().getFullYear();

      for (let month = 0; month < 12; month++) {
        const startDate = new Date(currentYear, month, 1); // Start of the month
        const endDate = new Date(currentYear, month + 1, 0); // End of the month

        const response = await axios.get(
          `http://3.25.86.182:5000/api/Order/TotalSales/${startDate.toISOString()}/${endDate.toISOString()}`, { withCredentials: true }
        );

        monthlyData.push(
          response.data.totalSales || 0,
        );
      }

      setMonthlySales(monthlyData);
    } catch (error) {
      console.error("Error fetching monthly sales:", error);
      setError("Failed to fetch monthly sales. Please try again.");
    }
  };

  useEffect(() => {
    ComputeWeeklySales();
    ComputeMonthlySales();
  }, []);
  return (
    <div className="App">
      <div style={{ maxWidth: "650px" }}>
        <Bar
          data={{
            // Name of the variables on x-axis for each bar
            labels: type === 'week' ? ["Week 1", "Week 2", "Week 3", "Week 4"] : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            datasets: [
              {
                // Label for bars
                label: "Total count/value",
                // Data or value of each bar
                data: type === 'week' ? weeklySales : monthlySales,
                // Color of each bar
                backgroundColor: ["aqua", "green", "red", "yellow"],
                // Border color of each bar
                borderColor: ["aqua", "green", "red", "yellow"],
                borderWidth: 0.5
              }
            ]
          }}
          // Height of the graph
          height={400}
          options={{
            maintainAspectRatio: false,
            scales: {
              y: {
                // The y-axis value will start from zero
                beginAtZero: true
              }
            },
            legend: {
              labels: {
                fontSize: 15
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default BarChartComponent;
