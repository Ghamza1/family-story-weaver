
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import TreeSelector from "@/components/dashboard/TreeSelector";
import TreeDetails from "@/components/dashboard/TreeDetails";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Check if authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);
  
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
