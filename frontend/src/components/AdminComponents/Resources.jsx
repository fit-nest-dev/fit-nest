import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditMembership from './EditMembership';
import { TextField } from '@mui/material';
import ResourceAddDialog from './ResourceAddDialog';
import ManageSuggestedProducts from './ManageSuggestedProducts';
import ManageLocations from './ManageLocations';
import ManageDiscountCodes from './ManageDiscountCodes';
import ManageCompanyInfo from './ManageCompanyInfo';
import ManageHomeMedia from './ManageHomeMedia';
import AddMembershipPlanDialog from './AddMembershipPlanDialog';
import ManageEvents from './ManageEvents';

/**
 * The Resources component renders a page that allows an admin to manage and edit
 * membership details and website resources. The component fetches all membership
 * plans and resources from the server when it mounts. The component renders a
 * list of all membership plans and resources. The component also allows an admin
 * to add a new membership plan, edit an existing membership plan, or delete an
 * existing membership plan. The component also allows an admin to add a new
 * resource, edit an existing resource, or delete an existing resource. The
 * component also renders a list of all suggested products. The component also
 * renders a list of all locations. The component also renders a list of all
 * events. The component also renders a list of all discount codes. The
 * component also renders a list of all company information. The component also
 * renders a list of all home media.
 */
const Resources = () => {
  const [plans, setPlans] = useState([]);
  const [resources, setResources] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const handleClose = () => setOpenAddDialog(false);
  const [AddPlanDialog, setAddPlanDialog] = useState(false);
  const handlecloseforMembership = () => setAddPlanDialog(false);
  // Separate state for the resource being edited
  const [editLinkId, setEditLinkId] = useState(null);
  const [newResourceLink, setNewResourceLink] = useState('');

  /**
   * Deletes a resource by its ID from the database and updates the resources
   * state accordingly. It also updates local storage with the filtered data.
   * @param {string} resourceId - The ID of the resource to delete.
   * @returns {Promise<void>}
   */
  const handleDeleteResourceById = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        const response = await axios.delete(`http://3.25.86.182:5000/api/Admin/DeleteResource/${resourceId}`, { withCredentials: true });
        if (response.status === 200) {
          setResources((prevResources) => prevResources.filter((resource) => resource._id !== resourceId));
          const existingResources = JSON.parse(localStorage.getItem('gym-resources')) || [];
          // Filter out the deleted resource
          const updatedResources = existingResources.filter((resource) => resource._id !== resourceId);
          // Update local storage with the filtered data
          localStorage.setItem('gym-resources', JSON.stringify(updatedResources));
        }
      }
      catch (err) {
        console.log(err)
      }
    }
  }
  /**
   * Edits a resource's link by its ID and updates the resources state accordingly.
   * Sends a PUT request to the server with the new resource link.
   * If the request is successful, updates the resource in the local state and local storage.
   * Resets the edit state and clears the input field after a successful update.
   * Logs an error to the console if the request fails.
   * 
   * @param {string} resourceId - The ID of the resource to edit.
   * @returns {Promise<void>}
   */

  const handleEditResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to edit this resource?')) {
      try {
        const response = await axios.put(
          `http://3.25.86.182:5000/api/Admin/UpdateResource/${resourceId}`,
          { resourceLink: newResourceLink }, { withCredentials: true }
        );

        setResources((prevResources) =>
          prevResources.map((resource) =>
            resource._id === resourceId ? response.data : resource
          )
        );
        const updatedResources = resources.map((resource) =>
          resource._id === resourceId ? response.data : resource
        );
        localStorage.setItem('gym-resources', JSON.stringify(updatedResources));
        setEditLinkId(null); // Reset edit state after successful update
        setNewResourceLink(''); // Clear the input field
      } catch (err) {
        console.log(err);
      }
    }
  };

  /**
   * Fetches all resources from the database and updates the resources state
   * accordingly. Logs an error to the console if the request fails.
   * @returns {Promise<void>}
   */
  const fetchResources = async () => {
    try {
      const response = await axios.get('http://3.25.86.182:5000/api/Admin/AllResources');
      setResources(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get('http://3.25.86.182:5000/api/Admin/AllMembershipPlans', { withCredentials: true });
      setPlans(response.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchPlans();
    fetchResources();
  }, []);
  return (
    <div className="mt-auto ml-auto w-auto overflow-y-auto max-h-auto">
      <div className="font-bold text-3xl">MANAGE AND EDIT MEMBERSHIP DETAILS</div>
      <div className="tariff-container">
        {plans?.length > 0 ? (
          plans.map((plan, index) => (
            <div key={index} className="tariff-card bg-gray-800 p-5 rounded-lg shadow-lg mb-5">
              <h2 className="text-xl text-white font-semibold">{plan.title}</h2>
              <p className="text-white mb-4">{plan.price} - {plan.description}</p>
              <button
                onClick={() => handleBuyNow(plan)}
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                DISCOUNTED PRICE {plan.discountedPrice}
              </button>
              <button
                onClick={() => { setEditPlan(plan); setOpenDialog(true); }}
                className="mt-4 bg-white text-black py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Edit Plan
              </button>
              {editPlan && (
                <EditMembership
                  plans={plans}
                  setPlans={setPlans}
                  openDialog={openDialog}
                  setOpenDialog={setOpenDialog}
                  plan={editPlan}
                />
              )}
            </div>
          ))
        ) : (
          <button
            onClick={() => setAddPlanDialog(true)}
            className="bg-green-500 text-white py-5 px-6 rounded-lg font-bold mt-5 hover:bg-green-600 transition-colors"
          >
            ADD MEMBERSHIP PLAN
          </button>
        )}
        <button
          onClick={() => setAddPlanDialog(true)}
          className="bg-gradient-to-r from-green-500 to-green-700 text-white py-4 px-8  font-bold mt-5 hover:from-green-600 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          ADD MEMBERSHIP PLAN
        </button>
      </div>


      <ResourceAddDialog resources={resources} setResources={setResources} fetchResources={fetchResources} open={openAddDialog} onClose={handleClose} />
      <ManageSuggestedProducts />
      <ManageLocations />
      <ManageEvents />
      <ManageDiscountCodes />
      <ManageCompanyInfo />
      <ManageHomeMedia />
    </div>
  );
};

export default Resources;
