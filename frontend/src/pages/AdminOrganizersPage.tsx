import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getAuthRole } from "../utils/authToken";
import { useNavigate } from "react-router";
import {
  fetchOrganizers,
  approveOrganizer,
  rejectOrganizer
} from "../utils/ClientApi";

import OrganizerRow from "../components/OrganizerRow";
import type { OrganizerUser } from "../types/user";

export default function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState<OrganizerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,setError] = useState<string | null>(null);
   const navigate = useNavigate();



    useEffect(() => {
      if (getAuthRole() !== "admin") {
        setError("Only admin can access.");
        navigate("/", { replace: true });
      }
    }, [navigate]);
  async function load() {
    try {
      const res = await fetchOrganizers();
      setOrganizers(res.organizers);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load organizers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id: number) {
    await approveOrganizer(id);
    load();
  }

  async function handleReject(id: number) {
    await rejectOrganizer(id);
    load();
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Organizer Approvals</h1>

        {loading && <p>Loading organizers...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && organizers.length === 0 && (
          <p>No organizers found.</p>
        )}

        {!loading && organizers.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Organization</th>
                <th className="px-4 py-3 text-left">Website</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {organizers.map((org) => (
                <OrganizerRow
                  key={org.id}
                  organizer={org}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
