
import { useState, useRef, useEffect } from "react";
import PersonNode from "./PersonNode";
import { Person } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, 
  ZoomOut, 
  Home as HomeIcon,
  User,
  Users,
  Minus,
  SeparatorHorizontal,
  MoreVertical,
  Download,
  Upload,
  Printer,
  Share2,
  Undo,
  Redo
} from "lucide-react";
import { useFamilyTree } from "@/context/FamilyTreeContext";
import AddPersonModal from "./AddPersonModal";
import PersonDetails from "./PersonDetails";
import EditPersonModal from "./EditPersonModal";
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

interface FamilyConnection {
  id: string;
  type: 'spouse' | 'parent-child' | 'sibling';
  fromId: string;
  toId: string;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  controlPoints?: { x: number; y: number }[];
  style: "solid" | "dotted";
}

// Simple action for undo/redo functionality
interface CanvasAction {
  type: 'MOVE_PERSON' | 'CHANGE_LINE_STYLE';
  payload: any;
  undo: () => void;
}

const TreeCanvas = () => {
  const { t } = useTranslation();
  const { selectedTree, selectedPerson, setSelectedPerson, removePerson, updatePerson } = useFamilyTree();
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [detailsPerson, setDetailsPerson] = useState<Person | null>(null);
  const [showRelativeOptions, setShowRelativeOptions] = useState(false);
  const [isMovingPerson, setIsMovingPerson] = useState(false);
  const [personBeingMoved, setPersonBeingMoved] = useState<Person | null>(null);
  const [customNodePositions, setCustomNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [familyConnections, setFamilyConnections] = useState<FamilyConnection[]>([]);
  
  // For undo/redo functionality
  const [actionHistory, setActionHistory] = useState<CanvasAction[]>([]);
  const [futureActions, setFutureActions] = useState<CanvasAction[]>([]);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastClickTime = useRef<number>(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  // For drag and drop functionality
  const isDraggingPerson = useRef(false);
  const personDraggedId = useRef<string | null>(null);
  const personStartPos = useRef<{ x: number, y: number } | null>(null);
  
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
    
    // Use custom positions if available, otherwise calculate
    for (const id in customNodePositions) {
      if (people[id]) {
        positions[id] = { ...customNodePositions[id] };
      }
    }
    
    // Set root position if not already positioned
    if (!positions[rootId]) {
      positions[rootId] = { x: centerX, y: centerY };
    }
    
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

  // Generate advanced family connections
  const generateFamilyConnections = () => {
    const connections: FamilyConnection[] = [];
    const people = selectedTree?.people || {};
    
    // Process spouse connections - horizontal line
    for (const personId in people) {
      const person = people[personId];
      
      // Process spouse connections
      for (const spouseId of person.spouseIds) {
        // Only create one connection per spouse pair
        if (personId < spouseId && 
            nodePositions[personId] && 
            nodePositions[spouseId]) {
          const connectionId = `spouse-${personId}-to-${spouseId}`;
          
          // Check if this connection already exists with custom style
          const existingConnection = familyConnections.find(conn => conn.id === connectionId);
          const style = existingConnection ? existingConnection.style : defaultLineStyle;
          
          connections.push({
            id: connectionId,
            type: 'spouse',
            fromId: personId,
            toId: spouseId,
            fromPos: nodePositions[personId],
            toPos: nodePositions[spouseId],
            style
          });
        }
      }
      
      // Process parent-child connections - vertical line from parent to child
      if (person.fatherId && people[person.fatherId] && 
          nodePositions[personId] && nodePositions[person.fatherId]) {
        const connectionId = `father-${person.fatherId}-to-${personId}`;
        
        // Check if this connection already exists with custom style
        const existingConnection = familyConnections.find(conn => conn.id === connectionId);
        const style = existingConnection ? existingConnection.style : defaultLineStyle;
        
        // Vertical line connection
        connections.push({
          id: connectionId,
          type: 'parent-child',
          fromId: person.fatherId,
          toId: personId,
          fromPos: nodePositions[person.fatherId],
          toPos: nodePositions[personId],
          controlPoints: [
            { 
              x: nodePositions[person.fatherId].x, 
              y: nodePositions[person.fatherId].y + 40 
            },
            { 
              x: nodePositions[personId].x, 
              y: nodePositions[person.fatherId].y + 40 
            }
          ],
          style
        });
      }
      
      if (person.motherId && people[person.motherId] && 
          nodePositions[personId] && nodePositions[person.motherId]) {
        const connectionId = `mother-${person.motherId}-to-${personId}`;
        
        // Check if this connection already exists with custom style
        const existingConnection = familyConnections.find(conn => conn.id === connectionId);
        const style = existingConnection ? existingConnection.style : defaultLineStyle;
        
        // Vertical line connection
        connections.push({
          id: connectionId,
          type: 'parent-child',
          fromId: person.motherId,
          toId: personId,
          fromPos: nodePositions[person.motherId],
          toPos: nodePositions[personId],
          controlPoints: [
            { 
              x: nodePositions[person.motherId].x, 
              y: nodePositions[person.motherId].y + 40 
            },
            { 
              x: nodePositions[personId].x, 
              y: nodePositions[person.motherId].y + 40 
            }
          ],
          style
        });
      }
      
      // Process sibling connections
      for (const siblingId of person.siblingIds) {
        if (personId < siblingId && 
            nodePositions[personId] && 
            nodePositions[siblingId]) {
          const connectionId = `sibling-${personId}-to-${siblingId}`;
          
          // Check if this connection already exists with custom style
          const existingConnection = familyConnections.find(conn => conn.id === connectionId);
          const style = existingConnection ? existingConnection.style : defaultLineStyle;
          
          // Create sibling bar connection
          const siblingBarY = Math.min(nodePositions[personId].y, nodePositions[siblingId].y) - 30;
          
          connections.push({
            id: connectionId,
            type: 'sibling',
            fromId: personId,
            toId: siblingId,
            fromPos: nodePositions[personId],
            toPos: nodePositions[siblingId],
            controlPoints: [
              { x: nodePositions[personId].x, y: siblingBarY },
              { x: nodePositions[siblingId].x, y: siblingBarY }
            ],
            style
          });
        }
      }
    }
    
    return connections;
  };
  
  useEffect(() => {
    const connections = generateFamilyConnections();
    setFamilyConnections(connections);
  }, [selectedTree, defaultLineStyle, nodePositions]);
  
  // Record an action for undo/redo
  const recordAction = (action: CanvasAction) => {
    setActionHistory(prev => [...prev, action]);
    // Clear future actions when a new action is performed
    setFutureActions([]);
  };
  
  // Undo the last action
  const handleUndo = () => {
    if (actionHistory.length === 0) return;
    
    const lastAction = actionHistory[actionHistory.length - 1];
    lastAction.undo();
    
    setActionHistory(prev => prev.slice(0, -1));
    setFutureActions(prev => [lastAction, ...prev]);
  };
  
  // Redo the last undone action
  const handleRedo = () => {
    if (futureActions.length === 0) return;
    
    const nextAction = futureActions[0];
    
    if (nextAction.type === 'MOVE_PERSON') {
      const { personId, newPosition } = nextAction.payload;
      setCustomNodePositions(prev => ({
        ...prev,
        [personId]: newPosition
      }));
    } else if (nextAction.type === 'CHANGE_LINE_STYLE') {
      const { lineId, newStyle } = nextAction.payload;
      setFamilyConnections(prev => 
        prev.map(connection => 
          connection.id === lineId 
            ? { ...connection, style: newStyle } 
            : connection
        )
      );
    }
    
    setFutureActions(prev => prev.slice(1));
    setActionHistory(prev => [...prev, nextAction]);
  };
  
  const toggleLineStyle = (lineId: string) => {
    const connection = familyConnections.find(conn => conn.id === lineId);
    if (!connection) return;
    
    const oldStyle = connection.style;
    const newStyle = oldStyle === 'solid' ? 'dotted' : 'solid';
    
    // Record the action for undo/redo
    recordAction({
      type: 'CHANGE_LINE_STYLE',
      payload: { lineId, newStyle, oldStyle },
      undo: () => {
        setFamilyConnections(prev => 
          prev.map(conn => 
            conn.id === lineId ? { ...conn, style: oldStyle } : conn
          )
        );
      }
    });
    
    setFamilyConnections(prev => 
      prev.map(connection => 
        connection.id === lineId 
          ? { ...connection, style: newStyle } 
          : connection
      )
    );
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    if (isMovingPerson && personBeingMoved) {
      // When moving a person, don't start canvas dragging
      return;
    }
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMovingPerson && personBeingMoved) {
      // Move the person instead of the canvas
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = (e.clientX - rect.left - position.x) / scale;
      const y = (e.clientY - rect.top - position.y) / scale;
      
      setCustomNodePositions(prev => ({
        ...prev,
        [personBeingMoved.id]: { x, y }
      }));
      return;
    }
    
    // For drag and drop functionality
    if (isDraggingPerson.current && personDraggedId.current) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = (e.clientX - rect.left - position.x) / scale;
      const y = (e.clientY - rect.top - position.y) / scale;
      
      setCustomNodePositions(prev => ({
        ...prev,
        [personDraggedId.current!]: { x, y }
      }));
      return;
    }
    
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // For person drag and drop
    if (isDraggingPerson.current && personDraggedId.current && personStartPos.current) {
      const currentPos = customNodePositions[personDraggedId.current];
      
      // Record the action for undo/redo
      recordAction({
        type: 'MOVE_PERSON',
        payload: { 
          personId: personDraggedId.current, 
          oldPosition: personStartPos.current,
          newPosition: currentPos
        },
        undo: () => {
          setCustomNodePositions(prev => ({
            ...prev,
            [personDraggedId.current!]: personStartPos.current!
          }));
        }
      });
      
      isDraggingPerson.current = false;
      personDraggedId.current = null;
      personStartPos.current = null;
    }
    
    if (isMovingPerson) {
      if (personBeingMoved) {
        // Record the move action for undo/redo
        const oldPosition = nodePositions[personBeingMoved.id] || { x: 0, y: 0 };
        const newPosition = customNodePositions[personBeingMoved.id];
        
        recordAction({
          type: 'MOVE_PERSON',
          payload: { 
            personId: personBeingMoved.id, 
            oldPosition,
            newPosition
          },
          undo: () => {
            setCustomNodePositions(prev => ({
              ...prev,
              [personBeingMoved.id]: oldPosition
            }));
          }
        });
      }
      
      setIsMovingPerson(false);
      setPersonBeingMoved(null);
    }
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    const scaleChange = 0.1;
    
    if (delta < 0) {
      // Zoom in
      setScale(prev => Math.min(prev + scaleChange, 2));
    } else {
      // Zoom out
      setScale(prev => Math.max(prev - scaleChange, 0.5));
    }
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
  
  // Start person drag
  const handlePersonDragStart = (e: React.MouseEvent, person: Person) => {
    e.stopPropagation();
    isDraggingPerson.current = true;
    personDraggedId.current = person.id;
    personStartPos.current = customNodePositions[person.id] || nodePositions[person.id] || { x: 0, y: 0 };
  };
  
  const handlePersonClick = (person: Person, e: React.MouseEvent) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;
    
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    // Start a timer to detect long press for moving persons
    longPressTimer.current = setTimeout(() => {
      setIsMovingPerson(true);
      setPersonBeingMoved(person);
      setSelectedPerson(null);
      toast.info(t("You can now move this person. Click to place."));
    }, 500);
    
    if (timeSinceLastClick < 300) {
      // Double click - show details/edit
      setDetailsPerson(person);
      setShowDetailsModal(true);
      setSelectedPerson(null);
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    } else {
      // Single click - select person
      clickTimer.current = setTimeout(() => {
        setSelectedPerson(person);
        // Auto-deselect other modes to avoid confusion
        setIsGridMode(false);
      }, 300);
    }
    
    lastClickTime.current = now;
  };
  
  const handleAddPerson = (type: string) => {
    setRelationshipType(type);
    setShowAddModal(true);
  };
  
  const closeAddModal = () => {
    setShowAddModal(false);
    setRelationshipType(null);
    setIsGridMode(false);
    setShowRelativeOptions(false);
    setSelectedPerson(null);
  };

  const handleLineClick = (e: React.MouseEvent, lineId: string) => {
    e.stopPropagation();
    setSelectedLineId(lineId === selectedLineId ? null : lineId);
  };

  const handleGridModeToggle = () => {
    setIsGridMode(!isGridMode);
    setSelectedLineId(null);
    setShowRelativeOptions(false);
    setSelectedPerson(null);
  };

  const toggleRelativeOptions = () => {
    setShowRelativeOptions(!showRelativeOptions);
    setIsGridMode(false);
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
  
  const handleDeletePerson = () => {
    if (detailsPerson && selectedTree) {
      setShowDetailsModal(false);
      removePerson(detailsPerson.id);
      toast.success(t("Person removed successfully"));
    }
  };
  
  const handleEditPerson = () => {
    if (detailsPerson) {
      setShowDetailsModal(false);
      setShowEditModal(true);
    }
  };
  
  const handleEditComplete = (updatedPerson: Person) => {
    updatePerson(updatedPerson.id, updatedPerson);
    setShowEditModal(false);
    toast.success(t("Person updated successfully"));
  };

  // These functions would be implemented fully in a production app
  const handleExportGedcom = () => {
    toast.info(t("GEDCOM export would be implemented here"));
  };
  
  const handleImportGedcom = () => {
    toast.info(t("GEDCOM import would be implemented here"));
  };
  
  const handlePrintTree = () => {
    toast.info(t("Print functionality would be implemented here"));
  };
  
  const handleShareTree = () => {
    toast.info(t("Sharing functionality would be implemented here"));
  };
  
  // Render a connection line based on its type
  const renderConnectionLine = (connection: FamilyConnection) => {
    const { id, type, fromPos, toPos, controlPoints, style } = connection;
    const isSelected = selectedLineId === id;
    const strokeColor = type === 'spouse' ? '#9E86ED' : '#555555';
    const strokeWidth = isSelected ? 4 : 2;
    
    // Line style toggle icon position calculation
    const iconPos = {
      x: 0,
      y: 0
    };
    
    if (type === 'spouse') {
      // For spouse lines (horizontal), place icon above the midpoint
      iconPos.x = (fromPos.x + toPos.x) / 2;
      iconPos.y = (fromPos.y + toPos.y) / 2 - 20;
    } else if (type === 'parent-child' && controlPoints) {
      // For parent-child lines, place icon on the horizontal bar
      iconPos.x = (controlPoints[0].x + controlPoints[1].x) / 2;
      iconPos.y = controlPoints[0].y - 20;
    } else if (type === 'sibling' && controlPoints) {
      // For sibling lines, place icon on the horizontal bar
      iconPos.x = (controlPoints[0].x + controlPoints[1].x) / 2;
      iconPos.y = controlPoints[0].y - 20;
    } else {
      // Default fallback
      iconPos.x = (fromPos.x + toPos.x) / 2;
      iconPos.y = (fromPos.y + toPos.y) / 2 - 20;
    }
    
    // Generate the SVG path based on connection type
    let pathData = "";
    
    if (type === 'spouse') {
      // Simple horizontal or vertical line for spouses
      pathData = `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`;
    } else if (type === 'parent-child' && controlPoints) {
      // Vertical line from parent to child with horizontal connector
      pathData = `M ${fromPos.x} ${fromPos.y} 
                  L ${controlPoints[0].x} ${controlPoints[0].y} 
                  L ${controlPoints[1].x} ${controlPoints[1].y} 
                  L ${toPos.x} ${toPos.y}`;
    } else if (type === 'sibling' && controlPoints) {
      // Connect siblings via a horizontal bar
      pathData = `M ${fromPos.x} ${fromPos.y} 
                  L ${controlPoints[0].x} ${controlPoints[0].y} 
                  L ${controlPoints[1].x} ${controlPoints[1].y} 
                  L ${toPos.x} ${toPos.y}`;
    } else {
      // Fallback to direct line
      pathData = `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`;
    }
    
    return (
      <g key={id} onClick={(e) => handleLineClick(e, id)}>
        <path
          d={pathData}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={style === 'dotted' ? '5,5' : 'none'}
          fill="none"
          className="cursor-pointer"
        />
        
        {isSelected && (
          <g>
            <circle 
              cx={iconPos.x} 
              cy={iconPos.y} 
              r="15" 
              fill="white" 
              stroke={strokeColor}
              onClick={() => toggleLineStyle(id)}
            />
            <g transform={`translate(${iconPos.x - 6}, ${iconPos.y - 6})`}>
              {style === 'solid' ? (
                <SeparatorHorizontal 
                  size={12} 
                  className="cursor-pointer" 
                  onClick={() => toggleLineStyle(id)}
                />
              ) : (
                <Minus 
                  size={12} 
                  className="cursor-pointer" 
                  onClick={() => toggleLineStyle(id)}
                />
              )}
            </g>
          </g>
        )}
      </g>
    );
  };
  
  return (
    <div className="relative h-full w-full">
      <div 
        ref={canvasRef}
        className={`family-canvas w-full h-full ${isGridMode ? 'cursor-cell' : isMovingPerson ? 'cursor-move' : 'cursor-grab active:cursor-grabbing'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={isGridMode ? handleGridClick : undefined}
        onWheel={handleWheel}
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
            {familyConnections.map(connection => renderConnectionLine(connection))}
          </svg>
          
          {selectedTree && Object.values(selectedTree.people).map(person => (
            <PersonNode 
              key={person.id}
              person={person}
              isSelected={selectedPerson?.id === person.id}
              onClick={(e) => handlePersonClick(person, e)}
              position={nodePositions[person.id] || { x: 0, y: 0 }}
              onMouseDown={(e) => handlePersonDragStart(e, person)}
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
        <Button variant="outline" size="icon" onClick={handleUndo} title={t('Undo')}>
          <Undo size={18} />
        </Button>
        <Button variant="outline" size="icon" onClick={handleRedo} title={t('Redo')}>
          <Redo size={18} />
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
          <User size={18} />
        </Button>
        
        <Button 
          variant={showRelativeOptions ? "default" : "outline"} 
          size="icon" 
          onClick={toggleRelativeOptions}
          title={t('Relatives')}
        >
          <Users size={18} />
        </Button>
      </div>
      
      {selectedPerson && showRelativeOptions && (
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
      
      <PersonDetails
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        person={detailsPerson}
        onEdit={handleEditPerson}
        onDelete={handleDeletePerson}
      />
      
      {showEditModal && detailsPerson && (
        <EditPersonModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          person={detailsPerson}
          onSave={handleEditComplete}
        />
      )}
    </div>
  );
};

export default TreeCanvas;
