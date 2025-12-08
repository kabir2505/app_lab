import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import AdminReportedEventCard from "../components/AdminReportedEventCard";
import type { AdminReportedEvent } from "../components/AdminReportedEventCard";
import { apiGet } from "../utils/ClientApi";
import { getAuthRole } from "../utils/authToken";

export default function AdminReportedEventsPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<AdminReportedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Ensure only admin can access
  useEffect(() => {
    if (getAuthRole() !== "admin") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await apiGet("/report");
        console.log(res.reports)
        setEvents(res.reports || []);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load reported events");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-sm text-[#697177]">Loading reported events…</p>
      </AdminLayout>
    );
  }

  if (errorMsg) {
    return (
      <AdminLayout>
        <p className="text-sm text-red-600">{errorMsg}</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold text-[#11181C] mb-6">
        Reported Events
      </h1>

      {events.length === 0 ? (
        <p className="text-sm text-[#697177]">No reported events found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <AdminReportedEventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
