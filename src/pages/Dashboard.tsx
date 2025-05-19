
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import AppLayout from "../components/layouts/AppLayout";
import { Car, ParkingMeter, Inbox, Users, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, linkTo }) => (
  <Link to={linkTo}>
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  </Link>
);

const Dashboard: React.FC = () => {
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === "ADMIN";
  
  // Mock data - in a real app, you'd fetch this from your API
  const statsForUser = [
    {
      title: "My Vehicles",
      value: 2,
      description: "Total registered vehicles",
      icon: <Car size={20} />,
      linkTo: "/vehicles",
    },
    {
      title: "Available Slots",
      value: 58,
      description: "Parking slots available now",
      icon: <ParkingMeter size={20} />,
      linkTo: "/slots",
    },
    {
      title: "My Requests",
      value: 1,
      description: "Active parking requests",
      icon: <Inbox size={20} />,
      linkTo: "/requests",
    },
    {
      title: "Approved Slots",
      value: 1,
      description: "Currently assigned to you",
      icon: <CheckCircle size={20} />,
      linkTo: "/slots",
    }
  ];
  
  const statsForAdmin = [
    {
      title: "Total Vehicles",
      value: 45,
      description: "Registered in the system",
      icon: <Car size={20} />,
      linkTo: "/vehicles",
    },
    {
      title: "Parking Slots",
      value: 100,
      description: "Total slots in the facility",
      icon: <ParkingMeter size={20} />,
      linkTo: "/slots",
    },
    {
      title: "Pending Requests",
      value: 12,
      description: "Waiting for approval",
      icon: <Inbox size={20} />,
      linkTo: "/requests",
    },
    {
      title: "Registered Users",
      value: 32,
      description: "Active user accounts",
      icon: <Users size={20} />,
      linkTo: "/users",
    }
  ];
  
  const stats = isAdmin ? statsForAdmin : statsForUser;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {authState.user?.name}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your {isAdmin ? "parking management system" : "parking status"}.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {isAdmin 
                          ? "New parking request submitted" 
                          : "Parking slot request approved"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isAdmin 
                          ? "User John Doe requested a parking slot for vehicle ABC123" 
                          : "Your request for vehicle XYZ789 was approved"}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {i === 0 ? "Just now" : i === 1 ? "2 hours ago" : "Yesterday"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>
                {isAdmin ? "Parking Slot Utilization" : "Your Parking Status"}
              </CardTitle>
              <CardDescription>
                {isAdmin
                  ? "Current status of parking spaces"
                  : "Information about your parking spaces"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAdmin ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Available Slots</p>
                      <div className="flex items-center">
                        <div className="w-full bg-secondary h-2 rounded-full">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: "58%" }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm">58%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="text-sm font-medium">Small</div>
                      <div className="text-2xl font-bold">25/30</div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Medium</div>
                      <div className="text-2xl font-bold">20/50</div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Large</div>
                      <div className="text-2xl font-bold">13/20</div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-md">
                    <div>
                      <p className="font-medium">Assigned Parking Slot</p>
                      <p className="text-sm text-muted-foreground">Slot A-42</p>
                    </div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      Active
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Car size={16} />
                    <span>Vehicle: XYZ789 (Sedan)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <ParkingMeter size={16} />
                    <span>Location: North Wing, Level 2</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle size={16} />
                    <span>Expires: May 20, 2025</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
