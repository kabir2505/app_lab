// src/pages/admin/AdminDashboardPage.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { apiGet } from "../utils/ClientApi";
import { getAuthRole } from "../utils/authToken";

interface StatPayload {
  totalUsers: number;
  totalOrganizers: number;
  totalAttendees: number;
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  reportedEvents: number;
  pendingOrganizers: number;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<StatPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Protect admin route
  useEffect(() => {
    if (getAuthRole() !== "admin") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Load dashboard data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const statsRes = await apiGet("/admin/stats");
        setStats(statsRes.stats);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-sm text-[#697177]">Loading dashboard…</p>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <p className="text-sm text-red-600">
          {errorMsg || "Stats unavailable."}
        </p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold text-[#11181C] mb-8">
        Admin Dashboard
      </h1>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Organizers" value={stats.totalOrganizers} />
        <StatCard label="Total Attendees" value={stats.totalAttendees} />
        <StatCard label="Total Events" value={stats.totalEvents} />
        <StatCard label="Upcoming Events" value={stats.upcomingEvents} />
        <StatCard label="Past Events" value={stats.pastEvents} />
        <StatCard label="Reported Events" value={stats.reportedEvents} />
        <StatCard label="Pending Organizers" value={stats.pendingOrganizers} />
      </div>

      {/* ACTION BUTTONS */}
   {/* ACTION BUTTONS */}
<div className="flex flex-col sm:flex-row gap-4 mt-8">

  <Link
    to="/admin/pending-organizers"
    className="flex-1 text-center py-3 rounded-lg 
               bg-[#F3F4F6] text-[#11181C] border border-[#E2E8EF]
               hover:bg-[#E5E7EB] transition text-sm font-medium"
  >
    Manage Pending Organizers
  </Link>

  <Link
    to="/admin/reported-events"
    className="flex-1 text-center py-3 rounded-lg 
               bg-[#F3F4F6] text-[#11181C] border border-[#E2E8EF]
               hover:bg-[#E5E7EB] transition text-sm font-medium"
  >
    View Reported Events
  </Link>

</div>

    </AdminLayout>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-5 bg-white border border-[#E2E8EF] rounded-xl shadow-sm">
      <p className="text-xs text-[#697177]">{label}</p>
      <p className="text-xl font-semibold text-[#11181C]">{value}</p>
    </div>
  );
}
