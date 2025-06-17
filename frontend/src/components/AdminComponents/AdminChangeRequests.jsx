import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { SocketContext } from "../../context/SocketContext";
import { useAuthContext } from "../../context/AuthContext";

/**
 * A component that displays a list of change requests for user profile information.
 * It fetches the list of requests from the API and displays them in a table.
 * The table columns include the user ID, current information, requested changes, status, and timestamp.
 * The component also includes buttons to approve or reject the requests.
 * If the request is approved, it updates the user's profile information.
 * If the request is rejected, it deletes the request.
 * The component uses the SocketContext to receive updates when a new request is generated.
 * It also uses the useAuthContext hook to get the current user's ID.
 * The component is wrapped in a loading indicator and error message, in case of an error or while the data is loading.
 * @returns {JSX.Element} A JSX element that displays the list of change requests.
 */
export const ChangeRequestApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useContext(SocketContext);
  const { Authuser } = useAuthContext();

  /**
   * Fetches the list of change requests for user profile information from the API.
   * Maps over each request and fetches the current user information for that request.
   * Updates the component state with the list of change requests.
   * If an error occurs, sets the error state to the error message.
   * Always sets the loading state to false.
   */
  const fetchRequests = async () => {
    try {
      const response = await axios.get("http://3.25.86.182:5000/api/users/getChangeRequests", { withCredentials: true }); // Replace with your API endpoint
      const fetchedRequests = await Promise.all(
        response.data.map(async (request) => {
          const currentInfoResponse = await axios.get(`http://3.25.86.182:5000/api/users/${request.userId}/current-info`, { withCredentials: true });
          return {
            ...request,
            currentInformation: currentInfoResponse.data,
          };
        })
      );
      setRequests(fetchedRequests);
    } catch (err) {
      setError("Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    socket.on('InfoChangeRequestGenerated', (change) => {
      fetchRequests();
    });
    return () => socket.off('InfoChangeRequestGenerated');
  }, [socket])
  /**
   * Handles an action (approval or rejection) for a change request.
   * Updates the request with the action, the current user's ID, and the user's ID.
   * If successful, updates the component state with the new request list.
   * If an error occurs, logs the error to the console.
   * @param {string} requestId - The ID of the change request.
   * @param {string} userId - The ID of the user who made the request.
   * @param {string} action - The action to take (either "Approved" or "Rejected").
   */
  const handleAction = async (requestId, userId, action) => {
    try {
      const response = await axios.patch(`http://3.25.86.182:5000/api/admin/change-requests/${requestId}`, {
        status: action,
        reviewedBy: Authuser._id,
        userId: userId.toString()
      }, { withCredentials: true });
      // Update the request list
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === requestId ? { ...req, ...response.data } : req
        )
      );
      fetchRequests()
    } catch (err) {
      console.error("Failed to update request", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="mt-6 ml-auto container mx-auto p-6 bg-black shadow-lg rounded-lg">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-white">
        Change Requests for Profile Information
      </h1>
      {requests.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">No pending requests.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-700 shadow-lg">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left border bg-black border-gray-700 uppercase font-semibold">User ID</th>
                <th className="px-6 py-4 text-left border bg-black border-gray-700 uppercase font-semibold">
                  Current Information
                </th>
                <th className="px-6 py-4 text-left border bg-black border-gray-700 uppercase font-semibold">
                  Requested Changes
                </th>
                <th className="px-6 py-4 text-left border bg-black border-gray-700 uppercase font-semibold">Status</th>
                <th className="px-6 py-4 text-left border bg-black border-gray-700 uppercase font-semibold">
                  Requested At
                </th>
                <th className="px-6 py-4 text-left border bg-black border-gray-700 uppercase font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr
                  key={request._id}
                  className="hover:bg-gray-800 transition-all duration-200"
                >
                  <td className="px-6 py-4 border border-gray-700 text-gray-300 text-sm">
                    {request.userId}
                  </td>
                  <td className="px-6 py-4 border border-gray-700 text-gray-300 text-sm">
                    <ul className="list-disc list-inside">
                      {Object.entries(request.currentInformation || {}).map(([field, value]) => (
                        <li key={field} className="capitalize">
                          <strong className="text-gray-100">{field}:</strong>{" "}
                          <span className="text-gray-400">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 border border-gray-700 text-gray-300 text-sm">
                    <ul className="list-disc list-inside">
                      {Object.entries(request.requestedChanges).map(([field, value]) => {
                        const isChanged =
                          request.currentInformation &&
                          request.currentInformation[field] !== value;
                        return (
                          <li key={field} className="capitalize">
                            <strong className="text-gray-100">{field}:</strong>{" "}
                            <span className={isChanged ? "text-green-400" : "text-gray-400"}>
                              {value}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </td>

                  <td className="px-6 py-4 border border-gray-700 text-gray-300 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full font-medium ${request.status === "Pending"
                          ? "bg-yellow-500 text-gray-900"
                          : request.status === "Approved"
                            ? "bg-green-500 text-gray-900"
                            : "bg-red-500 text-gray-900"
                        }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 border border-gray-700 text-gray-400 text-sm">
                    {new Date(request.requestedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 border border-gray-700 text-center">
                    {request.status === "Pending" && (
                      <div className="flex gap-3 justify-center">
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md font-medium"
                          onClick={() =>
                            handleAction(request._id, request.userId, "Approved")
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md font-medium"
                          onClick={() =>
                            handleAction(request._id, request.userId, "Rejected")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      )}
    </div>

  );
};