import { ChangeRequest } from "../models/ChangeRequest_Model.js";
import MembershipPlan from "../models/MembershipDetailsModel.js";
import Order from "../models/Order_Model.js";
import Product from "../models/Product_Model.js";
import Resource from "../models/ResourceModel.js";
import User from "../models/User_Model.js";
import UserPlanPdfRequest from "../models/UserPlanPdfRequest_Model.js";
import { io } from "../socket/socket.js";
const MembershipPlanwatcher = MembershipPlan.watch();
MembershipPlanwatcher.on('change', async (change) => {
  io.emit('MembershipPlanChanges', change);
})
// This function is used to create a new member
/**
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export const CreateMember = async (req, res) => {
  try {
    const { first_name, last_name, mobile_number, email, Membership_Type, start_date ,membership_id} = req.body;
    const existingUser = await User.findOne({
      first_name: first_name,
      last_name: last_name,
      mobile_number: mobile_number
    });
    if (existingUser) {
      return res.status(200).json({
        message: "User already exists"
      });
    }
    //  start_dae=new Date(start_date);
    const end_date = Membership_Type === 'Monthly' ? new Date(new Date(start_date).getTime() + 30 * 24 * 60 * 60 * 1000) :
      Membership_Type === 'BiMonthly' ? new Date(new Date(start_date).getTime() + 60 * 24 * 60 * 60 * 1000) :
        Membership_Type === 'Quarterly' ? new Date(new Date(start_date).getTime() + 90 * 24 * 60 * 60 * 1000) :
          Membership_Type === 'Quadrimester' ? new Date(new Date(start_date).getTime() + 120 * 24 * 60 * 60 * 1000) :
            Membership_Type === 'SemiAnnual' ? new Date(new Date(start_date).getTime() + 180 * 24 * 60 * 60 * 1000) :
              Membership_Type === 'Annual' ? new Date(new Date(start_date).getTime() + 360 * 24 * 60 * 60 * 1000) : null;
    const user = new User({ first_name, last_name, mobile_number, email, membership_details: { membership_type: Membership_Type, membership_id, start_date, end_date, status: "Active" } });
    await user.save();
    res.status(200).json(user);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
/**
 * Creates a new membership plan in the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export const AddNewMembershipPlan = async (req, res) => {
  try {
    const plan = new MembershipPlan(req.body);
    await plan.save();
    res.status(200).json(plan);
  }
  catch (err) {
    console.log(err);
  }
}

/**
 * Deletes a member from the database based on the member's ID
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export const DeleteMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    res.status(200).json(user);
  }
  catch (err) {
    console.log('error deleting member', err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Fetches all membership plans from the database
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export const getAllMembershipPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.find();
    if (!plans || plans.length === 0) {
      return res.status(404).json({ message: "No membership plans found" });
    }
    res.status(200).json(plans);
  } catch (error) {
    console.error("Error fetching membership plans:", error);
    res.status(500).json({ message: "Server error while fetching plans" });
  }
};

/**
 * Updates a membership plan in the database by its ID
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export const updateMembershipPlan = async (req, res) => {
  const { planId } = req.params; // Extract plan ID from the request params
  const updates = req.body; // Extract updates from the request body

  try {
    // Find the plan and update it
    const updatedPlan = await MembershipPlan.findByIdAndUpdate(
      planId,
      updates,
      { new: true, runValidators: true } // Return the updated document and run validation
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: "Membership plan not found" });
    }

    res.status(200).json(updatedPlan);
  } catch (error) {
    console.error("Error updating membership plan:", error);
    res.status(500).json({ message: "Server error while updating plan" });
  }
};
/**
 * Retrieves the 'ABOUT_US' resource from the database and returns its custom resources.
 * If the 'ABOUT_US' resource does not exist, returns an empty array.
 * Logs and returns an error message if an error occurs during the process.
 * 
 * @param {Request} req - The request object
 * @param {Response} res - The response object to send the resource data or error message
 * @returns {Promise<void>}
 */

export const getAboutUs = async (req, res) => {
  try {
    let resource = await Resource.findOne({ title: 'ABOUT_US' });
    if (!resource) {
      // If no ABOUT_US resource exists, return an empty array
      return res.status(200).json([]);
    }
    res.status(200).json(resource.customResource);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching locations' });
  }
};
/**
 * Saves or updates the 'ABOUT_US' resource with the provided locations.
 * If the 'ABOUT_US' resource does not exist, it creates a new one.
 * Validates the locations data and returns an error message if invalid.
 * Logs and returns an error message if an error occurs during the process.
 * 
 * @param {Request} req - The request object containing the locations data in the request body.
 * @param {Response} res - The response object to send the saved resource data or error message.
 * @returns {Promise<void>}
 */
export const saveLocations = async (req, res) => {
  const { locations } = req.body;

  if (!locations || !Array.isArray(locations)) {
    return res.status(400).json({ error: 'Invalid locations data' });
  }

  try {
    let resource = await Resource.findOne({ title: 'ABOUT_US' });

    if (!resource) {
      // Create a new ABOUT_US resource if it doesn't exist
      resource = new Resource({
        title: 'ABOUT_US',
        resourceType: 'ABOUT_US',
        customResource: locations,
      });
    } else {
      // Update existing resource
      resource.customResource = locations;
    }

    const savedResource = await resource.save();
    res.status(200).json(savedResource);
  } catch (error) {
    res.status(500).json({ error: 'Error saving locations' });
  }
}
/**
 * Retrieves the 'EVENTS' resource from the database and returns its custom resources.
 * If the 'EVENTS' resource does not exist, returns an empty array.
 * Logs and returns an error message if an error occurs during the process.
 * 
 * @param {Request} req - The request object
 * @param {Response} res - The response object to send the resource data or error message
 * @returns {Promise<void>}
 */
export const getEvents = async (req, res) => {
  try {
    let resource = await Resource.findOne({ title: 'EVENTS' });
    if (!resource) {
      // If no EVENTS resource exists, return an empty array
      return res.status(200).json([]);
    }
    res.status(200).json(resource.customResource);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
};
/**
 * Saves or updates the 'EVENTS' resource with the provided events data.
 * If the 'EVENTS' resource does not exist, it creates a new one.
 * Validates the events data and returns an error message if invalid.
 * Logs and returns an error message if an error occurs during the process.
 * 
 * @param {Request} req - The request object containing the events data in the request body.
 * @param {Response} res - The response object to send the saved resource data or error message.
 * @returns {Promise<void>}
 */
export const saveEvents = async (req, res) => {
  const { events } = req.body;

  if (!events || !Array.isArray(events)) {
    return res.status(400).json({ error: 'Invalid events data' });
  }

  try {
    let resource = await Resource.findOne({ title: 'EVENTS' });

    if (!resource) {
      // Create a new EVENTS resource if it doesn't exist
      resource = new Resource({
        title: 'EVENTS',
        resourceType: 'EVENTS',
        customResource: events,
      });
    } else {
      // Update the existing EVENTS resource
      resource.customResource = events;
    }

    const savedResource = await resource.save();
    res.status(200).json(savedResource);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error saving events' });
  }
};


/**
 * Saves or updates the 'SUGGESTED_PRODUCTS' resource with the provided product IDs.
 * Validates that exactly 4 product IDs are provided, fetches their details, and updates
 * the 'SUGGESTED_PRODUCTS' resource in the database. If the resource doesn't exist, creates a new one.
 * Returns the saved resource in JSON format upon success or an error message on failure.
 * 
 * @param {Request} req - The request object containing the product IDs in the request body.
 * @param {Response} res - The response object to send the saved resource data or error message.
 * @returns {Promise<void>}
 */

export const saveSuggestedProducts = async (req, res) => {
  const { productIds } = req.body; // Array of selected product IDs
  if (!productIds || productIds.length !== 4) {
    return res.status(400).json({ error: 'Exactly 4 products must be selected' });
  }
  try {
    // Fetch product details for the selected IDs
    const selectedProducts = await Product.find({ _id: { $in: productIds } });
    if (selectedProducts.length !== 4) {
      return res.status(400).json({ error: 'Invalid product selection' });
    }
    // Save to the Resource model
    let resource = await Resource.findOne({ title: 'SUGGESTED_PRODUCTS' });
    if (!resource) {
      resource = new Resource({
        title: 'SUGGESTED_PRODUCTS',
        resourceType: 'SUGGESTED_PRODUCTS',
        customResource: selectedProducts,
      });
    } else {
      resource.customResource = selectedProducts; // Update the suggested products
    }

    const savedResource = await resource.save();
    res.status(200).json(savedResource);
  } catch (error) {
    console.log('Error saving suggested products:', error);
    res.status(500).json({ error: 'Error saving suggested products' });
  }
}
/**
 * Retrieves all resources from the database.
 * Returns a JSON response with the list of resources.
 * If no resources are found, returns a 404 error message.
 * If an error occurs during the process, logs the error and returns a 500 error message.
 * @param {Request} req - The request object
 * @param {Response} res - The response object to send the resource data or error message
 * @returns {Promise<void>}
 */
export const getAllResources = async (req, res) => {
  try {
    // Fetch all resources from the database
    const resources = await Resource.find();
    // Check if there are any resources
    if (!resources || resources.length === 0) {
      return res.status(404).json({ message: 'No resources found.' });
    }
    // Return the resources in the response
    return res.status(200).json(resources);
  } catch (error) {
    // Handle any errors that occur
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Updates a resource in the database by its ID.
 * Sends a PUT request to the server with the updated resource data and the resource ID in the request parameters.
 * If successful, it returns the updated resource in JSON format.
 * If the resource is not found, a 404 error is returned.
 * Catches and logs any errors encountered during the process.
 * @param {Request} req - The request object containing the resource ID in the URL and the updated resource data in the request body.
 * @param {Response} res - The response object to send the updated resource or error message.
 * @returns {Promise<void>}
 */
export const UpdateResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(resource);
  }
  catch (err) {
    console.log('error editing resource', err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


/**
 * Creates a new resource in the database.
 * Sends a POST request to the server with the resource data in the request body.
 * If successful, it returns the created resource in JSON format.
 * If an error occurs during the process, logs the error and returns a 500 error message.
 * @param {Request} req - The request object containing the resource data in the request body.
 * @param {Response} res - The response object to send the created resource or error message.
 * @returns {Promise<void>}
 */
export const AddResources = async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(200).json(resource);
  }
  catch (err) {
    console.log('error adding resource', err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Deletes a resource from the database by its ID.
 * Sends a DELETE request to the server with the resource ID in the request parameters.
 * If the resource is found and deleted, it returns the deleted resource in JSON format.
 * If an error occurs during the process, logs the error and returns a 500 error message.
 * 
 * @param {Request} req - The request object containing the resource ID in the URL parameters.
 * @param {Response} res - The response object to send back the deleted resource or error message.
 * @returns {Promise<void>}
 */

export const DeleteResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByIdAndDelete(id);
    res.status(200).json(resource);
  }
  catch (err) {
    console.log('error deleting resource', err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Creates a new resource in the database.
 * Sends a POST request to the server with the resource data in the request body.
 * If successful, it returns the created resource in JSON format.
 * If an error occurs during the process, logs the error and returns a 500 error message.
 * @param {Request} req - The request object containing the resource data in the request body.
 * @param {Response} res - The response object to send the created resource or error message.
 * @returns {Promise<void>}
 */
export const AddNewResources = async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(200).json(resource);
  }
  catch (err) {
    console.log('error adding resource', err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


/**
 * Returns the total sales and total quantity of each product between the provided start and end dates.
 * Excludes refunded orders.
 * Optionally, sorts the results by total sales in descending order.
 * Returns a JSON array of objects with the keys: productId, totalSales, totalQuantity.
 * If an error occurs, logs the error and returns a 500 status code with an error message.
 * @param {Request} req - The request object containing the start and end dates in the URL parameters.
 * @param {Response} res - The response object to send the sales data or error message.
 * @returns {Promise<void>}
 */
export const getSalesDataByProduct = async (req, res) => {
  const { startDate, endDate } = req.params;

  // Validate the provided dates
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required.' });
  }

  try {
    const salesData = await Order.aggregate([
      {
        // Match orders within the provided start and end date range
        $match: {
          createdAt: {
            $gte: new Date(startDate), // Start date
            $lte: new Date(endDate), // End date
          },
          status: { $ne: 'Refunded' }, // Exclude refunded orders (optional)
        },
      },
      {
        // Unwind the products array to treat each product as a separate document
        $unwind: "$products",
      },
      {
        // Project the necessary fields: productId, quantity, price
        $project: {
          productId: "$products.productId",
          quantity: "$products.quantity",
          price: "$products.price",
        },
      },
      {
        // Group by productId and calculate total sales and total quantity
        $group: {
          _id: "$productId", // Group by productId
          totalSales: { $sum: { $multiply: ["$quantity", "$price"] } }, // Total sales = quantity * price
          totalQuantity: { $sum: "$quantity" }, // Total quantity sold
        },
      },
      {
        // Optionally, you can sort by total sales in descending order
        $sort: { totalSales: -1 },
      },
    ]);

    // Return the sales data as a response
    return res.status(200).json(salesData);
  } catch (err) {
    console.error('Error fetching sales data:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Modifies the discount codes in the database.
 * Accepts a POST request with the `discountCodes` field in the request body.
 * `discountCodes` should be an array of objects with the keys `code` and `value`.
 * If the data is invalid, it returns a 400 error with an error message.
 * If the modification is successful, it returns the updated resource in JSON format.
 * If an error occurs during the process, it logs the error and returns a 500 error message.
 * @param {Request} req - The request object containing the `discountCodes` field in the request body.
 * @param {Response} res - The response object to send the updated resource or error message.
 * @returns {Promise<void>}
 */
export const ModifyDiscountCodes = async (req, res) => {
  const { discountCodes } = req.body;

  // Ensure discountCodes is valid
  if (!discountCodes || !Array.isArray(discountCodes)) {
    return res.status(400).json({ error: 'Invalid discount codes data' });
  }

  try {
    let resource = await Resource.findOne({ title: 'DISCOUNT_CODE' });

    if (!resource) {
      // Create a new DISCOUNT_CODE resource if it doesn't exist
      resource = new Resource({
        title: 'DISCOUNT_CODE',
        resourceType: 'COUPONS',
        customResource: discountCodes,
      });
    } else {
      // Update existing resource
      resource.customResource = discountCodes;
    }

    const savedResource = await resource.save();
    res.status(200).json(savedResource);
  } catch (error) {
    res.status(500).json({ error: 'Error saving discount codes' });
  }
}

/**
 * Retrieves the discount codes from the database.
 * Searches for a resource with the title 'DISCOUNT_CODE'.
 * If found, returns the discount codes in the customResource field.
 * If not found, returns an empty array.
 * In case of an error, logs the error and returns a 500 status code with an error message.
 * 
 * @param {Request} req - The request object.
 * @param {Response} res - The response object to send the discount codes or error message.
 * @returns {Promise<void>}
 */

export const getDiscountCodes = async (req, res) => {
  try {
    let resource = await Resource.findOne({ title: 'DISCOUNT_CODE' });
    if (!resource) {
      // If no DISCOUNT_CODE resource exists, return an empty array
      return res.status(200).json([]);
    }
    res.status(200).json(resource.customResource);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching discount codes' });
  }
}


/**
 * Retrieves the company information from the database.
 * Searches for a resource with the title 'COMPANY_INFO'.
 * If found, returns the custom resource containing the company information.
 * If not found, returns a 404 status code with a message indicating that
 * the company information was not found.
 * In case of an error, logs the error and returns a 500 status code with
 * an error message.
 * 
 * @param {Request} req - The request object.
 * @param {Response} res - The response object to send the company information or error message.
 * @returns {Promise<void>}
 */

export const getFooterInfo = async (req, res) => {
  try {
    const resource = await Resource.findOne({ title: 'COMPANY_INFO' });
    if (!resource) return res.status(404).json({ message: 'Company Info not found' });
    res.json(resource.customResource);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching company info', error: err.message });
  }
}
/**
 * Updates the company information for the footer display in the database.
 * Accepts a PUT request with the company information fields in the request body.
 * If the 'COMPANY_INFO' resource does not exist, it creates a new one.
 * Updates the existing or newly created resource with the provided company information.
 * Returns a success message and the updated company information if successful.
 * In case of an error during the update, returns a 500 status code with an error message.
 * 
 * @param {Request} req - The request object containing company information in the request body.
 * @param {Response} res - The response object used to send back the success message or error message.
 * @returns {Promise<void>}
 */

export const UpdateFooterInfo = async (req, res) => {
  const { companyAddress, companyEmail, companyMobile, twitterLink, instagramLink, linkedinLink, facebookLink } = req.body;

  try {
    let resource = await Resource.findOne({ title: 'COMPANY_INFO' });
    if (!resource) {
      resource = new Resource({
        title: 'COMPANY_INFO',
        resourceType: 'COMPANY_INFO',
        customResource: {},
      });
    }

    resource.customResource = {
      companyAddress,
      companyEmail,
      companyMobile,
      twitterLink,
      instagramLink,
      linkedinLink,
      facebookLink,
    };

    await resource.save();
    res.json({ message: 'Company info updated successfully', customResource: resource.customResource });
  } catch (err) {
    res.status(500).json({ message: 'Error updating company info', error: err.message });
  }
}

/**
 * Fetches the home media (HOME_LOGO, HOME_PAGE_VIDEO, and other custom media)
 * from the database and returns it in the response.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object to send back the home media.
 * @returns {Promise<void>}
 */
export const getHomeMEDIA = async (req, res) => {
  try {
    const homeLogo = await Resource.findOne({ title: "HOME_LOGO" });
    const homePageVideo = await Resource.findOne({ title: "HOME_PAGE_VIDEO" });
    const customMedia = await Resource.find({ title: { $nin: ["HOME_LOGO", "HOME_PAGE_VIDEO"] } });

    res.status(200).json({
      homeLogo: homeLogo?.resourceLink || "",
      homePageVideo: homePageVideo?.resourceLink || "",
      customMedia,
    });
  } catch (err) {
    console.error("Error fetching media:", err);
    res.status(500).json({ message: "Failed to fetch media." });
  }
}
/**
 * Updates the home media (HOME_LOGO and HOME_PAGE_VIDEO) in the database.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object to send back the result.
 * @returns {Promise<void>}
 */
export const putHomeMedia = async (req, res) => {
  const { homeLogo, homePageVideo } = req.body;

  try {
    // Update HOME_LOGO
    if (homeLogo) {
      await Resource.findOneAndUpdate(
        { title: "HOME_LOGO" },
        { resourceType: "Image", resourceLink: homeLogo },
        { upsert: true } // Create if doesn't exist
      );
    }

    // Update HOME_PAGE_VIDEO
    if (homePageVideo) {
      await Resource.findOneAndUpdate(
        { title: "HOME_PAGE_VIDEO" },
        { resourceType: "Video", resourceLink: homePageVideo },
        { upsert: true }
      );
    }

    res.status(200).json({ message: "Home media updated successfully!" });
  } catch (err) {
    console.error("Error saving home media:", err);
    res.status(500).json({ message: "Failed to save home media." });
  }
}

/**
 * Adds a new custom media to the database.
 * Accepts a POST request with the title, resourceType, and resourceLink fields in the request body.
 * If any of the fields are missing, returns a 400 status code with an error message.
 * If a database error occurs during the addition, returns a 500 status code with an error message.
 * Returns a 201 status code with a success message if the addition is successful.
 * 
 * @param {Request} req - The request object containing the title, resourceType, and resourceLink fields.
 * @param {Response} res - The response object to send the result.
 * @returns {Promise<void>}
 */
export const PostCustomMedia = async (req, res) => {
  const { title, resourceType, resourceLink } = req.body;

  try {
    if (!title || !resourceType || !resourceLink) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newMedia = new Resource({
      title,
      resourceType,
      resourceLink,
    });

    await newMedia.save();
    res.status(201).json({ message: "Custom media added successfully!" });
  } catch (err) {
    console.error("Error adding custom media:", err);
    res.status(500).json({ message: "Failed to add custom media." });
  }
}

/**
 * Updates a change request in the database.
 * Accepts a PATCH request with the request ID as a parameter and the status, reviewedBy, and userId fields in the request body.
 * If the request ID is not found, returns a 404 error with an error message.
 * If the request body is invalid, returns a 400 error with an error message.
 * If the status is "Approved", updates the User information with the requested changes.
 * If the status is "Rejected", deletes the change request.
 * Returns a 200 status code with a success message if the update is successful.
 * If an error occurs during the update, returns a 500 error with an error message.
 * @param {Request} req - The request object containing the request ID and status.
 * @param {Response} res - The response object to send the result.
 * @returns {Promise<void>}
 */
export const updateChangeRequest = async (req, res) => {
  try {
    const { status, reviewedBy, userId } = req.body;

    // Step 1: Fetch ChangeRequest and User concurrently
    const request = await ChangeRequest.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ error: 'Change request not found' });
    }
    // Step 2: Update ChangeRequest status
    request.status = status;
    request.reviewedBy = reviewedBy;
    request.reviewedAt = new Date();
    await request.save();

    // Step 3: If approved, update the User information
    if (status === 'Approved') {
      const RequestedChanges = request.requestedChanges;
      const first_name = RequestedChanges.get('first_name')
      const last_name = RequestedChanges.get('last_name')
      const email = RequestedChanges.get('email')
      const mobile_number = RequestedChanges.get('mobile_number')
      const Address = RequestedChanges.get('Address')
      if (!first_name || !last_name || !email || !mobile_number || !Address) {
        return res.status(400).json({ error: 'Missing required fields in requested changes' });
      }
      const Authuser = await User.findByIdAndUpdate(userId, { first_name: first_name, last_name: last_name, email: email, mobile_number: mobile_number, Address: Address }, { new: true })
      res.status(200).json({ success: 'Reviewed successfully', Authuser: Authuser });
    }
    else if (status === 'Rejected') {
      await ChangeRequest.findByIdAndDelete(req.params.id)
      res.status(200).json({ success: 'Reviewed Rejected' });
    }

    // Send success response


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


/**
 * Retrieves all UserPlanPdfRequest records in the database.
 * 
 * This function sends a GET request to the server to retrieve all
 * UserPlanPdfRequest records. The response data containing the requests
 * is returned.
 * 
 * @returns {Promise<Object[]>} A promise that resolves to an array of
 * UserPlanPdfRequest records.
 */
export const getUserPlanPDFRequests = async (req, res) => {
  try {
    const requests = await UserPlanPdfRequest.find()
    res.status(200).json(requests)
  }
  catch (err) {
    console.log(err)
  }
}
/**
 * Deletes a UserPlanPdfRequest record from the database by ID.
 * 
 * This function sends a DELETE request to the server to delete a
 * UserPlanPdfRequest record by ID. If the request is deleted
 * successfully, a success message is returned. If an error occurs,
 * an error message is returned.
 * 
 * @param {Request} req - The request object containing the ID of the
 * UserPlanPdfRequest record to delete in the request URL.
 * @param {Response} res - The response object to send the success or
 * error message.
 * @returns {Promise<void>}
 */
export const deletePDFRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await UserPlanPdfRequest.findByIdAndDelete(id);
    res.status(200).json({ message: "Request deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting request.", error });
  }
}