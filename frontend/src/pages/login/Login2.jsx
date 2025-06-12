"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import useLogin from "../../hooks/useLogin"
import useSignup from "../../hooks/useSignup"
import axios from "axios"
import toast from "react-hot-toast"

const Login2 = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [state1, setState1] = useState(true)
  const [loadingResources, setLoadingResources] = useState(false)
  const [resources, setResources] = useState([])
  const [message, setMessage] = useState(null) // State for messages
  const [inputs, setInputs] = useState({
    password: "",
    confirmPassword: "",
  })
  const navigate = useNavigate()
  const { login } = useLogin()
  const { signup } = useSignup()

  const fetchResources = async () => {
    try {
      setLoadingResources(true)
      const response = await axios.get("http://localhost:5000/api/Admin/AllResources")
      setResources(response.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoadingResources(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const showMessage = (msg, type = "error") => {
    setMessage({ text: msg, type })
    setTimeout(() => setMessage(null), 8000)
  }

  const checkEmail = async (email) => {
    if (!email) {
      return
    }
    try {
      const response = await axios.post("http://localhost:5000/api/auth/check-email", { email })
      console.log(response)
      setIsAdmin(response.data.isAdmin)
      if (!response.data.exists && response.data.Status === "NOT-FOUND") {
        toast.error("User doesn't exists, Buy Membership")
        navigate("/tariff")
      } else if (response.data.exists && response.data.Status === "null") {
        toast.error("Buy a Membership to continue")
        navigate("/tariff", { state: { Status: response.data.Status } })
      } else if (
        response.data.exists &&
        response?.data?.Status?.toLowerCase() === "expired" &&
        response.data.passwordField === "not-null"
      ) {
        toast.error("Membership Expired, Buy a Membership to continue")
        navigate("/tariff", { state: { Status: response.data.Status } })
      } else if (
        response.data.exists &&
        response?.data?.Status?.toLowerCase() === "expired" &&
        response.data.passwordField === "null"
      ) {
        toast.error("Membership Expired, Buy a Membership to continue")
        navigate("/tariff", { state: { Status: response.data.Status } })
      } else if (
        response.data.exists &&
        response?.data?.Status?.toLowerCase() === "active" &&
        response.data.passwordField === "not-null"
      ) {
        setEmailExists(response.data.exists)
        setState1(false)
      } else if (
        response.data.exists &&
        response.data.Status?.toLowerCase() === "active" &&
        response.data.passwordField === "null"
      ) {
        setEmailExists(!response.data.exists)
        await sendOtp(email)
        setOtpSent(true)
      } else if (response.data.exists && response.data.isAdmin === true && response.data.Status === "ADMIN") {
        setEmailExists(response.data.exists)
        setState1(false)
      }
    } catch (error) {
      showMessage("Error checking email.")
    }
  }

  const sendOtp = async (email) => {
    try {
      if (email) {
        setLoading(true)
        await axios.post(
          "http://localhost:5000/api/auth/send-otp",
          {
            email,
            reason: "FOR NEW USER REGISTRATION",
          },
          { withCredentials: true },
        )
        setOtpSent(true)
        setLoading(false)
        showMessage("OTP sent successfully!", "success")
      }
    } catch (error) {
      showMessage("Error sending OTP.")
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { email, otp },
        { withCredentials: true },
      )
      if (response.data.verified) {
        setOtpVerified(true)
        setInputs((prev) => ({ ...prev, email }))
        showMessage("OTP Verified. Please set your new Password.", "success")
      } else {
        showMessage("Invalid OTP. Please try again.")
      }
    } catch (error) {
      showMessage("Error verifying OTP.")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setInputs((prev) => ({ ...prev, [name]: value }))
  }

  const normalizeEmail = (email) => email.trim().toLowerCase()

  const handleSaveNewPassword = async () => {
    if (inputs.password !== inputs.confirmPassword) {
      showMessage("Passwords do not match.")
      return
    }
    try {
      const response = await axios.put("http://localhost:5000/api/auth/save-new-password", {
        email,
        password: inputs.password,
      })
      if (response.data.success) {
        showMessage("Password saved successfully! You can now login.", "success")
        setInputs({
          password: "",
          confirmPassword: "",
        })
        setState1(false)
        setTimeout(() => {
          navigate(0) // Refresh the current page
        }, 1000)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (emailExists && !isAdmin) {
      if (password) {
        await login(email, password)
      } else if (otpVerified) {
        showMessage("Logged in using OTP!", "success")
      } else {
        showMessage("Enter either password or verify OTP.")
      }
    } else if (emailExists && isAdmin) {
      await login(email, password)
    } else if (otpVerified) {
      try {
        await signup(inputs)
        showMessage("Account created successfully! You can now log in.", "success")
      } catch (error) {
        showMessage("Error registering user.")
      }
    }
  }

  const handlesubmit2 = async (e) => {
    if (password) {
      await login(email, password)
    }
  }

  if (loadingResources) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    )
  }

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

      {/* Animated fitness icons */}
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
      <div className="relative z-10 w-full max-w-md">
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
          <h1 className="mb-6 text-center text-3xl font-bold text-white">
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">Login</span>
          </h1>

          <form
            onSubmit={(e) => {
              if (!otpVerified) {
                handleSubmit(e)
                checkEmail(email)
              } else {
                e.preventDefault() // Prevent form submission when setting a new password
              }
            }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">EMAIL</label>
              <div className="group relative">
                <input
                  type="text"
                  placeholder="Enter email"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
                  value={email}
                  onChange={(e) => {
                    setEmail(normalizeEmail(e.target.value))
                    setOtpVerified(false)
                    setOtp("")
                    setPassword("")
                  }}
                />
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
              </div>
            </div>

            {message && (
              <div
                className={`flex items-center rounded-lg ${message.type === "success" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"} px-4 py-2`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {message.type === "success" ? (
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  ) : (
                    <circle cx="12" cy="12" r="10"></circle>
                  )}
                  {message.type === "success" ? (
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  ) : (
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                  )}
                  {message.type === "error" && <line x1="12" y1="16" x2="12.01" y2="16"></line>}
                </svg>
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            {otpSent && !otpVerified && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">OTP</label>
                  <div className="group relative">
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
                  </div>
                </div>
                <button
                  type="button"
                  className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70"
                  onClick={verifyOtp}
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
                      "Verify OTP"
                    )}
                  </span>
                </button>
              </div>
            )}

            {!emailExists && otpVerified && state1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <div className="group relative">
                    <input
                      type="password"
                      name="password"
                      placeholder="Create Password"
                      className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
                      value={inputs.password}
                      onChange={handleInputChange}
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                  <div className="group relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
                      value={inputs.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
                  </div>
                </div>
              </div>
            )}

            {emailExists && !state1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <div className="group relative">
                    <input
                      type="password"
                      placeholder="Enter Password"
                      className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    className="group flex items-center justify-end text-sm font-medium text-green-400 transition-colors hover:text-green-300"
                    onClick={() => navigate(`/Forgot-password/${email}`)}
                  >
                    <span>Forgot Password?</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center">
                <svg
                  className="h-6 w-6 animate-spin text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : otpVerified && state1 ? (
              <button
                type="button"
                onClick={() => {
                  handleSaveNewPassword()
                }}
                className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <span className="absolute -top-10 left-[40%] h-40 w-40 -translate-x-1/2 rounded-full bg-white/10 transition-all duration-1000 group-hover:top-[40%]"></span>
                <span className="relative flex items-center justify-center">SET PASSWORD</span>
              </button>
            ) : (
              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70"
                disabled={loading}
              >
                <span className="absolute -top-10 left-[40%] h-40 w-40 -translate-x-1/2 rounded-full bg-white/10 transition-all duration-1000 group-hover:top-[40%]"></span>
                <span className="relative flex items-center justify-center">Submit</span>
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login2
