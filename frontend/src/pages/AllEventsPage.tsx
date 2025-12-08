import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../utils/ClientApi";
import EventCard from "../components/EventCard";
import type { Event } from "../types/event";
import Layout from "../components/Layout";
import { EVENT_CATEGORIES } from "../types/event";

export default function AllEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & sort state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc"); // default: latest first
  const [hidePastEvents, setHidePastEvents] = useState<boolean>(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await apiGet("/event");
        setEvents(res.events || []);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // Derived filtered + sorted events
  const processedEvents = useMemo(() => {
    let filtered = [...events];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    // Hide past events
    if (hidePastEvents) {
      filtered = filtered.filter(
        (e) => new Date(e.startDateTime) >= new Date()
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.startDateTime).getTime();
      const dateB = new Date(b.startDateTime).getTime();

      switch (sortBy) {
        case "date_asc":
          return dateA - dateB; // earliest first
        case "date_desc":
          return dateB - dateA; // latest first
        case "capacity_high":
          return (b.remainingCapacity ?? 0) - (a.remainingCapacity ?? 0);
        case "capacity_low":
          return (a.remainingCapacity ?? 0) - (b.remainingCapacity ?? 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, selectedCategory, hidePastEvents, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center">
        <p className="text-[#697177] text-sm">Loading events...</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#F7F9FA]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-semibold text-[#11181C] mb-6">
            All Events
          </h1>

          {/* FILTERS + SORT BAR */}
          <div className="bg-white border border-[#E2E8EF] rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">

            {/* Category Filter */}
            <div className="flex gap-2 items-center">
              <label className="text-sm text-[#11181C] font-medium">
                Category:
              </label>
              <select
                className="border border-[#E2E8EF] rounded-md px-3 py-2 text-sm bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All</option>
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex gap-2 items-center">
              <label className="text-sm text-[#11181C] font-medium">
                Sort By:
              </label>
              <select
                className="border border-[#E2E8EF] rounded-md px-3 py-2 text-sm bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date_desc">Date — Newest First</option>
                <option value="date_asc">Date — Oldest First</option>
                <option value="capacity_high">Capacity — High to Low</option>
                <option value="capacity_low">Capacity — Low to High</option>
              </select>
            </div>

            {/* Hide Past Toggle */}
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={hidePastEvents}
                onChange={(e) => setHidePastEvents(e.target.checked)}
              />
              <label className="text-sm text-[#11181C]">
                Hide past events
              </label>
            </div>
          </div>

          {/* Events List */}
          {processedEvents.length === 0 ? (
            <p className="text-[#697177] text-center text-sm">
              No events match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedEvents.map((event) => {
                const isPast = new Date(event.startDateTime) < new Date();
                return (
                  <div
                    key={event.id}
                    className={isPast ? "relative opacity-70 grayscale" : "relative"}
                  >
                    {isPast && (
                      <div className="absolute top-2 left-2 bg-[#B91C1C] text-white px-2 py-1 text-xs rounded-md shadow-sm">
                        Event Over
                      </div>
                    )}
                    <EventCard event={event} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
