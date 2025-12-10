// src/pages/AdminUsersPage.tsx
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useNavigate } from "react-router-dom";
import { getAuthRole } from "../utils/authToken";
import { fetchAllUsers, toggleBlockUser } from "../utils/ClientApi";
import UserCard from "../components/UserCard";
import type { UserCardProps } from "../components/UserCard";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (getAuthRole() !== "admin") {
      setError("Only admin can access this page.");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  async function load() {
    try {
      const res = await fetchAllUsers();
      setUsers(res.users);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleBlock(userId: number) {
    try {
      await toggleBlockUser(userId);
      load(); // refresh list
    } catch (err) {
      console.error(err);
      setError("Failed to update user block status.");
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Manage Users</h1>

        {loading && <p>Loading users...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && users.length === 0 && <p>No users found.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {!loading &&
            users.map((user) => (
              <UserCard key={user.id} user={user} onToggleBlock={handleToggleBlock} />
            ))}
        </div>
      </div>
    </AdminLayout>
  );
}
