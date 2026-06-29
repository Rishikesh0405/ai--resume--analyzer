import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuthAndRedirect = () => {
    if (window.puter?.auth) {
      if (window.puter.auth.isSignedIn()) {
        navigate("/upload", { replace: true });
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (window.puter) {
      checkAuthAndRedirect();
    } else {
      const interval = setInterval(() => {
        if (window.puter) {
          checkAuthAndRedirect();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const handleSignIn = async () => {
    if (!window.puter?.auth) {
      setError("Puter.js is still loading. Please wait a moment.");
      return;
    }
    
    setError(null);
    setSigningIn(true);

    try {
      await window.puter.auth.signIn();
      if (window.puter.auth.isSignedIn()) {
        navigate("/upload", { replace: true });
      } else {
        throw new Error("Sign-in was cancelled or failed.");
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err?.message || "An error occurred during sign in. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl space-y-8">
        
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-indigo-500/5 items-center justify-center border border-indigo-150 text-4xl mb-2 select-none border-indigo-100">
            🎯
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Welcome to ResumeIQ
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed font-semibold">
            Get instant, AI-driven ATS scores and suggestions to optimize your resume.
          </p>
        </div>

        {/* Error messaging */}
        {error && (
          <div className="bg-red-500/10 border border-red-550/20 text-red-650 text-xs font-bold px-4 py-3.5 rounded-xl text-red-600">
            ⚠️ {error}
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-4">
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 px-4 shadow-md shadow-indigo-600/10 hover:shadow-lg transition active:scale-[0.98] cursor-pointer"
          >
            {signingIn ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <span className="text-xl">🚀</span>
                Sign in with Puter
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.setItem("mock_signed_in", "true");
              navigate("/upload", { replace: true });
            }}
            className="w-full flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl py-3 px-4 shadow-sm transition active:scale-[0.98] cursor-pointer"
          >
            <span className="text-lg">👤</span>
            Continue as Guest (Local Storage)
          </button>

          <p className="text-[10px] text-center text-slate-400 max-w-xs mx-auto leading-relaxed font-bold uppercase tracking-wider">
            ResumeIQ is serverless and runs on client-side cloud storage. No local database or configuration required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
