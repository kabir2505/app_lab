import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import ReviewCard from "../components/ReviewCard";

import {getEventById,getMe,getUserBookings,bookEvent,createReview,updateReview,deleteReview,getEventAttendees, reportEvent, adminDeleteEvent} from "../utils/ClientApi";

import { getAuthRole, getAuthToken } from "../utils/authToken";
import { apiGet,apiPatch } from "../utils/ClientApi";
import type {EventDetail,EventReview,GetMeResponse,GetUserBookingsResponse,EventAttendee,} from "../types/event";



export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const numericEventId = Number(eventId);


  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

 
  const [me, setMe] = useState<GetMeResponse["user"] | null>(null);
  const [bookings, setBookings] = useState<GetUserBookingsResponse["bookings"]>(
    []
  );

  
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");


  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [attendeeError, setAttendeeError] = useState("");


const [reportReason, setReportReason] = useState("");
const [reportError, setReportError] = useState("");
const [reportSuccess, setReportSuccess] = useState("");
const [reporting, setReporting] = useState(false);
const [hasReported, setHasReported] = useState(false);

const [eventReports, setEventReports] = useState<any[]>([]);



  

  const role = getAuthRole();
  const hasToken = !!getAuthToken();



  async function reloadEvent() {
    if (!numericEventId) return;
    const res = await getEventById(numericEventId);
    setEvent(res.event);
  }

  async function reloadBookingsIfAttendee() {
    if (!hasToken || role !== "attendee") return;
    const res = await getUserBookings();
    setBookings(res.bookings);
  }

  async function loadAttendeesForOrganizer() {
    try {
      setAttendeesLoading(true);
      const res = await getEventAttendees(numericEventId);
      setAttendees(res.attendees);
    } catch (err: any) {
      setAttendeeError(err.message || "Failed to load attendees");
    } finally {
      setAttendeesLoading(false);
    }
  }


  useEffect(() => {
    if (!numericEventId || Number.isNaN(numericEventId)) {
      setErrorMsg("Invalid event id.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);

      
        const eventRes = await getEventById(numericEventId);
        setEvent(eventRes.event);

   
        if (hasToken) {
          const meRes = await getMe();
          setMe(meRes.user);

          if (meRes.user.role === "attendee") {
            const bookingsRes = await getUserBookings();
            setBookings(bookingsRes.bookings);
          }


      
            if (meRes.user.role === "attendee") {
            try {
                const repRes = await apiGet("/report"); // returns all reports
                const already = repRes.events?.some(
                (r: any) =>
                    r.event.id === numericEventId && r.user.id === meRes.user.id
                );
                setHasReported(!!already);
            } catch {}
            }


         
        if (role === "attendee") {
        try {
            const repRes = await apiGet("/report"); 
            const already = repRes.events.some(
            (r: any) => r.event.id === numericEventId && r.user.id === meRes.user.id
            );
            setHasReported(already);
        } catch {}
        }



        if (role === "admin") {
        try {
            const repRes = await apiGet("/report");
            const filtered = repRes.reports.filter(
            (r: any) => r.event.id === numericEventId
            );
            setEventReports(filtered);
        } catch {}
        }



        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load event.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [numericEventId, hasToken]);



  useEffect(() => {
    if (!event || !me) return;

    const isOrganizerOfThisEvent =
      hasToken && role === "organizer" && me.id === event.organizer.id;

    if (isOrganizerOfThisEvent) {
      loadAttendeesForOrganizer();
    }
  }, [event, me]);



  const isPastEvent = useMemo(() => {
    if (!event) return false;
    return new Date(event.startDateTime) < new Date();
  }, [event]);

  const hasBookingForEvent = useMemo(() => {
    if (!event || bookings.length === 0) return false;
    return bookings.some((b) => b.ticketType.event.id === event.id);
  }, [event, bookings]);

  const userReview: EventReview | undefined = useMemo(() => {
    if (!event || !me) return undefined;
    return event.reviews.find((r) => r.user?.id === me.id);
  }, [event, me]);

  const otherReviews = useMemo(() => {
    if (!event) return [];
    return userReview
      ? event.reviews.filter((r) => r.id !== userReview.id)
      : event.reviews;
  }, [event, userReview]);

  const canSeeReviewSection =
    !!event &&
    isPastEvent &&
    hasBookingForEvent &&
    hasToken &&
    role === "attendee";



  async function handleBookClick(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;

    if (!hasToken || role !== "attendee") {
      navigate("/login");
      return;
    }

    if (!selectedTicketId) {
      setBookingError("Please select a ticket type.");
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      await bookEvent(event.id, {
        ticketTypeId: selectedTicketId,
        quantity,
      });

      await Promise.all([reloadEvent(), reloadBookingsIfAttendee()]);
      alert("Booking successful!");
    } catch (err: any) {
      setBookingError(err.message || "Failed to book ticket.");
    } finally {
      setBookingLoading(false);
    }
  }



  function startEditingReview() {
    if (!userReview) return;
    setIsEditingReview(true);
    setEditRating(userReview.rating);
    setEditComment(userReview.comment ?? "");
  }

  function cancelEditingReview() {
    setIsEditingReview(false);
    setReviewError("");
  }

  async function handleCreateReview(e: React.FormEvent) {
    e.preventDefault();
    if (!event || !canSeeReviewSection) return;

    setReviewLoading(true);
    setReviewError("");

    try {
      await createReview(event.id, {
        rating: newRating,
        comment: newComment.trim() || null,
      });

      await reloadEvent();
      setNewRating(5);
      setNewComment("");
    } catch (err: any) {
      setReviewError(err.message || "Failed to create review.");
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleUpdateReview(e: React.FormEvent) {
    e.preventDefault();
    if (!event || !userReview) return;

    setReviewLoading(true);
    setReviewError("");

    try {
      await updateReview(userReview.id, event.id, {
        rating: editRating,
        comment: editComment.trim() || null,
      });

      await reloadEvent();
      setIsEditingReview(false);
    } catch (err: any) {
      setReviewError(err.message || "Failed to update review.");
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleDeleteReview() {
    if (!event || !userReview) return;

    const sure = window.confirm("Delete your review?");
    if (!sure) return;

    setReviewLoading(true);
    setReviewError("");

    try {
      await deleteReview(userReview.id, event.id);
      await reloadEvent();
      setIsEditingReview(false);
    } catch (err: any) {
      setReviewError(err.message || "Failed to delete review.");
    } finally {
      setReviewLoading(false);
    }
  }


  async function handleResolveReport(reportId: number) {
  try {
    await apiPatch(`/report/${reportId}/resolve`,{});
    alert("Report resolved and event blocked!");
    window.location.reload();
  } catch (err: any) {
    alert(err.message || "Failed to resolve report");
  }
}

async function handleRejectReport(reportId: number) {
  try {
    await apiPatch(`/report/${reportId}/reject`,{});
    alert("Report rejected");
    window.location.reload();
  } catch (err: any) {
    alert(err.message || "Failed to reject report");
  }
}


async function handleReportEvent() {
  if (!reportReason.trim()) {
    setReportError("Please enter a reason.");
    return;
  }

  setReporting(true);
  setReportError("");
  setReportSuccess("");

  try {
    await reportEvent(event.id, { reason: reportReason });

    setReportSuccess("Event reported successfully!");
    setHasReported(true);
    setReportReason("");

  } catch (err: any) {
    setReportError(err.message || "Failed to report event.");
  } finally {
    setReporting(false);
  }
}




  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-sm text-[#697177]">Loading event…</p>
        </div>
      </Layout>
    );
  }

  if (errorMsg || !event) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-sm text-red-600">
            {errorMsg || "Event not found."}
          </p>
          <Link to="/" className="mt-4 inline-block text-sm underline">
            Back to home
          </Link>
        </div>
      </Layout>
    );
  }

  const dateLabel = new Date(event.startDateTime).toLocaleString();



  return (
    <Layout>

      <div className="w-full bg-[#F3F4F6]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative h-64 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E5E7EB] via-[#F9FAFB] to-[#E5E7EB]" />
            <div className="relative h-44 w-full max-w-3xl overflow-hidden rounded-xl shadow-md bg-white flex items-center justify-center">
              {event.bannerImageUrl ? (
                <img
                  src={event.bannerImageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-[#8B959E]">
                  No banner image provided
                </span>
              )}
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">


        <section>
       
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                {event.category.toUpperCase()}
              </span>

              {isPastEvent && (
                <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
                  Event over
                </span>
              )}
            </div>

            <h1 className="text-2xl font-semibold">{event.title}</h1>
            <p className="mt-1 text-sm">{event.description}</p>
          </div>

        
          <div className="mb-4 space-y-1 text-sm">
            <p>
              <span className="font-medium">Date:</span> {dateLabel}
            </p>
            <p>
              <span className="font-medium">Location:</span> {event.location}
            </p>
            <p>
              <span className="font-medium">Organizer:</span>{" "}
              {event.organizer.name} ({event.organizer.email})
            </p>
            <p>
              <span className="font-medium">Remaining:</span>{" "}
              {event.remainingCapacity}
            </p>
          </div>

       
          {event.reviews.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-lg font-semibold">Reviews</h2>

              {userReview && <ReviewCard review={userReview} highlight />}
              {otherReviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-xs text-gray-500">No reviews yet.</p>
          )}

          {canSeeReviewSection && (
            <div className="mt-12 space-y-4">
              <h2 className="text-lg font-semibold">Your Review</h2>

              {reviewError && (
                <p className="text-sm text-red-600">{reviewError}</p>
              )}

              {userReview ? (
                <div className="space-y-3">
                  {!isEditingReview ? (
                    <>
                      <ReviewCard review={userReview} highlight />

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={startEditingReview}
                          className="text-xs px-3 py-1 rounded-md border text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={handleDeleteReview}
                          className="text-xs px-3 py-1 rounded-md border text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  ) : (
                    <form
                      onSubmit={handleUpdateReview}
                      className="space-y-3 border rounded-lg p-3 bg-white"
                    >
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Rating
                        </label>
                        <select
                          value={editRating}
                          onChange={(e) =>
                            setEditRating(Number(e.target.value))
                          }
                          className="w-24 border rounded-md px-2 py-1 text-sm"
                        >
                          {[1, 2, 3, 4, 5].map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Comment
                        </label>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          rows={3}
                          className="w-full border rounded-md px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={reviewLoading}
                          className="text-xs px-3 py-1 rounded-md bg-black text-white hover:bg-gray-900"
                        >
                          {reviewLoading ? "Saving…" : "Save changes"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditingReview}
                          className="text-xs px-3 py-1 rounded-md border hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={handleCreateReview}
                  className="space-y-3 border rounded-lg p-3 bg-white"
                >
                  <h3 className="text-sm font-medium">Leave a review</h3>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Rating
                    </label>
                    <select
                      value={newRating}
                      onChange={(e) =>
                        setNewRating(Number(e.target.value))
                      }
                      className="w-24 border rounded-md px-2 py-1 text-sm"
                    >
                      {[1, 2, 3, 4, 5].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Comment (optional)
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="text-xs px-3 py-1 rounded-md bg-black text-white hover:bg-gray-900"
                  >
                    {reviewLoading ? "Submitting…" : "Submit review"}
                  </button>
                </form>
              )}
            </div>
          )}
        </section>



{role === "admin" && eventReports.length > 0 && (
  <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
    <h2 className="text-lg font-semibold mb-2">Report Management</h2>

    {eventReports.map((rep) => (
      <div
        key={rep.id}
        className="border rounded-md p-3 mb-3 bg-[#F9FAFB]"
      >
        <p className="text-sm">
          <span className="font-medium">Reason:</span> {rep.reason}
        </p>
        <p className="text-xs text-[#697177]">
          Reported by: {rep.reportedBy.name} ({rep.reportedBy.email})
        </p>
        <p className="text-xs text-[#697177]">
          Status: {rep.status.toUpperCase()}
        </p>

        {rep.status === "pending" && (
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => handleResolveReport(rep.id)}
              className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Resolve (Block Event)
            </button>

            <button
              onClick={() => handleRejectReport(rep.id)}
              className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Reject Report
            </button>
          </div>
        )}
      </div>
    ))}
  </div>
)}


     
        <aside className="space-y-4">
          <div className="border border-[#E2E8EF] rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#11181C] mb-3">
              Tickets
            </h2>

            {event.ticket_type.length === 0 ? (
              <p className="text-xs text-[#697177]">
                No ticket types configured for this event.
              </p>
            ) : (
              <form onSubmit={handleBookClick} className="space-y-3">
                <div className="space-y-2">
                  {event.ticket_type.map((ticket) => (
                    <label
                      key={ticket.id}
                      className="flex items-center justify-between gap-2 border border-[#E2E8EF] rounded-md px-3 py-2 text-xs cursor-pointer hover:bg-[#F9FAFB]"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="ticketType"
                          value={ticket.id}
                          checked={selectedTicketId === ticket.id}
                          onChange={() => setSelectedTicketId(ticket.id)}
                        />
                        <div>
                          <p className="font-medium text-[#11181C] capitalize">
                            {ticket.name}
                          </p>
                          <p className="text-[11px] text-[#697177]">
                            ₹{ticket.price} · remaining{" "}
                            {ticket.remainingSeats ?? ticket.seatLimit}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#11181C] mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-24 border border-[#E2E8EF] rounded-md px-2 py-1 text-sm"
                  />
                </div>

                {bookingError && (
                  <p className="text-xs text-red-600">{bookingError}</p>
                )}

                {!hasToken || role !== "attendee" ? (
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center w-full text-xs px-3 py-2 rounded-md bg-black text-white hover:bg-gray-900"
                  >
                    Login to book
                  </Link>
                ) : isPastEvent ? (
                  <p className="text-xs text-[#697177]">
                    This event has ended. Booking closed.
                  </p>
                ) : (
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="inline-flex items-center justify-center w-full text-xs px-3 py-2 rounded-md bg-black text-white hover:bg-gray-900"
                  >
                    {bookingLoading ? "Booking…" : "Book tickets"}
                  </button>
                )}
              </form>
            )}
          </div>
        </aside>
      </div>


{role === "attendee" &&
  hasBookingForEvent &&
  isPastEvent && (
    <div className="border border-red-200 rounded-xl bg-red-50 p-4 shadow-sm mt-4">
      <h2 className="text-sm font-semibold text-red-700 mb-2">
        Report Event
      </h2>

      {hasReported ? (
        <p className="text-xs text-red-600">
          You have already reported this event.
        </p>
      ) : (
        <>
          <textarea
            className="w-full text-xs border border-red-300 rounded-md px-2 py-1 mb-2"
            rows={3}
            placeholder="Describe the issue…"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />

          {reportError && (
            <p className="text-xs text-red-600 mb-1">{reportError}</p>
          )}
          {reportSuccess && (
            <p className="text-xs text-green-600 mb-1">{reportSuccess}</p>
          )}

          <button
            disabled={reporting}
            onClick={handleReportEvent}
            className="w-full text-xs px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {reporting ? "Reporting…" : "Submit Report"}
          </button>
        </>
      )}
    </div>
  )}





      {hasToken &&
        role === "organizer" &&
        me?.id === event.organizer.id && (
          <div className="max-w-5xl mx-auto px-4 pb-16 mt-10">
            <h2 className="text-xl font-semibold mb-4">Attendees</h2>

            {attendeesLoading ? (
              <p className="text-sm text-gray-500">Loading attendees…</p>
            ) : attendeeError ? (
              <p className="text-sm text-red-600">{attendeeError}</p>
            ) : attendees.length === 0 ? (
              <p className="text-sm text-gray-500">
                No attendees have booked yet.
              </p>
            ) : (
              <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr className="text-left">
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Ticket</th>
                      <th className="py-2 px-3">Qty</th>
                      <th className="py-2 px-3">Total</th>
                      <th className="py-2 px-3">Booked At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((a) => (
                      <tr key={a.bookingId} className="border-b">
                        <td className="py-2 px-3">{a.name}</td>
                        <td className="py-2 px-3">{a.email}</td>
                        <td className="py-2 px-3 capitalize">{a.ticketType}</td>
                        <td className="py-2 px-3">{a.quantity}</td>
                        <td className="py-2 px-3">₹{a.totalPrice}</td>
                        <td className="py-2 px-3">
                          {new Date(a.bookedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}



        {role === "admin" && (
  <button
    onClick={async () => {
      if (!confirm("Are you sure you want to delete this entire event?")) return;

      try {
        await adminDeleteEvent(event.id);
        alert("Event deleted successfully.");
        navigate("/admin/events"); // redirect to admin page
      } catch (err: any) {
        alert(err.message || "Failed to delete event.");
      }
    }}
    className="px-3 py-2 text-xs rounded-md bg-red-700 text-white hover:bg-red-800"
  >
    Delete Event
  </button>
)}

    </Layout>
  );
}
