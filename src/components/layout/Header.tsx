
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, User, Trees, MoreVertical } from "lucide-react";
import { useFamilyTree } from "@/context/FamilyTreeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Header = () => {
  const navigate = useNavigate();
  const { selectedTree } = useFamilyTree();
  const { t } = useTranslation();
  
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
            <Trees size={24} className="text-asli-terracotta mr-2" />
            <span className="text-xl font-bold text-asli-navy">ASLI</span>
          </Link>
          
          {selectedTree && (
            <span className="ml-6 text-asli-gray">
              {selectedTree.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 px-0">
                <MoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/account-settings" className="cursor-pointer w-full">
                  {t('header.accountSettings')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
                  {t('header.accountSettings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-500 focus:text-red-500 cursor-pointer"
              >
                <LogOut size={16} className="mr-2" />
                <span>{t('header.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
