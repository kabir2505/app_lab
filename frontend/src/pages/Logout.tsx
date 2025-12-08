import { useEffect } from "react";
import { clearAuthToken, setAuthRole } from "../utils/authToken";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    clearAuthToken();   
    setAuthRole("");    
    navigate("/login"); 
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600 text-lg">Logging out...</p>
    </div>
  );
}
