import React, { useState, useEffect, useCallback } from "react";
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
import { MessageSquare, Plus, Search, Check, X, RefreshCw } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { Vehicle } from "../types/vehicle";
import { ParkingService } from "@/services/parking.service";
import { VehicleService } from "@/services/vehicle.service";
import { SlotRequestFormData } from "@/types/parking";
import { ParkingSlot } from "@/types/parking";

export interface SlotRequest {
  id: string;
  userId: string;
  userName: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleType: string;
  preferredLocation?: "NORTH" | "EAST" | "SOUTH" | "WEST" | undefined;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  assignedSlot?: {
    id: string;
    slotNumber: string;
  };
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <h2 className="text-lg font-bold">Something went wrong.</h2>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const SlotRequests: React.FC = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === "ADMIN";
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SlotRequest | null>(null);
  // Data states
  const [slotRequests, setSlotRequests] = useState<SlotRequest[]>([]);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [availableSlots, setAvailableSlots] = useState<ParkingSlot[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(false);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for creating requests
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [preferredLocation, setPreferredLocation] = useState<
    "NORTH" | "EAST" | "SOUTH" | "WEST" | undefined
  >(undefined);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [assignedSlotId, setAssignedSlotId] = useState("");

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Fetch user vehicles
  useEffect(() => {
    const fetchData = async () => {
      if (isAdmin) return; // Admins don't need vehicle list for creating requests
      setIsVehiclesLoading(true);
      try {
        const data = await VehicleService.getVehicles(1, 100, undefined);
        console.log("VehicleService.getVehicles response:", data);
        setUserVehicles(data.items ?? []);
        if (data.items.length === 0) {
          toast({
            title: "No vehicles available",
            description: "No vehicles found. Please add a vehicle first.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        console.error("fetchUserVehicles error:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to fetch your vehicles";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setUserVehicles([]);
      } finally {
        setIsVehiclesLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch slot requests
  const fetchSlotRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ParkingService.getSlotRequests(
        currentPage,
        itemsPerPage,
        debouncedSearchTerm || undefined,
        undefined
      );
      setSlotRequests((response as any ).items ?? []);
      setTotalItems(response.total ?? 0);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch slot requests";
      setError(errorMessage);
      setSlotRequests([]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm]);

  // Fetch available slots for approve dialog
  const fetchAvailableSlots = useCallback(async () => {
    if (!isAdmin || !isApproveDialogOpen) return;
    setIsSlotsLoading(true);
    try {
      const response = await ParkingService.getSlots(1, 100, undefined, undefined, undefined, true);
      console.log("ParkingService.getSlots response:", response);
      const slots = response.data.items ?? [];
      setAvailableSlots(slots);
      if (slots.length === 0) {
        toast({
          title: "No slots available",
          description: "No parking slots are available for assignment.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("fetchAvailableSlots error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to fetch available slots";
      setAvailableSlots([]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSlotsLoading(false);
    }
  }, [isAdmin, isApproveDialogOpen]);

  useEffect(() => {
    fetchSlotRequests();
  }, [fetchSlotRequests]);

  useEffect(() => {
    if (isApproveDialogOpen) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]); // Clear slots when dialog closes
      setIsSlotsLoading(false);
    }
  }, [isApproveDialogOpen, fetchAvailableSlots]);

  const resetForm = () => {
    setSelectedVehicleId("");
    setPreferredLocation(undefined);
    setStartDate("");
    setEndDate("");
    setNotes("");
    setRejectionReason("");
    setAssignedSlotId("");
    setSelectedRequest(null);
  };

  const handleCreateRequest = async () => {
    if (!selectedVehicleId || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    try {
      const requestData: SlotRequestFormData = {
        vehicleId: selectedVehicleId,
        preferredLocation,
        userId: authState.user?.id || "",
        startDate,
        endDate,
        notes,
      };
      await ParkingService.createSlotRequest(requestData);
      toast({
        title: "Parking slot request submitted",
        description: "Your request has been submitted and is pending approval.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchSlotRequests();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to create slot request";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await ParkingService.deleteSlotRequest(requestId);
      toast({
        title: "Request deleted",
        description: "Your parking slot request has been deleted.",
      });
      fetchSlotRequests();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete request";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleUpdateRequest = (request: SlotRequest) => {
    setSelectedRequest(request);
    setSelectedVehicleId(request.vehicleId);
    setPreferredLocation(request.preferredLocation);
    setStartDate(request.startDate);
    setEndDate(request.endDate);
    setNotes(request.notes || "");
    setIsCreateDialogOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedRequest) return;
    try {
      const requestData: SlotRequestFormData = {
        vehicleId: selectedVehicleId,
        preferredLocation,
        userId: authState.user?.id || "",
        startDate,
        endDate,
        notes,
      };
      await ParkingService.updateSlotRequest(selectedRequest.id, requestData);
      toast({
        title: "Request updated",
        description: "Your parking slot request has been updated successfully.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchSlotRequests();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update request";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest || !assignedSlotId) {
      toast({
        title: "Error",
        description: "Please select a parking slot to approve the request.",
        variant: "destructive",
      });
      return;
    }
    try {
      await ParkingService.approveSlotRequest(selectedRequest.id, assignedSlotId);
      toast({
        title: "Request approved",
        description: `Parking request for vehicle ${selectedRequest.vehiclePlate} has been approved.`,
      });
      setIsApproveDialogOpen(false);
      resetForm();
      fetchSlotRequests();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to approve request";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) {
      toast({
        title: "Error",
        description: "No request selected for rejection.",
        variant: "destructive",
      });
      return;
    }
    try {
      await ParkingService.rejectSlotRequest(selectedRequest.id, rejectionReason);
      toast({
        title: "Request rejected",
        description: `Parking request for vehicle ${selectedRequest.vehiclePlate} has been rejected.`,
      });
      setIsRejectDialogOpen(false);
      resetForm();
      fetchSlotRequests();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to reject request";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // New handler for viewing rejection reason
  const handleViewRejectionReason = async (slotRequestId: string) => {
    // Purpose: Fetch and display the rejection reason for a slot request when the "View Reason" button is clicked.
    // Why: Dynamically retrieves the reason from the backend to ensure the latest data is shown,
    // improving reliability over using cached rejectionReason from the SlotRequest object.
    try {
      const reason = await ParkingService.getRejectionReasonBySlotRequestId(slotRequestId);
      toast({
        title: "Rejection Reason",
        description: reason || "No reason provided",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch rejection reason",
        variant: "destructive",
      });
    }
  };

  const openApproveDialog = (request: SlotRequest) => {
    setSelectedRequest(request);
    setAssignedSlotId("");
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (request: SlotRequest) => {
    setSelectedRequest(request);
    setRejectionReason("");
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
    <ErrorBoundary>
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
            <div className="flex items-center space-x-2">
              {!isAdmin && (
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="btn-hover"
                      disabled={isVehiclesLoading}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {isVehiclesLoading
                        ? "Loading Vehicles..."
                        : "New Request"}
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
                          disabled={isVehiclesLoading || userVehicles.length === 0}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select your vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {isVehiclesLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading vehicles...
                              </SelectItem>
                            ) : userVehicles.length > 0 ? (
                              userVehicles.map((vehicle) => (
                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                  {vehicle.plateNumber} ({vehicle.vehicleType})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                No approved vehicles available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="preferredLocation"
                          className="text-right"
                        >
                          Preferred Location
                        </Label>
                        <Select
                          value={preferredLocation ?? "NONE"}
                          onValueChange={(
                            value: "NORTH" | "EAST" | "SOUTH" | "WEST" | "NONE"
                          ) =>
                            setPreferredLocation(
                              value === "NONE" ? undefined : value
                            )
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select preferred location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NONE">None</SelectItem>
                            <SelectItem value="NORTH">North</SelectItem>
                            <SelectItem value="EAST">East</SelectItem>
                            <SelectItem value="SOUTH">South</SelectItem>
                            <SelectItem value="WEST">West</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateRequest}
                        disabled={
                          isVehiclesLoading ||
                          !selectedVehicleId ||
                          !startDate ||
                          !endDate
                        }
                      >
                        Submit Request
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={fetchSlotRequests}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
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
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <p className="text-muted-foreground">Loading requests...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MessageSquare
                    size={48}
                    className="text-muted-foreground mb-4"
                  />
                  <h3 className="text-lg font-medium">Failed to load requests</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              ) : slotRequests.length > 0 ? (
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
                    {slotRequests.map((request) => (
                      <TableRow key={request.id}>
                        {isAdmin && <TableCell>{request.userName}</TableCell>}
                        <TableCell className="font-medium">
                          {request.vehiclePlate}
                        </TableCell>
                        <TableCell className="capitalize">
                          {request.vehicleType}
                        </TableCell>
                        <TableCell>
                          {request.preferredLocation || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>From: {request.startDate}</div>
                            <div>To: {request.endDate}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
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
                            {!isAdmin && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                  onClick={() => handleUpdateRequest(request)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                  Update
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => handleDeleteRequest(request.id)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </>
                            )}
                            {!isAdmin &&
                              request.status === "approved" &&
                              request.assignedSlot && (
                                <Button variant="outline" size="sm">
                                  Slot: {request.assignedSlot.slotNumber}
                                </Button>
                              )}
                            {!isAdmin && request.status === "rejected" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => handleViewRejectionReason(request.id)}
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
                  <MessageSquare
                    size={48}
                    className="text-muted-foreground mb-4"
                  />
                  <h3 className="text-lg font-medium">No requests found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm
                      ? "No requests match your search criteria."
                      : isAdmin
                        ? "No parking requests have been submitted yet."
                        : "You haven't made any parking requests yet."}
                  </p>
                  {!searchTerm && !isAdmin && (
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      disabled={isVehiclesLoading}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Submit your first request
                    </Button>
                  )}
                </div>
              )}
              {slotRequests.length > 0 && totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          className={
                            currentPage <= 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={currentPage === page}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          className={
                            currentPage >= totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Update/Create Slot Request Dialog */}
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedRequest
                  ? "Update Parking Slot Request"
                  : "Request Parking Slot"}
              </DialogTitle>
              <DialogDescription>
                {selectedRequest
                  ? "Update your parking slot request details below"
                  : "Submit a request for a parking slot for your vehicle"}
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
                  disabled={isVehiclesLoading || userVehicles.length === 0}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select your vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {isVehiclesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading vehicles...
                      </SelectItem>
                    ) : userVehicles.length > 0 ? (
                      userVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.plateNumber} ({vehicle.vehicleType})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No approved vehicles available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="preferredLocation" className="text-right">
                  Preferred Location
                </Label>
                <Select
                  value={preferredLocation ?? "NONE"}
                  onValueChange={(
                    value: "NORTH" | "EAST" | "SOUTH" | "WEST" | "NONE"
                  ) => setPreferredLocation(value === "NONE" ? undefined : value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select preferred location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="NORTH">North</SelectItem>
                    <SelectItem value="EAST">East</SelectItem>
                    <SelectItem value="SOUTH">South</SelectItem>
                    <SelectItem value="WEST">West</SelectItem>
                  </SelectContent>
                </Select>
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
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedRequest ? handleUpdateSubmit() : handleCreateRequest()
                }
                disabled={
                  isVehiclesLoading ||
                  !selectedVehicleId ||
                  !startDate ||
                  !endDate
                }
              >
                {selectedRequest ? "Update Request" : "Submit Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Request Dialog */}
        <Dialog
          open={isApproveDialogOpen}
          onOpenChange={setIsApproveDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Parking Request</DialogTitle>
              <DialogDescription>
                {selectedRequest
                  ? `Assign a parking slot to the request from ${selectedRequest.userName} for vehicle ${selectedRequest.vehiclePlate}.`
                  : "No request selected."}
              </DialogDescription>
            </DialogHeader>
            {selectedRequest ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignedSlotId" className="text-right">
                    Assign Slot
                  </Label>
                  {isSlotsLoading ? (
                    <div className="col-span-3 flex items-center">
                      <p className="text-muted-foreground">Loading slots...</p>
                    </div>
                  ) : (
                    <Select
                      value={assignedSlotId}
                      onValueChange={setAssignedSlotId}
                      disabled={isSlotsLoading || availableSlots.length === 0}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a parking slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.length > 0 ? (
                          availableSlots.map((slot) => (
                            <SelectItem key={slot.id} value={slot.id}>
                              {slot.slotNumber} ({slot.vehicleType})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No available slots
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-red-600">
                Error: No request selected for approval.
              </p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsApproveDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApproveRequest}
                disabled={isSlotsLoading || !assignedSlotId || !selectedRequest}
              >
                Approve Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Request Dialog */}
        <Dialog
          open={isRejectDialogOpen}
          onOpenChange={setIsRejectDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Parking Request</DialogTitle>
              <DialogDescription>
                {selectedRequest
                  ? `Provide a reason for rejecting the request from ${selectedRequest.userName} for vehicle ${selectedRequest.vehiclePlate}.`
                  : "No request selected."}
              </DialogDescription>
            </DialogHeader>
            {selectedRequest ? (
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
            ) : (
              <p className="text-red-600">
                Error: No request selected for rejection.
              </p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectRequest}
                disabled={!rejectionReason || !selectedRequest}
              >
                Reject Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppLayout>
    </ErrorBoundary>
  );
};

export default SlotRequests;