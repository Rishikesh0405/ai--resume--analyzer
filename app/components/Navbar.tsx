import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const checkAuth = async () => {
    if (window.puter?.auth) {
      const signedIn = window.puter.auth.isSignedIn();
      setIsSignedIn(signedIn);
      if (signedIn) {
        try {
          const userData = await window.puter.auth.getUser();
          setUser(userData);
        } catch (err) {
          console.error("Failed to load user info:", err);
        }
      } else {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    if (window.puter) {
      checkAuth();
    } else {
      const interval = setInterval(() => {
        if (window.puter) {
          checkAuth();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    if (window.puter?.auth) {
      await window.puter.auth.signOut();
      setIsSignedIn(false);
      setUser(null);
      setIsMobileMenuOpen(false);
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4">
      {/* Floating Navbar Card */}
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md border border-slate-100 rounded-3xl px-6 sm:px-8 h-16 flex items-center justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl select-none">🎯</span>
          <span className="text-xl font-extrabold tracking-tight text-slate-800 hover:text-indigo-600 transition">
            ResumeIQ
          </span>
        </Link>

        {/* Desktop Nav Actions */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            to="/"
            className={`text-sm font-semibold transition px-3 py-1.5 rounded-lg ${
              location.pathname === "/"
                ? "text-indigo-600 bg-indigo-50/50"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            }`}
          >
            Home
          </Link>
          
          <Link
            to="/builder"
            className={`text-sm font-semibold transition px-3 py-1.5 rounded-lg ${
              location.pathname === "/builder"
                ? "text-indigo-600 bg-indigo-50/50"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            }`}
          >
            Resume Builder
          </Link>
          
          {isSignedIn && (
            <Link
              to="/upload"
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 transition-all duration-300 shadow-sm shadow-indigo-600/10"
            >
              Upload Resume
            </Link>
          )}

          {isSignedIn && <div className="h-4 w-px bg-slate-200" />}

          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 font-semibold max-w-[150px] truncate" title={user?.email}>
                {user?.username || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm font-semibold bg-red-550 hover:bg-red-600 bg-[#ef4444] text-white rounded-xl px-4 py-2 shadow-sm transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/sign-in"
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2 transition shadow-sm"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 focus:outline-none"
        >
          <span className="sr-only">Open main menu</span>
          <span className="text-lg">{isMobileMenuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 border border-slate-100 rounded-2xl bg-white/95 backdrop-blur-md px-4 py-3 space-y-2 shadow-lg">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
          >
            Home
          </Link>
          
          <Link
            to="/builder"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
          >
            Resume Builder
          </Link>
          
          {isSignedIn && (
            <Link
              to="/upload"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            >
              Upload Resume
            </Link>
          )}

          <div className="border-t border-slate-100 my-2 pt-2" />

          {isSignedIn ? (
            <div className="space-y-2 px-3">
              <p className="text-xs text-slate-400 truncate">
                Signed in as: <span className="text-slate-600 font-semibold">{user?.username || user?.email}</span>
              </p>
              <button
                onClick={handleSignOut}
                className="w-full text-center block px-3 py-2 rounded-xl text-sm font-bold text-white bg-[#ef4444] hover:bg-red-650 transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="px-3">
              <Link
                to="/sign-in"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center block bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 font-bold transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
