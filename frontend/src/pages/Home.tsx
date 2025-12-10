import { useEffect, useState } from "react";
import { Link } from "react-router";
import Layout from "../components/Layout";
import EventCard from "../components/EventCard";
import { apiGet } from "../utils/ClientApi";
import type { Event } from "../types/event";

export default function Home() {
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [popular, setPopular] = useState<Event[]>([]);
  const [techEvents, setTechEvents] = useState<Event[]>([]);
  const [fashionEvents, setFashionEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    try {
      const take4 = <T,>(arr: T[] | undefined | null) => (arr ?? []).slice(0, 4);
      const [upcomingRes, popRes, techRes, fashionRes] = await Promise.all([
        apiGet("/event/upcoming"),
        apiGet("/event/search?sort=rating"),   
        apiGet("/event/search?category=tech"),
        apiGet("/event/search?category=fashion"),
      ]);

      console.log("upcoming", upcomingRes.events?.map((e: any) => e.category));
console.log("popular", popRes.events?.map((e: any) => e.category));
console.log("tech", techRes.events?.map((e: any) => e.category));
console.log("fashion", fashionRes.events?.map((e: any) => e.category));

      setUpcoming(take4(upcomingRes.events));
      setPopular(take4(popRes.events));
      setTechEvents(take4(techRes.events));
      setFashionEvents(take4(fashionRes.events));
    } catch (err) {
      console.error("Error loading home page:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  if (loading) {
    return (
      <Layout>
        <p className="text-[#697177] text-sm py-10">Loading…</p>
      </Layout>
    );
  }

  return (
    <Layout>


      <SectionBlock
        title="Upcoming Events"
        subtitle="Discover the latest events happening soon near you."
        link="/events/upcoming"
        events={upcoming}
      />


      <SectionBlock
        title="Popular Events"
        subtitle="Top-rated events people love."
        link="/search-events?sort=popular"
        events={popular}
      />


      <SectionBlock
        title="Tech Events"
        subtitle="Explore hackathons, conferences and meetups."
        link="/search-events?category=tech"
        events={techEvents}
      />


      <SectionBlock
        title="Fashion Events"
        subtitle="Discover the latest shows and lifestyle events."
        link="/search-events?category=fashion"
        events={fashionEvents}
      />

    </Layout>
  );
}


function SectionBlock({
  title,
  subtitle,
  link,
  events,
}: {
  title: string;
  subtitle: string;
  link: string;
  events: Event[];
}) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-[#11181C]">{title}</h2>
          <p className="text-sm text-[#697177]">{subtitle}</p>
        </div>

        <Link
          to={link}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all →
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-[#697177]">No events available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}
