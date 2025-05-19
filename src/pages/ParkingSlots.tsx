import React, { useState, useEffect } from "react";
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
import { Label } from "../components/ui/label";
import { ParkingMeter, Plus, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { ParkingSlot, PaginatedResponse } from "../types/parking";
import { ParkingService } from "@/services/parking.service";

const ParkingSlots: React.FC = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === "ADMIN";

  // State for slots and pagination
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  // Form state for creating/editing slots
  const [slotPrefix, setSlotPrefix] = useState("A");
  const [slotCount, setSlotCount] = useState(1);
  const [vehicleType, setVehicleType] = useState<"CAR" | "MOTORCYCLE" | "TRUCK" | "">("");
  const [size, setSize] = useState<"SMALL" | "MEDIUM" | "LARGE" | "">("");
  const [location, setLocation] = useState<"NORTH" | "EAST" | "SOUTH" | "WEST" | "">("");
  const [status, setStatus] = useState<"AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE" | "">("AVAILABLE");

  const itemsPerPage = 10;

  // Fetch slots
  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response: PaginatedResponse<ParkingSlot> = await ParkingService.getSlots(
          currentPage,
          itemsPerPage,
          searchTerm || undefined
        );
        setSlots(response.items || response.data?.items || []);
        setTotal(response.total || response.data?.total || 0);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch parking slots");
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to fetch parking slots",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlots();
  }, [currentPage, searchTerm, toast]);

  const totalPages = Math.ceil(total / itemsPerPage);

  const resetForm = () => {
    setSlotPrefix("A");
    setSlotCount(1);
    setVehicleType("");
    setSize("");
    setLocation("");
    setStatus("AVAILABLE");
    setSelectedSlot(null);
  };

  const handleCreateSlot = async () => {
    if (!vehicleType || !size || !location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Vehicle Type, Size, Location).",
        variant: "destructive",
      });
      return;
    }

    try {
      const slotsData = {
        count: slotCount,
        prefix: slotPrefix,
        vehicleType,
        size,
        location,
      };
      await ParkingService.createSlots(slotsData);
      toast({
        title: "Parking slots created",
        description: `${slotCount} parking slots with prefix ${slotPrefix} have been added.`,
      });
      setIsCreateDialogOpen(false);
      resetForm();
      // Refresh slots
      const response = await ParkingService.getSlots(currentPage, itemsPerPage, searchTerm || undefined);
      setSlots(response.items || response.data?.items || []);
      setTotal(response.total || response.data?.total || 0);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create parking slots",
        variant: "destructive",
      });
    }
  };

  const handleEditSlot = async () => {
    if (!selectedSlot || !vehicleType || !size || !location || !status) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Vehicle Type, Size, Location, Status).",
        variant: "destructive",
      });
      return;
    }

    try {
      const slotData: Partial<ParkingSlot> = {
        vehicleType,
        size,
        location,
        status,
      };
      await ParkingService.updateSlot(selectedSlot.id, slotData);
      toast({
        title: "Parking slot updated",
        description: `Slot ${selectedSlot.slotNumber} has been updated successfully.`,
      });
      setIsEditDialogOpen(false);
      resetForm();
      // Refresh slots
      const response = await ParkingService.getSlots(currentPage, itemsPerPage, searchTerm || undefined);
      setSlots(response.items || response.data?.items || []);
      setTotal(response.total || response.data?.total || 0);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update parking slot",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;

    try {
      await ParkingService.deleteSlot(selectedSlot.id);
      toast({
        title: "Parking slot deleted",
        description: `Slot ${selectedSlot.slotNumber} has been removed.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedSlot(null);
      // Refresh slots
      const response = await ParkingService.getSlots(currentPage, itemsPerPage, searchTerm || undefined);
      setSlots(response.items || response.data?.items || []);
      setTotal(response.total || response.data?.total || 0);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete parking slot",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setVehicleType(slot.vehicleType);
    setSize(slot.size);
    setLocation(slot.location);
    setStatus(slot.status);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setIsDeleteDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "text-green-600 bg-green-100";
      case "OCCUPIED":
        return "text-blue-600 bg-blue-100";
      case "RESERVED":
        return "text-yellow-600 bg-yellow-100";
      case "MAINTENANCE":
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
            <h1 className="text-2xl font-bold tracking-tight">Parking Slots</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Manage all parking slots in the system" : "View available parking slots"}
            </p>
          </div>

          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Slots
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Parking Slots</DialogTitle>
                  <DialogDescription>
                    Create multiple parking slots at once with sequential numbering.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="slotPrefix" className="text-right">
                      Prefix
                    </Label>
                    <Input
                      id="slotPrefix"
                      value={slotPrefix}
                      onChange={(e) => setSlotPrefix(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g. A"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="slotCount" className="text-right">
                      Number of Slots
                    </Label>
                    <Input
                      id="slotCount"
                      type="number"
                      min="1"
                      value={slotCount}
                      onChange={(e) => setSlotCount(parseInt(e.target.value) || 1)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="vehicleType" className="text-right">
                      Vehicle Type
                    </Label>
                    <Select
                      value={vehicleType}
                      onValueChange={(value: "CAR" | "MOTORCYCLE" | "TRUCK") => setVehicleType(value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAR">Car</SelectItem>
                        <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                        <SelectItem value="TRUCK">Truck</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="size" className="text-right">
                      Size
                    </Label>
                    <Select
                      value={size}
                      onValueChange={(value: "SMALL" | "MEDIUM" | "LARGE") => setSize(value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMALL">Small</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LARGE">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Select
                      value={location}
                      onValueChange={(value: "NORTH" | "EAST" | "SOUTH" | "WEST") => setLocation(value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORTH">North</SelectItem>
                        <SelectItem value="EAST">East</SelectItem>
                        <SelectItem value="SOUTH">South</SelectItem>
                        <SelectItem value="WEST">West</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSlot}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Parking Slots</CardTitle>
                <CardDescription>
                  {isAdmin ? "Manage and monitor all parking slots" : "View available parking slots"}
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search slots..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ParkingMeter size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Error</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            ) : slots.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slot Number</TableHead>
                    <TableHead>Vehicle Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">{slot.slotNumber}</TableCell>
                      <TableCell className="capitalize">{slot.vehicleType.toLowerCase()}</TableCell>
                      <TableCell className="capitalize">{slot.size.toLowerCase()}</TableCell>
                      <TableCell className="capitalize">{slot.location.toLowerCase()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.status)}`}>
                          {slot.status.charAt(0).toUpperCase() + slot.status.slice(1).toLowerCase()}
                        </span>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(slot)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openDeleteDialog(slot)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <ParkingMeter size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No parking slots found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm
                    ? "No slots match your search criteria."
                    : "No parking slots have been added yet."}
                </p>
                {!searchTerm && isAdmin && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first parking slot
                  </Button>
                )}
              </div>
            )}

            {slots.length > 0 && totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

      {/* Edit Slot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Parking Slot</DialogTitle>
            <DialogDescription>Update the details of the parking slot.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-slotNumber" className="text-right">
                Slot Number
              </Label>
              <Input
                id="edit-slotNumber"
                value={selectedSlot?.slotNumber || ""}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-vehicleType" className="text-right">
                Vehicle Type
              </Label>
              <Select
                value={vehicleType}
                onValueChange={(value: "CAR" | "MOTORCYCLE" | "TRUCK") => setVehicleType(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAR">Car</SelectItem>
                  <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                  <SelectItem value="TRUCK">Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-size" className="text-right">
                Size
              </Label>
              <Select
                value={size}
                onValueChange={(value: "SMALL" | "MEDIUM" | "LARGE") => setSize(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMALL">Small</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LARGE">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">
                Location
              </Label>
              <Select
                value={location}
                onValueChange={(value: "NORTH" | "EAST" | "SOUTH" | "WEST") => setLocation(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORTH">North</SelectItem>
                  <SelectItem value="EAST">East</SelectItem>
                  <SelectItem value="SOUTH">South</SelectItem>
                  <SelectItem value="WEST">West</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(value: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE") =>
                  setStatus(value)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSlot}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Slot Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the parking slot <strong>{selectedSlot?.slotNumber}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSlot}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ParkingSlots;