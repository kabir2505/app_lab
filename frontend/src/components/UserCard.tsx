// src/components/UserCard.tsx
import { useNavigate } from "react-router-dom";

export interface UserCardProps {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isBlocked: boolean;
}

export default function UserCard({ user, onToggleBlock }: { user: UserCardProps; onToggleBlock: (id: number) => void }) {
  const navigate = useNavigate();

  return (
    <div className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
      <h3 className="text-sm font-semibold">{user.name}</h3>
      <p className="text-xs text-gray-500">{user.email}</p>

      <p className="text-xs text-gray-600 mt-1">Role: {user.role}</p>

      <p className="text-[10px] text-gray-400 mt-1">
        Joined: {new Date(user.createdAt).toLocaleDateString()}
      </p>

      <span
        className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
          user.isBlocked
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {user.isBlocked ? "Blocked" : "Active"}
      </span>

      <button
        className={`mt-3 px-3 py-1 rounded text-xs font-medium ${
          user.isBlocked
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-red-600 text-white hover:bg-red-700"
        }`}
        onClick={() => onToggleBlock(user.id)}
      >
        {user.isBlocked ? "Unblock User" : "Block User"}
      </button>
    </div>
  );
}
