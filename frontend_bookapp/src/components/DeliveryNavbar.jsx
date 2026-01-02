import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Truck } from "lucide-react";

export default function DeliveryNavbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/delivery/dashboard" className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Truck size={24} />
          </div>
          Delivery Portal
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/delivery/profile"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium"
          >
            <User size={18} />
            My Profile
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

