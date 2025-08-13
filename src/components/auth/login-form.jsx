"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn, signInWithGoogle, getUserProfile } from '@/lib/firebase';

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signIn(email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Your email is not verified. Please check your inbox for a verification link or request a new one on the verification page.");
        router.push(`/verify?email=${user.email}&message=Please verify your email to log in.`);
        setLoading(false);
        return;
      }
      
      const profile = await getUserProfile(user.uid);
      
      if (!profile) {
        router.push("/");
        return;
      }
      
      // Check if user has completed onboarding
      if (!profile.onboardingCompleted && !profile.role) {
        router.push("/onboarding");
        return;
      }
      
      if (profile.role === 'admin') {
        router.push("/");
        return;
      }
      
      router.push("/");
    } catch (error) {
      const authError = error;
      
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (authError.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else if (authError.code === 'auth/too-many-requests') {
        setError('Too many unsuccessful login attempts. Please try again later.');
      } else if (authError.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.');
      } else {
        setError(authError.message || "An error occurred during login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithGoogle();
      
      // Check if this was handled by the signInWithGoogle redirect
      if (userCredential) {
        const profile = await getUserProfile(userCredential.user.uid);
        
        // Check if user has completed onboarding
        if (!profile?.onboardingCompleted && !profile?.role) {
          router.push("/onboarding");
          return;
        }
        
        if (profile?.role === 'admin') {
          router.push("/");
          return;
        }
        
        router.push("/");
      }
    } catch (error) {
      const authError = error;
      setError(authError.message || "An error occurred with Google sign in");
      setLoading(false);
    }
  };

  return (
    <div className="login-container" role="main" aria-labelledby="login-title">


      <style jsx global>{`
        .login-container {
          background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 50%, #faf5ff 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
          overflow: hidden;
          perspective: 1000px;
        }

        .login-container::before,
        .login-container::after {
          content: '';
          position: absolute;
          width: 30vw;
          height: 30vw;
          border-radius: 50%;
          filter: blur(45px);
          z-index: 0;
        }

        .login-container::before {
          background: linear-gradient(45deg, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%);
          top: -10%;
          left: -10%;
          animation: float 6s ease-in-out infinite;
        }

        .login-container::after {
          background: linear-gradient(45deg, rgba(236, 72, 153, 0.4) 0%, rgba(239, 68, 68, 0.4) 100%);
          bottom: -10%;
          right: -10%;
          animation: float 8s ease-in-out infinite reverse;
        }

        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(15px, 15px); }
          100% { transform: translate(0, 0); }
        }
        
        .glass-card {
          position: relative;
          z-index: 1;
          backdrop-filter: blur(20px) saturate(200%);
          -webkit-backdrop-filter: blur(20px) saturate(200%);
          background: linear-gradient(
            to right bottom,
            rgba(255, 255, 255, 0.9),
            rgba(255, 255, 255, 0.7),
            rgba(255, 255, 255, 0.4)
          );
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 
            0 8px 32px rgba(31, 38, 135, 0.15),
            0 4px 8px rgba(0, 0, 0, 0.05),
            inset 0 0 0 1px rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          padding: 1.5rem 1.5rem;
          width: 100%;
          max-width: 420px;
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          transform-style: preserve-3d;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin: 0.75rem 0;
        }

        .glass-card:hover {
          transform: translateY(-5px) rotateX(2deg) rotateY(2deg);
          box-shadow: 
            0 12px 40px rgba(31, 38, 135, 0.2),
            0 8px 16px rgba(0, 0, 0, 0.07),
            inset 0 0 0 1px rgba(255, 255, 255, 0.7);
        }
        
        .glass-input {
          background: rgba(255, 255, 255, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.5) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.3s ease !important;
          height: 44px !important;
          padding: 0.5rem 1rem 0.5rem 48px !important;
          font-size: 0.95rem !important;
          letter-spacing: 0.025em !important;
          border-radius: 12px !important;
          margin-bottom: 0.75rem;
          width: 100%;
        }
        
        .glass-input:focus {
          background: rgba(255, 255, 255, 0.95) !important;
          border-color: rgba(20, 184, 166, 0.8) !important;
          box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.15) !important;
          outline: none !important;
          transform: translateY(-1px);
        }

        .glass-input:hover {
          background: rgba(255, 255, 255, 0.9) !important;
          border-color: rgba(20, 184, 166, 0.4) !important;
        }
        
        .glass-button {
          background: rgba(255, 255, 255, 0.4) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: all 0.3s ease !important;
          color: #374151 !important;
        }
        
        .glass-button:hover {
          background: rgba(255, 255, 255, 0.6) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
        
        .gradient-button {
          background: linear-gradient(135deg, #0f766e, #7c3aed) !important;
          border: none !important;
          transition: all 0.3s ease !important;
          color: white !important;
          height: 52px !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
          letter-spacing: 0.025em !important;
          border-radius: 12px !important;
          position: relative;
          overflow: hidden;
          width: 100%;
          margin: 1rem 0 0.75rem 0;
          padding: 0.75rem 1.5rem;
        }
        
        .gradient-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0d5757, #6d28d9);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .gradient-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(15, 118, 110, 0.4) !important;
        }
        
        .gradient-button:hover::before {
          opacity: 1;
        }
        
        .gradient-button > * {
          position: relative;
          z-index: 1;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #0f766e, #7c3aed);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          z-index: 10;
          width: 20px;
          height: 20px;
        }
        
        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          cursor: pointer;
          z-index: 10;
          transition: color 0.2s ease;
          width: 20px;
          height: 20px;
          background: transparent;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .password-toggle:hover {
          color: #6b7280;
        }
      `}</style>
      <div className="w-full max-w-md px-4 sm:px-6">
        {/* Floating Login Card */}
        <div className="glass-card p-4 sm:p-6 rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <h1 id="login-title" className="text-3xl font-bold gradient-text mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to your Fashion-Hub account
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors group-hover:text-primary" size={20} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
              </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="input-icon h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input pl-12 pr-12 h-12 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 focus:ring-offset-0 transition-colors duration-200"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600 select-none hover:text-gray-800 transition-colors duration-200">
                    Remember me
                  </label>
                </div>
                <Link 
                  href="/auth/reset-password" 
                  className="text-sm font-medium text-primary hover:text-primary-dark focus:outline-none focus:text-primary-dark transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>
              <Button 
                className="w-full h-11 bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 focus:ring-4 focus:ring-teal-200 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl" 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200/60"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-gray-500 bg-white/80 backdrop-blur-sm rounded-full py-1">
                    or continue with
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-12 bg-white/90 hover:bg-white text-gray-700 font-medium border border-gray-200/60 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-lg hover:shadow-gray-200/40 hover:transform hover:-translate-y-0.5 backdrop-blur-sm"
                disabled={loading}
              >
                <img src="/images/google.svg" alt="Google" className="h-5 w-5" />
                <span className="text-gray-700 font-semibold">Continue with Google</span>
              </Button>


            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-teal-600 hover:text-teal-700 transition-colors font-semibold inline-flex items-center group"
                >
                  Sign up for free
                  <svg className="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </p>
            </div>
            
            {/* Terms */}
            <div className="text-center mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="text-teal-600 hover:text-teal-700 transition-colors underline decoration-teal-600/30 hover:decoration-teal-600">
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-teal-600 hover:text-teal-700 transition-colors underline decoration-teal-600/30 hover:decoration-teal-600">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}