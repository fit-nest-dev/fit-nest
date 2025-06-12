"use client"

import { useEffect, useState } from "react"
import useSignup from "../../hooks/useSignup"
import axios from "axios"

const Signup = ({ type, showPay, setShowPay }) => {
  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    address: "",
    type,
  })

  const fetchResources = async () => {
    try {
      // setLoadingResources(true);
      const response = await axios.get("http://localhost:5000/api/Admin/AllResources")
      setResources(response.data)
    } catch (err) {
      console.log(err)
    } finally {
      // setLoadingResources(false);
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  const [passwordError, setPasswordError] = useState("") // To handle password mismatch error
  const { loading, signupAfterPayment } = useSignup()
  const [resources, setResources] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (inputs.password !== inputs.confirmPassword) {
      setPasswordError("Passwords do not match.")
      return
    }
    setPasswordError("") // Clear error if passwords match

    await signupAfterPayment(inputs)
    setInputs({
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
      address: "",
    })
  }

  useEffect(() => {
    if (loading) {
      setShowPay(true)
    }
  }, [loading])

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat">
      {/* Overlay with fitness pattern */}
      <div className="absolute inset-0 bg-black/70">
        {/* Animated fitness pattern */}
        <div className="absolute inset-0 opacity-10">
          {/* Gym equipment pattern */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gym-equipment" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                {/* Dumbbell */}
                <g transform="translate(50, 50)">
                  <rect x="-40" y="-5" width="80" height="10" rx="5" fill="#4ade80" />
                  <circle cx="-40" cy="0" r="15" fill="#4ade80" />
                  <circle cx="40" cy="0" r="15" fill="#4ade80" />
                </g>

                {/* Kettlebell */}
                <g transform="translate(150, 150)">
                  <circle cx="0" cy="10" r="20" fill="#4ade80" />
                  <rect x="-5" y="-20" width="10" height="25" rx="2" fill="#4ade80" />
                  <circle cx="0" cy="-20" r="8" fill="#4ade80" />
                </g>

                {/* Barbell */}
                <g transform="translate(150, 50) rotate(45)">
                  <rect x="-60" y="-3" width="120" height="6" rx="3" fill="#4ade80" />
                  <rect x="-75" y="-10" width="20" height="20" rx="2" fill="#4ade80" />
                  <rect x="55" y="-10" width="20" height="20" rx="2" fill="#4ade80" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gym-equipment)" />
          </svg>
        </div>

        {/* Animated gradient circles */}
        <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-green-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 h-96 w-96 animate-pulse rounded-full bg-green-600/10 blur-3xl"></div>

        {/* Diagonal lines */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(45deg, #4ade80 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>
      </div>

      {/* Animated fitness icons - Repositioned to match login page */}
      <div className="absolute bottom-10 right-10 h-24 w-24 animate-pulse opacity-20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#4ade80">
          <path d="M104 96c-13.3 0-24 10.7-24 24v12H64c-13.3 0-24 10.7-24 24v80c0 13.3 10.7 24 24 24h16v12c0 13.3 10.7 24 24 24s24-10.7 24-24V132c0-13.3-10.7-24-24-24zm304 0c-13.3 0-24 10.7-24 24v140c0 13.3 10.7 24 24 24s24-10.7 24-24V260h16c13.3 0 24-10.7 24-24V156c0-13.3-10.7-24-24-24h-16v-12c0-13.3-10.7-24-24-24zM208 128h96c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16h-96c-8.8 0-16-7.2-16-16v-64c0-8.8 7.2-16 16-16z" />
        </svg>
      </div>

      <div className="absolute left-10 top-10 h-24 w-24 animate-bounce opacity-20" style={{ animationDelay: "0.3s" }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#4ade80">
          <path d="M104 96c-13.3 0-24 10.7-24 24v12H64c-13.3 0-24 10.7-24 24v80c0 13.3 10.7 24 24 24h16v12c0 13.3 10.7 24 24 24s24-10.7 24-24V132c0-13.3-10.7-24-24-24zm304 0c-13.3 0-24 10.7-24 24v140c0 13.3 10.7 24 24 24s24-10.7 24-24V260h16c13.3 0 24-10.7 24-24V156c0-13.3-10.7-24-24-24h-16v-12c0-13.3-10.7-24-24-24zM208 128h96c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16h-96c-8.8 0-16-7.2-16-16v-64c0-8.8 7.2-16 16-16z" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-6 flex justify-center">
          {resources.find((resource) => resource.title === "HOME_LOGO")?.resourceLink ? (
            <img
              src={resources.find((resource) => resource.title === "HOME_LOGO")?.resourceLink || "/placeholder.svg"}
              alt="Logo"
              className="h-24 w-auto drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 18h12"></path>
                <path d="M3 22h18"></path>
                <path d="M4 15h1V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11h2V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11h1"></path>
              </svg>
            </div>
          )}
        </div>

        <div className="w-full rounded-2xl border border-gray-800 bg-black/80 p-8 shadow-xl backdrop-blur-xl">
          <h1 className="mb-8 text-center text-3xl font-bold text-white">
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              New SignUp
            </span>
          </h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* First Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">First Name</label>
              <div className="group relative">
                <input
                  type="text"
                  placeholder="Enter First Name"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
                  value={inputs.firstName}
                  onChange={(e) => setInputs({ ...inputs, firstName: e.target.value })}
                />
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Last Name</label>
              <div className="group relative">
                <input
                  type="text"
                  placeholder="Enter Last Name"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
                  value={inputs.lastName}
                  onChange={(e) => setInputs({ ...inputs, lastName: e.target.value })}
                />
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <div className="group relative">
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
                  value={inputs.email}
                  onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                />
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Mobile Number</label>
              <div className="group relative">
                <input
                  type="text"
                  placeholder="Enter Mobile Number"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
                  value={inputs.mobileNumber}
                  onChange={(e) => setInputs({ ...inputs, mobileNumber: e.target.value })}
                />
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Address</label>
              <div className="group relative">
                <input
                  type="text"
                  placeholder="Enter Address"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
                  value={inputs.address}
                  onChange={(e) => setInputs({ ...inputs, address: e.target.value })}
                />
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="group relative">
                <input
                  type="password"
                  placeholder="Enter Password"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
                  value={inputs.password}
                  onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                />
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
              <div className="group relative">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
                  value={inputs.confirmPassword}
                  onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
                />
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
              </div>
              {passwordError && <p className="mt-1 text-sm text-red-500">{passwordError}</p>}
            </div>

            {/* Signup Button */}
            <div className="mt-4 md:col-span-2">
              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70"
                disabled={loading}
              >
                <span className="absolute -top-10 left-[40%] h-40 w-40 -translate-x-1/2 rounded-full bg-white/10 transition-all duration-1000 group-hover:top-[40%]"></span>
                <span className="relative flex items-center justify-center">
                  {loading ? (
                    <svg
                      className="h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "SIGNUP"
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup
