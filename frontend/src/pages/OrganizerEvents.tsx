import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import OrganizerLayout from "../components/OrganizerLayout";
import { apiDelete, apiGet, apiPost } from "../utils/ClientApi";
import { getAuthRole } from "../utils/authToken";

import type { Event } from "../types/event";
import OrganizerEventCard from "../components/OrganizerEventCard";
export default function OrganizerEventsPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // --------------------
  // FETCH ORGANIZER EVENTS
  // --------------------
  async function fetchEvents() {
    try {
      const res = await apiGet("/event/company-events");
      setEvents(res.events || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to fetch events.");
    } finally {
      setLoading(false);
    }
  }

  // --------------------
  // DELETE EVENT
  // --------------------
  async function handleDelete(eventId: number) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await apiDelete(`/event/${eventId}`); // backend uses POST or DELETE depending on your router
      alert("Event deleted successfully.");
      fetchEvents();
    } catch (err: any) {
      alert(err.message || "Failed to delete event.");
      console.error(err);
    }
  }

  // --------------------
  // PROTECT ROUTE
  // --------------------
  useEffect(() => {
    if (getAuthRole() !== "organizer") {
      navigate("/", { replace: true });
    } else {
      fetchEvents();
    }
  }, []);

  // --------------------
  // RENDER
  // --------------------
  return (
    <OrganizerLayout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-[#11181C] mb-6">
          My Events
        </h1>

        {errorMsg && (
          <p className="text-red-600 text-sm mb-4">{errorMsg}</p>
        )}

        {loading ? (
          <p className="text-[#697177]">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-[#697177]">You have not created any events yet.</p>
        ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    
    {events.map(event => (
        <OrganizerEventCard
        key={event.id}
        event={event}
        onDelete={handleDelete}
        />
    ))}
    </div>
       
        )}
      </div>
    </OrganizerLayout>
  );
}
