import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { SocketContext } from "../../context/SocketContext";

/**
 * AdminFeedbackView component is used to display all the feedbacks provided by
 * users. It fetches the feedbacks from the server and displays them in a table.
 * It also listens for the 'UserChanges' event from the socket and fetches the
 * feedbacks again when the event is emitted.
 */
const AdminFeedbackView = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { socket } = useContext(SocketContext);
  /**
   * Fetches all user feedbacks from the server.
   *
   * This asynchronous function sends a GET request to the server to retrieve
   * all feedbacks provided by users. If successful, it updates the feedbacks
   * state with the received data. In the case of an error, it logs the error
   * and sets an error message state. Regardless of the outcome, it sets the
   * loading state to false after the operation is complete.
   */

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get("http://3.25.86.182:5000/api/users/all-feedbacks", { withCredentials: true });
      if (response.status === 200) {
        setFeedbacks(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setError("NO FEEDBACKS CURRENTLY");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    socket.on('UserChanges', (change) => {
      fetchFeedbacks();
    });
    return () => socket.off('UserChanges');
  }, [socket])
  useEffect(() => {
    fetchFeedbacks();
  }, []);
  if (isLoading) {
    return <div>Loading feedbacks...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="mt-6 mx-auto w-full font-sans ml-[70px] text-white">
      <h2 className="text-3xl mb-6 border-b-2 border-gray-300 pb-2 text-center">
        User Feedbacks
      </h2>
      {feedbacks?.length === 0 ? (
        <p className="text-lg text-gray-400  italic text-center">
          No feedbacks available.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="table-auto w-full border-collapse bg-black text-white">
            <thead>
              <tr>
                <th className="py-3 px-6 text-left bg-black font-semibold border-b border-gray-600">
                  First Name
                </th>
                <th className="py-3 px-6 text-left bg-black font-semibold border-b border-gray-600">
                  Last Name
                </th>
                <th className="py-3 px-6 text-left bg-black font-semibold border-b border-gray-600">
                  Email
                </th>
                <th className="py-3 px-6 text-left bg-black font-semibold border-b border-gray-600">
                  Feedbacks
                </th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((user, index) => (
                <tr key={user._id} className={"bg-black"}>
                  <td className="py-4 px-6 border-b border-gray-600">{user.first_name}</td>
                  <td className="py-4 px-6 border-b border-gray-600">{user.last_name}</td>
                  <td className="py-4 px-6 border-b border-gray-600">{user.email}</td>
                  <td className="py-4 px-6 border-b border-gray-600">
                    <ul className="space-y-4 max-h-48 overflow-y-auto">
                      {user.feedback.map((fb) => (
                        <li key={fb.feedback_id} className="p-3 rounded-lg border border-gray-600 bg-black">
                          <p>
                            <span className="font-semibold">Date:</span> {new Date(fb.date).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-semibold">Message:</span> {fb.message}
                          </p>
                        </li>
                      ))}
                    </ul>
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

export default AdminFeedbackView;
