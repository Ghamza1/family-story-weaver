
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Person } from "@/types";
import { useFamilyTree } from "@/context/FamilyTreeContext";
import { toast } from "sonner";

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  relationshipType: string;
  relativeTo?: Person | null;
}

const AddPersonModal = ({
  isOpen,
  onClose,
  relationshipType,
  relativeTo,
}: AddPersonModalProps) => {
  const { addPerson } = useFamilyTree();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: relativeTo?.lastName || "",
    maidenName: "",
    prefix: "",
    suffix: "",
    gender: relationshipType === "mother" ? "female" : 
            relationshipType === "father" ? "male" : "",
    birthDate: "",
    birthPlace: "",
    deathDate: "",
    deathPlace: "",
    occupation: "",
    notes: "",
  });
  
  const getRelationshipTitle = () => {
    switch (relationshipType) {
      case "root": return "Add First Person";
      case "father": return "Add Father";
      case "mother": return "Add Mother";
      case "spouse": return "Add Spouse";
      case "child": return "Add Child";
      case "sibling": return "Add Sibling";
      default: return "Add Person";
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGenderChange = (value: string) => {
    setFormData(prev => ({ ...prev, gender: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.gender) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      addPerson({
        ...formData,
        gender: formData.gender as "male" | "female" | "other",
      }, relationshipType, relativeTo?.id);
      
      toast.success("Person added successfully");
      onClose();
    } catch (error) {
      console.error("Error adding person:", error);
      toast.error("Failed to add person");
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getRelationshipTitle()}</DialogTitle>
          <DialogDescription>
            Enter the details of the person you want to add to your family tree.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maidenName">Maiden Name</Label>
              <Input
                id="maidenName"
                name="maidenName"
                value={formData.maidenName}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prefix">Prefix</Label>
              <Input
                id="prefix"
                name="prefix"
                placeholder="Mr., Dr., etc."
                value={formData.prefix}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="suffix">Suffix</Label>
              <Input
                id="suffix"
                name="suffix"
                placeholder="Jr., Sr., III, etc."
                value={formData.suffix}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Gender <span className="text-red-500">*</span></Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={handleGenderChange}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthPlace">Birth Place</Label>
              <Input
                id="birthPlace"
                name="birthPlace"
                value={formData.birthPlace}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deathDate">Death Date</Label>
              <Input
                id="deathDate"
                name="deathDate"
                type="date"
                value={formData.deathDate}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deathPlace">Death Place</Label>
              <Input
                id="deathPlace"
                name="deathPlace"
                value={formData.deathPlace}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-asli-navy hover:bg-asli-blue">
              Save Person
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPersonModal;
