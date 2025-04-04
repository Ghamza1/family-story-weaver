
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { Link } from "react-router-dom";
import { Trees } from "lucide-react";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  
  // Check if already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col bg-asli-beige/30">
      <div className="py-8 px-4">
        <div className="max-w-md mx-auto">
          <Link to="/" className="flex items-center justify-center mb-8">
            <Trees size={24} className="text-asli-terracotta mr-2" />
            <span className="text-2xl font-bold text-asli-navy">ASLI</span>
          </Link>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
