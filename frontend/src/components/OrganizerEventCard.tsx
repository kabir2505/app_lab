import { Link } from "react-router-dom";
import type { Event } from "../types/event";

interface Props {
  event: Event;
  onDelete: (eventId: number) => void;
}

export default function OrganizerEventCard({ event, onDelete }: Props) {
  const dateLabel = new Date(event.startDateTime).toLocaleString();
  const img = event.bannerImageUrl;

  return (
    <div className="bg-white border border-[#E2E8EF] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">


      <div className="relative h-40 w-full overflow-hidden bg-[#F7F9FA]">
        {img ? (
          <img
            src={img}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-[#8B959E]">
            No image available
          </div>
        )}


        <Link
          to={`/events/${event.id}`}
          className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md hover:bg-black"
        >
          View
        </Link>
      </div>


      <div className="p-4 space-y-2">
        <h2 className="text-base font-semibold text-[#11181C] line-clamp-1">
          {event.title}
        </h2>

        <p className="text-sm text-[#697177] line-clamp-2">
          {event.description}
        </p>

        <div className="text-xs text-[#8B959E] space-y-1">
          <p>
            <span className="font-medium text-[#11181C]">Category:</span>{" "}
            {event.category}
          </p>
          <p>
            <span className="font-medium text-[#11181C]">Location:</span>{" "}
            {event.location}
          </p>
          <p>
            <span className="font-medium text-[#11181C]">Date:</span>{" "}
            {dateLabel}
          </p>
        </div>


        <div className="pt-2 text-sm text-[#11181C]">
          <span className="font-medium">Remaining:</span>{" "}
          {event.remainingCapacity ?? "N/A"}
        </div>


        <div className="flex items-center gap-3 pt-3">
          <Link
            to={`/organizer/events/${event.id}/edit`}
            className="flex-1 inline-flex items-center justify-center
                       bg-gray-100 text-black py-2 rounded-md text-sm
                       hover:bg-gray-200 transition"
          >
            Update
          </Link>

          <button
            onClick={() => onDelete(event.id)}
            className="flex-1 inline-flex items-center justify-center
                       bg-red-600 text-white py-2 rounded-md text-sm
                       hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>

    </div>
  );
}
