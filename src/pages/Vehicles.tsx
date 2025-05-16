import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { Car, Plus, Search, Edit, Trash2, Check, X, RefreshCw } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { Vehicle, VehicleFormData, PaginatedResponse, VehicleType, Size } from "../types/vehicle";
import CreateVehicleForm from "../components/vehicle/CreateVehicleForm";
import { VehicleService } from "@/services/vehicle.service";

const Vehicles: React.FC = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === "ADMIN";
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Vehicle data state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for edit dialog
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
  const [size, setSize] = useState<Size | "">("");
  const [color, setColor] = useState("");
  const [model, setModel] = useState("");

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch vehicles
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<Vehicle> = await VehicleService.getVehicles(
        currentPage,
        itemsPerPage,
        debouncedSearchTerm || undefined
      );
      setVehicles(response.items);
      setTotalItems(response.total);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to fetch vehicles";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const resetForm = () => {
    setPlateNumber("");
    setVehicleType("");
    setSize("");
    setColor("");
    setModel("");
    setRejectionReason("");
    setSelectedVehicle(null);
  };

  const handleCreateVehicle = async (formData: VehicleFormData) => {
    try {
      const data = await VehicleService.createVehicle(formData);
      toast({
        title: "Vehicle submitted for approval",
        description: `Vehicle ${formData.plateNumber} has been submitted and is pending approval.`,
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchVehicles();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error happened when registering vehicle";
      toast({
        title: "Vehicle registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditVehicle = async () => {
    if (!selectedVehicle) return;
    try {
      const formData: Partial<VehicleFormData> = {
        plateNumber,
        vehicleType: vehicleType || undefined,
        size: size || undefined,
        attributes: {
          color: color || undefined,
          model: model || undefined,
        },
      };
      await VehicleService.updateVehicle(selectedVehicle.id, formData);
      toast({
        title: "Vehicle updated",
        description: `Vehicle ${plateNumber} has been updated successfully.`,
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchVehicles();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update vehicle";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;
    try {
      await VehicleService.deleteVehicle(selectedVehicle.id);
      toast({
        title: "Vehicle deleted",
        description: `Vehicle ${selectedVehicle.plateNumber} has been removed.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to delete vehicle";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleApproveVehicle = async () => {
    if (!selectedVehicle) return;
    try {
      await VehicleService.approveVehicle(selectedVehicle.id);
      toast({
        title: "Vehicle approved",
        description: `Vehicle ${selectedVehicle.plateNumber} has been approved.`,
      });
      setIsApproveDialogOpen(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to approve vehicle";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRejectVehicle = async () => {
    if (!selectedVehicle) return;
    try {
      await VehicleService.rejectVehicle(selectedVehicle.id, rejectionReason);
      toast({
        title: "Vehicle rejected",
        description: `Vehicle ${selectedVehicle.plateNumber} has been rejected.`,
      });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to reject vehicle";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setPlateNumber(vehicle.plateNumber);
    setVehicleType(vehicle.vehicleType);
    setSize(vehicle.size);
    setColor(vehicle.attributes?.color || "");
    setModel(vehicle.attributes?.model || "");
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
          <div className="flex items-center space-x-2">
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
                      Enter the details of your vehicle below. Your submission will need admin approval.
                    </DialogDescription>
                  </DialogHeader>
                  <CreateVehicleForm
                    onSubmit={handleCreateVehicle}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
            <Button variant="outline" size="icon" onClick={fetchVehicles} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
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
            {isLoading ? (
              <div className="flex justify-center py-12">
                <p className="text-muted-foreground">Loading vehicles...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Car size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Failed to load vehicles</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            ) : vehicles.length > 0 ? (
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
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.plateNumber}</TableCell>
                      <TableCell className="capitalize">
                        <div className="flex items-center">
                          <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                          {vehicle.vehicleType}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{vehicle.size}</TableCell>
                      <TableCell>{vehicle.attributes?.color}</TableCell>
                      <TableCell>{vehicle.attributes?.model}</TableCell>
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
            {vehicles.length > 0 && totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} vehicles
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
                onValueChange={(value: VehicleType | "") => setVehicleType(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={VehicleType.CAR}>Car</SelectItem>
                  <SelectItem value={VehicleType.MOTORCYCLE}>Motorcycle</SelectItem>
                  <SelectItem value={VehicleType.TRUCK}>Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-size" className="text-right">
                Size
              </Label>
              <Select
                value={size}
                onValueChange={(value: Size | "") => setSize(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Size.SMALL}>Small</SelectItem>
                  <SelectItem value={Size.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={Size.LARGE}>Large</SelectItem>
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