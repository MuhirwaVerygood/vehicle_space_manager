
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { VehicleFormData } from "../../types/vehicle";
import { useToast } from "../../hooks/use-toast";

interface CreateVehicleFormProps {
  onSubmit: (data: VehicleFormData) => void;
  onCancel: () => void;
}

const CreateVehicleForm: React.FC<CreateVehicleFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const { toast } = useToast();
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<"car" | "motorcycle" | "truck" | "">("");
  const [size, setSize] = useState<"small" | "medium" | "large" | "">("");
  const [color, setColor] = useState("");
  const [model, setModel] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plateNumber || !vehicleType || !size) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const vehicleData: VehicleFormData = {
      plateNumber,
      vehicleType: vehicleType as "car" | "motorcycle" | "truck",
      size: size as "small" | "medium" | "large",
      attributes: {
        color,
        model,
      },
    };
    
    onSubmit(vehicleData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="plateNumber" className="text-right">
          Plate Number*
        </Label>
        <Input
          id="plateNumber"
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
          className="col-span-3"
          placeholder="e.g. ABC123"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="vehicleType" className="text-right">
          Vehicle Type*
        </Label>
        <Select 
          value={vehicleType} 
          onValueChange={(value: "car" | "motorcycle" | "truck") => setVehicleType(value)}
          required
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
          Size*
        </Label>
        <Select 
          value={size} 
          onValueChange={(value: "small" | "medium" | "large") => setSize(value)}
          required
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
        <Label htmlFor="color" className="text-right">
          Color
        </Label>
        <Input
          id="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="col-span-3"
          placeholder="e.g. Blue"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="model" className="text-right">
          Model
        </Label>
        <Input
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="col-span-3"
          placeholder="e.g. Toyota Corolla"
        />
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};

export default CreateVehicleForm;
