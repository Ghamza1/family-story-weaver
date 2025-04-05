
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import TreeSelector from "@/components/dashboard/TreeSelector";
import TreeDetails from "@/components/dashboard/TreeDetails";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  
  // Check if authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);
  
  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar-TN' ? 'rtl' : 'ltr';
    
    return () => {
      document.documentElement.dir = 'ltr'; // Reset on unmount
    };
  }, [i18n.language]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <TreeSelector />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <TreeDetails />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
