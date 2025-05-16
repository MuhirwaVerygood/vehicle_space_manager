
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { authState } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        {authState.isAuthenticated ? (
          <div className="space-y-4">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Return to Dashboard
            </Link>
            <p className="text-sm text-gray-400 mt-2">
              or{" "}
              <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
                go to Home page
              </Link>
            </p>
          </div>
        ) : (
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotFound;
