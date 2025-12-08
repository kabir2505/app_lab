import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import OrganizerLayout from "../components/OrganizerLayout";
import OrganizerEventCard from "../components/OrganizerEventCard";
import { apiGet, apiDelete } from "../utils/ClientApi";
import { getAuthRole } from "../utils/authToken";
import type { Event } from "../types/event";

export default function OrganizerDashboardPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ----------------------------
  // Protect Route (only organizer)
  // ----------------------------
  useEffect(() => {
    if (getAuthRole() !== "organizer") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // ----------------------------
  // Fetch organizer's events
  // ----------------------------
  useEffect(() => {
    async function fetchOrgEvents() {
      try {
        setLoading(true);
        const res = await apiGet("/event/company-events");
        setEvents(res.events || []);
      } catch (err: any) {
        console.error(err);
        setErrorMsg("Failed to load organizer events.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrgEvents();
  }, []);

  // ----------------------------
  // Delete Event
  // ----------------------------
  async function handleDelete(eventId: number) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await apiDelete(`/event/${eventId}`);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete event.");
    }
  }

  // ----------------------------
  // Organize events into upcoming & past
  // ----------------------------
  const now = new Date();
  const upcomingEvents = events.filter(
    (e) => new Date(e.startDateTime) >= now
  );
  const pastEvents = events.filter(
    (e) => new Date(e.startDateTime) < now
  );

  // ----------------------------
  // Advanced Stats
  // ----------------------------
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let totalCapacity = 0;
    let totalUsedCapacity = 0;

    events.forEach((event) => {
      event.ticket_type.forEach((ticket) => {
        const seatLimit = ticket.seatLimit ?? 0;
        const remaining = ticket.remainingSeats ?? seatLimit;
        const sold = seatLimit - remaining;
        const revenue = sold * ticket.price;

        totalRevenue += revenue;
        totalTicketsSold += sold;
        totalCapacity += seatLimit;
        totalUsedCapacity += sold;
      });
    });

    const avgTickets = events.length ? totalTicketsSold / events.length : 0;
    const utilization =
      totalCapacity > 0 ? (totalUsedCapacity / totalCapacity) * 100 : 0;

    // Upcoming & past revenue
    let upcomingRevenue = 0;
    let pastRevenue = 0;

    upcomingEvents.forEach((e) =>
      e.ticket_type.forEach((ticket) => {
        const seatLimit = ticket.seatLimit ?? 0;
        const remaining = ticket.remainingSeats ?? seatLimit;
        const sold = seatLimit - remaining;
        upcomingRevenue += sold * ticket.price;
      })
    );

    pastEvents.forEach((e) =>
      e.ticket_type.forEach((ticket) => {
        const seatLimit = ticket.seatLimit ?? 0;
        const remaining = ticket.remainingSeats ?? seatLimit;
        const sold = seatLimit - remaining;
        pastRevenue += sold * ticket.price;
      })
    );

    // Highest-selling event
    let bestEvent = null;
    let maxSold = -1;
    events.forEach((e) => {
      let count = 0;
      e.ticket_type.forEach((ticket) => {
        const limit = ticket.seatLimit ?? 0;
        const rem = ticket.remainingSeats ?? limit;
        count += limit - rem;
      });
      if (count > maxSold) {
        maxSold = count;
        bestEvent = e;
      }
    });

    // Category distribution
    const categoryMap: Record<string, number> = {};
    events.forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
    });

    return {
      totalRevenue,
      totalTicketsSold,
      avgTickets,
      utilization,
      upcomingRevenue,
      pastRevenue,
      bestEvent,
      categoryMap,
    };
  }, [events]);

  const totalEvents = events.length;
  const totalUpcoming = upcomingEvents.length;
  const totalPast = pastEvents.length;

  return (
    <OrganizerLayout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-[#11181C] mb-6">
          Organizer Dashboard
        </h1>

        {errorMsg && <p className="text-sm text-red-600 mb-4">{errorMsg}</p>}

        {/* =====================
            STATS SECTION
        ====================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Basic counts */}
          <StatBox label="Total Events" value={totalEvents} />
          <StatBox label="Upcoming Events" value={totalUpcoming} />
          <StatBox label="Past Events" value={totalPast} />

          {/* Advanced stats */}
          <StatBox label="Total Tickets Sold" value={stats.totalTicketsSold} />
          <StatBox label="Total Revenue (₹)" value={stats.totalRevenue} />
          <StatBox label="Upcoming Revenue (₹)" value={stats.upcomingRevenue} />
          <StatBox label="Past Revenue (₹)" value={stats.pastRevenue} />
          <StatBox
            label="Avg Tickets / Event"
            value={stats.avgTickets.toFixed(1)}
          />
          <StatBox
            label="Capacity Utilization"
            value={stats.utilization.toFixed(1) + "%"}
          />
        </div>

        {/* Best Event */}
        {stats.bestEvent && (
          <div className="p-5 mb-10 bg-white border border-[#E2E8EF] rounded-xl shadow-sm">
            <p className="text-xs text-[#697177]">Top-Selling Event</p>
            <p className="text-lg font-semibold text-[#11181C]">
              {stats.bestEvent.title}
            </p>
          </div>
        )}

        {/* =====================
            UPCOMING EVENTS
        ====================== */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#11181C]">
            Upcoming Events
          </h2>

          <Link
            to="/organizer/events"
            className="text-[#11181C] text-sm hover:underline"
          >
            View all →
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-[#697177] mb-10">
            No upcoming events.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {upcomingEvents.slice(0, 3).map((event) => (
              <OrganizerEventCard
                key={event.id}
                event={event}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* =====================
            PAST EVENTS
        ====================== */}
        <h2 className="text-lg font-semibold text-[#11181C] mb-4">Past Events</h2>

        {pastEvents.length === 0 ? (
          <p className="text-sm text-[#697177]">No past events.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <div key={event.id} className="opacity-70 grayscale">
                <OrganizerEventCard event={event} onDelete={() => {}} />
              </div>
            ))}
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
}

// Small reusable stat card
function StatBox({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-5 bg-white border border-[#E2E8EF] rounded-xl shadow-sm">
      <p className="text-xs text-[#697177]">{label}</p>
      <p className="text-xl font-semibold text-[#11181C]">{value}</p>
    </div>
  );
}
