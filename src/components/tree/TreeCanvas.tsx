
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
  UserPlus,
  LineIcon, 
  SeparatorHorizontal
} from "lucide-react";
import { useFamilyTree } from "@/context/FamilyTreeContext";
import AddPersonModal from "./AddPersonModal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslation } from "react-i18next";

const TreeCanvas = () => {
  const { t } = useTranslation();
  const { selectedTree, selectedPerson, setSelectedPerson } = useFamilyTree();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [relationshipType, setRelationshipType] = useState<string | null>(null);
  const [lineStyle, setLineStyle] = useState<"solid" | "dotted">("solid");
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Calculate node positions with improved algorithm for extended family
  const getNodePositions = () => {
    const positions: Record<string, { x: number; y: number }> = {};
    const people = selectedTree?.people || {};
    const centerX = (canvasRef.current?.clientWidth || 800) / 2;
    const centerY = (canvasRef.current?.clientHeight || 600) / 2;
    
    // Start with the root person or selected person
    const rootId = selectedTree?.rootPersonId || (selectedPerson?.id);
    
    if (!rootId || !people[rootId]) {
      return positions;
    }
    
    // Helper to check if a person has been positioned
    const isPositioned = (id: string) => id in positions;
    
    // Helper to get all children for a person
    const getChildren = (personId: string) => {
      return Object.values(people).filter(p => 
        p.fatherId === personId || p.motherId === personId
      );
    };
    
    // Helper to get all siblings for a person
    const getSiblings = (personId: string) => {
      const person = people[personId];
      if (!person) return [];
      
      // Get siblings via common parents
      const siblings = [];
      if (person.fatherId) {
        siblings.push(...Object.values(people).filter(p => 
          p.id !== personId && p.fatherId === person.fatherId
        ));
      }
      if (person.motherId) {
        siblings.push(...Object.values(people).filter(p => 
          p.id !== personId && !siblings.includes(p) && p.motherId === person.motherId
        ));
      }
      
      // Add explicitly defined siblings
      for (const sibId of person.siblingIds) {
        const sibling = people[sibId];
        if (sibling && !siblings.includes(sibling)) {
          siblings.push(sibling);
        }
      }
      
      return siblings;
    };
    
    // Position the root person
    positions[rootId] = { x: centerX, y: centerY };
    
    // Build tree structure by generation
    // First, go up to ancestors
    const processAncestors = (personId: string, level = 0, horizontalOffset = 0) => {
      const person = people[personId];
      if (!person) return;
      
      // Process father (if exists and not already positioned)
      if (person.fatherId && !isPositioned(person.fatherId)) {
        const fatherX = positions[personId].x - 250 - (level * 50);
        const fatherY = positions[personId].y - 150;
        positions[person.fatherId] = { x: fatherX, y: fatherY };
        
        // Recursively process father's ancestors
        processAncestors(person.fatherId, level + 1, horizontalOffset - 1);
      }
      
      // Process mother (if exists and not already positioned)
      if (person.motherId && !isPositioned(person.motherId)) {
        const motherX = positions[personId].x + 250 + (level * 50);
        const motherY = positions[personId].y - 150;
        positions[person.motherId] = { x: motherX, y: motherY };
        
        // Recursively process mother's ancestors
        processAncestors(person.motherId, level + 1, horizontalOffset + 1);
      }
    };
    
    // Process siblings and their spouses
    const processSiblings = (personId: string) => {
      const person = people[personId];
      if (!person) return;
      
      const siblings = getSiblings(personId);
      let siblingOffset = 1;
      
      for (const sibling of siblings) {
        if (!isPositioned(sibling.id)) {
          const siblingX = positions[personId].x + (270 * siblingOffset);
          const siblingY = positions[personId].y;
          positions[sibling.id] = { x: siblingX, y: siblingY };
          siblingOffset++;
          
          // Process sibling's spouses
          processSpouses(sibling.id);
        }
      }
    };
    
    // Process spouses
    const processSpouses = (personId: string) => {
      const person = people[personId];
      if (!person) return;
      
      let spouseOffset = 1;
      for (const spouseId of person.spouseIds) {
        if (!isPositioned(spouseId)) {
          const spouseX = positions[personId].x;
          const spouseY = positions[personId].y + (130 * spouseOffset);
          positions[spouseId] = { x: spouseX, y: spouseY };
          spouseOffset++;
        }
      }
    };
    
    // Process descendants (children and their descendants)
    const processDescendants = (personId: string, level = 0, horizontalOffset = 0) => {
      const children = getChildren(personId);
      let childOffset = -Math.floor(children.length / 2);
      
      for (const child of children) {
        if (!isPositioned(child.id)) {
          const childX = positions[personId].x + (220 * (childOffset + horizontalOffset));
          const childY = positions[personId].y + 150 + (level * 50);
          positions[child.id] = { x: childX, y: childY };
          childOffset++;
          
          // Process this child's spouses
          processSpouses(child.id);
          
          // Recursively process this child's descendants
          processDescendants(child.id, level + 1, childOffset);
        }
      }
    };
    
    // Run all the positioning algorithms
    processAncestors(rootId);
    processSiblings(rootId);
    processSpouses(rootId);
    processDescendants(rootId);
    
    // For any remaining people, position them in a grid
    let gridRow = 0;
    let gridCol = 0;
    for (const id in people) {
      if (!isPositioned(id)) {
        positions[id] = {
          x: centerX + 350 + (gridCol * 220),
          y: centerY + 350 + (gridRow * 150)
        };
        
        gridCol++;
        if (gridCol > 2) {
          gridCol = 0;
          gridRow++;
        }
      }
    }
    
    return positions;
  };
  
  const nodePositions = getNodePositions();
  
  // Calculate relationship lines
  const getRelationshipLines = () => {
    const lines = [];
    const people = selectedTree?.people || {};
    
    // Parent-child relationships
    for (const id in people) {
      const person = people[id];
      
      // Parent-child lines
      if (person.fatherId && people[person.fatherId] && 
          nodePositions[id] && nodePositions[person.fatherId]) {
        lines.push({
          from: nodePositions[person.fatherId],
          to: nodePositions[id],
          type: 'parent-child'
        });
      }
      
      if (person.motherId && people[person.motherId] && 
          nodePositions[id] && nodePositions[person.motherId]) {
        lines.push({
          from: nodePositions[person.motherId],
          to: nodePositions[id],
          type: 'parent-child'
        });
      }
      
      // Spouse lines
      for (const spouseId of person.spouseIds) {
        // Only draw the line once (from the lower ID to the higher ID)
        if (id < spouseId && nodePositions[id] && nodePositions[spouseId]) {
          lines.push({
            from: nodePositions[id],
            to: nodePositions[spouseId],
            type: 'spouse'
          });
        }
      }
      
      // Sibling lines (explicitly defined)
      for (const siblingId of person.siblingIds) {
        // Only draw the line once (from the lower ID to the higher ID)
        if (id < siblingId && nodePositions[id] && nodePositions[siblingId]) {
          lines.push({
            from: nodePositions[id],
            to: nodePositions[siblingId],
            type: 'sibling'
          });
        }
      }
    }
    
    return lines;
  };
  
  const relationshipLines = getRelationshipLines();
  
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
          {/* Render relationship lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {relationshipLines.map((line, index) => (
              <line
                key={`line-${index}`}
                x1={line.from.x}
                y1={line.from.y}
                x2={line.to.x}
                y2={line.to.y}
                stroke={line.type === 'spouse' ? '#9E86ED' : '#555555'}
                strokeWidth={2}
                strokeDasharray={lineStyle === 'dotted' ? '5,5' : 'none'}
              />
            ))}
          </svg>
          
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
        </div>
      </div>
      
      {/* Tree controls */}
      <div className="tree-controls absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md border border-gray-200 flex flex-col gap-2 z-10">
        <Button variant="outline" size="icon" onClick={handleZoomIn} title={t('Zoom In')}>
          <ZoomIn size={18} />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut} title={t('Zoom Out')}>
          <ZoomOut size={18} />
        </Button>
        <Button variant="outline" size="icon" onClick={handleResetView} title={t('Reset View')}>
          <HomeIcon size={18} />
        </Button>
        <div className="h-px w-full bg-gray-300 my-1"></div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => handleAddPerson('root')}
          disabled={!!selectedTree?.rootPersonId}
        >
          <UserPlus size={16} />
          <span>{t('Add First Person')}</span>
        </Button>
      </div>
      
      {/* Line style control */}
      <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md border border-gray-200 z-10">
        <div className="text-xs font-medium mb-1 text-gray-500">{t('Line Style')}</div>
        <ToggleGroup type="single" value={lineStyle} onValueChange={(value) => value && setLineStyle(value as 'solid' | 'dotted')}>
          <ToggleGroupItem value="solid" title={t('Solid Lines')}>
            <LineIcon size={16} />
          </ToggleGroupItem>
          <ToggleGroupItem value="dotted" title={t('Dotted Lines')}>
            <SeparatorHorizontal size={16} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {/* Person action buttons - show when a person is selected */}
      {selectedPerson && (
        <div className="absolute right-4 top-20 bg-white p-3 rounded-lg shadow-md border border-gray-200 flex flex-col gap-2 z-10">
          <h3 className="font-semibold text-sm text-asli-navy">
            {t('Add Relative to')} {selectedPerson.firstName}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAddPerson('father')}
              disabled={!!selectedPerson.fatherId}
            >
              {t('Father')}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAddPerson('mother')}
              disabled={!!selectedPerson.motherId}
            >
              {t('Mother')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddPerson('spouse')}>
              {t('Spouse')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddPerson('child')}>
              {t('Child')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddPerson('sibling')}>
              {t('Sibling')}
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
