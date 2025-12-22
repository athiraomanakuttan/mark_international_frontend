"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, PhoneCall, Lock, Check, Users, Award, MapPin, Star } from 'lucide-react'
import { useFetchFormData } from "@/hook/FormHook"
import type { LoginType } from "@/types/form-types"
import { loginUser } from "@/service/loginService"
import { toast } from "react-toastify"
import { useAppDispatch } from "@/lib/redux/hook"
import { setUser, setLoading } from "@/lib/redux/features/userSlice"
import Cookies from "js-cookie"
import AuthDebug from "@/components/debug/AuthDebug"

interface FloatingElement {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  type: "book" | "globe" | "graduation" | "plane" | "map" | "users" | "award" | "star"
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  speedX: number
  speedY: number
  color: string
}

const LoginPage: React.FC = () => {
  const { formData, setForm } = useFetchFormData<LoginType>()
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([])
  const [particles, setParticles] = useState<Particle[]>([])

  const dispatch = useAppDispatch()
  const router = useRouter()

  useEffect(() => {
    const types: Array<"book" | "globe" | "graduation" | "plane" | "map" | "users" | "award" | "star"> = [
      "book",
      "globe",
      "graduation",
      "plane",
      "map",
      "users",
      "award",
      "star",
    ]
    const elements: FloatingElement[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 18 + 12,
      delay: Math.random() * 6,
      duration: Math.random() * 10 + 15,
      type: types[Math.floor(Math.random() * types.length)],
    }))
    setFloatingElements(elements)

    const particleColors = [
      "rgba(59, 130, 246, 0.7)",
      "rgba(99, 102, 241, 0.6)",
      "rgba(139, 92, 246, 0.5)",
      "rgba(59, 130, 246, 0.8)",
      "rgba(147, 197, 253, 0.6)",
    ]
    const initialParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      opacity: Math.random() * 0.5 + 0.4,
      speedX: (Math.random() - 0.5) * 1.2,
      speedY: (Math.random() - 0.5) * 1.2,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
    }))
    setParticles(initialParticles)

    const animateParticles = () => {
      setParticles((prevParticles) =>
        prevParticles.map((particle) => ({
          ...particle,
          x: (particle.x + particle.speedX + 100) % 100,
          y: (particle.y + particle.speedY + 100) % 100,
          opacity: 0.3 + Math.sin(Date.now() * 0.002 + particle.id) * 0.4,
        })),
      )
    }

    const interval = setInterval(animateParticles, 30)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (isLoading) return

    setIsLoading(true)
    dispatch(setLoading(true))

    try {
      // Clear any existing tokens before login
      Cookies.remove("accessToken")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      
      const response = await loginUser(formData)
      console.log("Response ==><== ", response?.data?.user?.role)

      if (response.status) {
        const accessToken = response?.data?.accessToken || response?.token || "";
        Cookies.set("accessToken", accessToken, { expires: 7 })
        dispatch(
          setUser({
            user: response?.data?.user,
            token: accessToken,
          }),
        )

        toast.success(response.message || "Welcome to Mark International!")
        // Use immediate navigation to avoid potential race conditions
        const targetPath = response?.data?.user?.role === "admin" ? "/dashboard" : "/staff/dashboard"
        router.push(targetPath)
      } else {
        dispatch(setLoading(false))
        setIsLoading(false)
        toast.error(response.message || "Login failed. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      dispatch(setLoading(false))
      setIsLoading(false)
      toast.error("An unexpected error occurred. Please try again.")
    }
  }

  const getFloatingIcon = (type: string, size: number) => {
    const iconProps = { size, className: "text-blue-300 opacity-60" }
    switch (type) {
      case "book":
        return <Users {...iconProps} />
      case "globe":
        return <Award {...iconProps} />
      case "graduation":
        return <MapPin {...iconProps} />
      case "plane":
        return <Star {...iconProps} />
      default:
        return <Users {...iconProps} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-hidden">
      <AuthDebug />
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-200/40 blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-200/35 to-teal-200/35 blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute top-10 right-1/3 w-48 h-48 rounded-full bg-gradient-to-br from-orange-200/25 to-yellow-200/25 blur-3xl animate-pulse"
          style={{ animationDelay: "6s" }}
        ></div>

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

        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full transition-all duration-75 ease-linear"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 3}px ${particle.color}, 0 0 ${
                particle.size * 6
              }px ${particle.color.replace("0.", "0.2")}`,
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </div>

      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0 opacity-8"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59,130,246,.15) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(139,69,19,.15) 2px, transparent 2px), radial-gradient(circle at 50% 50%, rgba(34,197,94,.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px, 80px 80px, 40px 40px",
          animation: "worldMove 30s linear infinite",
        }}
      />

      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* <CHANGE> make container responsive: stack on small, two columns on md+ */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row md:min-h-[600px]">
          {/* Left visual panel */}
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-12 flex items-center justify-center relative hidden md:flex">
            <div className="w-full max-w-md text-center">
              <div className="mb-10 md:mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-blue-800 mb-2 md:mb-3">Study Abroad</h2>
                <p className="text-base sm:text-lg text-blue-600">Your Gateway to Global Education</p>
              </div>

              <div className="mb-8">
                {/* <CHANGE> responsive hero image sizes only */}
                <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 mx-auto rounded-full overflow-hidden shadow-2xl border-8 border-white/80 backdrop-blur-sm relative group">
                  <img
                    src="/diverse-group-of-international-students-studying-t.png"
                    alt="International students studying abroad"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>

              <div className="animate-fade-in">
                <p className="text-lg sm:text-xl font-semibold text-blue-700 mb-1 md:mb-2">Join Thousands of Students</p>
                <p className="text-blue-600">Pursuing Dreams Worldwide</p>
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="flex-1 p-6 md:p-12 flex items-center justify-center slide-in-right">
            <div className="w-full max-w-sm">
              <div className="text-center mb-6 md:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 md:mb-2">Welcome!</h1>
                <p className="text-xs sm:text-sm text-gray-600">Start your study abroad journey</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div>
                  <div className="relative">
                    <PhoneCall className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={formData.phoneNumber || ""}
                      onChange={(e) => setForm("phoneNumber", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 md:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password || ""}
                      onChange={(e) => setForm("password", e.target.value)}
                      className="w-full pl-12 pr-12 py-3 md:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
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

              <div className="text-center mt-8">
                <p className="text-gray-600">
                  {"Don't have an account? "}
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

      <style jsx>{`
        @keyframes educationFloat {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(90deg);
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
          }
          75% {
            transform: translateY(-15px) rotate(270deg);
          }
        }

        @keyframes worldMove {
          0% {
            background-position: 0 0, 0 0, 0 0;
          }
          100% {
            background-position: 60px 60px, -80px -80px, 40px 40px;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .slide-in-left {
          animation: slideInLeft 1s ease-out;
        }

        .slide-in-right {
          animation: slideInRight 1s ease-out;
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default LoginPage