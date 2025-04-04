
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "@/components/auth/RegisterForm";
import { Link } from "react-router-dom";
import { Trees } from "lucide-react";
import { useTranslation } from "react-i18next";

const RegisterPage = () => {
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
    <div className="min-h-screen flex flex-col bg-asli-beige/30" dir={i18n.language.startsWith("ar") ? "rtl" : "ltr"}>
      <div className="py-8 px-4">
        <div className="max-w-md mx-auto">
          <Link to="/" className="flex items-center justify-center mb-8">
            <Trees size={24} className="text-asli-terracotta mr-2" />
            <span className="text-2xl font-bold text-asli-navy">ASLI</span>
          </Link>
          
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
