
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { Label } from "../components/ui/label";
import { ParkingMeter, Plus, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { ParkingSlot } from "../types/parking";

const ParkingSlots: React.FC = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  
  // Form state for creating/editing slots
  const [slotNumber, setSlotNumber] = useState("");
  const [slotPrefix, setSlotPrefix] = useState("A");
  const [slotCount, setSlotCount] = useState(1);
  const [vehicleType, setVehicleType] = useState<"car" | "motorcycle" | "truck" | "">("");
  const [size, setSize] = useState<"small" | "medium" | "large" | "">("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"available" | "occupied" | "reserved" | "maintenance">("available");
  
  // Mock data for parking slots
  const mockSlots: ParkingSlot[] = [
    {
      id: "1",
      slotNumber: "A-01",
      vehicleType: "car",
      size: "medium",
      location: "North Wing, Level 1",
      status: "available",
      createdAt: "2023-05-10T10:30:00Z",
      updatedAt: "2023-05-10T10:30:00Z",
    },
    {
      id: "2",
      slotNumber: "A-02",
      vehicleType: "car",
      size: "medium",
      location: "North Wing, Level 1",
      status: "occupied",
      createdAt: "2023-05-10T10:30:00Z",
      updatedAt: "2023-05-12T14:15:00Z",
      assignedTo: {
        userId: "user1",
        vehicleId: "vehicle1",
        vehiclePlate: "ABC123",
      },
    },
    {
      id: "3",
      slotNumber: "B-01",
      vehicleType: "motorcycle",
      size: "small",
      location: "East Wing, Level 1",
      status: "available",
      createdAt: "2023-05-11T09:20:00Z",
      updatedAt: "2023-05-11T09:20:00Z",
    },
    {
      id: "4",
      slotNumber: "C-01",
      vehicleType: "truck",
      size: "large",
      location: "South Wing, Ground Level",
      status: "maintenance",
      createdAt: "2023-05-12T11:45:00Z",
      updatedAt: "2023-05-15T08:30:00Z",
    },
  ];
  
  const filteredSlots = mockSlots.filter(slot => 
    slot.slotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredSlots.length / itemsPerPage);
  const paginatedSlots = filteredSlots.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const resetForm = () => {
    setSlotNumber("");
    setSlotPrefix("A");
    setSlotCount(1);
    setVehicleType("");
    setSize("");
    setLocation("");
    setStatus("available");
    setSelectedSlot(null);
  };
  
  const handleCreateSlot = () => {
    // In a real app, this would make an API call
    toast({
      title: "Parking slots created",
      description: `${slotCount} parking slots with prefix ${slotPrefix} have been added.`,
    });
    setIsCreateDialogOpen(false);
    resetForm();
  };
  
  const handleEditSlot = () => {
    // In a real app, this would make an API call
    toast({
      title: "Parking slot updated",
      description: `Slot ${selectedSlot?.slotNumber} has been updated successfully.`,
    });
    setIsEditDialogOpen(false);
    resetForm();
  };
  
  const handleDeleteSlot = () => {
    // In a real app, this would make an API call
    toast({
      title: "Parking slot deleted",
      description: `Slot ${selectedSlot?.slotNumber} has been removed.`,
    });
    setIsDeleteDialogOpen(false);
    setSelectedSlot(null);
  };
  
  const openEditDialog = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setSlotNumber(slot.slotNumber);
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
      case "available":
        return "text-green-600 bg-green-100";
      case "occupied":
        return "text-blue-600 bg-blue-100";
      case "reserved":
        return "text-yellow-600 bg-yellow-100";
      case "maintenance":
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
                      onChange={(e) => setSlotCount(parseInt(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="vehicleType" className="text-right">
                      Vehicle Type
                    </Label>
                    <Select 
                      value={vehicleType} 
                      onValueChange={(value: "car" | "motorcycle" | "truck") => setVehicleType(value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="size" className="text-right">
                      Size
                    </Label>
                    <Select 
                      value={size} 
                      onValueChange={(value: "small" | "medium" | "large") => setSize(value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g. North Wing, Level 1"
                    />
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSlots.length > 0 ? (
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
                  {paginatedSlots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">
                        {slot.slotNumber}
                      </TableCell>
                      <TableCell className="capitalize">{slot.vehicleType}</TableCell>
                      <TableCell className="capitalize">{slot.size}</TableCell>
                      <TableCell>{slot.location}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.status)}`}>
                          {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
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
            
            {filteredSlots.length > 0 && totalPages > 1 && (
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
      
      {/* Edit Slot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Parking Slot</DialogTitle>
            <DialogDescription>
              Update the details of the parking slot.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-slotNumber" className="text-right">
                Slot Number
              </Label>
              <Input
                id="edit-slotNumber"
                value={slotNumber}
                onChange={(e) => setSlotNumber(e.target.value)}
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
                onValueChange={(value: "car" | "motorcycle" | "truck") => setVehicleType(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-size" className="text-right">
                Size
              </Label>
              <Select 
                value={size} 
                onValueChange={(value: "small" | "medium" | "large") => setSize(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">
                Location
              </Label>
              <Input
                id="edit-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select 
                value={status} 
                onValueChange={(value: "available" | "occupied" | "reserved" | "maintenance") => setStatus(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
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
              Are you sure you want to delete the parking slot{" "}
              <strong>{selectedSlot?.slotNumber}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSlot}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ParkingSlots;
