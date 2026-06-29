import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./app.css";
import { Navbar } from "./components/Navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* Puter.js CDN */}
        <script src="https://js.puter.com/v2/"></script>
        {/* Puter.js Graceful Local/Guest Fallback Interceptor */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function setupMockPuter() {
                  if (!window.puter) {
                    window.puter = {};
                  }
                  if (!window.puter.auth) {
                    window.puter.auth = {};
                  }
                  
                  const realIsSignedIn = window.puter.auth.isSignedIn;
                  window.puter.auth.isSignedIn = function() {
                    if (localStorage.getItem("mock_signed_in") === "true") {
                      return true;
                    }
                    return realIsSignedIn ? realIsSignedIn.apply(this, arguments) : false;
                  };

                  const realGetUser = window.puter.auth.getUser;
                  window.puter.auth.getUser = function() {
                    if (localStorage.getItem("mock_signed_in") === "true") {
                      return Promise.resolve({ username: "Guest User", email: "guest@resumeiq.local", uuid: "guest-uuid" });
                    }
                    return realGetUser ? realGetUser.apply(this, arguments) : Promise.reject("Not signed in");
                  };

                  const realSignOut = window.puter.auth.signOut;
                  window.puter.auth.signOut = function() {
                    localStorage.removeItem("mock_signed_in");
                    if (realSignOut) {
                      try {
                        return realSignOut.apply(this, arguments);
                      } catch(e) {}
                    }
                    return Promise.resolve();
                  };
                  
                  const realSignIn = window.puter.auth.signIn;
                  window.puter.auth.signIn = function() {
                    localStorage.setItem("mock_signed_in", "true");
                    return Promise.resolve();
                  };

                  // Mock KV storage if Puter's real KV is not present or if we are in mock mode
                  if (!window.puter.kv) {
                    window.puter.kv = {
                      set: function(key, value) {
                        localStorage.setItem(key, value);
                        return Promise.resolve();
                      },
                      get: function(key) {
                        return Promise.resolve(localStorage.getItem(key));
                      },
                      del: function(key) {
                        localStorage.removeItem(key);
                        return Promise.resolve();
                      },
                      list: function(pattern) {
                        const keys = [];
                        const prefix = pattern.replace("*", "");
                        for (let i = 0; i < localStorage.length; i++) {
                          const k = localStorage.key(i);
                          if (k && k.startsWith(prefix)) {
                            keys.push(k);
                          }
                        }
                        return Promise.resolve(keys);
                      }
                    };
                  }
                  
                  const realKv = window.puter.kv;
                  if (realKv && !realKv.isWrapped) {
                    window.puter.kv = {
                      isWrapped: true,
                      set: function(key, value) {
                        if (localStorage.getItem("mock_signed_in") === "true") {
                          localStorage.setItem(key, value);
                          return Promise.resolve();
                        }
                        return realKv.set(key, value);
                      },
                      get: function(key) {
                        if (localStorage.getItem("mock_signed_in") === "true") {
                          return Promise.resolve(localStorage.getItem(key));
                        }
                        return realKv.get(key);
                      },
                      del: function(key) {
                        if (localStorage.getItem("mock_signed_in") === "true") {
                          localStorage.removeItem(key);
                          return Promise.resolve();
                        }
                        return realKv.del(key);
                      },
                      list: function(pattern) {
                        if (localStorage.getItem("mock_signed_in") === "true") {
                          const keys = [];
                          const prefix = pattern.replace("*", "");
                          for (let i = 0; i < localStorage.length; i++) {
                            const k = localStorage.key(i);
                            if (k && k.startsWith(prefix)) {
                              keys.push(k);
                            }
                          }
                          return Promise.resolve(keys);
                        }
                        return realKv.list(pattern);
                      }
                    };
                  }

                  if (!window.puter.fs) {
                    window.puter.fs = {
                      upload: function(files) {
                        const f = files[0];
                        return Promise.resolve({
                          name: f.name,
                          path: "/uploads/" + f.name
                        });
                      },
                      read: function(path) {
                        return Promise.resolve(new Blob());
                      }
                    };
                  }
                }

                setupMockPuter();
                const interval = setInterval(setupMockPuter, 100);
                window.addEventListener('load', function() {
                  clearInterval(interval);
                  setupMockPuter();
                });
              })();
            `
          }}
        />
        {/* PDF.js CDN */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        {/* Google Fonts: Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
    </div>
  );
}
