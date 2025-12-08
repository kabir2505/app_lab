// src/pages/SearchEventsPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import EventCard from "../components/EventCard";
import { apiGet } from "../utils/ClientApi";
import type { Event } from "../types/event";

export default function SearchEventsPage() {
  const location = useLocation();
  const { filter } = useParams();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse normal search query params
  const params = new URLSearchParams(location.search);
  const q = params.get("q") ?? "";
  const categoryQuery = params.get("category") ?? "";

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);

      try {
        let res;

        // -----------------------------
        // 1️⃣ Handle /search-events/popular
        // -----------------------------
        if (filter) {
          if (filter === "popular") {
            res = await apiGet("/event/popular");
          } else {
            // tech, music, fashion, sports, other
            res = await apiGet(`/event?category=${filter}`);
          }
        }
        // -----------------------------
        // 2️⃣ Handle /search-events?q=.. or /search-events?category=..
        // -----------------------------
        else {
          res = await apiGet(`/event/search${location.search}`);
        }

        setEvents(res.events || []);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [location.search, filter]);

  const hasFilters = q || categoryQuery || filter;

  // Dynamic heading text
  const pageTitle = filter
    ? filter === "popular"
      ? "Popular Events"
      : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Events`
    : "Search Events";

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-[#11181C] mb-2">
          {pageTitle}
        </h1>

        {/* Search description */}
        {hasFilters && !filter && (
          <p className="text-sm text-[#697177] mb-4">
            Showing results
            {q && (
              <>
                {" "}
                for <span className="font-medium text-[#11181C]">"{q}"</span>
              </>
            )}
            {categoryQuery && (
              <>
                {" "}
                in category{" "}
                <span className="font-medium text-[#11181C]">
                  {categoryQuery}
                </span>
              </>
            )}
            .
          </p>
        )}

        {!hasFilters && (
          <p className="text-sm text-[#697177] mb-4">
            You can search by keyword or filter by category.
          </p>
        )}

        {/* Results */}
        {loading ? (
          <p className="text-sm text-[#697177]">Loading events…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-[#697177]">No events found.</p>
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
