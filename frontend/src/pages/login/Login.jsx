"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import useLogin from "../../hooks/useLogin"

const Login = () => {
  const [Email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { loading, loginAsAdmin } = useLogin()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await loginAsAdmin(Email, password)
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6.5 6.5h11"></path>
          <path d="M6.5 17.5h11"></path>
          <path d="M4 12h16"></path>
          <path d="M2 9v6"></path>
          <path d="M22 9v6"></path>
        </svg>
      </div>

      <div className="absolute left-10 top-10 h-24 w-24 animate-bounce opacity-20" style={{ animationDelay: "0.3s" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6.5 6.5h11"></path>
          <path d="M6.5 17.5h11"></path>
          <path d="M4 12h16"></path>
          <path d="M2 9v6"></path>
          <path d="M22 9v6"></path>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex justify-center">
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
        </div>

        <div className="w-full rounded-2xl border border-gray-800 bg-black/80 p-8 shadow-xl backdrop-blur-xl">
          <h1 className="mb-6 text-center text-3xl font-bold text-white">
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              ADMIN LOGIN
            </span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">EMAIL</label>
              <div className="group relative">
                <input
                  type="text"
                  placeholder="Enter email"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 group-hover:border-gray-600"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 group-hover:w-full"></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">PASSWORD</label>
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

            <div className="flex flex-col space-y-3 pt-2">
              <button
                type="button"
                className="group flex items-center justify-center text-sm font-medium text-green-400 transition-colors hover:text-green-300"
                onClick={() => navigate("/login")}
              >
                <span>BACK TO LOGIN AS USER</span>
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

              <button
                type="button"
                className="group flex items-center justify-center text-sm font-medium text-green-400 transition-colors hover:text-green-300"
                onClick={() => navigate(`/Forgot-password/${Email}`)}
              >
                <span>FORGOT PASSWORD?</span>
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
                  "LOGIN"
                )}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Animated fitness elements at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-16 p-4">
        <div className="h-16 w-16 animate-bounce opacity-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4ade80"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
        </div>
        <div className="h-16 w-16 animate-pulse opacity-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4ade80"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
            <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
          </svg>
        </div>
        <div className="h-16 w-16 animate-bounce opacity-20" style={{ animationDelay: "0.2s" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4ade80"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 18h12"></path>
            <path d="M3 22h18"></path>
            <path d="M4 15h1V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11h2V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11h1"></path>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default Login
