import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { FEATURES, HOW_IT_WORKS } from "../../constants";

export const HomePage: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAuth = () => {
      if (window.puter?.auth) {
        setIsSignedIn(window.puter.auth.isSignedIn());
        setCheckingAuth(false);
      }
    };

    if (window.puter) {
      verifyAuth();
    } else {
      const interval = setInterval(() => {
        if (window.puter) {
          verifyAuth();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const ctaLink = checkingAuth ? "/sign-in" : isSignedIn ? "/upload" : "/sign-in";
  const ctaText = checkingAuth ? "Get Started" : isSignedIn ? "Go to Dashboard" : "Get Started For Free";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 space-y-8">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider">
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight md:leading-none">
            Get Your Resume{" "}
            <span className="bg-gradient-to-r from-indigo-550 via-purple-500 to-indigo-650 bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              ATS Score
            </span>{" "}
            Instantly
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Upload your resume, enter the target job description, and let our advanced AI analyzer optimize it for corporate screening systems in seconds.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={ctaLink}
              className="w-full sm:w-auto text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-8 py-4 transition-all duration-300 shadow-md shadow-indigo-600/10 hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              {ctaText}
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto text-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-8 py-4 transition shadow-sm"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-slate-100 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Powerful Features to Land the Interview
            </h2>
            <p className="text-sm text-slate-400 font-bold max-w-md mx-auto">
              Optimized parsing and structural assessment driven by multi-modal AI feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 shadow-sm rounded-3xl p-8 hover:border-indigo-500/20 hover:-translate-y-1 transition duration-300 space-y-5"
              >
                <div className="text-4xl select-none">{feat.icon}</div>
                <h3 className="text-lg font-bold text-slate-800">{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              How It Works
            </h2>
            <p className="text-sm text-slate-400 font-bold max-w-md mx-auto">
              Follow our simple three-step process to optimize your resume score.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((work, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 rounded-3xl p-8 relative flex flex-col justify-between hover:border-indigo-500/20 shadow-sm transition group duration-300"
              >
                <div className="absolute top-6 right-8 text-5xl font-extrabold text-indigo-600/5 select-none group-hover:text-indigo-600/10 transition">
                  {work.step}
                </div>
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-extrabold text-slate-800">{work.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{work.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="py-20 border-t border-slate-100 bg-white/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Ready to Beat the Application Filters?</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Sign in with Puter to upload your PDF, analyze it against open roles, and keep a history of past scans.
          </p>
          <div className="pt-2">
            <Link
              to={ctaLink}
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-8 py-4 shadow-md shadow-indigo-600/10 hover:shadow-lg transition cursor-pointer"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span className="text-sm font-bold text-slate-800">ResumeIQ</span>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            &copy; {new Date().getFullYear()} ResumeIQ. Built serverless with Puter.js and React Router.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
