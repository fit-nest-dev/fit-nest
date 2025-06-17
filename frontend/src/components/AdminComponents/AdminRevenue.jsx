
import axios from 'axios';
import React, { useState, useEffect } from 'react';

/**
 * AdminRevenue component to calculate revenue and net profit for the gym.
 * @param {array} emails - list of email addresses of the gym's members.
 * @returns {JSX.Element} - the rendered component.
 */
const AdminRevenue = () => {
  // States for managing input values
  const [customExpenses, setCustomExpenses] = useState(0);
  const [electricityBill, setElectricityBill] = useState(0);
  const [trainerSalary, setTrainerSalary] = useState(0);
  const [netProfit, setNetProfit] = useState(null);
  const [loading, setLoading] = useState(false);
  // State for managing date range selection
  const IntToMonth=(i)=>{
    if(i==1){
      return "January";}
    if(i==2){
      return "February";
    }
    if(i==3){
      return "March";
    } 
    if(i==4){
      return "April";
    } 
    if(i==5){
      return "May";
    } 
    if(i==6){
      return "June";
    } 
    if(i==7){
      return "July";
    } 
    if(i==8){
      return "August";
    } 
    if(i==9){
      return "September";
    } 
    if(i==10){
      return "October";
    }   
    if(i==11){
      return "November";  
    } 
    if(i==12){  
      return "December";  
    }
  }
  const [selectedPeriod, setSelectedPeriod] = useState(IntToMonth(new Date().getMonth() + 1));  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalSales, setTotalSales] = useState(0);
  const [customInputs, setCustomInputs] = useState([]);
  const [totalMembershipSales, setMembershipSales] = useState(0);
  /**
   * Adds a new custom input field to the list.
   * The new input is initialized with a unique id and an empty value.
   */

  const addCustomInput = () => {
    setCustomInputs([...customInputs, { id: Date.now(), value: "" }]);
  };

  /**
   * Removes a custom input field from the list by its unique id.
   *
   * This function filters out the input with the specified id
   * from the customInputs array, effectively deleting the input
   * with the matching id.
   *
   * @param {number} id - The unique identifier of the custom input to be removed.
   */

  const removeCustomInput = (id) => {
    setCustomInputs(customInputs.filter((input) => input.id !== id));
  };

  /**
   * Updates the value of a custom input field in the customInputs state.
   *
   * Iterates over the customInputs array and updates the input object
   * that matches the specified id with the new value provided.
   *
   * @param {number} id - The unique identifier of the custom input to update.
   * @param {string} value - The new value to assign to the custom input.
   */

  const handleCustomInputChange = (id, value) => {
    setCustomInputs(
      customInputs.map((input) =>
        input.id === id ? { ...input, value } : input
      )
    );
  };
  // Helper function to get the start and end dates of a selected month
  const getMonthDates = (month) => {
    const currentYear = new Date().getFullYear();
    let start, end;
    switch (month) {
      case "January":
        start = new Date(currentYear, 0, 1); // January 1st
        end = new Date(currentYear, 0, 31);  // January 31st
        break;
      case "February":
        start = new Date(currentYear, 1, 1); // February 1st
        end = new Date(currentYear, 1, 28);  // February 28th (not considering leap years here, We can add it later)
        break;
      case "March":
        start = new Date(currentYear, 2, 1); // March 1st
        end = new Date(currentYear, 2, 31);  // March 31st
        break;
      case "April":
        start = new Date(currentYear, 3, 1); // April 1st
        end = new Date(currentYear, 3, 30);  // April 30th
        break;
      case "May":
        start = new Date(currentYear, 4, 1); // May 1st
        end = new Date(currentYear, 4, 31);  // May 31st
        break;
      case "June":
        start = new Date(currentYear, 5, 1); // June 1st
        end = new Date(currentYear, 5, 30);  // June 30th
        break;
      case "July":
        start = new Date(currentYear, 6, 1); // July 1st
        end = new Date(currentYear, 6, 31);  // July 31st
        break;
      case "August":
        start = new Date(currentYear, 7, 1); // August 1st
        end = new Date(currentYear, 7, 31);  // August 31st
        break;
      case "September":
        start = new Date(currentYear, 8, 1); // September 1st
        end = new Date(currentYear, 8, 30);  // September 30th
        break;
      case "October":
        start = new Date(currentYear, 9, 1); // October 1st
        end = new Date(currentYear, 9, 31);  // October 31st
        break;
      case "November":
        start = new Date(currentYear, 10, 1); // November 1st
        end = new Date(currentYear, 10, 30);  // November 30th
        break;
      case "December":
        start = new Date(currentYear, 11, 1); // December 1st
        end = new Date(currentYear, 11, 31);  // December 31st
        break;
      default:
        start = null;
        end = null;
    }
    return { start, end };
  };
 
  /**
   * Fetches total sales from membership for a given date range from the server and updates the state with the response.
   *
   * This function sends a GET request to the server to retrieve the total sales from membership
   * for the given date range and updates the membershipSales state with the response.
   * If an error occurs during the process, it logs the error to the console.
   *
   * @returns {Promise<void>}
   */
  const FetchTotalSalesFromMembership = async (startDate, endDate) => {
    try {
      const response = await axios.get(`http://3.25.86.182:5000/api/users/SalesFromMembership/${startDate}/${endDate}`, { withCredentials: true });
      setMembershipSales(response.data.totalSales);
    }
    catch (err) {
      console.log(err)
    }
  }
  /**
   * Fetches total sales from orders for a given date range from the server and updates the state with the response.
   *
   * This function sends a GET request to the server to retrieve the total sales from orders
   * for the given date range and updates the totalSales state with the response.
   * If an error occurs during the process, it logs the error to the console.
   *
   * @returns {Promise<void>}
   */
  const fetchTotalSales = async (startDate, endDate) => {
    try {
      const response = await axios.get(
        `http://3.25.86.182:5000/api/Order/TotalSales/${startDate}/${endDate}`, { withCredentials: true }
      );
      setTotalSales(response.data.totalSales);
    } catch (err) {
      console.error("Error fetching total sales:", err);
    }
  };
  useEffect(() => {
    setLoading(true);
    const { start, end } = getMonthDates(IntToMonth(new Date().getMonth() + 1));
    setStartDate(start?.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    setEndDate(end?.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    fetchTotalSales(start?.toISOString().split("T")[0], end?.toISOString().split("T")[0]);
    FetchTotalSalesFromMembership(start?.toISOString().split("T")[0], end?.toISOString().split("T")[0]);
    setTotalSales(totalSales || 0);
    setMembershipSales(totalMembershipSales|| 0);
    setLoading(false);
  }, [])
  useEffect(() => {
    fetchTotalSales(startDate, endDate);
    FetchTotalSalesFromMembership(startDate, endDate);
    setTotalSales(totalSales || 0);
    setMembershipSales(totalMembershipSales || 0);
  }, [startDate, endDate])
  /**
   * Handles changes in the selected period, updating the start and end dates accordingly.
   * 
   * When the user selects a period from the dropdown, this function updates the start and end 
   * dates based on the selected month. If "Custom" is selected, it clears the start and end dates.
   * 
   * @param {Object} e - The event object from the dropdown change event.
   */

  const handlePeriodChange = (e) => {
    const month = e.target.value;
    setSelectedPeriod(month);

    if (month === "Custom") {
      setStartDate("");
      setEndDate("");
    } else {
      const { start, end } = getMonthDates(month);
      setStartDate(start.toISOString().split("T")[0]); // Format as YYYY-MM-DD
      setEndDate(end.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    }
  };
  // Calculate total revenue and net profit
  const calculateRevenue = () => {
    const totalRevenue = parseFloat(totalSales) + parseFloat(totalMembershipSales);
    const totalExpenses =
      parseFloat(customExpenses) +
      parseFloat(electricityBill) +
      parseFloat(trainerSalary);

    const netProfit = totalRevenue - totalExpenses - customInputs.reduce((total, input) => total + parseFloat(input.value), 0);
    setNetProfit(netProfit);
  };
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-w-96 mx-auto">
        <div className="w-full p-6 bg-white-800 rounded-lg shadow-md bg-gray-200 bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-70 border border-gray-100">
          <h1 className="text-3xl font-semibold text-center text-gray-500">
            Loading...
          </h1>
        </div>
      </div>
    );
  }
  return (
    <div className="ml-auto font-bold h-auto w-full max-h-auto overflow-auto p-0 sm:p-8 bg-black rounded-lg shadow-2xl">
      <h2 className="text-4xl text-white font-extrabold mb-8 text-center flex items-center justify-center">
        <i className="fas fa-chart-line mr-4 text-green-500"></i>
        Admin Revenue Management
      </h2>

      {/* Select Time Period Section */}
      <div className="mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl text-white mb-4 flex items-center">
            <i className="fas fa-calendar-alt mr-4 text-blue-500"></i>Select Time Period
          </h3>
          <div className="flex items-center mb-6">
            <label className="text-white text-lg">Select Month or Date Range:</label>
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="ml-4 p-4 rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
              <option value="Custom">Custom Dates</option>
            </select>
          </div>
          {/* Custom Dates Section */}
          {selectedPeriod === "Custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-white text-lg">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="ml-2 p-4 rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="text-white text-lg">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="ml-2 p-4 rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Revenue and Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Total Revenue Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-2xl mb-4 flex items-center">
            Total Revenue Calculation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Sales from Products */}
            <div className="bg-gray-800 py-8 px-2 rounded-lg shadow-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-green-400 mr-6">
                  <i className="fas fa-shopping-cart text-4xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-300">Total Sales (Products)</h3>
                  <p className="text-3xl font-bold text-white">{totalSales || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 py-8 px-2 rounded-lg shadow-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-yellow-400 mr-6">
                  <i className="fas fa-user-friends text-4xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-300">Total Sales (Memberships)</h3>
                  <p className="text-3xl font-bold text-white">
  {Number.isInteger(totalMembershipSales) ? totalMembershipSales : totalMembershipSales?.toFixed(3) || 0}
</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-7 border-t border-gray-700 pt-5 flex items-center justify-between">
            <span className="text-lg font-bold text-white">Total Sales From Products & Membership:</span>
            <span className="font-extrabold text-xl text-blue-400">
              {(
                Number(totalSales || 0) +
                Number(totalMembershipSales || 0)
              )?.toFixed(2)}
            </span>
          </div>
        </div>
        {/* Expenses Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-2xl mb-4 flex items-center">
            <i className="fas fa-money-check-alt mr-4 text-red-500"></i>Expenses
          </h3>
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <label className="text-white text-lg">Electricity Bill:</label>
              <input
                type="number"
                value={electricityBill}
                onChange={(e) => setElectricityBill(e.target.value)}
                placeholder="Enter electricity bill"
                className="p-4 rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-white text-lg">Salary of Trainers:</label>
              <input
                type="number"
                value={trainerSalary}
                onChange={(e) => setTrainerSalary(e.target.value)}
                placeholder="Enter trainer salary"
                className="p-4 rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Custom Inputs */}
            <h4 className="text-white text-lg mt-4">Custom Inputs:</h4>
            {customInputs.map((input) => (
              <div key={input.id} className="flex items-center mb-4">
              <input
                type="text"
                value={input.value}
                onChange={(e) => handleCustomInputChange(input.id, e.target.value)}
                placeholder="Enter custom value"
                className="p-2 sm:p-4 w-full sm:w-auto rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button
                onClick={() => removeCustomInput(input.id)}
                className="ml-2 sm:ml-4 p-2 sm:p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Remove
              </button>
            </div>
            
            ))}
            <button
              onClick={addCustomInput}
              className="mt-4 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Add Custom
            </button>
          </div>

          <div className="mt-6 text-white font-semibold">
            Net revenue: {Number(totalSales?.toFixed(2) || 0) + Number(totalMembershipSales?.toFixed(2) || 0)}
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={calculateRevenue}
          className="p-4 bg-green-600 text-white rounded-lg w-full max-w-sm hover:bg-green-700 transition"
        >
          Calculate Net Profit
        </button>
      </div>

      {/* Display Net Profit */}
      {netProfit !== null && (
        <div className="mt-6 text-white font-semibold text-center">
          <h3 className="text-2xl">
            <i className="fas fa-hand-holding-usd mr-2 text-green-500"></i>
            Net Profit: {netProfit.toFixed(2)}
          </h3>
        </div>
      )}
    </div>


  );
};

export default AdminRevenue;
