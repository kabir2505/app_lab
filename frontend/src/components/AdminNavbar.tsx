// src/components/AdminNavbar.tsx
import { Link } from "react-router-dom";
import { getAuthRole } from "../utils/authToken";

export default function AdminNavbar() {
  const role = getAuthRole();

  if (role !== "admin") return null;

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
  
      <Link to="/admin" className="text-xl font-semibold text-[#11181C]">
        AdminPanel
      </Link>

      <div className="flex gap-5 items-center text-sm text-[#11181C]">

        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/all-organizers">Organizers</Link>
        <Link to="/events/all-events">Events</Link>
        <Link to="/admin/reported-events">Reported Events</Link>

        <Link to="/logout" className="text-red-600 font-medium">
          Logout
        </Link>
      </div>
    </nav>
  );
}
