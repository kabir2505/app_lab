import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { getAuthRole } from "../utils/authToken";
import {
  getMeRaw,
  getMyBookingsRaw,
  updateAttendeeProfileRaw,
} from "../utils/ClientApi";
import type { Event } from "../types/event";



type AttendeeProfile = {
  preferences: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

type MeUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  attendeeProfile?: AttendeeProfile | null;
};

type BookingStatus = "confirmed" | "cancelled" | string;

type BookingTicket = {
  id: number;
  name: string; 
  price: number;
  seatLimit: number;
  remainingSeats?: number;
  event: Event;
};

type Booking = {
  id: number;
  quantity: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  ticketType: BookingTicket;
};

type GetMeResponse = {
  success: boolean;
  message: string;
  user: MeUser;
};

type GetBookingsResponse = {
  success: boolean;
  message: string;
  bookings: Booking[];
};

type UpdateAttendeeProfileRequest = {
  preferences: string | null;
  bio: string | null;
  avatarUrl: string | null;
};


function BookingCard({ booking }: { booking: Booking }) {
  const event = booking.ticketType.event;
  const eventDate = new Date(event.startDateTime);
  const isPastEvent = eventDate < new Date();

  const dateLabel = eventDate.toLocaleString();
  const statusLabel =
    booking.status === "confirmed"
      ? "Confirmed"
      : booking.status === "cancelled"
      ? "Cancelled"
      : booking.status;

  return (
    <div className="border border-[#E2E8EF] rounded-lg bg-white p-4 flex flex-col gap-2">
    
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#11181C] line-clamp-1">
            {event.title}
          </p>
          <p className="text-xs text-[#697177]">
            {event.location} · {dateLabel}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              booking.status === "confirmed"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]"
            }`}
          >
            {statusLabel}
          </span>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563]">
            {isPastEvent ? "Past event" : "Upcoming"}
          </span>
        </div>
      </div>


      <div className="text-xs text-[#4B5563] flex flex-wrap gap-x-4 gap-y-1">
        <p>
          <span className="font-medium text-[#11181C]">Ticket:</span>{" "}
          <span className="capitalize">{booking.ticketType.name}</span>
        </p>
        <p>
          <span className="font-medium text-[#11181C]">Price:</span> ₹
          {booking.ticketType.price}
        </p>
        <p>
          <span className="font-medium text-[#11181C]">Quantity:</span>{" "}
          {booking.quantity}
        </p>
        <p>
          <span className="font-medium text-[#11181C]">Total:</span> ₹
          {booking.totalPrice}
        </p>
      </div>

   
      {typeof booking.ticketType.remainingSeats === "number" && (
        <p className="text-[11px] text-[#697177]">
          Remaining seats for this ticket:{" "}
          <span className="font-medium text-[#11181C]">
            {booking.ticketType.remainingSeats}
          </span>
        </p>
      )}
    </div>
  );
}



export default function AttendeeProfilePage() {
  const [me, setMe] = useState<MeUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");


  const [isEditing, setIsEditing] = useState(false);
  const [prefInput, setPrefInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [avatarInput, setAvatarInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);


  useEffect(() => {
    const role = getAuthRole();

    if (role !== "attendee") {
      setErrorMsg("Only attendees can access this page.");
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setErrorMsg("");

        const [meResRaw, bookingsResRaw] = await Promise.all([
          getMeRaw(),
          getMyBookingsRaw(),
        ]);

        const meRes = meResRaw as GetMeResponse;
        const bookingsRes = bookingsResRaw as GetBookingsResponse;

        setMe(meRes.user);
        setBookings(bookingsRes.bookings || []);

        // initialise edit form from profile
        const profile = meRes.user.attendeeProfile;
        setPrefInput(profile?.preferences ?? "");
        setBioInput(profile?.bio ?? "");
        setAvatarInput(profile?.avatarUrl ?? "");
      } catch (err: any) {
        console.error("Failed to load profile/bookings:", err);
        setErrorMsg(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);



  const sortedBookings: Booking[] = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];

    const confirmed = bookings.filter(
      (b) => b.status.toLowerCase() === "confirmed"
    );
    const others = bookings.filter(
      (b) => b.status.toLowerCase() !== "confirmed"
    );


    const byDateDesc = (a: Booking, b: Booking) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    return [...confirmed.sort(byDateDesc), ...others.sort(byDateDesc)];
  }, [bookings]);

  const hasBookings = sortedBookings.length > 0;

  

  function startEditing() {
    if (!me) return;
    const profile = me.attendeeProfile;
    setPrefInput(profile?.preferences ?? "");
    setBioInput(profile?.bio ?? "");
    setAvatarInput(profile?.avatarUrl ?? "");
    setIsEditing(true);
  }

  function cancelEditing() {
    if (!me) {
      setIsEditing(false);
      return;
    }
    const profile = me.attendeeProfile;
    setPrefInput(profile?.preferences ?? "");
    setBioInput(profile?.bio ?? "");
    setAvatarInput(profile?.avatarUrl ?? "");
    setIsEditing(false);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;

    setSavingProfile(true);
    setErrorMsg("");

    const payload: UpdateAttendeeProfileRequest = {
      preferences: prefInput.trim() === "" ? null : prefInput.trim(),
      bio: bioInput.trim() === "" ? null : bioInput.trim(),
      avatarUrl: avatarInput.trim() === "" ? null : avatarInput.trim(),
    };

    try {
      const resRaw = await updateAttendeeProfileRaw(payload);
      const res = resRaw as GetMeResponse; // backend can return updated user in same shape

      setMe(res.user);
      const profile = res.user.attendeeProfile;
      setPrefInput(profile?.preferences ?? "");
      setBioInput(profile?.bio ?? "");
      setAvatarInput(profile?.avatarUrl ?? "");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }



  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center">
          <p className="text-sm text-[#697177]">Loading profile…</p>
        </div>
      </Layout>
    );
  }

  if (!me) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center">
          <p className="text-sm text-[#B91C1C]">
            {errorMsg || "Unable to load user details."}
          </p>
        </div>
      </Layout>
    );
  }

  const profile = me.attendeeProfile;

  return (
    <Layout>
      <div className="min-h-screen bg-[#F7F9FA]">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1.1fr,2fr] gap-8">

          <section className="space-y-4">
            <div className="border border-[#E2E8EF] rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="h-16 w-16 rounded-full bg-[#E2E8EF] flex items-center justify-center overflow-hidden text-lg font-semibold text-[#11181C]">
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={me.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (me.name || "?")
                      .trim()
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

           
                <div>
                  <p className="text-base font-semibold text-[#11181C]">
                    {me.name}
                  </p>
                  <p className="text-sm text-[#697177]">{me.email}</p>
                  <p className="mt-1 inline-flex text-[11px] px-2 py-0.5 rounded-full bg-[#E5F0FF] text-[#1D4ED8]">
                    Attendee
                  </p>
                </div>
              </div>

              
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-[#687076] uppercase tracking-wide mb-1">
                    Preferences
                  </p>
                  <p className="text-sm text-[#11181C] whitespace-pre-wrap">
                    {profile?.preferences
                      ? profile.preferences
                      : "No preferences added yet."}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-[#687076] uppercase tracking-wide mb-1">
                    Bio
                  </p>
                  <p className="text-sm text-[#11181C] whitespace-pre-wrap">
                    {profile?.bio ? profile.bio : "No bio added yet."}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-[#687076] uppercase tracking-wide mb-1">
                    Avatar URL
                  </p>
                  <p className="text-xs text-[#697177] break-all">
                    {profile?.avatarUrl || "No avatar URL set."}
                  </p>
                </div>
              </div>

      
              <div className="mt-4">
                {!isEditing ? (
                 <button
  type="button"
  onClick={startEditing}
  className="text-sm px-3 py-1.5 rounded-md 
             border border-[#E2E8EF]
             bg-white text-blue-600
             hover:bg-[#F3F4F6]
             transition"
>
                    Edit Profile
                  </button>
                ) : null}
              </div>
            </div>


            {isEditing && (
              <form
                onSubmit={handleSaveProfile}
                className="border border-[#E2E8EF] rounded-xl bg-white p-5 shadow-sm space-y-4"
              >
                <h2 className="text-sm font-semibold text-[#11181C]">
                  Edit profile
                </h2>

                <div>
                  <label className="block text-xs font-medium text-[#11181C] mb-1">
                    Preferences
                  </label>
                  <textarea
                    className="w-full border border-[#E2E8EF] rounded-md px-3 py-2 text-sm"
                    rows={3}
                    value={prefInput}
                    onChange={(e) => setPrefInput(e.target.value)}
                    placeholder="What kind of events do you like?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#11181C] mb-1">
                    Bio
                  </label>
                  <textarea
                    className="w-full border border-[#E2E8EF] rounded-md px-3 py-2 text-sm"
                    rows={3}
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    placeholder="Tell organizers a bit about yourself."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#11181C] mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#E2E8EF] rounded-md px-3 py-2 text-sm"
                    value={avatarInput}
                    onChange={(e) => setAvatarInput(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-[#B91C1C]">{errorMsg}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="text-sm px-3 py-1.5 rounded-md bg-[#11181C] text-white hover:bg-black disabled:opacity-70"
                  >
                    {savingProfile ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                     className="text-sm px-3 py-1.5 rounded-md 
             border border-[#E2E8EF]
             bg-white text-blue-600
             hover:bg-[#F3F4F6]
             transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {errorMsg && !isEditing && (
              <p className="text-xs text-[#B91C1C] mt-2">{errorMsg}</p>
            )}
          </section>


          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#11181C]">
                Your bookings
              </h2>
              {hasBookings && (
                <p className="text-xs text-[#697177]">
                  Showing confirmed bookings first.
                </p>
              )}
            </div>

            {!hasBookings ? (
              <p className="text-sm text-[#697177]">
                You don&apos;t have any bookings yet.
              </p>
            ) : (
              <div className="space-y-3">
                {sortedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
