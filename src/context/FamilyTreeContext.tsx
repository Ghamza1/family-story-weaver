
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { FamilyTree, Person } from "@/types";

interface FamilyTreeContextType {
  trees: FamilyTree[];
  selectedTree: FamilyTree | null;
  selectedPerson: Person | null;
  selectTree: (treeId: string) => void;
  setSelectedPerson: (person: Person | null) => void;
  createTree: (name: string) => void;
  addPerson: (
    personData: Omit<Person, "id" | "spouseIds" | "childrenIds" | "siblingIds">, 
    relationshipType: string, 
    relativeId?: string
  ) => void;
}

const FamilyTreeContext = createContext<FamilyTreeContextType | undefined>(undefined);

export const FamilyTreeProvider = ({ children }: { children: ReactNode }) => {
  const [trees, setTrees] = useState<FamilyTree[]>([]);
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  
  // Initialize with sample data
  useEffect(() => {
    // Check if we're already authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) return;
    
    // Try to load from localStorage first
    const storedTrees = localStorage.getItem("familyTrees");
    if (storedTrees) {
      try {
        const parsedTrees = JSON.parse(storedTrees);
        setTrees(parsedTrees);
        // If there's at least one tree, select the first one
        if (parsedTrees.length > 0) {
          setSelectedTreeId(parsedTrees[0].id);
        }
      } catch (e) {
        console.error("Error parsing stored trees:", e);
        // If there's an error, initialize with empty state
        initializeEmptyState();
      }
    } else {
      // If no stored trees, initialize with empty state
      initializeEmptyState();
    }
  }, []);
  
  // Save trees to localStorage whenever they change
  useEffect(() => {
    if (trees.length > 0) {
      localStorage.setItem("familyTrees", JSON.stringify(trees));
    }
  }, [trees]);
  
  const initializeEmptyState = () => {
    // Start with an empty array of trees
    setTrees([]);
    setSelectedTreeId(null);
    setSelectedPerson(null);
  };
  
  // Get the currently selected tree
  const selectedTree = selectedTreeId 
    ? trees.find(tree => tree.id === selectedTreeId) || null 
    : null;
  
  // Select a tree
  const selectTree = (treeId: string) => {
    setSelectedTreeId(treeId);
    setSelectedPerson(null);
  };
  
  // Create a new tree
  const createTree = (name: string) => {
    const userId = localStorage.getItem("userId") || "unknown-user";
    const newTree: FamilyTree = {
      id: uuidv4(),
      name,
      ownerId: userId,
      people: {},
      relationships: [],
      created: new Date(),
      lastModified: new Date(),
      sharedWith: []
    };
    
    setTrees(prev => [...prev, newTree]);
    setSelectedTreeId(newTree.id);
    setSelectedPerson(null);
  };
  
  // Add a person to the selected tree
  const addPerson = (
    personData: Omit<Person, "id" | "spouseIds" | "childrenIds" | "siblingIds">, 
    relationshipType: string, 
    relativeId?: string
  ) => {
    if (!selectedTree) return;
    
    // Create a new person
    const newPersonId = uuidv4();
    const newPerson: Person = {
      id: newPersonId,
      ...personData,
      spouseIds: [],
      childrenIds: [],
      siblingIds: []
    };
    
    // Update the tree with the new person
    const updatedTree = { ...selectedTree };
    updatedTree.people = { ...updatedTree.people, [newPersonId]: newPerson };
    updatedTree.lastModified = new Date();
    
    // If this is the first person in the tree, set them as the root
    if (Object.keys(updatedTree.people).length === 1) {
      updatedTree.rootPersonId = newPersonId;
    }
    
    // Handle relationship based on relationshipType
    if (relativeId && updatedTree.people[relativeId]) {
      const relative = { ...updatedTree.people[relativeId] };
      
      switch (relationshipType) {
        case "father":
          // Set this person as the father of the relative
          newPerson.childrenIds = [...newPerson.childrenIds, relativeId];
          relative.fatherId = newPersonId;
          break;
        
        case "mother":
          // Set this person as the mother of the relative
          newPerson.childrenIds = [...newPerson.childrenIds, relativeId];
          relative.motherId = newPersonId;
          break;
        
        case "spouse":
          // Add spouse relationship
          newPerson.spouseIds = [...newPerson.spouseIds, relativeId];
          relative.spouseIds = [...relative.spouseIds, newPersonId];
          break;
        
        case "child":
          // Add child relationship
          if (relative.gender === "male") {
            newPerson.fatherId = relativeId;
          } else if (relative.gender === "female") {
            newPerson.motherId = relativeId;
          }
          relative.childrenIds = [...relative.childrenIds, newPersonId];
          break;
        
        case "sibling":
          // Add sibling relationship
          newPerson.siblingIds = [...newPerson.siblingIds, relativeId];
          relative.siblingIds = [...relative.siblingIds, newPersonId];
          
          // Share same parents if available
          if (relative.fatherId) {
            newPerson.fatherId = relative.fatherId;
            const father = { ...updatedTree.people[relative.fatherId] };
            father.childrenIds = [...father.childrenIds, newPersonId];
            updatedTree.people[relative.fatherId] = father;
          }
          
          if (relative.motherId) {
            newPerson.motherId = relative.motherId;
            const mother = { ...updatedTree.people[relative.motherId] };
            mother.childrenIds = [...mother.childrenIds, newPersonId];
            updatedTree.people[relative.motherId] = mother;
          }
          break;
      }
      
      // Update the relative in the tree
      updatedTree.people[relativeId] = relative;
    }
    
    // Update the trees array
    setTrees(prev => prev.map(tree => 
      tree.id === selectedTree.id ? updatedTree : tree
    ));
    
    // Select the newly added person
    setSelectedPerson(newPerson);
  };
  
  const contextValue: FamilyTreeContextType = {
    trees,
    selectedTree,
    selectedPerson,
    selectTree,
    setSelectedPerson,
    createTree,
    addPerson
  };
  
  return (
    <FamilyTreeContext.Provider value={contextValue}>
      {children}
    </FamilyTreeContext.Provider>
  );
};

export const useFamilyTree = () => {
  const context = useContext(FamilyTreeContext);
  if (context === undefined) {
    throw new Error("useFamilyTree must be used within a FamilyTreeProvider");
  }
  return context;
};
