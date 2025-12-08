// src/components/EventCard.tsx
import { Link } from "react-router-dom";
import type { Event } from "../types/event";

export default function EventCard({ event }: { event: Event }) {
  const dateLabel = new Date(event.startDateTime).toLocaleString();

  return (
    <Link to={`/events/${event.id}`} className="block">
      <div className="bg-white border border-[#E2E8EF] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Image */}
        {event.bannerImageUrl ? (
          <div className="h-40 w-full overflow-hidden bg-[#F7F9FA]">
            <img
              src={event.bannerImageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-40 w-full bg-[#F7F9FA] flex items-center justify-center text-xs text-[#8B959E]">
            No image available
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-2">
          <h2 className="text-base font-semibold text-[#11181C] line-clamp-1">
            {event.title}
          </h2>

          <p className="text-sm text-[#697177] line-clamp-2">
            {event.description}
          </p>

          <div className="mt-1 text-xs text-[#8B959E] space-y-1">
            <p>
              <span className="font-medium text-[#11181C]">Category:</span>{" "}
              {event.category}
            </p>
            <p>
              <span className="font-medium text-[#11181C]">Location:</span>{" "}
              {event.location}
            </p>
            {/* <p>
              <span className="font-medium text-[#11181C]">Location:</span>{" "}
              {event}
            </p> */}
            <p>
              <span className="font-medium text-[#11181C]">Date:</span>{" "}
              {dateLabel}
            </p>
          </div>

          <div className="pt-2 text-sm text-[#11181C]">
            <span className="font-medium">Remaining:</span>{" "}
            {event.remainingCapacity ?? "N/A"}
          </div>
        </div>
      </div>
    </Link>
  );
}
 