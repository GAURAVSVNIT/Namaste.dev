"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { AuthStyles } from "@/components/auth/auth-styles";

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";
  const redirectTo = searchParams.get("redirectTo") || "/chat";

  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [resending, setResending] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSessionChecking(true);
      if (user) {
        setCurrentUserEmail(user.email);
        if (user.emailVerified) {
          setMessage("Your email is already verified! Redirecting...");
          setTimeout(() => {
            router.push(redirectTo || '/chat');
          }, 2000);
        } else {
          setMessage("Please verify your email. If you received a code, enter it below, or request a new verification email.");
        }
      } else {
        setCurrentUserEmail(null);
        if (!emailFromQuery) {
           setError("No user session found. Please log in or ensure you have an email in the link to verify.");
        } else {
            setMessage(`Attempting to verify for ${emailFromQuery}. If you received a code, enter it below.`);
        }
      }
      setSessionChecking(false);
    });
    return () => unsubscribe();
  }, [router, redirectTo, emailFromQuery]);

  const handleResendOTP = async () => {
    const targetEmail = auth.currentUser?.email || emailFromQuery;
    if (!targetEmail) {
      setError("Email is required to resend verification link.");
      return;
    }

    setResending(true);
    setError(null);
    setMessage(null);

    try {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await sendEmailVerification(auth.currentUser);
        setMessage("A new verification email has been sent to your registered email address.");
      } else if (auth.currentUser && auth.currentUser.emailVerified) {
        setMessage("Your email is already verified.");
      } else {
        setError("Please ensure you are logged in with the email you want to verify, or check the email sent during signup.");
      }
    } catch (error) {
      setError(error.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  if (sessionChecking) {
    return (
      <div className="auth-container">
        <AuthStyles />
        <div className="w-full max-w-md">
          <div className="glass-card p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-teal-600 mb-4" />
            <p className="text-gray-600">Checking verification status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
<div className="auth-container" role="main" aria-labelledby="verify-email-title">
      <AuthStyles />
      
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 id="verify-email-title" className="text-3xl font-bold gradient-text mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please check your inbox for a verification link.
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive an email?{" "}
              <button 
                onClick={handleResendOTP} 
                className="text-teal-600 hover:text-teal-700 font-semibold transition-colors disabled:opacity-50"
                disabled={resending || sessionChecking}
              >
                {resending ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </span>
                ) : (
                  "Resend verification email"
                )}
              </button>
            </p>
          </div>

          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <Link 
              href="/auth/login" 
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerifyPageFallback() {
  return (
    <div className="auth-container">
      <AuthStyles />
      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600 mb-4" />
          <p className="text-gray-600">Loading verification page...</p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyPageFallback />}>
      <VerifyPageContent />
    </Suspense>
  );
}