"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Eye, EyeOff, PhoneCall, Lock, Check, BookOpen, Globe, GraduationCap, Plane } from "lucide-react"
import { useFetchFormData } from "@/hook/FormHook"
import type { LoginType } from "@/types/form-types"
import { loginUser } from "@/service/loginService"
import { toast } from "react-toastify"

interface FloatingElement {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  type: "book" | "globe" | "graduation" | "plane"
}

const LoginPage: React.FC = () => {
  const { formData, setForm } = useFetchFormData<LoginType>()
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    // Generate education-themed floating elements
    const types: Array<"book" | "globe" | "graduation" | "plane"> = ["book", "globe", "graduation", "plane"]
    const elements: FloatingElement[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      duration: Math.random() * 8 + 12,
      type: types[Math.floor(Math.random() * types.length)],
    }))
    setFloatingElements(elements)
  }, [])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(async () => {
      const response = await loginUser(formData)

      if (response.status) {
        toast.success(response.message || "Welcome to your study abroad journey!")
      } else {
        toast.error(response.message || "Login failed. Please try again.")
      }

      setIsLoading(false)
    }, 2000)
  }

  const getFloatingIcon = (type: string, size: number) => {
    const iconProps = { size, className: "text-blue-300 opacity-60" }
    switch (type) {
      case "book":
        return <BookOpen {...iconProps} />
      case "globe":
        return <Globe {...iconProps} />
      case "graduation":
        return <GraduationCap {...iconProps} />
      case "plane":
        return <Plane {...iconProps} />
      default:
        return <BookOpen {...iconProps} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Education-themed animated background */}
      <div className="absolute inset-0">
        {/* Gradient orbs with education colors */}
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-200/40 blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-200/35 to-teal-200/35 blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Floating education icons */}
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animation: `educationFloat ${element.duration}s infinite ease-in-out`,
              animationDelay: `${element.delay}s`,
            }}
          >
            {getFloatingIcon(element.type, element.size)}
          </div>
        ))}
      </div>

      {/* Animated world map pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59,130,246,.2) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(139,69,19,.2) 2px, transparent 2px)`,
          backgroundSize: "60px 60px",
          animation: "worldMove 25s linear infinite",
        }}
      />

      <style jsx>{`
        @keyframes educationFloat {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 0.6;
          }
          25% { 
            transform: translateY(-30px) rotate(90deg) scale(1.1); 
            opacity: 0.8;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg) scale(0.9); 
            opacity: 0.7;
          }
          75% { 
            transform: translateY(-35px) rotate(270deg) scale(1.05); 
            opacity: 0.9;
          }
        }
        
        @keyframes worldMove {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(60px, 60px) rotate(360deg); }
        }
        
        @keyframes slideInLeft {
          from { 
            opacity: 0; 
            transform: translateX(-50px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes slideInRight {
          from { 
            opacity: 0; 
            transform: translateX(50px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes bookFlip {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
        }
        
        @keyframes globeSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .slide-in-left { 
          animation: slideInLeft 0.8s ease-out; 
        }
        .slide-in-right { 
          animation: slideInRight 0.8s ease-out; 
        }
      `}</style>

      {/* Main container */}
      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] flex">
          {/* Left side - Study Abroad Illustration */}
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 p-12 flex items-center justify-center slide-in-left">
            <div className="relative w-full max-w-md">
              {/* Background circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-indigo-200/50 rounded-full transform scale-110 animate-pulse"></div>

              {/* Study abroad illustration */}
              <div className="relative z-10 flex items-center justify-center h-80">
                {/* Desk */}
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="w-52 h-4 bg-gradient-to-r from-amber-300 to-orange-300 rounded-lg shadow-lg"></div>
                  <div className="w-2 h-16 bg-gradient-to-b from-amber-400 to-amber-500 absolute left-4 -bottom-16"></div>
                  <div className="w-2 h-16 bg-gradient-to-b from-amber-400 to-amber-500 absolute right-4 -bottom-16"></div>
                </div>

                {/* Student 1 - studying */}
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 -translate-x-12">
                  {/* Body */}
                  <div className="w-8 h-14 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full"></div>
                  {/* Head */}
                  <div className="w-7 h-7 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full absolute -top-5 left-0.5"></div>
                  {/* Hair */}
                  <div className="w-8 h-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full absolute -top-7 left-0"></div>
                  {/* Book */}
                  <div className="w-6 h-4 bg-gradient-to-br from-red-400 to-red-500 rounded absolute top-4 -right-1 transform -rotate-12 animate-pulse"></div>
                </div>

                {/* Student 2 - with laptop */}
                <div className="absolute bottom-20 right-1/2 transform translate-x-1/2 translate-x-8">
                  {/* Body */}
                  <div className="w-7 h-12 bg-gradient-to-b from-purple-400 to-purple-500 rounded-full"></div>
                  {/* Head */}
                  <div className="w-6 h-6 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full absolute -top-4 left-0.5"></div>
                  {/* Hair */}
                  <div className="w-7 h-3 bg-gradient-to-br from-brown-600 to-brown-700 rounded-full absolute -top-6 left-0"></div>
                  {/* Laptop */}
                  <div className="w-8 h-5 bg-gradient-to-br from-gray-300 to-gray-400 rounded absolute top-2 -right-1 transform rotate-6"></div>
                  <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-blue-500 absolute top-2 -right-1 transform rotate-6"></div>
                </div>

                {/* World Map on wall */}
                <div className="absolute top-8 left-8 w-16 h-12 bg-gradient-to-br from-green-200 to-green-300 rounded-lg border-2 border-brown-400">
                  <div className="w-3 h-2 bg-brown-500 absolute top-1 left-2 rounded"></div>
                  <div className="w-2 h-3 bg-brown-500 absolute top-2 right-3 rounded"></div>
                  <div className="w-4 h-1 bg-brown-500 absolute bottom-2 left-1 rounded"></div>
                </div>

                {/* Globe */}
                <div className="absolute top-12 right-8">
                  <div
                    className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full relative"
                    style={{ animation: "globeSpin 8s linear infinite" }}
                  >
                    <div className="w-2 h-3 bg-green-400 absolute top-1 left-1 rounded"></div>
                    <div className="w-1.5 h-2 bg-green-400 absolute bottom-1 right-1 rounded"></div>
                  </div>
                  <div className="w-1 h-6 bg-gray-600 absolute -bottom-6 left-1/2 transform -translate-x-1/2"></div>
                </div>

                {/* Books stack */}
                <div className="absolute bottom-20 left-8">
                  <div className="w-8 h-2 bg-red-400 rounded"></div>
                  <div className="w-7 h-2 bg-blue-400 rounded absolute top-2"></div>
                  <div className="w-9 h-2 bg-green-400 rounded absolute top-4"></div>
                </div>

                {/* Graduation cap */}
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-1 bg-black rounded-full"></div>
                  <div className="w-6 h-6 bg-black absolute -top-3 left-1 transform rotate-12"></div>
                  <div className="w-1 h-3 bg-yellow-400 absolute -top-1 right-0"></div>
                </div>

                {/* Airplane */}
                <div className="absolute top-6 right-16">
                  <Plane
                    className="w-6 h-6 text-blue-500 transform rotate-45 animate-bounce"
                    style={{ animationDuration: "3s" }}
                  />
                </div>

                {/* Floating educational elements */}
                <div
                  className="absolute bottom-8 right-16 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="absolute top-20 left-16 w-2 h-2 bg-pink-400 rounded-full animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
                <div
                  className="absolute top-32 right-4 w-2.5 h-2.5 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: "1.5s" }}
                ></div>

                {/* Study abroad text elements */}
                <div className="absolute bottom-4 left-4 text-xs text-blue-600 font-semibold opacity-60">STUDY</div>
                <div className="absolute bottom-4 right-4 text-xs text-purple-600 font-semibold opacity-60">ABROAD</div>
              </div>

              {/* Pagination dot */}
              <div className="flex justify-center mt-8">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="flex-1 p-12 flex items-center justify-center slide-in-right">
            <div className="w-full max-w-sm">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h1>
                <p className="text-gray-600 text-sm">Start your study abroad journey</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email field */}
                <div>
                  <div className="relative">
                    <PhoneCall className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={formData.phoneNumber || ""}
                      onChange={(e) => setForm("phoneNumber", e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="phone number"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password || ""}
                      onChange={(e) => setForm("password", e.target.value)}
                      className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember me and Forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
                          rememberMe ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-green-400"
                        }`}
                      >
                        {rememberMe && <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />}
                      </div>
                    </div>
                    <span className="ml-3 text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300">
                    Forgot password?
                  </a>
                </div>

                {/* Sign in button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              {/* Sign up link */}
              <div className="text-center mt-8">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300"
                  >
                    Sign up
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
