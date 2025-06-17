import React, { useState, useEffect, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Grid,
} from "@mui/material";

import { FaChartLine } from "react-icons/fa";
import { Menu as MenuIcon } from "@mui/icons-material"; // Hamburger icon
import axios from "axios";
import AdminFeedbackView from "./AdminFeedbackView";
import { SocketContext } from "../../context/SocketContext";
import OrderDialogAdmin from "../AdminComponents/OrderDialogAdmin";
import { useAuthContext } from "../../context/AuthContext";
import TrainerDetailsAdmin from "../TrainerComponents/TrainerDetailsAdmin";
import AdminProductListing from "../AdminComponents/AdminProductListing";
import Resources from "./Resources";
import AdminRevenue from "./AdminRevenue";
import MemberDetails from "./MemberDetails";
import useLogout from "../../hooks/useLogout";
import CustomMail from "./CustomMail";
import Dasboard from "./Dasboard";
import { ChangeRequestApproval } from "./AdminChangeRequests";
import AdminPdfRequests from "./AdminPdfRequests";
import { useNavigate } from "react-router-dom";

/**
 * AdminPortal component is the main component for the admin dashboard.
 *
 * It contains a navigation drawer with links to different admin pages.
 * The content of the page is determined by the selected tab in the navigation drawer.
 *
 * This component uses several hooks and context APIs to manage state and communicate with the server.
 *
 * @returns {JSX.Element} The rendered AdminPortal component.
 */
const AdminPortal = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [error, setError] = useState("");
  const navigate=useNavigate();
  const [MemeberShipData, setMemeberShipData] = useState([]);
  const [products, setProducts] = useState([]);
  const { logout } = useLogout();
  const [isOrdersOpen, setOrdersOpen] = useState(false);
  const [emails, setEmails] = useState([]); // user emails
  const [trainerEmails, setTrainerEmails] = useState([]); // trainer emails
  const { Authuser } = useAuthContext();
  const { socket } = useContext(SocketContext);
  const { productsMap, setProductsMap } = useAuthContext();
  const [drawerOpen, setDrawerOpen] = useState(false); // Drawer state

  const handleOrdersClose = () => setOrdersOpen(false);
  /**
   * Fetches all user emails from the server and updates the state with the response.
   *
   * This function sends a GET request to the server to fetch all user emails and
   * updates the emails state with the response. If an error occurs during the
   * process, it logs the error message to the console.
   *
   * @returns {Promise<void>}
   */
  const fetchEmails = async () => {
    try {
      const response = await axios.get("http://3.25.86.182:5000/api/users/get-all-emails", { withCredentials: true });
      setEmails(response.data);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  /**
   * Fetches all trainer emails from the server and updates the state with the response.
   *
   * This function sends a GET request to the server to retrieve all trainer emails
   * and updates the trainerEmails state with the response. If an error occurs during
   * the process, it logs an error message to the console.
   *
   * @returns {Promise<void>}
   */

  const fetchTrainerEmails = async () => {
    try {
      const response = await axios.get("http://3.25.86.182:5000/api/Trainer/AllMails", { withCredentials: true });
      setTrainerEmails(response.data);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  useEffect(() => {
    fetchEmails();
    fetchTrainerEmails();
  }, [selectedTab]);

  useEffect(() => {
    socket.on("UserChanges", (change) => {
      fetchMembershipDetails();
    });
    return () => socket.off("UserChanges");
  }, [socket]);

  /**
   * Fetches all products from the server and updates the state with the response.
   *
   * This function sends a GET request to the server to retrieve all products
   * and updates the products state with the response. If an error occurs during
   * the process, it logs an error message to the console.
   *
   * @returns {Promise<void>}
   */
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://3.25.86.182:5000/api/products/AllProducts", { withCredentials: true });
      setProducts(response.data);
      const map = {};
      response.data.forEach((product) => {
        map[product._id] = product;
      });
      setProductsMap(map);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  /**
   * Fetches all user membership details from the server and updates the state with the response.
   *
   * This function sends a GET request to the server to retrieve all user membership details
   * and updates the MemeberShipData state with the response. If an error occurs during
   * the process, it logs the error to the console.
   *
   * @returns {Promise<void>}
   */
  const fetchMembershipDetails = async () => {
    try {
      const response = await axios.get("http://3.25.86.182:5000/api/users/MemberShipDetails", { withCredentials: true });
      setMemeberShipData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Handles a change in the currently selected tab.
   *
   * This function is called when the user changes the currently selected tab.
   * It updates the state with the new tab index and closes the drawer.
   *
   * @param {number} index - The index of the newly selected tab.
   */
  const handleTabChange = (index) => {
    setSelectedTab(index);
    setDrawerOpen(false); // Close the drawer when selecting a tab
  };

  /**
   * Renders the content of a tab panel, displaying it only when the tab is selected.
   *
   * This component is used to conditionally render its children based on the `value` and `index` props.
   * It is typically used in conjunction with a tab navigation system.
   *
   * @param {Object} props - The props object.
   * @param {number} props.value - The currently selected tab index.
   * @param {number} props.index - The index of this tab panel.
   * @param {React.ReactNode} props.children - The content to render within the tab panel.
   * @returns {JSX.Element} The rendered tab panel component.
   */

  const TabPanel = ({ value, index, children }) => (
    <div hidden={value !== index}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );

  return (
    <div className="bg-black text-white">
      {/* App Bar */}
      <AppBar position="static" style={{ position: "fixed", top: 0, zIndex: 2, left: 0, right: 0, backgroundColor: "black" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h4" style={{ flexGrow: 1 }}>
            Admin Portal
          </Typography>
          {/* <button onClick={() => logout()} color="inherit" className="bg-red-500 p-3 rounded-lg text-white">
            Logout
          </button> */}
        </Toolbar>
      </AppBar>

      {/* Drawer for vertical navigation */}
      <Drawer
       variant={ "temporary" } 
        style={{
          backgroundColor: "black",
        }}
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 250,
          flexShrink: 0,
          backgroundColor: "black",
          "& .MuiDrawer-paper": {
            width: 250,
            boxSizing: "border-box",
            padding: "20px",
            backgroundColor: "black",
            color: "white",
            borderRight: "2px solid #444",
          },
        }}
      >
        <Box sx={{ paddingBottom: 4 }}>
          <Typography
            variant="h5"
            sx={{
              color: "green",
              fontWeight: "600",
              fontFamily: "'Poppins', sans-serif",
              textAlign: "center",
              marginBottom: 3,
              letterSpacing: "1px",
            }}
          >
            Admin Portal
          </Typography>
        </Box>

        <List>
          <ListItem
            button
            onClick={() => handleTabChange(1)}
            sx={{
              padding: "15px 10px",
              borderRadius: "8px",
              marginBottom: "10px",
              "&:hover": {
                backgroundColor: "#444",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              },
            }}
          >
            <ListItemText
              primary="Dashboard"
              sx={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: "500",
                color: "#ddd",
                letterSpacing: "0.5px",
              }}
            />
          </ListItem>

          <ListItem
            button
            onClick={() => handleTabChange(8)}
            sx={{
              padding: "15px 10px",
              borderRadius: "8px",
              marginBottom: "10px",
              "&:hover": {
                backgroundColor: "#444",
                cursor: "pointer",
              },
            }}
          >
            <ListItemText
              primary="Revenue"
              sx={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: "500",
                color: "#ddd",
              }}
            />
          </ListItem>

          <ListItem
            button
            onClick={() => { handleTabChange(0); fetchProducts(); }}
            sx={{
              padding: "15px 10px",
              borderRadius: "8px",
              marginBottom: "10px",
              "&:hover": {
                backgroundColor: "#444",
                cursor: "pointer",
              },
            }}
          >
            <ListItemText
              primary="Product Listings"
              sx={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: "500",
                color: "#ddd",
              }}
            />
          </ListItem>

          <ListItem
            button
            onClick={() => handleTabChange(2)}
            sx={{
              padding: "15px 10px",
              borderRadius: "8px",
              marginBottom: "10px",
              "&:hover": {
                backgroundColor: "#444",
                cursor: "pointer",
              },
            }}
          >
            <ListItemText
              primary="Members"
              onClick={() => { fetchMembershipDetails() }}
              sx={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: "500",
                color: "#ddd",
              }}
            />
          </ListItem>

          <ListItem
            button
            onClick={() => handleTabChange(3)}
            sx={{
              padding: "15px 10px",
              borderRadius: "8px",
              marginBottom: "10px",
              "&:hover": {
                backgroundColor: "#444",
                cursor: "pointer",
              },
            }}
          >
            <ListItemText
              primary="Emails"
              sx={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: "500",
                color: "#ddd",
              }}
            />
          </ListItem>

          <ListItem
            button
            onClick={() => { handleTabChange(4); }}
            sx={{
              padding: "15px 10px",
              borderRadius: "8px",
              marginBottom: "10px",
              "&:hover": {
                backgroundColor: "#444",
                cursor: "pointer",
              },
            }}
          >
            <ListItemText
              primary="Feedback"
              sx={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: "500",
                color: "#ddd",
              }}
            />
          </ListItem>

          <ListItem
            button
            onClick={() => { handleTabChange(5); setOrdersOpen(true); }}
            sx={{
              padding: "15px 10px",
              borderRadius: "8px",
              marginBottom: "10px",
              "&:hover": {
                backgroundColor: "#444",
                cursor: "pointer",
              },
            }}
          >
            <ListItemText
              primary="Orders"
              sx={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: "500",
                color: "#ddd",
              }}
            />
          </ListItem>

          <ListItem
            button
            onClick={() => handleTabChange(6)}
            sx={{
              padding: "15px 10px",
              borderRadius: "8px",
              marginBottom: "10px",
              "&:hover": {
                backgroundColor: "#444",
                cursor: "pointer",
              },
            }}
          >
            <ListItemText
              primary="Trainer"
              sx={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: "500",
                color: "#ddd",
              }}
            />
          </ListItem>

          <ListItem
            button
            onClick={() => handleTabChange(7)}
            sx={{
              padding: "15px 10px",
              borderRadius: "8px",
              marginBottom: "10px",
              "&:hover": {
                backgroundColor: "#444",
                cursor: "pointer",
              },
            }}
          >
            <ListItemText
              primary="Resources"
              sx={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: "500",
                color: "#ddd",
              }}
            />
          </ListItem>

          <ListItem
            button
            onClick={() => handleTabChange(9)}
            sx={{
              padding: "15px 10px",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#444",
                cursor: "pointer",
              },
            }}
          >
            <ListItemText
              primary="Requests"
              sx={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: "500",
                color: "#ddd",
              }}
            />
          </ListItem>
          <ListItemText
          onClick={()=>{navigate(`/Forgot-password/${Authuser.email}`)}}
           sx={{
            padding: "15px 10px",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#444",
              cursor: "pointer",
            },
          }}>
            <ListItemText
              primary="Change password"
              sx={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: "500",
                color: "#ddd",
              }}
            />
          </ListItemText>
          <button onClick={() => logout()} color="inherit" className="bg-red-500 p-3 rounded-lg text-white">
            Logout
          </button>
        </List>
      </Drawer>


      {/* Content */}
      <Box
        ml={1}  // Reduce the margin-left to minimize the space between the sidebar and content
        mt={7}  // Add margin-top to avoid overlap with the AppBar
        sx={{
          display: "flex",
          justifyContent: "center",  // Horizontally center the content
          alignItems: "flex-start",   // Align content at the top for better flow
          minHeight: "100vh",         // Take full height
          padding: "0 15px",
          backgroundColor: "black"        // Add padding for better spacing
        }}
      >
        <Grid container justifyContent="center" alignItems="flex-start" style={{ backgroundColor: "black" }}>
          <Grid item xs={12} md={9}>
            {/* Tabs Content */}
            <TabPanel value={selectedTab} index={0}>
              <AdminProductListing />
            </TabPanel>
            <TabPanel value={selectedTab} index={1}>
              <Dasboard productsMap={productsMap} setProductsMap={setProductsMap} />
              {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            </TabPanel>
            <TabPanel value={selectedTab} index={2}>
              <MemberDetails fetchMembershipDetails={fetchMembershipDetails}
                setMemeberShipData={setMemeberShipData}
                MemeberShipData={MemeberShipData} />
            </TabPanel>
            <TabPanel value={selectedTab} index={3}>
              <CustomMail userEmails={emails} trainerEmails={trainerEmails} />
            </TabPanel>
            <TabPanel value={selectedTab} index={4}>
              <AdminFeedbackView />
            </TabPanel>
            <TabPanel value={selectedTab} index={5}>
              <OrderDialogAdmin open={isOrdersOpen} onClose={handleOrdersClose} />
            </TabPanel>
            <TabPanel value={selectedTab} index={6}>
              <TrainerDetailsAdmin emails={emails} />
            </TabPanel>
            <TabPanel value={selectedTab} index={7}>
              <Resources />
            </TabPanel>
            <TabPanel value={selectedTab} index={8}>
              <AdminRevenue emails={emails} />
            </TabPanel>
            <TabPanel value={selectedTab} index={9}>
              <ChangeRequestApproval emails={emails} />
              <AdminPdfRequests />
            </TabPanel>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default AdminPortal;