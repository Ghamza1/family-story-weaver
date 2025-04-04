
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FolderTree } from "lucide-react";
import { useFamilyTree } from "@/context/FamilyTreeContext";
import CreateTreeModal from "@/components/tree/CreateTreeModal";
import { cn } from "@/lib/utils";

const TreeSelector = () => {
  const { trees, selectedTree, selectTree } = useFamilyTree();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  return (
    <div className="p-4 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-asli-navy">My Family Trees</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowCreateModal(true)}
          title="Create New Tree"
        >
          <Plus size={18} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {trees.length === 0 ? (
          <div className="text-center py-8 px-4 text-gray-500">
            <FolderTree size={36} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No trees yet. Create your first family tree to get started.</p>
          </div>
        ) : (
          trees.map(tree => (
            <button
              key={tree.id}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md transition-colors text-sm",
                selectedTree?.id === tree.id
                  ? "bg-asli-navy text-white"
                  : "hover:bg-gray-100 text-asli-gray"
              )}
              onClick={() => selectTree(tree.id)}
            >
              {tree.name}
            </button>
          ))
        )}
      </div>
      
      <div className="pt-4 border-t border-gray-200 mt-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} className="mr-2" />
          New Family Tree
        </Button>
      </div>
      
      <CreateTreeModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
};

export default TreeSelector;
