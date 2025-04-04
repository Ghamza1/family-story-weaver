
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, User, Tree } from "lucide-react";
import { useFamilyTree } from "@/context/FamilyTreeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Header = () => {
  const navigate = useNavigate();
  const { selectedTree } = useFamilyTree();
  
  const userName = localStorage.getItem("userName") || "User";
  const userEmail = localStorage.getItem("userEmail");
  
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully");
    navigate("/");
  };
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-3 px-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center">
            <Tree size={24} className="text-asli-terracotta mr-2" />
            <span className="text-xl font-bold text-asli-navy">ASLI</span>
          </Link>
          
          {selectedTree && (
            <span className="ml-6 text-asli-gray">
              {selectedTree.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center">
                <User size={18} className="mr-2" />
                <span>{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userName}</p>
                {userEmail && <p className="text-xs text-gray-500">{userEmail}</p>}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/account-settings" className="cursor-pointer w-full">
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-500 focus:text-red-500 cursor-pointer"
              >
                <LogOut size={16} className="mr-2" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
