import type { EventReview } from "../types/event";

interface ReviewCardProps {
  review: EventReview;
  highlight?: boolean; 
}

export default function ReviewCard({ review, highlight }: ReviewCardProps) {
  const createdLabel = new Date(review.createdAt).toLocaleString();

  return (
    <div
      className={`border rounded-lg px-4 py-3 bg-white shadow-sm ${
        highlight ? "border-[#11181C]" : "border-[#E2E8EF]"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[#11181C]">
            {review.user?.name ?? "Anonymous"}
          </p>
          <span className="text-xs text-[#8B959E]">@{review.user?.email}</span>
        </div>
        <span className="text-xs text-[#8B959E]">{createdLabel}</span>
      </div>

      <div className="flex items-center gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <span
            key={idx}
            className={
              idx < review.rating
                ? "text-yellow-500 text-sm"
                : "text-[#E2E8EF] text-sm"
            }
          >
            ★
          </span>
        ))}
      </div>

      {review.comment && (
        <p className="text-sm text-[#4B5563] whitespace-pre-wrap">
          {review.comment}
        </p>
      )}
    </div>
  );
}
