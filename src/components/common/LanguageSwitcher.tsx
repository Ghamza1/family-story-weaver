
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
    // Removed RTL direction setting
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 px-0">
          <Languages size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage("en")}>
          <span className={i18n.language === "en" ? "font-bold" : ""}>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("ar-TN")}>
          <span className={i18n.language === "ar-TN" ? "font-bold" : ""}>Arabic</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
