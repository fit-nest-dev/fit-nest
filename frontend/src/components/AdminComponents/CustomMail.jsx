import React, { useState } from "react";

/**
 * CustomMail component to send a custom email to selected users or trainers.
 *
 * @param {array} userEmails - list of user email addresses.
 * @param {array} trainerEmails - list of trainer email addresses.
 * @returns {JSX.Element} - the rendered component.
 */
const CustomMail = ({ userEmails, trainerEmails }) => {
  const [selectedUserEmails, setSelectedUserEmails] = useState([]);
  const [selectedTrainerEmails, setSelectedTrainerEmails] = useState([]);
  /**
   * Handles sending a custom email to selected users or trainers.
   * 
   * If no recipients are selected, an alert is shown asking the user to select at least one recipient.
   * Otherwise, a mailto link is created with the selected emails and the user is redirected to Gmail.
   */
  const handleSendMail = () => {
    const allSelectedEmails = [
      ...selectedUserEmails,
      ...selectedTrainerEmails,
    ];

    if (!allSelectedEmails.length) {
      alert("Please select at least one recipient!");
      return;
    }

    // Create mailto link with selected emails
    const mailtoLink = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(
      allSelectedEmails.join(",")
    )}`;

    // Redirect to Gmail
    window.open(mailtoLink, "_blank");
  };

  return (
    <div className="bg-black p-10 shadow-2xl rounded-lg text-gray-200 font-poppins">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between border-b border-gray-800 pb-4">
        <h2 className="text-4xl font-extrabold text-white flex items-center gap-4">
          <i className="fa fa-envelope text-gray-400"></i> Send Email
        </h2>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105 flex items-center gap-3"
          onClick={handleSendMail}
        >
          <i className="fa fa-paper-plane"></i> Send
        </button>
      </div>

      {/* Email Selection Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* User Emails Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-300 mb-6">
            <i className="fa fa-users text-gray-400"></i> User Emails
          </h3>
          <div className="bg-gray-800 rounded-lg p-6 shadow-inner space-y-4">
            {/* Select All */}
            <div className="flex items-center justify-between border-b border-gray-700 pb-4">
              <label className="flex items-center gap-4">
                <input
                  type="checkbox"
                  className="form-checkbox w-5 h-5 text-gray-500 focus:ring focus:ring-gray-500"
                  checked={selectedUserEmails.length === userEmails.length}
                  onChange={(e) =>
                    setSelectedUserEmails(
                      e.target.checked ? userEmails.map((user) => user.email) : []
                    )
                  }
                />
                <span className="text-sm text-gray-400">Select All</span>
              </label>
              <span className="text-sm text-gray-500">
                {selectedUserEmails.length}/{userEmails.length} selected
              </span>
            </div>

            {/* Email List */}
            <div className="max-h-56 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
              {userEmails.filter((user) => user.isAdmin === false).map((user) => (
                <div
                  key={user._id}
                  className={`flex justify-between items-center px-4 py-3 rounded-lg cursor-pointer transition-all ${selectedUserEmails.includes(user.email)
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700"
                    }`}
                  onClick={() =>
                    setSelectedUserEmails((prev) =>
                      prev.includes(user.email)
                        ? prev.filter((email) => email !== user.email)
                        : [...prev, user.email]
                    )
                  }
                >
                  <div>
                    <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <i className="fa fa-check-circle text-gray-500"></i>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trainer Emails Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-300 mb-6">
            <i className="fa fa-chalkboard-teacher text-gray-400"></i> Trainer Emails
          </h3>
          <div className="bg-gray-800 rounded-lg p-6 shadow-inner space-y-4">
            {/* Select All */}
            <div className="flex items-center justify-between border-b border-gray-700 pb-4">
              <label className="flex items-center gap-4">
                <input
                  type="checkbox"
                  className="form-checkbox w-5 h-5 text-gray-500 focus:ring focus:ring-gray-500"
                  checked={selectedTrainerEmails.length === trainerEmails.length}
                  onChange={(e) =>
                    setSelectedTrainerEmails(
                      e.target.checked ? trainerEmails.map((trainer) => trainer.email) : []
                    )
                  }
                />
                <span className="text-sm text-gray-400">Select All</span>
              </label>
              <span className="text-sm text-gray-500">
                {selectedTrainerEmails.length}/{trainerEmails.length} selected
              </span>
            </div>

            {/* Email List */}
            <div className="max-h-56 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
              {trainerEmails.map((trainer) => (
                <div
                  key={trainer._id}
                  className={`flex justify-between items-center px-4 py-3 rounded-lg cursor-pointer transition-all ${selectedTrainerEmails.includes(trainer.email)
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700"
                    }`}
                  onClick={() =>
                    setSelectedTrainerEmails((prev) =>
                      prev.includes(trainer.email)
                        ? prev.filter((email) => email !== trainer.email)
                        : [...prev, trainer.email]
                    )
                  }
                >
                  <div>
                    <p className="text-sm font-medium">{trainer.first_name} {trainer.last_name}</p>
                    <p className="text-xs text-gray-400">{trainer.email}</p>
                  </div>
                  <i className="fa fa-check-circle text-gray-500"></i>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>




  );
};

export default CustomMail;
