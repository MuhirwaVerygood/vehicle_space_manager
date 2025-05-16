
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { User, LogOut, Settings, Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState(0);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {authState.user?.role === "admin" ? "Admin Portal" : "User Dashboard"}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
                    {notifications}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="font-medium flex justify-between items-center">
                  <h3>Notifications</h3>
                  {notifications > 0 ? (
                    <Button variant="ghost" size="sm" onClick={() => setNotifications(0)}>
                      Clear all
                    </Button>
                  ) : null}
                </div>
                {notifications > 0 ? (
                  <div className="space-y-2">
                    <div className="border-b pb-2">
                      <p className="text-sm">Your parking request has been approved</p>
                      <p className="text-xs text-gray-500">10 minutes ago</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No new notifications</p>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white">
                    {authState.user ? getInitials(authState.user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{authState.user?.name}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <p className="font-medium text-sm text-gray-700">{authState.user?.name}</p>
                <p className="text-xs text-gray-500">{authState.user?.email}</p>
                <p className="text-xs font-semibold text-primary">
                  {authState.user?.role.charAt(0).toUpperCase() + authState.user?.role.slice(1)}
                </p>
              </div>
              <div className="border-t my-2"></div>
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm" 
                  onClick={() => navigate('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm" 
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm text-red-500 hover:text-red-700 hover:bg-red-50" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};

export default Header;
