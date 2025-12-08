import type { ApiResponse, CreateEventRequest, CreateEventResponse, CreateTicketTypeRequest, EventAttendee,EventAttendeeResponse } from "../types/event";
import { getAuthToken } from "./authToken";
import type { FetchOrganizersResponse } from "../types/user";
import type {
  CreateTicketTypeResponse,
  EventDetailResponse,
  BookEventRequest,
  BookEventResponse,
  GetUserBookingsResponse,
  GetMeResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewResponse,
} from "../types/event";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


export class ApiError extends Error {
    status: number;
    data: any;

    constructor(status: number, message: string, data?: any){
        super(message);
        this.status = status;
        this.data = data;
    }
}


async function handleResponse(res:Response){
    let data: any = null;
    console.log(data);
    try{
        data = await res.json();
    }catch(err){
        data = null;
    }


    if(!res.ok){
        const message = data?.message || `Request failed with status ${res.status} ${res.statusText}`;
        console.log(message);
        throw new ApiError(res.status, message, data)
    }

    return data;
}

async function handleError(res: Response): Promise<never> {
  let payload: any = null;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      payload = await res.json();
    } catch {
      // ignore parse error
    }
  } else {
    try {
      payload = await res.text();
    } catch {
      // ignore read error
    }
  }

  const message =
    (payload && typeof payload === "object" && payload.message) ||
    (typeof payload === "string" && payload) ||
    res.statusText ||
    "Request failed";

  throw new Error(`failed (${res.status}): ${message}`);
}

export async function apiGet(path: string, explicitToken?:string) {
  const token = explicitToken??getAuthToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

 


  return handleResponse(res);

}

export async function apiDelete(path:string, explicitToken?:string){
    const token = explicitToken??getAuthToken();
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...(token? {Authorization: `Bearer ${token}`}: {}),
        }
    })

    if (!res.ok){
        await handleError(res);
    }

    return handleResponse(res);

}


export async function apiPost(path: string, body: any, explicitToken?:string){
    const token = explicitToken??getAuthToken();

    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
            ...(token ? {Authorization: `Bearer ${token}`}: {})
        },
        body: JSON.stringify(body)
    });

    console.log(res);

    if (!res.ok){
        await handleError(res);
    }

    return handleResponse(res);
}


export async function apiPatch(path: string, body: any, explicitToken?:string){
    const token = explicitToken??getAuthToken();
    console.log(token);
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {})
        },
        body: JSON.stringify(body)
    })

    if (!res.ok){
        await handleError(res);
    } 

    return handleResponse(res);
}

export async function updateReportStatus(id: number, status: "pending" | "resolved" | "rejected") {
  return apiPatch(`/report/${id}/status`, { status });
}

export async function signupAttendee(data:any){
    const path="/auth/signup/user"
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    if (!res.ok){
        // throw new Error(`POST ${path} failed: ${res.statusText}`);
        await handleError(res);
    }

    return handleResponse(res);
}
export async function signupOrganizer(data:any){
    const path="/auth/signup/organizer"
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    if (!res.ok){
        // throw new Error(`POST ${path} failed: ${res.statusText}`);
        await handleError(res);
    }

    return handleResponse(res);
}

export async function createEvent(data: CreateEventRequest): Promise<CreateEventResponse> {
    const res = await apiPost("/event", data);
    return res as CreateEventResponse;
}

// export async function createTicketType(eventId:number, data:CreateTicketTypeRequest): Promise<ApiResponse<{ticket:any}>>{
//     return apiPost(`/ticket/event/${eventId}`, data);
// }

export async function createTicketType(
  eventId: number,
  data: CreateTicketTypeRequest
): Promise<CreateTicketTypeResponse> {
  const res = await apiPost(`/ticket/event/${eventId}`, data);
  return res as CreateTicketTypeResponse;
}

export async function fetchOrganizers(): Promise<FetchOrganizersResponse> {
  return apiGet("/admin/getPendingOrganizers");
}

export async function approveOrganizer(id: number) {
  return apiPatch(`/admin/approveOrganizer/${id}`, {});
}

export async function rejectOrganizer(id: number) {
  return apiPatch(`/admin/rejectOrganizer/${id}`, {});
}

export async function getEventById(
  eventId: number
): Promise<EventDetailResponse> {
  const res = await apiGet(`/event/${eventId}`);
  return res as EventDetailResponse;
}

export async function getMe(): Promise<GetMeResponse> {
  const res = await apiGet("/profile/me");
  return res as GetMeResponse;
}

export async function getUserBookings(): Promise<GetUserBookingsResponse> {
  const res = await apiGet("/profile/bookings");
  return res as GetUserBookingsResponse;
}

export async function bookEvent(
  eventId: number,
  payload: BookEventRequest
): Promise<BookEventResponse> {
  const res = await apiPost(`/event/${eventId}/book`, payload);
  return res as BookEventResponse;
}

export async function createReview(
  eventId: number,
  payload: CreateReviewRequest
): Promise<ReviewResponse> {
  const res = await apiPost(`/review/event/${eventId}`, payload);
  return res as ReviewResponse;
}

export async function updateReview(
  reviewId: number,
  eventId: number,
  payload: UpdateReviewRequest
): Promise<ReviewResponse> {
  const res = await apiPatch(`/review/${reviewId}/events/${eventId}`, payload);
  return res as ReviewResponse;
}

export async function deleteReview(
  reviewId: number,
  eventId: number
): Promise<void> {
  await apiDelete(`/profile/${reviewId}/event/${eventId}`);
}

export async function getMeRaw() {
  return apiGet("/profile/me");
}

export async function getMyBookingsRaw() {
  return apiGet("/profile/bookings");
}

export async function updateAttendeeProfileRaw(data: {
  preferences: string | null;
  bio: string | null;
  avatarUrl: string | null;
}) {
  return apiPatch("/profile", data);
}

export async function getEventAttendees(eventId: number): Promise<EventAttendeeResponse> {
  return apiGet(`/event/${eventId}/attendees`);
}

export function reportEvent(eventId: number, data: { reason: string }) {
  return apiPost(`/report/${eventId}`, data);
}
