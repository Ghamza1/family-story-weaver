
import React from "react";
import { Person } from "@/types";
import { cn } from "@/lib/utils";

interface PersonNodeProps {
  person: Person;
  isSelected?: boolean;
  position: { x: number; y: number };
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

const PersonNode: React.FC<PersonNodeProps> = ({ 
  person, 
  isSelected = false,
  position,
  onClick,
  onMouseDown
}) => {
  const { firstName, lastName, gender } = person;
  
  const fullName = `${firstName} ${lastName}`;
  
  // Gender-specific styling
  const genderClass = gender === "male" 
    ? "bg-blue-50 border-blue-200" 
    : gender === "female" 
      ? "bg-pink-50 border-pink-200" 
      : "bg-gray-50 border-gray-200";
  
  return (
    <div 
      className={cn(
        "absolute person-node w-40 px-2 py-1 rounded-md border text-center cursor-pointer transition-shadow",
        genderClass,
        isSelected && "ring-2 ring-offset-1 ring-purple-500 shadow-lg"
      )}
      style={{
        left: position.x - 80, // Center horizontally (half of width)
        top: position.y - 15,  // Center vertically (half of height)
        touchAction: "none",   // Important for proper dragging
      }}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <div className="text-sm font-medium truncate">{fullName}</div>
    </div>
  );
};

export default PersonNode;
