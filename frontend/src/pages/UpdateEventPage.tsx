// src/pages/UpdateEventPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Layout from "../components/Layout";
import { apiGet, apiPost, apiPatch } from "../utils/ClientApi";
import { getAuthRole } from "../utils/authToken";

import type {
  CreateEventFormValues,
  CreateEventRequest,
  EventCategory,
  CreateTicketFormValues,
  CreateTicketTypeRequest,
  Event,
  TicketType,
  EditTicketFormValues
} from "../types/event";

import { EVENT_CATEGORIES } from "../types/event";

export default function UpdateEventPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();

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

  const [tickets, setTickets] = useState<EditTicketFormValues[]>([
    { name: "regular", price: 0, seatLimit: 0 },
    { name: "vip", price: 0, seatLimit: 0 },
  ]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Protect route
  useEffect(() => {
    if (getAuthRole() !== "organizer") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Fetch event + tickets
  useEffect(() => {
    async function loadEvent() {
      try {
        const ev = await apiGet(`/event/${eventId}`);
        const event: Event = ev.event;

        setForm({
          title: event.title,
          description: event.description,
          location: event.location,
          category: event.category as EventCategory,
          startDateTime: event.startDateTime.slice(0, 16), // format for datetime-local
          bannerImageUrl: event.bannerImageUrl || "",
          teasorVideoUrl: event.teasorVideoUrl || "",
          capacity: event.capacity ?? 0,
        });

        // Load tickets → assuming event.ticket_type exists
        if (event.ticket_type) {
          const mapped = event.ticket_type.map((t: TicketType) => ({
            name: t.name,
            price: t.price,
            seatLimit: t.seatLimit,
            id: t.id,
          }));

          setTickets(mapped);
        }

      } catch (err: any) {
        console.error(err);
        setErrorMsg("Failed to load event.");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  // -------------------------
  // Update field helpers
  // -------------------------
  function updateField<K extends keyof CreateEventFormValues>(
    key: K,
    value: CreateEventFormValues[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateTicketField<K extends keyof CreateTicketFormValues>(
    index: number,
    key: K,
    value: CreateTicketFormValues[K]
  ) {
    setTickets((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  }

  // -------------------------
  // SUBMIT UPDATE
  // -------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    try {
      const payload: CreateEventRequest = {
        title: form.title,
        description: form.description,
        location: form.location,
        category: form.category,
        startDateTime: form.startDateTime,
        capacity: form.capacity,
        bannerImageUrl: form.bannerImageUrl || null,
        teasorVideoUrl: form.teasorVideoUrl || null,
      };

    //   // PATCH event
      await apiPatch(`/event/${eventId}`, payload);

    //   // Update ticket types
    //   for (const t of tickets) {
    //     const ticketPayload: CreateTicketTypeRequest = {
    //       name: t.name,
    //       price: t.price,
    //       seatLimit: t.seatLimit,
    //     };

    //     await apiPatch(`/ticket/${t.id}/update`, ticketPayload);
    //   }

      alert("Event updated successfully!");
      navigate("/organizer/events");

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to update event.");
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="py-10 text-center text-[#697177]">Loading event…</div>
      </Layout>
    );
  }

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-[#11181C] mb-6">
          Update Event
        </h1>

        {errorMsg && (
          <p className="text-red-600 text-sm mb-4">{errorMsg}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#11181C]">Title</label>
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
            <label className="block text-sm font-medium text-[#11181C]">Description</label>
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
            <label className="block text-sm font-medium text-[#11181C]">Location</label>
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
            <label className="block text-sm font-medium text-[#11181C]">Category</label>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value as EventCategory)}
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

          {/* Date */}
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
            <label className="block text-sm font-medium text-[#11181C]">Capacity</label>
            <input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => updateField("capacity", Number(e.target.value))}
              className="mt-1 w-full border border-[#E2E8EF] rounded-md px-3 py-2"
              required
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-[#11181C]">
              Banner Image URL
            </label>
            <input
              type="text"
              value={form.bannerImageUrl}
              onChange={(e) => updateField("bannerImageUrl", e.target.value)}
              className="mt-1 w-full border border-[#E2E8EF] rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#11181C]">
              Teaser Video URL
            </label>
            <input
              type="text"
              value={form.teasorVideoUrl}
              onChange={(e) => updateField("teasorVideoUrl", e.target.value)}
              className="mt-1 w-full border border-[#E2E8EF] rounded-md px-3 py-2"
            />
          </div>

          {/* Tickets
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#11181C]">Ticket Types</h2>

            {tickets.map((ticket, index) => (
              <div key={index} className="border p-4 rounded-md bg-white">
                <p className="font-medium text-sm mb-2 capitalize">
                  Ticket Type: {ticket.name}
                </p>

                <label className="block text-sm font-medium">Price</label>
                <input
                  type="number"
                  min={0}
                  value={ticket.price}
                  onChange={(e) => updateTicketField(index, "price", Number(e.target.value))}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                />

                <label className="block text-sm font-medium mt-3">Seat Limit</label>
                <input
                  type="number"
                  min={1}
                  value={ticket.seatLimit}
                  onChange={(e) => updateTicketField(index, "seatLimit", Number(e.target.value))}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div> */}

          <button
            type="submit"
            className="bg-[#11181C] text-white px-4 py-2 rounded-md text-sm hover:bg-black transition"
          >
            Update Event
          </button>
        </form>
      </div>
    </Layout>
  );
}
