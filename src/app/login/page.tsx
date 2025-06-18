'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, User, Zap, ArrowRight } from 'lucide-react';
import  {useFetchFormData} from '@/hook/FormHook'
import { LoginType } from '@/types/formTypes';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const LoginPage: React.FC = () => {
  const {formData, setForm} = useFetchFormData<LoginType>()
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<string>('');

  useEffect(() => {
    const elements: FloatingElement[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 20,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15,
    }));
    setFloatingElements(elements);
  }, []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      console.log(formData)
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #405189 50%, #1e40af 100%)' }}>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ backgroundColor: '#405189' }}></div>
        <div className="absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ backgroundColor: '#6366f1', animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ backgroundColor: '#3b82f6', animationDelay: '4s' }}></div>
        
        {/* Floating geometric shapes */}
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute opacity-10"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.size}px`,
              height: `${element.size}px`,
              animation: `float ${element.duration}s infinite ease-in-out`,
              animationDelay: `${element.delay}s`,
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-white to-transparent rounded-lg transform rotate-45"></div>
          </div>
        ))}
      </div>

      {/* Animated grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(64, 81, 137, 0.3); }
          50% { box-shadow: 0 0 30px rgba(64, 81, 137, 0.5); }
        }
        
        .slide-up { animation: slideUp 0.8s ease-out; }
        .input-glow { animation: glow 2s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          
          {/* Logo Section */}
          <div className="text-center mb-8 slide-up">
            <div className="inline-block relative group">
              <div className="absolute -inset-4 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-300" style={{ background: 'linear-gradient(45deg, #405189, #6366f1)' }}></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20 group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/uploads/main-logo.jpg" 
                  alt="Mark International Logo" 
                  className="h-16 w-auto object-contain max-w-[200px] mx-auto"
                />
              </div>
            </div>
            <h1 className="mt-6 text-3xl font-bold text-white">Welcome Back</h1>
            <p className="mt-2 text-gray-300">Sign in to your account</p>
          </div>

          {/* Login Card */}
          <div className="slide-up bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20" style={{ animationDelay: '0.2s' }}>
            
            <div className="space-y-6">
              
              {/* Username Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200 ml-1">Username</label>
                                  <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setForm('userName',e.target.value)}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput('')}
                    className={`w-full pl-12 pr-4 py-4 bg-black/20 border-2 ${
                      focusedInput === 'username' ? 'border-blue-400 input-glow' : 'border-gray-600'
                    } rounded-xl focus:outline-none transition-all duration-300 text-white placeholder-gray-400`}
                    style={{
                      focusBorderColor: '#405189',
                      '--focus-color': '#405189'
                    }}
                    placeholder="Enter username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setForm('password',e.target.value)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput('')}
                    className={`w-full pl-12 pr-12 py-4 bg-black/20 border-2 ${
                      focusedInput === 'password' ? 'border-blue-400 input-glow' : 'border-gray-600'
                    } rounded-xl focus:outline-none transition-all duration-300 text-white placeholder-gray-400`}
                    style={{
                      focusBorderColor: '#405189'
                    }}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                 
                </label>
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors" style={{ color: '#6b9eff' }}>
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden rounded-xl p-[2px] transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
                style={{ background: 'linear-gradient(45deg, #405189, #6366f1)' }}
                onClick={handleSubmit}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" style={{ background: 'linear-gradient(45deg, #405189, #6366f1)' }}></div>
                <div className="relative text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300" style={{ background: 'linear-gradient(45deg, #405189, #5a67d8)' }}>
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>

            </div>

            {/* Footer */}
            
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center slide-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-gray-400 text-sm">
              Don't have an account? 
              <a href="#" className="text-blue-400 hover:text-blue-300 ml-1 transition-colors" style={{ color: '#6b9eff' }}>
                Contact Support
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;