
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
import { useFamilyTree } from "@/context/FamilyTreeContext";
import { toast } from "sonner";

interface CreateTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTreeModal = ({ isOpen, onClose }: CreateTreeModalProps) => {
  const [treeName, setTreeName] = useState("");
  const { createTree } = useFamilyTree();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!treeName.trim()) {
      toast.error("Please enter a tree name");
      return;
    }
    
    try {
      createTree(treeName);
      toast.success(`"${treeName}" tree created successfully`);
      onClose();
    } catch (error) {
      console.error("Error creating tree:", error);
      toast.error("Failed to create tree");
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Family Tree</DialogTitle>
          <DialogDescription>
            Enter a name for your new family tree.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="treeName">Tree Name</Label>
            <Input
              id="treeName"
              value={treeName}
              onChange={(e) => setTreeName(e.target.value)}
              placeholder="e.g., Smith Family Tree"
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-asli-terracotta hover:bg-asli-terracotta/90">
              Create Tree
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTreeModal;
