// src/pages/UpcomingEventsPage.tsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import EventCard from "../components/EventCard";
import { apiGet } from "../utils/ClientApi";
import type { Event } from "../types/event";

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchUpcoming() {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await apiGet("/event/upcoming");
        setEvents(res.events || []);
      } catch (err: any) {
        console.error("Failed to fetch upcoming events:", err);
        setErrorMsg(err.message || "Failed to fetch upcoming events.");
      } finally {
        setLoading(false);
      }
    }

    fetchUpcoming();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-[#11181C] mb-2">
          Upcoming Events
        </h1>
        <p className="text-sm text-[#697177] mb-6">
          Events with a start date in the future.
        </p>

        {errorMsg && (
          <p className="text-sm text-red-600 mb-4">{errorMsg}</p>
        )}

        {loading ? (
          <p className="text-sm text-[#697177]">Loading upcoming events…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-[#697177]">No upcoming events found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
