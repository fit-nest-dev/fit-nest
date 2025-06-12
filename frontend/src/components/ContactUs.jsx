import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import React from 'react'
import { Link } from 'react-router-dom'
import Typewriter from "typewriter-effect";
import MapImg from '../assets/MAP1.jpg'
const ContactUs = () => {
  const center = {
    lat: 37.7749, // Latitude
    lng: -122.4194, // Longitude
  };
  return (
    <section className="flex flex-wrap px-4 sm:px-6 py-6 sm:py-8 bg-black relative">
      {/* Left Column - Name, Description, and Buttons */}
      <div className="w-full md:w-1/2 mb-6 md:mb-0 flex flex-col items-center md:items-start text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-green-600 mb-4 font-poppins">
          <Typewriter
            options={{
              strings: ["FIT NEST", "Your Fitness Journey Begins Here!"],
              autoStart: true,
              loop: true,
            }}
          />
        </h1>
        <p className="text-lg sm:text-xl mb-4 font-roboto text-gray-300">
          Where fitness meets family!
        </p>
        <p className="text-gray-400 font-lato mb-6">
          Experience training in a supportive, community-driven environment. Achieve your goals while feeling at home.
        </p>
        <div className="border-t border-gray-600 my-6 w-full"></div>
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-md">
          {/* Contact Us Button - Linked to the contact page */}
          <a
            href="tel:+919008255804"
            className="relative flex items-center justify-center bg-black text-white font-semibold py-2 px-6 shadow-lg border border-white transition duration-300 w-full transform hover:scale-105 hover:shadow-white/50"
          >
            <i className="fas fa-phone text-white mr-2"></i>
            <span>Contact Us</span>
          </a>


          {/* Membership Button - Linked to the membership page */}
          <Link to="/members" className="relative flex items-center justify-center bg-green-600 to-green-700 text-white font-semibold py-2 px-6 shadow-lg transition-transform duration-300 w-full transform hover:scale-105 hover:shadow-green-500/50">
            <i className="fas fa-users text-white mr-2"></i>
            <span>Membership</span>
          </Link>
        </div>
      </div>

      {/* Right Column - Google Map with Button */}
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <div className="relative w-full max-w-md transition-all duration-300">
          <img src={MapImg} width={800} height={800} alt="" />
          <a
            href="https://www.google.com/maps/place/Fit+Nest+-+Top+Rated+Gym+In+Boring+Road/@25.6104738,85.1154629,17z/data=!3m1!4b1!4m6!3m5!1s0x39ed593ba6c93ac9:0x95a8243da486cbca!8m2!3d25.610469!4d85.1180378!16s%2Fg%2F11h2p6j35n?entry=ttu&g_ep=EgoyMDI0MTIxMS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex justify-center items-center text-white font-semibold py-2 px-4 opacity-0 hover:opacity-100 transition-opacity duration-300"
          >
            <span className='flex items-center text-black bg-white'>See Location</span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default ContactUs
