import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Layout from "../components/Layout";
import { apiGet } from "../utils/ClientApi";
import type { Event } from "../types/event";
import { getAuthToken, getAuthRole } from "../utils/authToken";

export default function EventDetailsPage(){
    const {eventId} = useParams<{eventId: string}>();
    const navigate = useNavigate();

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error,setError] = useState<string | null>(null);

    const token = getAuthToken();
    const role = getAuthRole();

    useEffect(() => {
        async function fetchEvent(){
            if (!eventId){
                setError("Invalid event id");
                setLoading(false)
                return;
            }

            try{
                setLoading(true);
                setError(null);

                const res = await apiGet(`/event/$eventId`)
                setEvent(res.event);
            } catch(err){
                console.error(err);
                setError("Failed to load event")
            } finally{
                setLoading(false);
            }
        }

        fetchEvent();
    }, [eventId]) //effect when eventId changes


    function handleLoginClick(){
        navigate("/login");
    }

    function handleBookClick(){
        if (!eventId) return;
        navigate(`/events/${eventId}/book`);
    }


    return (
        <Layout>

            {loading && <p className="text-sm text-slate-500">Loading event…</p>}

            {!loading && error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {!loading && !error && event && (
                <div className="space-y-6">
                    <section>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {event.title}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                        {event.description}
                        </p>

                        <div className="mt-4 text-sm text-slate-700 space-y-1">
                        <p>
                            <span className="font-medium">Category:</span> {event.category}
                        </p>
                        <p>
                            <span className="font-medium">Location:</span> {event.location}
                        </p>
                        <p>
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(event.startDateTime).toLocaleString()}
                        </p>
                        <p>
                            <span className="font-medium">Remaining capacity:</span>{" "}
                            {event.remainingCapacity ?? "N/A"}
                        </p>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 mb-3">
                        Ticket types
                        </h2>
                        {event.ticket_type.length === 0 ? (
                        <p className="text-sm text-slate-500">
                            No tickets configured for this event.
                        </p>
                        ) : (
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                            {event.ticket_type.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="border border-slate-200 rounded-lg p-4 bg-white"
                            >
                                <p className="text-sm font-semibold capitalize text-slate-900">
                                {ticket.name}
                                </p>
                                <p className="mt-1 text-sm text-slate-700">
                                Price:{" "}
                                <span className="font-medium">
                                    {typeof ticket.price === "string"
                                    ? ticket.price
                                    : ticket.price.toFixed(2)}
                                </span>
                                </p>
                                <p className="mt-1 text-sm text-slate-700">
                                Remaining seats:{" "}
                                <span className="font-medium">
                                    {ticket.remainingSeats ?? ticket.seatLimit}
                                </span>
                                </p>
                            </div>
                            ))}
                        </div>
                        )}
                    </section>

                    <section className="pt-4 border-t border-slate-200">
                        {!token ? (
                        <button
                            onClick={handleLoginClick}
                            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Login to book tickets
                        </button>
                        ) : role === "attendee" ? (
                        <button
                            onClick={handleBookClick}
                            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                            Book tickets
                        </button>
                        ) : (
                        <p className="text-sm text-slate-500">
                            Only attendees can book tickets for events.
                        </p>
                        )}
                </section>
            </div>
      )}
    </Layout>
  );
}