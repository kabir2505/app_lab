import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { createEvent, apiPost } from "../utils/ClientApi";
import { getAuthRole } from "../utils/authToken";

import type {
  CreateEventFormValues,
  CreateEventRequest,
  CreateEventResponse,
  CreateTicketFormValues,
  CreateTicketTypeRequest,
  EventCategory,
} from "../types/event";

import { EVENT_CATEGORIES } from "../types/event";

export default function CreateEventPage() {
  const navigate = useNavigate();

  // ----------------------------
  // FORM STATE
  // ----------------------------
  const [form, setForm] = useState<CreateEventFormValues>({
    title: "",
    description: "",
    location: "",
    category: "",
    startDateTime: "",
    bannerImageUrl: "",
    teasorVideoUrl: "",
    capacity: 0,
  });

  const [tickets, setTickets] = useState<CreateTicketFormValues[]>([
    { name: "regular", price: 0, seatLimit: 0 },
    { name: "vip", price: 0, seatLimit: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ----------------------------
  // PROTECT ROUTE (organizer only)
  // ----------------------------
  useEffect(() => {
    if (getAuthRole() !== "organizer") {
      setErrorMsg("Only organizers can create events.");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // ----------------------------
  // FORM FIELD UPDATER
  // ----------------------------
  function updateField<K extends keyof CreateEventFormValues>(
    field: K,
    value: CreateEventFormValues[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ----------------------------
  // TICKET FIELD UPDATER
  // ----------------------------
  function updateTicketField<K extends keyof CreateTicketFormValues>(
    index: number,
    field: K,
    value: CreateTicketFormValues[K]
  ) {
    setTickets((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  // ----------------------------
  // SUBMIT FORM
  // ----------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // 1️⃣ Prepare Event Payload
      const eventPayload: CreateEventRequest = {
        title: form.title,
        description: form.description,
        location: form.location,
        category: form.category,
        startDateTime: form.startDateTime,
        capacity: form.capacity,
        bannerImageUrl: form.bannerImageUrl || null,
        teasorVideoUrl: form.teasorVideoUrl || null,
      };

      // 2️⃣ POST /event
      const eventRes: CreateEventResponse = await createEvent(eventPayload);
      const eventId = eventRes.event.id;

      // 3️⃣ POST tickets for this event
      for (const ticket of tickets) {
        const payload: CreateTicketTypeRequest = {
          name: ticket.name,
          price: ticket.price,
          seatLimit: ticket.seatLimit,
        };

        await apiPost(`/ticket/event/${eventId}`, payload);
      }

      alert("Event and ticket types created successfully!");
      navigate("/organizer/events");

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------
  // RENDER PAGE
  // ----------------------------
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-[#11181C] mb-6">
          Create New Event
        </h1>

        {errorMsg && <p className="text-red-600 text-sm mb-4">{errorMsg}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#11181C]">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="mt-1 w-full border border-[#E2E8EF] rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#11181C]">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="mt-1 w-full border border-[#E2E8EF] rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-[#11181C]">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="mt-1 w-full border border-[#E2E8EF] rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#11181C]">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                updateField("category", e.target.value as EventCategory | "")
              }
              className="mt-1 w-full border border-[#E2E8EF] rounded-md px-3 py-2 bg-white"
              required
            >
              <option value="" disabled>Select category</option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date & Time */}
          <div>
            <label className="block text-sm font-medium text-[#11181C]">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={form.startDateTime}
              onChange={(e) => updateField("startDateTime", e.target.value)}
              className="mt-1 w-full border border-[#E2E8EF] rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-[#11181C]">
              Capacity
            </label>
            <input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => updateField("capacity", Number(e.target.value))}
              className="mt-1 w-full border border-[#E2E8EF] rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-sm font-medium text-[#11181C]">
              Banner Image URL (optional)
            </label>
            <input
              type="text"
              value={form.bannerImageUrl}
              onChange={(e) => updateField("bannerImageUrl", e.target.value)}
              className="mt-1 w-full border border-[#E2E8EF] rounded-md px-3 py-2"
            />
          </div>

          {/* Teaser Video */}
          <div>
            <label className="block text-sm font-medium text-[#11181C]">
              Teaser Video URL (optional)
            </label>
            <input
              type="text"
              value={form.teasorVideoUrl}
              onChange={(e) => updateField("teasorVideoUrl", e.target.value)}
              className="mt-1 w-full border border-[#E2E8EF] rounded-md px-3 py-2"
            />
          </div>

          {/* ------------------------------
              FIXED TICKET TYPES SECTION
             ------------------------------ */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#11181C]">
              Ticket Types
            </h2>

            {tickets.map((ticket, index) => (
              <div
                key={index}
                className="border border-gray-200 p-4 rounded-md bg-white"
              >
                {/* Name — fixed */}
                <p className="font-medium text-sm text-[#11181C] mb-2 capitalize">
                  Ticket Type: {ticket.name}
                </p>

                {/* Price */}
                <label className="block text-sm font-medium text-[#11181C]">
                  Price
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full border border-[#E2E8EF] rounded-md px-3 py-2 text-sm"
                  value={ticket.price}
                  onChange={(e) =>
                    updateTicketField(index, "price", Number(e.target.value))
                  }
                  required
                />

                {/* Seat Limit */}
                <label className="block text-sm font-medium text-[#11181C] mt-3">
                  Seat Limit
                </label>
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full border border-[#E2E8EF] rounded-md px-3 py-2 text-sm"
                  value={ticket.seatLimit}
                  onChange={(e) =>
                    updateTicketField(index, "seatLimit", Number(e.target.value))
                  }
                  required
                />
              </div>
            ))}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#11181C] text-white px-4 py-2 rounded-md text-sm hover:bg-black transition"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
