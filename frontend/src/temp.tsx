// import { useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams, Link } from "react-router-dom";
// import Layout from "../components/Layout";
// import ReviewCard from "../components/ReviewCard";
// import type { EventAttendee } from "../types/event";
// import { getEventAttendees } from "../utils/ClientApi";
// import {
//   getEventById,
//   getMe,
//   getUserBookings,
//   bookEvent,
//   createReview,
//   updateReview,
//   deleteReview,
// } from "../utils/ClientApi";
// import { getAuthRole, getAuthToken } from "../utils/authToken";
// import type {
//   EventDetail,
//   EventReview,
//   GetMeResponse,
//   GetUserBookingsResponse,
// } from "../types/event";

// export default function EventDetailPage() {
//   const { eventId } = useParams<{ eventId: string }>();
//   const navigate = useNavigate();

//   const numericEventId = Number(eventId);

//   const [event, setEvent] = useState<EventDetail | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [errorMsg, setErrorMsg] = useState("");

//   const [me, setMe] = useState<GetMeResponse["user"] | null>(null);
//   const [bookings, setBookings] = useState<
//     GetUserBookingsResponse["bookings"]
//   >([]);

//   // booking state
//   const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
//   const [quantity, setQuantity] = useState(1);
//   const [bookingLoading, setBookingLoading] = useState(false);
//   const [bookingError, setBookingError] = useState("");

//   // review state
//   const [reviewLoading, setReviewLoading] = useState(false);
//   const [reviewError, setReviewError] = useState("");

//   const [newRating, setNewRating] = useState(5);
//   const [newComment, setNewComment] = useState("");

//   const [isEditingReview, setIsEditingReview] = useState(false);
//   const [editRating, setEditRating] = useState(5);
//   const [editComment, setEditComment] = useState("");

//   const [attendees, setAttendees] = useState<EventAttendee[]>([]);
// const [attendeesLoading, setAttendeesLoading] = useState(false);
// const [attendeeError, setAttendeeError] = useState("");


//   const role = getAuthRole();
//   const hasToken = !!getAuthToken();

//   // ─────────────────────────────────────────────
//   // Helpers to reload event & bookings
//   // ─────────────────────────────────────────────

//   async function reloadEvent() {
//     if (!numericEventId || Number.isNaN(numericEventId)) return;
//     const res = await getEventById(numericEventId);
//     setEvent(res.event);
//   }

//   async function reloadBookingsIfAttendee() {
//     if (!hasToken) return;
//     const currentRole = getAuthRole();
//     if (currentRole !== "attendee") return;

//     const res = await getUserBookings();
//     setBookings(res.bookings);
//   }


//   async function loadAttendees() {
//   try {
//     setAttendeesLoading(true);
//     const res = await getEventAttendees(eventId);
//     setAttendees(res.attendees);
//   } catch (err: any) {
//     setAttendeeError(err.message || "Failed to load attendees");
//   } finally {
//     setAttendeesLoading(false);
//   }
// }

//   // ─────────────────────────────────────────────
//   // Initial load: event + (optionally) me + bookings
//   // ─────────────────────────────────────────────

//   useEffect(() => {
//     if (!numericEventId || Number.isNaN(numericEventId)) {
//       setErrorMsg("Invalid event id.");
//       setLoading(false);
//       return;
//     }

//     async function load() {
//       try {
//         setLoading(true);
//         setErrorMsg("");

//         // 1) event details
//         const eventRes = await getEventById(numericEventId);
//         setEvent(eventRes.event);

//         // 2) if logged in, get me + bookings
//         if (hasToken) {
//           try {
//             const meRes = await getMe();
//             setMe(meRes.user);

//             if (meRes.user.role === "attendee") {
//               const bookingsRes = await getUserBookings();
//               setBookings(bookingsRes.bookings);
//             }

//             if (role === "organizer" && me?.id === event.organizer.id) {
//   loadAttendees();
// }

//           } catch (err) {
//             // if /profile/me fails, we just ignore for now
//             console.error("Failed to load user/me or bookings", err);
//           }
//         }
//       } catch (err: any) {
//         console.error(err);
//         setErrorMsg(err.message || "Failed to load event.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();
//   }, [numericEventId, hasToken]);

//   // ─────────────────────────────────────────────
//   // Derived booleans
//   // ─────────────────────────────────────────────

//   const isPastEvent = useMemo(() => {
//     if (!event) return false;
//     return new Date(event.startDateTime) < new Date();
//   }, [event]);

//   const hasBookingForEvent = useMemo(() => {
//     if (!event) return false;
//     if (!bookings || bookings.length === 0) return false;

//     return bookings.some(
//       (b) => b.ticketType.event.id === event.id
//     );
//   }, [bookings, event]);

//   const userReview: EventReview | undefined = useMemo(() => {
//     if (!event || !me) return undefined;
//     return event.reviews.find((r) => r.user && r.user.id === me.id);
//   }, [event, me]);

//   const otherReviews: EventReview[] = useMemo(() => {
//     if (!event) return [];
//     if (!userReview) return event.reviews;
//     return event.reviews.filter((r) => r.id !== userReview.id);
//   }, [event, userReview]);

  
//   const canSeeReviewSection =
//     !!event && isPastEvent && hasBookingForEvent && hasToken && role === "attendee";

//   // ─────────────────────────────────────────────
//   // Booking handler
//   // ─────────────────────────────────────────────

//   async function handleBookClick(e: React.FormEvent) {
//     e.preventDefault();
//     if (!event) return;

//     if (!hasToken || role !== "attendee") {
//       navigate("/login");
//       return;
//     }

//     if (!selectedTicketId) {
//       setBookingError("Please select a ticket type.");
//       return;
//     }

//     if (quantity <= 0) {
//       setBookingError("Quantity must be at least 1.");
//       return;
//     }

//     setBookingLoading(true);
//     setBookingError("");

//     try {
//       await bookEvent(event.id, {
//         ticketTypeId: selectedTicketId,
//         quantity,
//       });

//       // Refresh event + bookings to see updated remainingCapacity
//       await Promise.all([reloadEvent(), reloadBookingsIfAttendee()]);
//       alert("Booking successful!");
//     } catch (err: any) {
//       console.error(err);
//       setBookingError(err.message || "Failed to book ticket.");
//     } finally {
//       setBookingLoading(false);
//     }
//   }

//   // ─────────────────────────────────────────────
//   // Review handlers
//   // ─────────────────────────────────────────────

//   async function handleCreateReview(e: React.FormEvent) {
//     e.preventDefault();
//     if (!event || !canSeeReviewSection) return;

//     setReviewLoading(true);
//     setReviewError("");

//     try {
//       await createReview(event.id, {
//         rating: newRating,
//         comment: newComment.trim() || null,
//       });

//       await reloadEvent();
//       setNewRating(5);
//       setNewComment("");
//     } catch (err: any) {
//       console.error(err);
//       setReviewError(err.message || "Failed to create review.");
//     } finally {
//       setReviewLoading(false);
//     }
//   }

//   function startEditingReview() {
//     if (!userReview) return;
//     setIsEditingReview(true);
//     setEditRating(userReview.rating);
//     setEditComment(userReview.comment ?? "");
//   }

//   function cancelEditingReview() {
//     setIsEditingReview(false);
//     setReviewError("");
//   }

//   async function handleUpdateReview(e: React.FormEvent) {
//     e.preventDefault();
//     if (!event || !userReview) return;

//     setReviewLoading(true);
//     setReviewError("");

//     try {
//       await updateReview(userReview.id, event.id, {
//         rating: editRating,
//         comment: editComment.trim() || null,
//       });

//       await reloadEvent();
//       setIsEditingReview(false);
//     } catch (err: any) {
//       console.error(err);
//       setReviewError(err.message || "Failed to update review.");
//     } finally {
//       setReviewLoading(false);
//     }
//   }

//   async function handleDeleteReview() {
//     if (!event || !userReview) return;

//     const sure = window.confirm("Delete your review for this event?");
//     if (!sure) return;

//     setReviewLoading(true);
//     setReviewError("");

//     try {
//       await deleteReview(userReview.id, event.id);
//       await reloadEvent();
//       setIsEditingReview(false);
//     } catch (err: any) {
//       console.error(err);
//       setReviewError(err.message || "Failed to delete review.");
//     } finally {
//       setReviewLoading(false);
//     }
//   }

//   // ─────────────────────────────────────────────
//   // Render
//   // ─────────────────────────────────────────────

//   if (loading) {
//     return (
//       <Layout>
//         <div className="max-w-4xl mx-auto px-4 py-10">
//           <p className="text-sm text-[#697177]">Loading event…</p>
//         </div>
//       </Layout>
//     );
//   }

//   if (errorMsg || !event) {
//     return (
//       <Layout>
//         <div className="max-w-4xl mx-auto px-4 py-10">
//           <p className="text-sm text-red-600">
//             {errorMsg || "Event not found."}
//           </p>
//           <Link
//             to="/"
//             className="mt-4 inline-block text-sm text-[#11181C] underline"
//           >
//             Back to home
//           </Link>
//         </div>
//       </Layout>
//     );
//   }

//   const dateLabel = new Date(event.startDateTime).toLocaleString();

//   return (
//     <Layout>
//       {/* Banner section */}
//       <div className="w-full bg-[#F3F4F6]">
//         <div className="max-w-5xl mx-auto px-4">
//           <div className="relative h-64 flex items-center justify-center">
//             <div className="absolute inset-0 bg-gradient-to-r from-[#E5E7EB] via-[#F9FAFB] to-[#E5E7EB]" />
//             <div className="relative h-44 w-full max-w-3xl overflow-hidden rounded-xl shadow-md bg-[#F9FAFB] flex items-center justify-center">
//               {event.bannerImageUrl ? (
//                 <img
//                   src={event.bannerImageUrl}
//                   alt={event.title}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <span className="text-xs text-[#8B959E]">
//                   No banner image provided
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
//         {/* Left: event info */}
// {/* Main event details section */}
// <section>

//   {/* CATEGORY + TITLE + DESCRIPTION */}
//   <div className="mb-4">
//     <div className="flex items-center gap-2 mb-1">
//       <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-[#E5F0FF] text-[#1D4ED8]">
//         {event.category.toUpperCase()}
//       </span>

//       {isPastEvent && (
//         <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-[#FEE2E2] text-[#B91C1C]">
//           Event over
//         </span>
//       )}
//     </div>

//     <h1 className="text-2xl font-semibold text-[#11181C]">{event.title}</h1>

//     <p className="mt-1 text-sm text-[#4B5563] whitespace-pre-wrap">
//       {event.description}
//     </p>
//   </div>

//   {/* EVENT METADATA */}
//   <div className="mb-4 space-y-1 text-sm text-[#4B5563]">
//     <p>
//       <span className="font-medium text-[#11181C]">Date & Time:</span>{" "}
//       {dateLabel}
//     </p>
//     <p>
//       <span className="font-medium text-[#11181C]">Location:</span>{" "}
//       {event.location}
//     </p>
//     <p>
//       <span className="font-medium text-[#11181C]">Organizer:</span>{" "}
//       {event.organizer.name} ({event.organizer.email})
//     </p>
//     <p>
//       <span className="font-medium text-[#11181C]">
//         Remaining Capacity:
//       </span>{" "}
//       {event.remainingCapacity ?? "N/A"}
//     </p>
//   </div>

//   {/* -------------------------------------------------------- */}
//   {/* 🔵 PUBLIC REVIEWS — visible to EVERYONE                  */}
//   {/* -------------------------------------------------------- */}

//   {event.reviews.length > 0 && (
//     <div className="mt-10">
//       <h2 className="text-lg font-semibold text-[#11181C] mb-3">
//         Reviews
//       </h2>

//       {/* Show user's review first if exists */}
//       {userReview && (
//         <ReviewCard review={userReview} highlight />
//       )}

//       {/* Show all other reviews */}
//       {otherReviews.map((review) => (
//         <ReviewCard key={review.id} review={review} />
//       ))}
//     </div>
//   )}

//   {/* If literally no reviews */}
//   {event.reviews.length === 0 && (
//     <p className="text-xs text-[#697177] mt-8">No reviews yet.</p>
//   )}

//   {/* -------------------------------------------------------- */}
//   {/* 🔵 ATTENDEE REVIEW CONTROLS (write, edit, delete)        */}
//   {/* Only show if user booked, is attendee, event is past     */}
//   {/* -------------------------------------------------------- */}

//   {canSeeReviewSection && (
//     <div className="mt-12 space-y-4">
//       <h2 className="text-lg font-semibold text-[#11181C]">
//         Your Review
//       </h2>

//       {reviewError && (
//         <p className="text-sm text-red-600">{reviewError}</p>
//       )}

//       {/* ATTENDEE ALREADY REVIEWED ---------------------- */}
//       {userReview ? (
//         <div className="space-y-3">
//           {!isEditingReview && (
//             <>
//               <ReviewCard review={userReview} highlight />

//               <div className="flex gap-2">
//             <button
//             type="button"
//             onClick={startEditingReview}
//             className="text-xs px-3 py-1 rounded-md border border-red-200 
//                              text-blue-600 hover:bg-blue-50"
//             >
//             Edit review
//             </button>

//                 <button
//                   type="button"
//                   onClick={handleDeleteReview}
//                   className="text-xs px-3 py-1 rounded-md border border-red-200 
//                              text-red-600 hover:bg-red-50"
//                 >
//                   Delete review
//                 </button>
//               </div>
//             </>
//           )}

//           {/* INLINE EDIT FORM */}
//           {isEditingReview && (
//             <form
//               onSubmit={handleUpdateReview}
//               className="space-y-3 border border-[#E2E8EF] rounded-lg p-3 bg-white"
//             >
//               {/* Rating */}
//               <div>
//                 <label className="block text-xs font-medium text-[#11181C] mb-1">
//                   Rating
//                 </label>
//                 <select
//                   value={editRating}
//                   onChange={(e) => setEditRating(Number(e.target.value))}
//                   className="w-24 border border-[#E2E8EF] rounded-md px-2 py-1 text-sm"
//                 >
//                   {[1, 2, 3, 4, 5].map((r) => (
//                     <option key={r} value={r}>
//                       {r}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Comment */}
//               <div>
//                 <label className="block text-xs font-medium text-[#11181C] mb-1">
//                   Comment
//                 </label>
//                 <textarea
//                   value={editComment}
//                   onChange={(e) => setEditComment(e.target.value)}
//                   rows={3}
//                   className="w-full border border-[#E2E8EF] rounded-md px-3 py-2 text-sm"
//                 />
//               </div>

//               <div className="flex gap-2">
//                 <button
//                   type="submit"
//                   disabled={reviewLoading}
//                   className="text-xs px-3 py-1 rounded-md bg-[#11181C] text-white hover:bg-black"
//                 >
//                   {reviewLoading ? "Saving…" : "Save changes"}
//                 </button>

//                 <button
//                   type="button"
//                   onClick={cancelEditingReview}
//                   className="text-xs px-3 py-1 rounded-md border border-[#E2E8EF] 
//                              text-[#11181C] hover:bg-[#F3F4F6]"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       ) : (
//         /* ATTENDEE HAS NOT REVIEWED — CREATE FORM */
//         <form
//           onSubmit={handleCreateReview}
//           className="space-y-3 border border-[#E2E8EF] rounded-lg p-3 bg-white"
//         >
//           <h3 className="text-sm font-medium text-[#11181C]">
//             Leave a review
//           </h3>

//           {/* Rating */}
//           <div>
//             <label className="block text-xs font-medium text-[#11181C] mb-1">
//               Rating
//             </label>
//             <select
//               value={newRating}
//               onChange={(e) => setNewRating(Number(e.target.value))}
//               className="w-24 border border-[#E2E8EF] rounded-md px-2 py-1 text-sm"
//             >
//               {[1, 2, 3, 4, 5].map((r) => (
//                 <option key={r} value={r}>
//                   {r}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Comment */}
//           <div>
//             <label className="block text-xs font-medium text-[#11181C] mb-1">
//               Comment (optional)
//             </label>
//             <textarea
//               className="w-full border border-[#E2E8EF] rounded-md px-3 py-2 text-sm"
//               rows={3}
//               value={newComment}
//               onChange={(e) => setNewComment(e.target.value)}
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={reviewLoading}
//             className="text-xs px-3 py-1 rounded-md bg-[#11181C] text-white hover:bg-black"
//           >
//             {reviewLoading ? "Submitting…" : "Submit review"}
//           </button>
//         </form>
//       )}
//     </div>
//   )}
// </section>


//         {/* Right: booking card */}
//         <aside className="space-y-4">
//           <div className="border border-[#E2E8EF] rounded-xl bg-white p-4 shadow-sm">
//             <h2 className="text-sm font-semibold text-[#11181C] mb-3">
//               Tickets
//             </h2>

//             {event.ticket_type.length === 0 ? (
//               <p className="text-xs text-[#697177]">
//                 No ticket types configured for this event.
//               </p>
//             ) : (
//               <form onSubmit={handleBookClick} className="space-y-3">
//                 {/* Tickets list */}
//                 <div className="space-y-2">
//                   {event.ticket_type.map((ticket) => (
//                     <label
//                       key={ticket.id}
//                       className="flex items-center justify-between gap-2 border border-[#E2E8EF] rounded-md px-3 py-2 text-xs cursor-pointer hover:bg-[#F9FAFB]"
//                     >
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="radio"
//                           name="ticketType"
//                           value={ticket.id}
//                           checked={selectedTicketId === ticket.id}
//                           onChange={() => setSelectedTicketId(ticket.id)}
//                         />
//                         <div>
//                           <p className="font-medium text-[#11181C] capitalize">
//                             {ticket.name}
//                           </p>
//                           <p className="text-[11px] text-[#697177]">
//                             ₹{ticket.price} · remaining{" "}
//                             {ticket.remainingSeats ?? ticket.seatLimit}
//                           </p>
//                         </div>
//                       </div>
//                     </label>
//                   ))}
//                 </div>

//                 {/* Quantity */}
//                 <div>
//                   <label className="block text-xs font-medium text-[#11181C] mb-1">
//                     Quantity
//                   </label>
//                   <input
//                     type="number"
//                     min={1}
//                     value={quantity}
//                     onChange={(e) => setQuantity(Number(e.target.value))}
//                     className="w-24 border border-[#E2E8EF] rounded-md px-2 py-1 text-sm"
//                   />
//                 </div>

//                 {bookingError && (
//                   <p className="text-xs text-red-600">{bookingError}</p>
//                 )}

//                 {/* CTA */}
//                 {!hasToken || role !== "attendee" ? (
//                   <Link
//                     to="/login"
//                     className="inline-flex items-center justify-center w-full text-xs px-3 py-2 rounded-md bg-[#11181C] text-white hover:bg-black"
//                   >
//                     Login to book
//                   </Link>
//                 ) : isPastEvent ? (
//                   <p className="text-xs text-[#697177]">
//                     This event has already ended. Booking is closed.
//                   </p>
//                 ) : (
//                   <button
//                     type="submit"
//                     disabled={bookingLoading}
//                     className="inline-flex items-center justify-center w-full text-xs px-3 py-2 rounded-md bg-[#11181C] text-white hover:bg-black"
//                   >
//                     {bookingLoading ? "Booking…" : "Book tickets"}
//                   </button>
//                 )}
//               </form>
//             )}
//           </div>
//         </aside>
//       </div>


//             {/* ---------------------------------------------------------
//     ORGANIZER — ATTENDEE LIST
// ---------------------------------------------------------- */}
// {hasToken && role === "organizer" && me?.id === event.organizer.id && (
//   <div className="max-w-5xl mx-auto px-4 pb-16 mt-10">
//     <h2 className="text-xl font-semibold text-[#11181C] mb-4">
//       Attendees
//     </h2>

//     {attendeesLoading ? (
//       <p className="text-sm text-[#697177]">Loading attendees…</p>
//     ) : attendeeError ? (
//       <p className="text-sm text-red-600">{attendeeError}</p>
//     ) : attendees.length === 0 ? (
//       <p className="text-sm text-[#697177]">
//         No attendees have booked for this event yet.
//       </p>
//     ) : (
//       <div className="overflow-x-auto border border-[#E2E8EF] rounded-xl bg-white shadow-sm">
//         <table className="min-w-full text-sm">
//           <thead className="bg-[#F7F9FA] border-b border-[#E2E8EF]">
//             <tr className="text-left text-[#11181C]">
//               <th className="py-2 px-3">Name</th>
//               <th className="py-2 px-3">Email</th>
//               <th className="py-2 px-3">Ticket</th>
//               <th className="py-2 px-3">Qty</th>
//               <th className="py-2 px-3">Total</th>
//               <th className="py-2 px-3">Booked At</th>
//             </tr>
//           </thead>

//           <tbody>
//             {attendees.map((a) => (
//               <tr
//                 key={a.bookingId}
//                 className="border-b border-[#F0F2F4] text-[#4B5563]"
//               >
//                 <td className="py-2 px-3">{a.name}</td>
//                 <td className="py-2 px-3">{a.email}</td>
//                 <td className="py-2 px-3 capitalize">{a.ticketType}</td>
//                 <td className="py-2 px-3">{a.quantity}</td>
//                 <td className="py-2 px-3">₹{a.totalPrice}</td>
//                 <td className="py-2 px-3">
//                   {new Date(a.bookedAt).toLocaleString()}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     )}
//   </div>
// )}





//     </Layout>
//   );
// }
// src/pages/EventDetailPage.tsx