import React, { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Footer component for the website.
 * 
 * This component fetches the company information from the server and displays it
 * in the footer section of the website. It also includes a contact form that
 * allows users to send messages to the company.
 * 
 * The component is responsive and adapts to different screen sizes.
 * 
 * @returns {JSX.Element} The rendered footer component.
 */
const Footer = () => {
  const [email, setEmail] = useState("");
  const [companyInfo, setCompanyInfo] = useState({
    companyAddress: "",
    companyEmail: "",
    companyMobile: "",
    twitterLink: "",
    instagramLink: "",
    linkedinLink: "",
    facebookLink: "",
  });

  /**
   * Fetches the company information from the server and updates the component state
   * with the latest information.
   */
  const fetchCompanyInfo = async () => {
    try {
      const response = await axios.get(`http://3.25.86.182:5000/api/Admin/get-footer-info`, { withCredentials: true });
      setCompanyInfo(response.data[0]);
    } catch (err) {
      console.error("Error fetching company info:", err);
    }
  };

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  /**
   * Handles the submission of a message from the footer's contact form.
   */
  const handleMessageSubmit = (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const message = e.target.message.value;

    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=fitnest.patna@gmail.com&su=Message from ${email}&body=${encodeURIComponent(message)}`;

    window.location.href = gmailLink;
  };

  return (
    <section className="bg-black text-white py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-white mb-10 mt-10">Contact Us</h2>
          <p className="text-md text-gray-400 mb-4">We'd love to hear from you! Reach out for inquiries or feedback.</p>
          <hr className="border-t border-gray-700 mt-2 w-1/4 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Left Side: Important Links */}
          <div className="flex flex-col items-center md:items-start justify-center bg-black p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold  text-center md:text-left mb-10">Important Links</h3>
            <ul className="space-y-2 mb-1">
              <li>
                <a
                  href="/terms-and-conditions"
                  className="hover:text-green-400 transition duration-300 ease-in-out text-lato"
                >
                  Terms and Conditions
                </a>
              </li>
              <li>
                <a
                  href="/code-of-conduct"
                  className=" text-lato hover:text-green-400 transition duration-300 ease-in-out"
                >
                  Code of Conduct
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  className=" text-lato hover:text-green-400 transition duration-300 ease-in-out"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/return-policy"
                  className="text-lato hover:text-green-400 transition duration-300 ease-in-out"
                >
                  Return Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Middle Section: Contact Information */}
          <div className="flex flex-col items-center md:items-start justify-center bg-black p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <i className="fas fa-envelope text-green-400 text-lg"></i>
                <a
                  href={`mailto:${companyInfo?.companyEmail || ""}`}
                  className="hover:text-green-400 transition duration-300 ease-in-out"
                >
                  {companyInfo.companyEmail}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-phone-alt text-green-400 text-lg"></i>
                <a
                  href={`tel:${companyInfo?.companyMobile || ""}`}
                  className="hover:text-green-400 transition duration-300 ease-in-out"
                >
                  {companyInfo.companyMobile}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-map-marker-alt text-green-400 text-lg"></i>
                <p>{companyInfo?.companyAddress || ""}</p>
              </li>
            </ul>
            <div className="mt-6 flex justify-center gap-6">
              <a
                href={`${companyInfo?.facebookLink || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl hover:text-green-400 transition duration-300 ease-in-out"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href={`${companyInfo?.instagramLink || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl hover:text-green-400 transition duration-300 ease-in-out"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href={`${companyInfo?.twitterLink || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl hover:text-green-400 transition duration-300 ease-in-out"
              >
<i className="fab fa-x-twitter"></i>
</a>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="flex flex-col items-center md:items-start justify-center bg-black p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-1 mt-9">Send Us a Message</h3>
            <form
              onSubmit={handleMessageSubmit}
              className="space-y-3 w-full max-w-md flex flex-col items-center"
            >
              <div className="w-full">
                <label className="block text-sm mb-1 mt-2" htmlFor="email">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your Email"
                  required
                />
              </div>
              <div className="w-full">
                <label className="block text-sm mb-1" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="2"
                  placeholder="Your Message"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-700 text-white py-2 px-6 rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out w-full sm:w-auto"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Rights Information */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">© 2024 Fit Nest Gym. All rights reserved. Powered by S. AIntelligence Technologies </p>
        </div>
      </div>
    </section>
  );
};

export default Footer;
