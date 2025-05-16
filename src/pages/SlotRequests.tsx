
import React, { useState } from "react";
import AppLayout from "../components/layouts/AppLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { MessageSquare, Plus, Search, Check, X } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { SlotRequest } from "../types/parking";

const SlotRequests: React.FC = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SlotRequest | null>(null);
  
  // Form state for creating requests
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [assignedSlotId, setAssignedSlotId] = useState("");
  
  // Mock data for vehicles owned by the user
  const userVehicles = [
    { id: "1", plateNumber: "ABC123", type: "Car" },
    { id: "2", plateNumber: "XYZ789", type: "Motorcycle" }
  ];
  
  // Mock data for available parking slots (for admin)
  const availableSlots = [
    { id: "1", slotNumber: "A-01", type: "Car" },
    { id: "2", slotNumber: "B-03", type: "Car" },
    { id: "3", slotNumber: "C-05", type: "Motorcycle" }
  ];
  
  // Mock data for slot requests
  const mockRequests: SlotRequest[] = [
    {
      id: "1",
      userId: "user1",
      userName: "John Doe",
      vehicleId: "1",
      vehiclePlate: "ABC123",
      vehicleType: "car",
      preferredLocation: "North Wing",
      startDate: "2025-05-15",
      endDate: "2025-08-15",
      status: "pending",
      notes: "Prefer a spot close to the elevator",
      createdAt: "2025-05-10T10:30:00Z",
      updatedAt: "2025-05-10T10:30:00Z",
    },
    {
      id: "2",
      userId: "user2",
      userName: "Jane Smith",
      vehicleId: "3",
      vehiclePlate: "DEF456",
      vehicleType: "motorcycle",
      preferredLocation: "East Wing",
      startDate: "2025-05-20",
      endDate: "2025-06-20",
      status: "approved",
      assignedSlot: {
        id: "slot2",
        slotNumber: "B-03"
      },
      notes: "Need a spot for a month",
      createdAt: "2025-05-09T14:20:00Z",
      updatedAt: "2025-05-11T09:15:00Z",
    },
    {
      id: "3",
      userId: "user1",
      userName: "John Doe",
      vehicleId: "2",
      vehiclePlate: "XYZ789",
      vehicleType: "motorcycle",
      preferredLocation: "South Wing",
      startDate: "2025-05-25",
      endDate: "2025-06-25",
      status: "rejected",
      rejectionReason: "No spots available in the requested area",
      notes: "Need a spot for my motorcycle",
      createdAt: "2025-05-08T16:45:00Z",
      updatedAt: "2025-05-12T11:30:00Z",
    },
  ];
  
  // Filter requests based on user role and search term
  const filteredRequests = mockRequests.filter(request => {
    // If admin, show all requests, else show only the user's requests
    const roleFilter = isAdmin ? true : request.userId === authState.user?.id;
    
    // Search filter
    const searchFilter = 
      request.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.preferredLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.userName && request.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return roleFilter && searchFilter;
  });
  
  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const resetForm = () => {
    setSelectedVehicleId("");
    setPreferredLocation("");
    setStartDate("");
    setEndDate("");
    setNotes("");
    setRejectionReason("");
    setAssignedSlotId("");
    setSelectedRequest(null);
  };
  
  const handleCreateRequest = () => {
    // In a real app, this would make an API call
    toast({
      title: "Parking slot request submitted",
      description: "Your request has been submitted and is pending approval.",
    });
    setIsCreateDialogOpen(false);
    resetForm();
  };
  
  const handleApproveRequest = () => {
    // In a real app, this would make an API call
    toast({
      title: "Request approved",
      description: `Parking request for vehicle ${selectedRequest?.vehiclePlate} has been approved.`,
    });
    setIsApproveDialogOpen(false);
    resetForm();
  };
  
  const handleRejectRequest = () => {
    // In a real app, this would make an API call
    toast({
      title: "Request rejected",
      description: `Parking request for vehicle ${selectedRequest?.vehiclePlate} has been rejected.`,
    });
    setIsRejectDialogOpen(false);
    resetForm();
  };
  
  const openApproveDialog = (request: SlotRequest) => {
    setSelectedRequest(request);
    setIsApproveDialogOpen(true);
  };
  
  const openRejectDialog = (request: SlotRequest) => {
    setSelectedRequest(request);
    setIsRejectDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Slot Requests</h1>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "Manage and review parking slot requests" 
                : "Request and manage your parking slots"}
            </p>
          </div>
          
          {!isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Parking Slot</DialogTitle>
                  <DialogDescription>
                    Submit a request for a parking slot for your vehicle
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="vehicleId" className="text-right">
                      Vehicle
                    </Label>
                    <Select 
                      value={selectedVehicleId} 
                      onValueChange={setSelectedVehicleId}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select your vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {userVehicles.map(vehicle => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plateNumber} ({vehicle.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="preferredLocation" className="text-right">
                      Preferred Location
                    </Label>
                    <Input
                      id="preferredLocation"
                      value={preferredLocation}
                      onChange={(e) => setPreferredLocation(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g. North Wing, Near Elevator"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endDate" className="text-right">
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Additional Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="col-span-3"
                      placeholder="Any special requirements or requests"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRequest}>Submit Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {isAdmin ? "All Parking Requests" : "Your Parking Requests"}
                </CardTitle>
                <CardDescription>
                  {isAdmin 
                    ? "Review and manage parking slot requests from users" 
                    : "Track the status of your parking slot requests"}
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search requests..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {isAdmin && <TableHead>User</TableHead>}
                    <TableHead>Vehicle Plate</TableHead>
                    <TableHead>Vehicle Type</TableHead>
                    <TableHead>Preferred Location</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.map((request) => (
                    <TableRow key={request.id}>
                      {isAdmin && (
                        <TableCell>{request.userName}</TableCell>
                      )}
                      <TableCell className="font-medium">
                        {request.vehiclePlate}
                      </TableCell>
                      <TableCell className="capitalize">{request.vehicleType}</TableCell>
                      <TableCell>{request.preferredLocation}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>From: {request.startDate}</div>
                          <div>To: {request.endDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {isAdmin && request.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => openApproveDialog(request)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => openRejectDialog(request)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {!isAdmin && request.status === "approved" && request.assignedSlot && (
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              Slot: {request.assignedSlot.slotNumber}
                            </Button>
                          )}
                          
                          {!isAdmin && request.status === "rejected" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => {
                                toast({
                                  title: "Rejection reason",
                                  description: request.rejectionReason || "No reason provided",
                                });
                              }}
                            >
                              View Reason
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <MessageSquare size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No requests found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm
                    ? "No requests match your search criteria."
                    : isAdmin
                      ? "No parking requests have been submitted yet."
                      : "You haven't made any parking requests yet."}
                </p>
                {!searchTerm && !isAdmin && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Submit your first request
                  </Button>
                )}
              </div>
            )}
            
            {filteredRequests.length > 0 && totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          isActive={currentPage === page} 
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Approve Request Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Parking Request</DialogTitle>
            <DialogDescription>
              Assign a parking slot to the request from {selectedRequest?.userName} for vehicle {selectedRequest?.vehiclePlate}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignedSlotId" className="text-right">
                Assign Slot
              </Label>
              <Select 
                value={assignedSlotId} 
                onValueChange={setAssignedSlotId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a parking slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map(slot => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.slotNumber} ({slot.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApproveRequest}
              disabled={!assignedSlotId}
            >
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Request Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Parking Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting the request from {selectedRequest?.userName} for vehicle {selectedRequest?.vehiclePlate}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rejectionReason" className="text-right">
                Reason for Rejection
              </Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="col-span-3"
                placeholder="Explain why the request is being rejected"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectRequest}
              disabled={!rejectionReason}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SlotRequests;
