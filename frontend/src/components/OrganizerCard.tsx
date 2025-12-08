import { useNavigate } from "react-router-dom";

export interface OrganizerCardProps {
  id: number;
  organizationName: string | null;
  isApproved: boolean;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function OrganizerCard({ organizer }: { organizer: OrganizerCardProps }) {
  const navigate = useNavigate();

  return (
    <div
    //   onClick={() => navigate(`/admin/organizers/${organizer.id}/events`)}
      className="p-4 bg-white border rounded-xl shadow-sm cursor-pointer hover:shadow-md transition"
    >
      <h3 className="text-sm font-semibold">{organizer.user.name}</h3>
      <p className="text-xs text-gray-500">{organizer.user.email}</p>

      {organizer.organizationName && (
        <p className="text-xs mt-1 text-gray-700">
          Org: {organizer.organizationName}
        </p>
      )}

      <p className="text-[10px] text-gray-400 mt-1">
        Joined: {new Date(organizer.createdAt).toLocaleDateString()}
      </p>

      <span
        className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
          organizer.isApproved
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {organizer.isApproved ? "Approved" : "Pending"}
      </span>
    </div>
  );
}
