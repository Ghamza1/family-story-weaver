
import { useState, useRef, useEffect } from "react";
import PersonNode from "./PersonNode";
import { Person } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Home as HomeIcon,
  Plus,
  UserPlus
} from "lucide-react";
import { useFamilyTree } from "@/context/FamilyTreeContext";
import AddPersonModal from "./AddPersonModal";

const TreeCanvas = () => {
  const { selectedTree, selectedPerson, setSelectedPerson } = useFamilyTree();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [relationshipType, setRelationshipType] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Calculate node positions
  const getNodePositions = () => {
    const positions: Record<string, { x: number; y: number }> = {};
    const people = selectedTree?.people || {};
    const centerX = (canvasRef.current?.clientWidth || 800) / 2;
    const centerY = (canvasRef.current?.clientHeight || 600) / 2;
    
    // Simple layout algorithm
    // This is a placeholder - a real app would need a more sophisticated layout
    let i = 0;
    for (const id in people) {
      const person = people[id];
      // Just a simple grid layout for this demo
      const row = Math.floor(i / 3);
      const col = i % 3;
      positions[id] = {
        x: centerX + (col - 1) * 250,
        y: centerY + row * 150
      };
      i++;
    }
    
    return positions;
  };
  
  const nodePositions = getNodePositions();
  
  // Handle canvas dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left clicks
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  // Add person button handlers
  const handleAddPerson = (type: string) => {
    setRelationshipType(type);
    setShowAddModal(true);
  };
  
  const closeAddModal = () => {
    setShowAddModal(false);
    setRelationshipType(null);
  };
  
  return (
    <div className="relative h-full w-full">
      <div 
        ref={canvasRef}
        className="family-canvas w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="absolute inset-0 transform"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center'
          }}
        >
          {/* Render person nodes */}
          {selectedTree && Object.values(selectedTree.people).map(person => (
            <PersonNode 
              key={person.id}
              person={person}
              isSelected={selectedPerson?.id === person.id}
              onClick={() => setSelectedPerson(person)}
              position={nodePositions[person.id] || { x: 0, y: 0 }}
            />
          ))}
          
          {/* Render relationships (lines between nodes) */}
          {/* This would be implemented in a real app */}
        </div>
      </div>
      
      {/* Tree controls */}
      <div className="tree-controls">
        <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn size={18} />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut size={18} />
        </Button>
        <Button variant="outline" size="icon" onClick={handleResetView} title="Reset View">
          <HomeIcon size={18} />
        </Button>
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => handleAddPerson('root')}
          disabled={!!selectedTree?.rootPersonId}
        >
          <UserPlus size={16} />
          <span>Add First Person</span>
        </Button>
      </div>
      
      {/* Person action buttons - show when a person is selected */}
      {selectedPerson && (
        <div className="absolute right-4 top-4 bg-white p-3 rounded-lg shadow-md border border-gray-200 flex flex-col gap-2 z-10">
          <h3 className="font-semibold text-sm text-asli-navy">Add Relative to {selectedPerson.firstName}</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAddPerson('father')}
              disabled={!!selectedPerson.fatherId}
            >
              Father
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAddPerson('mother')}
              disabled={!!selectedPerson.motherId}
            >
              Mother
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddPerson('spouse')}>
              Spouse
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddPerson('child')}>
              Child
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddPerson('sibling')}>
              Sibling
            </Button>
          </div>
        </div>
      )}
      
      {/* Add person modal */}
      {showAddModal && (
        <AddPersonModal 
          isOpen={showAddModal} 
          onClose={closeAddModal} 
          relationshipType={relationshipType || 'root'} 
          relativeTo={selectedPerson} 
        />
      )}
    </div>
  );
};

export default TreeCanvas;
