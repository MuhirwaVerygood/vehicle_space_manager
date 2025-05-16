
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { 
  ParkingMeter, 
  Car, 
  Bell, 
  Users,
  MessageSquare 
  // Using MessageSquare instead of Inbox since Inbox isn't imported
} from "lucide-react";

const Index = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate("/dashboard");
    }
  }, [authState.isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <header className="container mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-primary h-10 w-10 rounded-md flex items-center justify-center">
            <ParkingMeter className="text-white" size={20} />
          </div>
          <h1 className="ml-3 font-bold text-xl text-gray-800">ParkMaster</h1>
        </div>
        <div className="space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/login")}
            className="btn-hover"
          >
            Login
          </Button>
          <Button 
            onClick={() => navigate("/register")}
            className="btn-hover"
          >
            Register
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex items-center">
        <div className="container mx-auto px-4 py-12 md:py-24 flex flex-col md:flex-row items-center animate-fade-in">
          <div className="md:w-1/2 md:pr-12 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Efficient Vehicle Parking Management System
            </h1>
            <p className="text-xl text-gray-600">
              Streamline your parking operations with our comprehensive solution. 
              Request slots, manage vehicles, and receive real-time updates.
            </p>
            <div className="flex space-x-4 pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/register")}
                className="btn-hover"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate("/login")}
                className="btn-hover"
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-primary to-blue-400 opacity-30 blur-xl"></div>
              <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-md">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 p-4 rounded-lg flex flex-col items-center justify-center">
                    <ParkingMeter className="text-primary h-8 w-8 mb-2" />
                    <h3 className="font-medium text-gray-800">Slot Management</h3>
                    <p className="text-sm text-gray-500 text-center mt-1">
                      Efficiently manage parking slots
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <Car className="text-blue-500 h-8 w-8 mb-2" />
                    <h3 className="font-medium text-gray-800">Vehicle Registration</h3>
                    <p className="text-sm text-gray-500 text-center mt-1">
                      Add multiple vehicles easily
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <MessageSquare className="text-green-500 h-8 w-8 mb-2" />
                    <h3 className="font-medium text-gray-800">Request System</h3>
                    <p className="text-sm text-gray-500 text-center mt-1">
                      Streamlined slot request process
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <Bell className="text-yellow-500 h-8 w-8 mb-2" />
                    <h3 className="font-medium text-gray-800">Notifications</h3>
                    <p className="text-sm text-gray-500 text-center mt-1">
                      Real-time email alerts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 md:py-24">
        <div className="container mx-auto px-4 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Key Features</h2>
            <p className="text-gray-600 mt-2">
              Discover the tools that make parking management effortless
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Users className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">User Management</h3>
              <p className="text-gray-600">
                Secure registration and login system with role-based access control
              </p>
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <Car className="text-blue-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Vehicle Management</h3>
              <p className="text-gray-600">
                Register multiple vehicles with detailed information and attributes
              </p>
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-100 p-3 rounded-full w-fit mb-4">
                <ParkingMeter className="text-green-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Parking Management</h3>
              <p className="text-gray-600">
                Efficiently manage slots with location tracking and availability status
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/10 py-12 md:py-24">
        <div className="container mx-auto px-4 text-center animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to optimize your parking management?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are streamlining their parking operations with our comprehensive solution.
          </p>
          <Button 
            size="lg" 
            className="btn-hover"
            onClick={() => navigate("/register")}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white h-10 w-10 rounded-md flex items-center justify-center">
                <ParkingMeter className="text-primary" size={20} />
              </div>
              <h2 className="ml-3 font-bold text-xl">ParkMaster</h2>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 ParkMaster. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
