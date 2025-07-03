"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordPageContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/action`,
        handleCodeInApp: true,
      });
      
      setSuccess(true);
    } catch (error) {
      const authError = error;
      
      if (authError.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (authError.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else if (authError.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError(authError.message || "An error occurred while sending reset email");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gradient-to-b from-dark via-accent to-highlight/90 px-4 sm:px-6">
      <style jsx global>{`
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
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          transform-style: preserve-3d;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
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
          height: 48px !important;
          padding-left: 48px !important;
          font-size: 0.95rem !important;
          letter-spacing: 0.025em !important;
          border-radius: 12px !important;
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
        
        .gradient-button {
          background: linear-gradient(135deg, #0f766e, #7c3aed) !important;
          border: none !important;
          transition: all 0.3s ease !important;
          color: white !important;
          height: 48px !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
          letter-spacing: 0.025em !important;
          border-radius: 12px !important;
          position: relative;
          overflow: hidden;
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
      `}</style>
      
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-2xl shadow-2xl">
          {/* Back to Login Link */}
          <div className="mb-6">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to login
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 id="reset-password-title" className="text-3xl font-bold gradient-text mb-2">
              {success ? 'Check Your Email' : 'Reset Password'}
            </h1>
            <p className="text-gray-600">
              {success 
                ? 'We\'ve sent a password reset link to your email address'
                : 'Enter your email address and we\'ll send you a link to reset your password'
              }
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  If you don't see the email in your inbox, please check your spam folder.
                </p>
                
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="w-full gradient-button"
                >
                  Send Another Email
                </Button>
              </div>
            </div>
          ) : (
            <>
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

              <form onSubmit={handleResetPassword} className="space-y-6">
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

                <Button 
                  className="w-full gradient-button" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Sign Up Link */}
          <div className="text-center mt-8">
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
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              By using our service, you agree to our{" "}
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
  );
}

// Loading fallback component
function ResetPasswordPageFallback() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gradient-to-b from-dark via-accent to-highlight/90 px-4 sm:px-6">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="mt-2 text-sm text-gray-500">Loading reset password page...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordPageFallback />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}