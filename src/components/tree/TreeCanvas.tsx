
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
  Minus,
  SeparatorHorizontal,
  MoreVertical,
  Download,
  Upload,
  Printer,
  Share2
} from "lucide-react";
import { useFamilyTree } from "@/context/FamilyTreeContext";
import AddPersonModal from "./AddPersonModal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Line {
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: string;
  id: string;
  style: "solid" | "dotted";
}

const TreeCanvas = () => {
  const { t } = useTranslation();
  const { selectedTree, selectedPerson, setSelectedPerson } = useFamilyTree();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [relationshipType, setRelationshipType] = useState<string | null>(null);
  const [defaultLineStyle, setDefaultLineStyle] = useState<"solid" | "dotted">("solid");
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [isGridMode, setIsGridMode] = useState(false);
  const [gridPosition, setGridPosition] = useState<{ x: number, y: number } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const getNodePositions = () => {
    const positions: Record<string, { x: number; y: number }> = {};
    const people = selectedTree?.people || {};
    const centerX = (canvasRef.current?.clientWidth || 800) / 2;
    const centerY = (canvasRef.current?.clientHeight || 600) / 2;
    
    const rootId = selectedTree?.rootPersonId || (selectedPerson?.id);
    
    if (!rootId || !people[rootId]) {
      return positions;
    }
    
    const isPositioned = (id: string) => id in positions;
    
    const getChildren = (personId: string) => {
      return Object.values(people).filter(p => 
        p.fatherId === personId || p.motherId === personId
      );
    };
    
    const getSiblings = (personId: string) => {
      const person = people[personId];
      if (!person) return [];
      
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
      
      for (const sibId of person.siblingIds) {
        const sibling = people[sibId];
        if (sibling && !siblings.includes(sibling)) {
          siblings.push(sibling);
        }
      }
      
      return siblings;
    };
    
    positions[rootId] = { x: centerX, y: centerY };
    
    const processAncestors = (personId: string, level = 0, horizontalOffset = 0) => {
      const person = people[personId];
      if (!person) return;
      
      if (person.fatherId && !isPositioned(person.fatherId)) {
        const fatherX = positions[personId].x - 250 - (level * 50);
        const fatherY = positions[personId].y - 150;
        positions[person.fatherId] = { x: fatherX, y: fatherY };
        
        processAncestors(person.fatherId, level + 1, horizontalOffset - 1);
      }
      
      if (person.motherId && !isPositioned(person.motherId)) {
        const motherX = positions[personId].x + 250 + (level * 50);
        const motherY = positions[personId].y - 150;
        positions[person.motherId] = { x: motherX, y: motherY };
        
        processAncestors(person.motherId, level + 1, horizontalOffset + 1);
      }
    };
    
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
          
          processSpouses(sibling.id);
        }
      }
    };
    
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
    
    const processDescendants = (personId: string, level = 0, horizontalOffset = 0) => {
      const children = getChildren(personId);
      let childOffset = -Math.floor(children.length / 2);
      
      for (const child of children) {
        if (!isPositioned(child.id)) {
          const childX = positions[personId].x + (220 * (childOffset + horizontalOffset));
          const childY = positions[personId].y + 150 + (level * 50);
          positions[child.id] = { x: childX, y: childY };
          childOffset++;
          
          processSpouses(child.id);
          
          processDescendants(child.id, level + 1, childOffset);
        }
      }
    };
    
    processAncestors(rootId);
    processSiblings(rootId);
    processSpouses(rootId);
    processDescendants(rootId);
    
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
  
  const getRelationshipLines = (): Line[] => {
    const lines: Line[] = [];
    const people = selectedTree?.people || {};
    
    for (const id in people) {
      const person = people[id];
      
      if (person.fatherId && people[person.fatherId] && 
          nodePositions[id] && nodePositions[person.fatherId]) {
        lines.push({
          from: nodePositions[person.fatherId],
          to: nodePositions[id],
          type: 'parent-child',
          id: `father-${person.fatherId}-to-${id}`,
          style: defaultLineStyle
        });
      }
      
      if (person.motherId && people[person.motherId] && 
          nodePositions[id] && nodePositions[person.motherId]) {
        lines.push({
          from: nodePositions[person.motherId],
          to: nodePositions[id],
          type: 'parent-child',
          id: `mother-${person.motherId}-to-${id}`,
          style: defaultLineStyle
        });
      }
      
      for (const spouseId of person.spouseIds) {
        if (id < spouseId && nodePositions[id] && nodePositions[spouseId]) {
          lines.push({
            from: nodePositions[id],
            to: nodePositions[spouseId],
            type: 'spouse',
            id: `spouse-${id}-to-${spouseId}`,
            style: defaultLineStyle
          });
        }
      }
      
      for (const siblingId of person.siblingIds) {
        if (id < siblingId && nodePositions[id] && nodePositions[siblingId]) {
          lines.push({
            from: nodePositions[id],
            to: nodePositions[siblingId],
            type: 'sibling',
            id: `sibling-${id}-to-${siblingId}`,
            style: defaultLineStyle
          });
        }
      }
    }
    
    return lines;
  };
  
  const [relationshipLines, setRelationshipLines] = useState<Line[]>([]);
  
  useEffect(() => {
    const lines = getRelationshipLines();
    setRelationshipLines(lines);
  }, [selectedTree, defaultLineStyle, nodePositions]);
  
  const toggleLineStyle = (lineId: string) => {
    setRelationshipLines(prev => 
      prev.map(line => 
        line.id === lineId 
          ? { ...line, style: line.style === 'solid' ? 'dotted' : 'solid' } 
          : line
      )
    );
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
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
  
  const handleAddPerson = (type: string) => {
    setRelationshipType(type);
    setShowAddModal(true);
  };
  
  const closeAddModal = () => {
    setShowAddModal(false);
    setRelationshipType(null);
  };

  const handleLineClick = (e: React.MouseEvent, lineId: string) => {
    e.stopPropagation();
    setSelectedLineId(lineId === selectedLineId ? null : lineId);
  };

  const handleGridModeToggle = () => {
    setIsGridMode(!isGridMode);
    setSelectedLineId(null);
  };

  const handleGridClick = (e: React.MouseEvent) => {
    if (!isGridMode) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate position in the grid (snap to 100px grid)
    const x = Math.round((e.clientX - rect.left - position.x) / 100) * 100;
    const y = Math.round((e.clientY - rect.top - position.y) / 100) * 100;
    
    setGridPosition({ x, y });
    handleAddPerson('root');
  };

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
  
  return (
    <div className="relative h-full w-full">
      <div 
        ref={canvasRef}
        className={`family-canvas w-full h-full ${isGridMode ? 'cursor-cell' : 'cursor-grab active:cursor-grabbing'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={isGridMode ? handleGridClick : undefined}
      >
        <div 
          className="absolute inset-0 transform"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center'
          }}
        >
          {isGridMode && (
            <div className="absolute inset-0 pointer-events-none">
              <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                  <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          )}
          
          <svg className="absolute inset-0 w-full h-full">
            {relationshipLines.map((line) => {
              const isSelected = selectedLineId === line.id;
              const strokeColor = line.type === 'spouse' ? '#9E86ED' : '#555555';
              const strokeWidth = isSelected ? 4 : 2;
              
              return (
                <g key={line.id}>
                  <line
                    x1={line.from.x}
                    y1={line.from.y}
                    x2={line.to.x}
                    y2={line.to.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={line.style === 'dotted' ? '5,5' : 'none'}
                    className="cursor-pointer"
                    onClick={(e) => handleLineClick(e, line.id)}
                  />
                  {isSelected && (
                    <g>
                      <circle 
                        cx={(line.from.x + line.to.x) / 2} 
                        cy={(line.from.y + line.to.y) / 2} 
                        r="15" 
                        fill="white" 
                        stroke={strokeColor}
                      />
                      <g transform={`translate(${(line.from.x + line.to.x) / 2 - 6}, ${(line.from.y + line.to.y) / 2 - 6})`}>
                        {line.style === 'solid' ? (
                          <SeparatorHorizontal 
                            size={12} 
                            className="cursor-pointer" 
                            onClick={() => toggleLineStyle(line.id)}
                          />
                        ) : (
                          <Minus 
                            size={12} 
                            className="cursor-pointer" 
                            onClick={() => toggleLineStyle(line.id)}
                          />
                        )}
                      </g>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
          
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
      </div>
      
      <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md border border-gray-200 flex flex-col gap-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" title={t('Tools')}>
              <MoreVertical size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleImportGedcom}>
              <Upload size={16} className="mr-2" />
              {t('Import')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportGedcom}>
              <Download size={16} className="mr-2" />
              {t('Export')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrintTree}>
              <Printer size={16} className="mr-2" />
              {t('Print')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareTree}>
              <Share2 size={16} className="mr-2" />
              {t('Share')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant={isGridMode ? "default" : "outline"} 
          size="icon" 
          onClick={handleGridModeToggle}
          title={isGridMode ? t('Exit Add Mode') : t('Add Person')}
        >
          <Plus size={18} />
        </Button>
        
        <div className="h-px w-full bg-gray-300 my-1"></div>
        
        <ToggleGroup type="single" value={defaultLineStyle} onValueChange={(value) => value && setDefaultLineStyle(value as 'solid' | 'dotted')}>
          <ToggleGroupItem value="solid" title={t('Solid Lines')}>
            <Minus size={16} />
          </ToggleGroupItem>
          <ToggleGroupItem value="dotted" title={t('Dotted Lines')}>
            <SeparatorHorizontal size={16} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {selectedPerson && !isGridMode && (
        <div className="absolute right-4 top-40 bg-white p-3 rounded-lg shadow-md border border-gray-200 flex flex-col gap-2 z-10">
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
