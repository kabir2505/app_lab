import { Link, useNavigate } from "react-router-dom";
import { clearAuthToken } from "../utils/authToken";

export default function OrganizerNavbar() {
  const navigate = useNavigate();

  function handleLogout() {
    clearAuthToken();
    navigate("/login");
  }

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Left: Logo */}
      <Link to="/organizer" className="text-xl font-semibold text-[#11181C]">
        Eventify Organizer
      </Link>

      {/* Right: Links */}
      <div className="flex gap-4 items-center text-sm text-[#11181C]">
        <Link to="/organizer/events">My Events</Link>
        <Link to="/organizer/create-event">Create Event</Link>
        <Link to="/organizer/profile">Profile</Link>

        <button
          onClick={handleLogout}
          className="text-red-600 font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
