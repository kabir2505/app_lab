import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthRole } from "../utils/authToken";

export default function Navbar() {
  const role = getAuthRole();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchTerm.trim();
    if (q.length > 0) {
      navigate(`/search-events?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">

      <Link to="/" className="text-xl font-semibold text-[#11181C]">
        ShowFlick
      </Link>


      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center max-w-sm w-full mx-6"
      >
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-[#E2E8EF] rounded-md px-3 py-1.5 text-sm 
                     focus:outline-none focus:ring-1 focus:ring-[#11181C]"
        />
      </form>


      <div className="flex gap-4 items-center text-sm text-[#11181C]">
        <Link to="/events/all-events">Events</Link>

 
        {!role && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register/attendee">Sign Up</Link>
            <Link to="/register/organizer">Register Org</Link>
          </>
        )}


        {role && (
          <>

            {role === "attendee" && (
              <Link
                to="/profile"
                className="font-medium text-[#11181C] hover:text-black"
              >
                Profile
              </Link>
            )}

            {role === "organizer" && (
              <Link
                to="/organizer/events"
                className="font-medium text-[#11181C] hover:text-black"
              >
                Dashboard
              </Link>
            )}

            <Link to="/logout" className="text-red-600 font-medium">
              Logout
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
