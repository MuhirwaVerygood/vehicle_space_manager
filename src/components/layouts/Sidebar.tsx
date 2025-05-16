
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { 
  Car, 
  ParkingMeter, 
  Inbox, 
  Users, 
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const { authState } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Define navigation items based on user role
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home size={20} />,
      roles: ["USER", "ADMIN"],
    },
    {
      name: "Vehicles",
      path: "/vehicles",
      icon: <Car size={20} />,
      roles: ["USER", "ADMIN"],
    },
    {
      name: "Parking Slots",
      path: "/slots",
      icon: <ParkingMeter size={20} />,
      roles: ["USER", "ADMIN"],
    },
    {
      name: "Slot Requests",
      path: "/requests",
      icon: <Inbox size={20} />,
      roles: ["USER", "ADMIN"],
    },
    {
      name: "User Management",
      path: "/users",
      icon: <Users size={20} />,
      roles: ["ADMIN"],
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings size={20} />,
      roles: ["USER", "ADMIN"],
    },
  ];

  // Filter nav items by user role
  const filteredNavItems = navItems.filter(
    (item) => authState.user && item.roles.includes(authState.user.role)
  );

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center">
          <div className="bg-primary h-9 w-9 rounded-md flex items-center justify-center">
            <ParkingMeter className="text-white" size={20} />
          </div>
          {!collapsed && (
            <h1 className="ml-2 font-bold text-lg text-gray-800">ParkMaster</h1>
          )}
        </Link>
        <Button 
          variant="ghost" 
          size="sm"
          className="ml-2 p-1 h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-x-3 p-2 rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100",
                  collapsed ? "justify-center" : ""
                )}
              >
                <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* App Version */}
      <div className={cn(
        "p-4 text-xs text-gray-500 border-t",
        collapsed ? "text-center" : ""
      )}>
        {!collapsed ? "ParkMaster v1.0.0" : "v1.0"}
      </div>
    </aside>
  );
};

export default Sidebar;
