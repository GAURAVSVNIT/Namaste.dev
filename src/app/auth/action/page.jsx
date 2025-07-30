"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
} from "firebase/auth";
import { Loader2 } from "lucide-react";
import { AuthStyles } from "@/components/auth/auth-styles";

function AuthActionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  let mode = searchParams.get("mode");
  let oobCode = searchParams.get("oobCode");
  
  // Log all search parameters for debugging
  console.log("All URL search params:", Object.fromEntries([...searchParams.entries()]));
  
  // Check for continueUrl parameter that might contain encoded mode and oobCode
  const continueUrl = searchParams.get("continueUrl");
  console.log("Initial values:", { mode, oobCode, continueUrl });
  
  if (continueUrl) {
    try {
      const continueUrlObj = new URL(continueUrl);
      console.log("Parsed continueUrl:", continueUrlObj.toString());
      console.log("continueUrl search params:", continueUrlObj.search);
      
      const continueParams = new URLSearchParams(continueUrlObj.search);
      console.log("continueParams entries:", Object.fromEntries([...continueParams.entries()]));
      
      // Extract mode and oobCode from continueUrl if present
      if (!mode) {
        mode = continueParams.get("mode");
        console.log("mode from continueUrl:", mode);
      }
      if (!oobCode) {
        oobCode = continueParams.get("oobCode");
        console.log("oobCode from continueUrl:", oobCode);
      }
      
      // Check if mode and oobCode might be double-encoded
      if (!mode || !oobCode) {
        try {
          // Try to decode the continueUrl once more in case it's double-encoded
          const decodedUrl = decodeURIComponent(continueUrl);
          const decodedUrlObj = new URL(decodedUrl);
          const decodedParams = new URLSearchParams(decodedUrlObj.search);
          
          console.log("Decoded continueUrl:", decodedUrl);
          console.log("Decoded params:", Object.fromEntries([...decodedParams.entries()]));
          
          if (!mode) mode = decodedParams.get("mode");
          if (!oobCode) oobCode = decodedParams.get("oobCode");
          
          console.log("After double-decode attempt:", { mode, oobCode });
        } catch (decodeErr) {
          console.error("Error attempting to decode continueUrl:", decodeErr);
        }
      }
    } catch (err) {
      console.error("Error parsing continueUrl:", err);
    }
  }

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [emailForReset, setEmailForReset] = useState(null);

  useEffect(() => {
    console.log("useEffect running with:", { mode, oobCode });
    
    if (mode === "resetPassword" && oobCode) {
      console.log("Handling resetPassword action with code:", oobCode);
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          console.log("Password reset code verified for email:", email);
          setEmailForReset(email);
          setMessage("Please enter your new password.");
          setIsVerifying(false);
        })
        .catch((err) => {
          console.error("Invalid or expired oob code for password reset:", err);
          setError(
            "Invalid or expired password reset link. Please try resetting your password again."
          );
          setIsVerifying(false);
        });
    } else if (mode === "verifyEmail" && oobCode) {
      console.log("Handling verifyEmail action with code:", oobCode);
      applyActionCode(auth, oobCode)
        .then(async () => {
          console.log("Email verification successful");
          setMessage(
            "Your email address has been verified successfully! Setting up your profile..."
          );
          setIsVerifying(false);
          
          // Check if user has completed onboarding
          try {
            const { getUserById } = await import('@/lib/user');
            const user = auth.currentUser;
            
            if (user) {
              const userProfile = await getUserById(user.uid);
              
              // If user doesn't have a role (new user), redirect to onboarding
              if (!userProfile?.role) {
                setTimeout(() => router.push("/onboarding"), 2000);
                return;
              }
            }
          } catch (error) {
            console.error('Error checking user profile:', error);
          }
          
          setTimeout(() => router.push("/"), 3000);
        })
        .catch((err) => {
          console.error("Error verifying email:", err);
          setError(
            "Failed to verify email. The link may be invalid, expired, or the email may already be verified. Please try logging in or request a new verification email if needed."
          );
          setIsVerifying(false);
        });
    } else {
      console.error("No valid action detected:", { mode, oobCode });
      setError(
        mode ? "Invalid action or missing code." : "No action specified. Please check the link."
      );
      setIsVerifying(false);
    }
  }, [mode, oobCode, router]);

  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!oobCode) {
      setError("Missing reset code. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage(
        "Your password has been reset successfully! You can now log in with your new password."
      );
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => router.push("auth/login?message=Password reset successfully"), 3000);
    } catch (err) {
      console.error("Error confirming password reset:", err);
      setError(
        "Failed to reset password. The link may have expired or been used already. Please try resetting your password again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="auth-container">
        <AuthStyles />
        <div className="w-full max-w-md">
          <div className="glass-card p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-teal-600 mb-4" />
            <p className="text-gray-600">Verifying link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (mode !== "resetPassword" || !emailForReset) {
    if (mode === "verifyEmail" && !error && message) {
      return (
        <div className="auth-container" role="main" aria-labelledby="email-verified-title">
          <AuthStyles />
          <div className="w-full max-w-md">
            <div className="glass-card p-8 rounded-2xl shadow-2xl text-center">
              <div className="text-center mb-8">
                <h1 id="email-verified-title" className="text-3xl font-bold gradient-text mb-2">
                  Email Verified!
                </h1>
                <p className="text-gray-600">
                  Your email has been successfully verified.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-sm mb-6">
                <p>{message}</p>
              </div>
              
              <Link 
                href="auth/login" 
                className="gradient-button inline-flex items-center justify-center px-6"
              >
                Proceed to Login
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="auth-container" role="main" aria-labelledby="action-required-title">
        <AuthStyles />
        <div className="w-full max-w-md">
          <div className="glass-card p-8 rounded-2xl shadow-2xl text-center">
            <div className="text-center mb-8">
              <h1 id="action-required-title" className="text-3xl font-bold gradient-text mb-2">
                Action Required
              </h1>
              <p className="text-gray-600">
                Please complete the requested action to continue.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm mb-6">
                <p>{error}</p>
              </div>
            )}
            
            {message && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg text-sm mb-6">
                <p>{message}</p>
              </div>
            )}
            
            <Link 
              href="auth/login" 
              className="gradient-button inline-flex items-center justify-center px-6"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" role="main" aria-labelledby="set-password-title">
      <AuthStyles />
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 id="set-password-title" className="text-3xl font-bold gradient-text mb-2">
              Set New Password
            </h1>
            <p className="text-gray-600">
              Enter a new password for {emailForReset}.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm mb-6">
              <p>{error}</p>
            </div>
          )}
          {message && !error && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-sm mb-6">
              <p>{message}</p>
            </div>
          )}

          <form onSubmit={handleConfirmResetPassword} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="text-sm font-medium"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="glass-input w-full"
                  required
                  minLength={6}
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="confirmNewPassword"
                className="text-sm font-medium"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="glass-input w-full"
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || isVerifying}
              className="gradient-button w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Resetting...</span>
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
          
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <p className="text-gray-600 text-sm">
              Remember your password?{" "}
              <Link 
                href="auth/login" 
                className="text-teal-600 hover:text-teal-700 transition-colors font-semibold"
              >
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthActionPageFallback() {
  return (
    <div className="auth-container">
      <AuthStyles />
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600 mb-4" />
          <p className="text-gray-600">Loading action page...</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={<AuthActionPageFallback />}>
      <AuthActionPageContent />
    </Suspense>
  );
}
