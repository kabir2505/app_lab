import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import  OrganizerCard from "../components/OrganizerCard";
import type { OrganizerCardProps } from "../components/OrganizerCard";
import { apiGet } from "../utils/ClientApi";
import { getAuthRole } from "../utils/authToken";

export default function AdminAllOrganizersPage() {
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState<OrganizerCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Protect admin route
  useEffect(() => {
    if (getAuthRole() !== "admin") {
      navigate("/", { replace: true });
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiGet("/admin/organizers");
        setOrganizers(res.organizers || []);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load organizers");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-sm text-gray-500">Loading organizers…</p>
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
      <h1 className="text-2xl font-semibold mb-6">All Organizers</h1>

      {organizers.length === 0 ? (
        <p className="text-sm text-gray-500">No organizers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizers.map((org) => (
            <OrganizerCard key={org.id} organizer={org} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
