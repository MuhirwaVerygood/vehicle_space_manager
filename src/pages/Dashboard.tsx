import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import AppLayout from '../components/layouts/AppLayout';
import { Car, ParkingMeter, Inbox, Users, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { VehicleService } from '@/services/vehicle.service';
import { ParkingService } from '@/services/parking.service';
import { AuthService } from '@/services/auth.service';

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
}


interface Vehicle {
  id: string;
  userId: string;
  plateNumber: string;
  vehicleType: string;
  size: string;
  attributes: { color: string; model: string };
}
interface ParkingSlot {
  id: string;
  slotNumber: string;
  size: string;
  vehicleType: string;
  status: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  slotRequests: SlotRequest[];
}
interface SlotRequest {
  id: string;
  userId: string;
  vehicle?: Vehicle;
  slot?: ParkingSlot;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  expiryDate?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, linkTo }) => (
  <Link to={linkTo}>
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <div className="bg-primary/10 p-2 rounded-full text-primary">{icon}</div>
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
  const { toast } = useToast();
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === 'ADMIN';
  const userId = authState.user?.id;

  // State for stats
  const [vehiclesCount, setVehiclesCount] = useState(0);
  const [availableSlotsCount, setAvailableSlotsCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [approvedSlotsCount, setApprovedSlotsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<SlotRequest[]>([]);
  const [slotUtilization, setSlotUtilization] = useState<{
    small: { available: number; total: number };
    medium: { available: number; total: number };
    large: { available: number; total: number };
  }>({  
    small: { available: 0, total: 0 },
    medium: { available: 0, total: 0 },
    large: { available: 0, total: 0 },
  });
  const [userParkingStatus, setUserParkingStatus] = useState<SlotRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data for stats and other sections
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch vehicles
        const vehiclesResponse = await VehicleService.getVehicles(1, 100); // Fetch more to count
        const vehicles = vehiclesResponse.items;
        if (isAdmin) {
          setVehiclesCount(vehicles.length);
        } else {
          const userVehicles = vehicles.filter((v) => v.userId === userId);
          setVehiclesCount(userVehicles.length);
        }

        // Fetch available slots
        const slotsResponse = await ParkingService.getSlots(1, 100, undefined, undefined, undefined, true);        
        setAvailableSlotsCount(slotsResponse.data.items.length);

        // Fetch slot requests
        const requestsResponse = await ParkingService.getSlotRequests(
          1,
          10,
          undefined,
          isAdmin ? 'PENDING' : undefined
        );
        const requests = requestsResponse.data.items;
        console.log(requestsResponse.data);
        
        if (isAdmin) {
          setRequestsCount(requests.length);
        } else {
          const userRequests = requests.filter((r) => r.userId === userId);
          setRequestsCount(userRequests.length);
          const approvedRequests = userRequests.filter((r) => r.status === 'APPROVED');
          setApprovedSlotsCount(approvedRequests.length);
          setUserParkingStatus(approvedRequests[0] || null); // Use first approved request for status
        }

        // Fetch users (admin only)
        if (isAdmin) {
          const usersResponse = await AuthService.getAllUsers(1, 100);
          console.log(usersResponse.items);
          
          setUsersCount(usersResponse.items.length);
        }

        // Fetch recent activities (latest slot requests)
        const activityResponse = await ParkingService.getSlotRequests(1, 3); // Limit to 3
        setRecentActivities(activityResponse.items);

        // Fetch slot utilization (admin only)
        if (isAdmin) {
          const allSlotsResponse = await ParkingService.getSlots(1, 100); // Fetch all slots
          const slots = allSlotsResponse.items;
          const smallSlots = slots.filter((s) =>s.size === 'SMALL');
          const mediumSlots = slots.filter((s) => s.size === 'MEDIUM');
          const largeSlots = slots.filter((s) => s.size === 'LARGE');
          setSlotUtilization({
            small: {
              available: smallSlots.filter((s) => s.status === 'AVAILABLE').length,
              total: smallSlots.length,
            },
            medium: {
              available: mediumSlots.filter((s) => s.status === 'AVAILABLE').length,
              total: mediumSlots.length,
            },
            large: {
              available: largeSlots.filter((s) => s.status === 'AVAILABLE').length,
              total: largeSlots.length,
            },
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, isAdmin ]);

  // Define stats based on role
  const statsForUser = [
    {
      title: 'My Vehicles',
      value: vehiclesCount,
      description: 'Total registered vehicles',
      icon: <Car size={20} />,
      linkTo: '/vehicles',
    },
    {
      title: 'Available Slots',
      value: availableSlotsCount,
      description: 'Parking slots available now',
      icon: <ParkingMeter size={20} />,
      linkTo: '/slots',
    },
    {
      title: 'My Requests',
      value: requestsCount,
      description: 'Active parking requests',
      icon: <Inbox size={20} />,
      linkTo: '/requests',
    },
    {
      title: 'Approved Slots',
      value: approvedSlotsCount,
      description: 'Currently assigned to you',
      icon: <CheckCircle size={20} />,
      linkTo: '/slots',
    },
  ];

  const statsForAdmin = [
    {
      title: 'Total Vehicles',
      value: vehiclesCount,
      description: 'Registered in the system',
      icon: <Car size={20} />,
      linkTo: '/vehicles',
    },
    {
      title: 'Parking Slots',
      value: availableSlotsCount,
      description: 'Total available slots in the facility',
      icon: <ParkingMeter size={20} />,
      linkTo: '/slots',
    },
    {
      title: 'Pending Requests',
      value: requestsCount,
      description: 'Waiting for approval',
      icon: <Inbox size={20} />,
      linkTo: '/requests',
    },
    {
      title: 'Registered Users',
      value: usersCount,
      description: 'Active user accounts',
      icon: <Users size={20} />,
      linkTo: '/users',
    },
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
            Here's an overview of your {isAdmin ? 'parking management system' : 'parking status'}.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">Loading...</div>
        ) : (
          <>
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
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity, i) => (
                        <div
                          key={activity.id}
                          className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">
                              {isAdmin
                                ? `New parking request submitted`
                                : activity.status === 'APPROVED'
                                ? 'Parking slot request approved'
                                : 'Parking slot request submitted'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {isAdmin
                                ? `User requested a parking slot for vehicle ${activity.vehicle?.plateNumber || 'N/A'}`
                                : `Your request for vehicle ${activity.vehicle?.plateNumber || 'N/A'} was ${
                                    activity.status === 'APPROVED' ? 'APPROVED': 'submitted'
                                  }`}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {i === 0 ? 'Just now' : i === 1 ? '2 hours ago' : 'Yesterday'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent activities.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{isAdmin ? 'Parking Slot Utilization' : 'Your Parking Status'}</CardTitle>
                  <CardDescription>
                    {isAdmin ? 'Current status of parking spaces' : 'Information about your parking spaces'}
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
                                style={{
                                  width: `${
                                    (availableSlotsCount / (slotUtilization.small.total + slotUtilization.medium.total + slotUtilization.large.total)) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm">
                              {Math.round(
                                (availableSlotsCount / (slotUtilization.small.total + slotUtilization.medium.total + slotUtilization.large.total)) * 100
                              )}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="text-sm font-medium">Small</div>
                          <div className="text-2xl font-bold">
                            {slotUtilization.small.available}/{slotUtilization.small.total}
                          </div>
                          <div className="text-xs text-muted-foreground">Available</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Medium</div>
                          <div className="text-2xl font-bold">
                            {slotUtilization.medium.available}/{slotUtilization.medium.total}
                          </div>
                          <div className="text-xs text-muted-foreground">Available</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Large</div>
                          <div className="text-2xl font-bold">
                            {slotUtilization.large.available}/{slotUtilization.large.total}
                          </div>
                          <div className="text-xs text-muted-foreground">Available</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userParkingStatus ? (
                        <>
                          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-md">
                            <div>
                              <p className="font-medium">Assigned Parking Slot</p>
                              <p className="text-sm text-muted-foreground">
                                {userParkingStatus.slot?.slotNumber || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                              Active
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Car size={16} />
                            <span>Vehicle: {userParkingStatus.vehicle?.plateNumber || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <ParkingMeter size={16} />
                            <span>Location: {userParkingStatus.slot?.location || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle size={16} />
                            <span>Expires: {userParkingStatus.expiryDate ? new Date(userParkingStatus.expiryDate).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">No assigned parking slots.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;