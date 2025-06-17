import React, { useEffect, useState } from 'react'
import MembersAddDialog from '../TrainerComponents/MembersAddDialog';
import axios from 'axios';
import EditMemberDialog from './EditMemberDialog';
/**
 * A component to display user membership details in a table format.
 *
 * This component receives the list of user membership details as a prop and displays them in a table
 * format. It also allows the user to search, sort and filter the data. The user can also delete a
 * member or edit their details using the actions button.
 *
 * @param {Array} MemeberShipData - The list of user membership details.
 * @param {function} fetchMembershipDetails - A function to call to refresh the membership details after editing.
 * @returns A JSX element containing the table of user membership details.
 */
const MemberDetails = ({ MemeberShipData, fetchMembershipDetails, setMemeberShipData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [latestFilter, setLatestFilter] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState(null);
  const handleEdit = (user) => { setOpenEdit(true); setSelectedEditUser(user) }
  /**
   * Deletes a member from the database based on the member's ID
   *
   * This function sends a DELETE request to the server to delete the
   * member with the provided ID. If the server responds with a 200 status
   * code, the function logs the response to the console. If the server
   * responds with an error, the function logs the error to the console.
   *
   * @param {string} userId - The ID of the user to be deleted.
   * @returns {Promise<void>}
   */
  const DeleteMemberById = async (userId) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        const response = await axios.delete(`http://3.25.86.182:5000/api/Admin/Delete-Member/${userId}`, { withCredentials: true });
        if (response.status === 200) {
          setMemeberShipData((prevMembers) => prevMembers.filter((member) => member._id !== userId));
        }
      }
      catch (err) {
        console.log(err)
      }
    }
  }
  /**
   * Handles the search query by updating the component state with the new search query.
   * This triggers a re-render of the component with the new search query.
   * @param {string} query The search query to search for in the member list.
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  /**
   * Highlights the search query in the provided name by wrapping the matched
   * text in a bold, green span element.
   *
   * @param {string} name - The name to search for the query in.
   * @param {string} query - The query to search for in the name.
   * @returns {ReactElement} A span element containing the highlighted name.
   */
  const highlightQuery = (name, query) => {
    if (!query) return name;
    const regex = new RegExp(`(${query})`, 'i'); // Case-insensitive match
    const parts = name.split(regex);
    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} style={{ color: 'green', fontWeight: 'bold' }}>
              {part}
            </span>
          ) : (
            <span key={index} style={{ color: 'black' }}>
              {part}
            </span>
          )
        )}
      </span>
    );
  };
  return (
    <div className="border border-black p-2 shadow-2xl bg-black text-white font-sans">
      <h2 className="font-bold text-2xl mb-4">User Membership Details</h2>

      <div className="flex flex-col gap-4 mb-4">
        <div className="relative w-full md:w-[450px]">
          <i
            className="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          ></i>
          <input
            type="text"
            placeholder="Search by name/email/mobile number"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input border border-gray-400 rounded-full pl-10 pr-3 py-2 text-white bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
      </div>


      <div className="mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <label className="text-lg">Sort By:</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border p-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="">Default</option>
              <option value="RECENT-MEMBERSHIPS">RECENT MEMBERSHIPS</option>
              <option value="OLDEST-MEMBERSHIPS">OLDEST MEMBERSHIPS</option>
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <label className="text-lg">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border p-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="">Default</option>
              <option value="active">ACTIVE</option>
              <option value="expired">EXPIRED</option>
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <label className="text-lg">LATEST:</label>
            <select
              value={latestFilter}
              onChange={(e) => setLatestFilter(e.target.value)}
              className="border p-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="">DEFAULT</option>
              <option value="1DAY">LESS THAN 1 DAY</option>
              <option value="2DAY">LESS THAN 2 DAYS</option>
              <option value="3DAY">LESS THAN 3 DAYS</option>
              <option value="4DAY">LESS THAN 4 DAYS</option>
              <option value="5DAY">LESS THAN 5 DAYS</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-gray-900 text-white">
          <thead>
            <tr>
              <th className='px-4 py-2 text-left bg-black'>ID</th>
              <th className="px-4 py-2 text-left bg-black">Name</th>
              <th className="px-4 py-2 text-left bg-black">Email</th>
              <th className="px-4 py-2 text-left bg-black">Contact</th>
              <th className="px-4 py-2 text-left bg-black">Start Date</th>
              <th className="px-4 py-2 text-left bg-black">End Date</th>
              <th className="px-4 py-2 text-left bg-black">Status</th>
              <th className="px-4 py-2 text-left bg-black">Paid</th>
              <th className="px-4 py-2 text-left bg-black">Membership Type</th>
              <th className="px-4 py-2 text-left bg-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MemeberShipData?.filter(
              (user) =>
                user.mobile_number.includes(searchQuery) ||
                user.email.toLowerCase().includes(searchQuery) ||
                user.first_name.toLowerCase().includes(searchQuery) ||
                user.last_name.toLowerCase().includes(searchQuery)

            ).filter((user) => {
              if (categoryFilter === 'active') {
                return user.membership_details.status === 'Active';
              }
              if (categoryFilter === 'expired') {
                return user.membership_details.status === 'Expired';
              }
              if (latestFilter === '1DAY')
                return + new Date() - new Date(user.membership_details.start_date) <= 1 * 24 * 60 * 60 * 1000;
              if (latestFilter === '2DAY')
                return + new Date() - new Date(user.membership_details.start_date) <= 2 * 24 * 60 * 60 * 1000;
              if (latestFilter === '3DAY')
                return + new Date() - new Date(user.membership_details.start_date) <= 3 * 24 * 60 * 60 * 1000;
              if (latestFilter === '4DAY')
                return + new Date() - new Date(user.membership_details.start_date) <= 4 * 24 * 60 * 60 * 1000;
              if (latestFilter === '5DAY')
                return + new Date() - new Date(user.membership_details.start_date) <= 5 * 24 * 60 * 60 * 1000;
              return true;
            }).sort((a, b) => {
              if (sortOption === 'RECENT-MEMBERSHIPS') {
                // Get the current time
                return new Date(b.membership_details.start_date) - new Date(a.membership_details.start_date);

              }

              if (sortOption === 'OLDEST-MEMBERSHIPS') {
                return new Date(a.membership_details.start_date) - new Date(b.membership_details.start_date);
              }

              return 0;
            })
              .map((user, index) => (
                <tr key={index} className="border-t border-gray-700 bg-black">
                  <td className='px-4 py-2'>{user?.membership_details?.membership_id}</td>
                  <td className="px-4 py-2">{highlightQuery(user.first_name, searchQuery)} {highlightQuery(user.last_name, searchQuery)}</td>
                  <td className="px-4 py-2">{highlightQuery(user.email, searchQuery)}</td>
                  <td className="px-4 py-2">{highlightQuery(user.mobile_number, searchQuery)}</td>
                  <td className="px-4 py-2"> {isNaN(new Date(user.membership_details.start_date).getTime())
                    ? ""
                    : new Date(user.membership_details.start_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2"> {isNaN(new Date(user.membership_details.end_date).getTime())
                    ? ""
                    : new Date(user.membership_details.end_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {user?.membership_details ?
                      (user.membership_details.status === null ? "Pending" : user.membership_details.status)
                      : "NOT-A-MEMBER"}
                  </td>                <td className="px-4 py-2">{user.membership_details.PaidByUser?.toString()}</td>
                  <td className="px-4 py-2">{user.membership_details.membership_type}</td>
                  <td className="px-4 py-3 flex gap-2 ">

                    <button
                      onClick={() => {
                        DeleteMemberById(user._id);
                      }}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      DELETE
                    </button>
                    <button
                      onClick={() => {
                        handleEdit(user);
                      }}
                      className="ml-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      EDIT
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => setOpenDialog(true)}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
      >
        ADD MEMBER
      </button>
      <EditMemberDialog openEdit={openEdit} setOpenEdit={setOpenEdit} user={selectedEditUser} fetchMembershipDetails={fetchMembershipDetails} />
      <MembersAddDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />
    </div>


  )
}

export default MemberDetails