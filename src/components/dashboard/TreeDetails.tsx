
import { Button } from "@/components/ui/button";
import { useFamilyTree } from "@/context/FamilyTreeContext";
import TreeCanvas from "@/components/tree/TreeCanvas";
import { Download, Upload, Printer, Share2 } from "lucide-react";
import { toast } from "sonner";

const TreeDetails = () => {
  const { selectedTree } = useFamilyTree();
  
  // These functions would be implemented fully in a production app
  const handleExportGedcom = () => {
    toast.info("GEDCOM export would be implemented here");
  };
  
  const handleImportGedcom = () => {
    toast.info("GEDCOM import would be implemented here");
  };
  
  const handlePrintTree = () => {
    toast.info("Print functionality would be implemented here");
  };
  
  const handleShareTree = () => {
    toast.info("Sharing functionality would be implemented here");
  };
  
  if (!selectedTree) {
    return (
      <div className="flex items-center justify-center h-full bg-asli-beige/30">
        <div className="text-center max-w-md px-4">
          <h2 className="text-xl font-semibold text-asli-navy mb-2">No Tree Selected</h2>
          <p className="text-asli-gray mb-4">
            Select a tree from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
        <h2 className="font-semibold text-asli-navy">
          {selectedTree.name}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleImportGedcom}>
            <Upload size={16} className="mr-1" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportGedcom}>
            <Download size={16} className="mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintTree}>
            <Printer size={16} className="mr-1" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareTree}>
            <Share2 size={16} className="mr-1" />
            Share
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <TreeCanvas />
      </div>
    </div>
  );
};

export default TreeDetails;
