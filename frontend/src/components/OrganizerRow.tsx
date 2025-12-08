import type { OrganizerUser } from "../types/user";

interface Props {
  organizer: OrganizerUser;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export default function OrganizerRow({ organizer, onApprove, onReject }: Props) {
  return (
    <tr className="border-b border-gray-200">
       
      <td className="px-4 py-3">{organizer.user.name}</td>
      <td className="px-4 py-3">{organizer.user.email}</td>
      <td className="px-4 py-3">{organizer.organizationName ?? "-"}</td>
      <td className="px-4 py-3 text-blue-600">
        {organizer.website ?? "-"}
        
      </td>
      <td className="px-4 py-3">
        <span
          className={`px-2 py-1 rounded text-xs ${
            organizer.isApproved === true
              ? "bg-green-100 text-green-800"
              : organizer.isApproved === false
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {organizer.isApproved ? "Approved" : "Disapproved"}
        </span>
      </td>

      <td className="px-4 py-3 flex gap-2">
        <button
          onClick={() => onApprove(organizer.user.id)}
          className="text-white bg-green-600 px-3 py-1 rounded text-sm hover:bg-green-700 transition"
        >
          Approve
        </button>

        <button
          onClick={() => onReject(organizer.user.id)}
          className="text-white bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700 transition"
        >
          Reject
        </button>
      </td>
    </tr>
  );
}
