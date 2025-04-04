
import { cn } from "@/lib/utils";
import { Person } from "@/types";

interface PersonNodeProps {
  person: Person;
  isSelected: boolean;
  onClick: () => void;
  position: { x: number; y: number };
}

const PersonNode = ({ person, isSelected, onClick, position }: PersonNodeProps) => {
  const { firstName, lastName, birthDate, deathDate, gender } = person;
  
  // Format date display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).getFullYear().toString();
    } catch {
      return dateStr;
    }
  };
  
  const birthYear = formatDate(birthDate);
  const deathYear = formatDate(deathDate);
  const yearsText = birthYear || deathYear ? `(${birthYear}${deathYear ? ` - ${deathYear}` : ""})` : "";
  
  // Gender-based styling
  const genderClass = 
    gender === "male" ? "border-blue-400 bg-blue-50" : 
    gender === "female" ? "border-pink-400 bg-pink-50" : 
    "border-gray-300 bg-gray-50";
  
  return (
    <div 
      className={cn(
        "person-node absolute p-3 border-2 rounded-md shadow-sm transition-shadow",
        genderClass,
        isSelected ? "ring-2 ring-asli-navy ring-offset-2" : ""
      )}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
        minWidth: "120px",
      }}
      onClick={onClick}
    >
      <h3 className="font-semibold text-asli-navy text-center">
        {firstName} {lastName}
      </h3>
      {yearsText && (
        <p className="text-xs text-asli-gray mt-1 text-center">{yearsText}</p>
      )}
    </div>
  );
};

export default PersonNode;
