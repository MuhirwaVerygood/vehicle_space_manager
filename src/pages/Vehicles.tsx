
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
import { Label } from "../components/ui/label";
import { Car, Plus, Search, Edit, Trash2, Check, X } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { Vehicle } from "../types/vehicle";
import CreateVehicleForm from "../components/vehicle/CreateVehicleForm";

const Vehicles: React.FC = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Form state
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<"car" | "motorcycle" | "truck" | "">("");
  const [size, setSize] = useState<"small" | "medium" | "large" | "">("");
  const [color, setColor] = useState("");
  const [model, setModel] = useState("");
  
  // Mock data for vehicles
  const mockVehicles: Vehicle[] = [
    {
      id: "1",
      userId: "user1",
      plateNumber: "ABC123",
      vehicleType: "car",
      size: "medium",
      attributes: { color: "Blue", model: "Toyota Corolla" },
      status: "approved",
      createdAt: "2023-05-10T10:30:00Z",
      updatedAt: "2023-05-10T10:30:00Z",
    },
    {
      id: "2",
      userId: "user1",
      plateNumber: "XYZ789",
      vehicleType: "motorcycle",
      size: "small",
      attributes: { color: "Red", model: "Honda CBR" },
      status: "pending",
      createdAt: "2023-05-12T14:15:00Z",
      updatedAt: "2023-05-12T14:15:00Z",
    },
    {
      id: "3",
      userId: "user2",
      plateNumber: "DEF456",
      vehicleType: "truck",
      size: "large",
      attributes: { color: "Black", model: "Ford F-150" },
      status: "rejected",
      createdAt: "2023-05-14T09:45:00Z",
      updatedAt: "2023-05-14T16:30:00Z",
    }
  ];
  
  // Filter vehicles based on user role and search term
  const filteredVehicles = mockVehicles.filter(vehicle => {
    // If admin, show all vehicles, else show only the user's vehicles
    const roleFilter = isAdmin ? true : vehicle.userId === authState.user?.id;
    
    // Search filter
    const searchFilter = 
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.attributes.color && vehicle.attributes.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vehicle.attributes.model && vehicle.attributes.model.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return roleFilter && searchFilter;
  });
  
  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const resetForm = () => {
    setPlateNumber("");
    setVehicleType("");
    setSize("");
    setColor("");
    setModel("");
    setRejectionReason("");
    setSelectedVehicle(null);
  };
  
  const handleCreateVehicle = (formData: any) => {
    // In a real app, this would make an API call
    toast({
      title: "Vehicle submitted for approval",
      description: `Vehicle ${formData.plateNumber} has been submitted and is pending approval.`,
    });
    setIsCreateDialogOpen(false);
    resetForm();
  };
  
  const handleEditVehicle = () => {
    // In a real app, this would make an API call
    toast({
      title: "Vehicle updated",
      description: `Vehicle ${plateNumber} has been updated successfully.`,
    });
    setIsEditDialogOpen(false);
    resetForm();
  };
  
  const handleDeleteVehicle = () => {
    // In a real app, this would make an API call
    toast({
      title: "Vehicle deleted",
      description: `Vehicle ${selectedVehicle?.plateNumber} has been removed.`,
    });
    setIsDeleteDialogOpen(false);
    setSelectedVehicle(null);
  };
  
  const handleApproveVehicle = () => {
    // In a real app, this would make an API call
    toast({
      title: "Vehicle approved",
      description: `Vehicle ${selectedVehicle?.plateNumber} has been approved.`,
    });
    setIsApproveDialogOpen(false);
    setSelectedVehicle(null);
  };
  
  const handleRejectVehicle = () => {
    // In a real app, this would make an API call
    toast({
      title: "Vehicle rejected",
      description: `Vehicle ${selectedVehicle?.plateNumber} has been rejected.`,
    });
    setIsRejectDialogOpen(false);
    setRejectionReason("");
    setSelectedVehicle(null);
  };
  
  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setPlateNumber(vehicle.plateNumber);
    setVehicleType(vehicle.vehicleType);
    setSize(vehicle.size);
    setColor(vehicle.attributes.color || "");
    setModel(vehicle.attributes.model || "");
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteDialogOpen(true);
  };
  
  const openApproveDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsApproveDialogOpen(true);
  };
  
  const openRejectDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsRejectDialogOpen(true);
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    let bgColor = "";
    let textColor = "";
    
    switch (status) {
      case "approved":
        bgColor = "bg-green-100";
        textColor = "text-green-600";
        break;
      case "pending":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-600";
        break;
      case "rejected":
        bgColor = "bg-red-100";
        textColor = "text-red-600";
        break;
      default:
        bgColor = "bg-gray-100";
        textColor = "text-gray-600";
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Manage all registered vehicles" : "Manage your registered vehicles here"}
            </p>
          </div>
          
          {!isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-hover">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Vehicle</DialogTitle>
                  <DialogDescription>
                    Enter the details of your vehicle below. Your submission will need admin approval before it's active.
                  </DialogDescription>
                </DialogHeader>
                <CreateVehicleForm 
                  onSubmit={handleCreateVehicle} 
                  onCancel={() => setIsCreateDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{isAdmin ? "All Vehicles" : "Your Vehicles"}</CardTitle>
                <CardDescription>
                  {isAdmin ? "Review and manage all registered vehicles" : "A list of all your registered vehicles"}
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search vehicles..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredVehicles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Vehicle Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        {vehicle.plateNumber}
                      </TableCell>
                      <TableCell className="capitalize">
                        <div className="flex items-center">
                          <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                          {vehicle.vehicleType}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{vehicle.size}</TableCell>
                      <TableCell>{vehicle.attributes.color}</TableCell>
                      <TableCell>{vehicle.attributes.model}</TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {isAdmin && vehicle.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-500 hover:text-green-700 hover:bg-green-50"
                                onClick={() => openApproveDialog(vehicle)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openRejectDialog(vehicle)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {(!isAdmin || vehicle.status === "approved") && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(vehicle)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openDeleteDialog(vehicle)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Car size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No vehicles found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm
                    ? "No vehicles match your search criteria."
                    : isAdmin 
                      ? "No vehicles have been registered yet."
                      : "You haven't added any vehicles yet."}
                </p>
                {!searchTerm && !isAdmin && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first vehicle
                  </Button>
                )}
              </div>
            )}
            
            {filteredVehicles.length > 0 && totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} of{" "}
                  {filteredVehicles.length} vehicles
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update the details of your vehicle below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-plateNumber" className="text-right">
                Plate Number
              </Label>
              <Input
                id="edit-plateNumber"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="col-span-3"
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
              <Label htmlFor="edit-color" className="text-right">
                Color
              </Label>
              <Input
                id="edit-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-model" className="text-right">
                Model
              </Label>
              <Input
                id="edit-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditVehicle}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Vehicle Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the vehicle with plate number{" "}
              <strong>{selectedVehicle?.plateNumber}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteVehicle}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Approve Vehicle Dialog */}
      {isAdmin && (
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Vehicle</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve the vehicle with plate number{" "}
                <strong>{selectedVehicle?.plateNumber}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApproveVehicle}
              >
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Reject Vehicle Dialog */}
      {isAdmin && (
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Vehicle</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting the vehicle with plate number{" "}
                <strong>{selectedVehicle?.plateNumber}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rejectionReason" className="text-right">
                  Rejection Reason
                </Label>
                <Input
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="col-span-3"
                  placeholder="Explain why this vehicle is being rejected"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectVehicle}
                disabled={!rejectionReason}
              >
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
};

export default Vehicles;
