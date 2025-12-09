import { useNavigate } from "react-router-dom";
import { updateReportStatus } from "../utils/ClientApi";

import type { AdminReportedEvent } from "../types/admin";

export default function AdminReportedEventCard({ event }: { event: AdminReportedEvent }) {
  const navigate = useNavigate();

  async function handleStatusChange(
    newStatus: "pending" | "resolved" | "rejected",
    e: React.MouseEvent
  ) {
    e.stopPropagation(); // prevent card click navigation

    try {
      await updateReportStatus(event.id, newStatus);
      alert(`Status updated to ${newStatus}`);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  }

  return (
    <div
      className="p-4 bg-white border rounded-xl shadow-sm cursor-pointer hover:shadow-md transition"
      onClick={() => navigate(`/events/${event.event.id}`)}   // <— REDIRECT TO EVENT DETAIL
    >
      {/* EVENT TITLE */}
      <h3 className="font-semibold text-sm mb-1">{event.event.title}</h3>

      <p className="text-xs text-gray-500">
        Reported By: {event.reportedBy.name} ({event.reportedBy.email})
      </p>

      <p className="text-xs text-red-600 mt-1">Reason: {event.reason}</p>

      <p className="text-[10px] text-gray-400 mt-1">
        Reported At: {new Date(event.reportedAt).toLocaleString()}
      </p>

      {/* STATUS BADGE */}
      <div className="mt-2">
        <span
          className={`px-2 py-1 text-xs rounded ${
            event.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : event.status === "resolved"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {event.status.toUpperCase()}
        </span>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-4 flex gap-2">

        {event.status !== "resolved" && (
          <button
            className="px-3 py-1 bg-green-600 text-white rounded text-xs"
            onClick={(e) => handleStatusChange("resolved", e)}
          >
            Resolve
          </button>
        )}

        {event.status !== "rejected" && (
          <button
            className="px-3 py-1 bg-red-600 text-white rounded text-xs"
            onClick={(e) => handleStatusChange("rejected", e)}
          >
            Reject
          </button>
        )}

        {event.status !== "pending" && (
          <button
            className="px-3 py-1 bg-gray-600 text-white rounded text-xs"
            onClick={(e) => handleStatusChange("pending", e)}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
