

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  event?: any;
  ticket?: any;
  bookings?: any[];
}


export interface Event {
    id: number,
    title: string,
    description: string,
    bannerImageUrl?: string | null;
    teasorVideoUrl? :string | null;
    location: string,
    category: string,
    startDateTime: string,
    capacity: number | null,
    remainingCapacity? : number,
    ticket_type: TicketType[];
}

export type EventCategory = typeof EVENT_CATEGORIES[number];

export interface CreateEventFormValues {
    title: string;
    description: string;
    location: string;
    category: EventCategory | "" ;
    startDateTime: string;
    bannerImageUrl: string;
    teasorVideoUrl: string;
    capacity:number;
}

export interface CreateEventRequest {
    title: string;
    description: string;
    location: string;   
    category: string;
    capacity: number;
    startDateTime: string;
    bannerImageUrl: string | null
    teasorVideoUrl: string | null
}

export interface CreateEventResponse {
    success: boolean;
    message: string;
    event: Event;
}


export const EVENT_CATEGORIES = [
    "tech",
    "music",
    "fashion",
    "sports",
    "other"
] as const; 


export interface TicketType {
    id: number,
    name: TicketName,
    price: number,
    seatLimit: number,
    remainingSeats:number
}


export type TicketName = "regular" | "vip";

export interface CreateTicketFormValues{
    name:TicketName;
    seatLimit: number;
    price: number

}

export interface CreateTicketTypeRequest{
    name:TicketName;
    seatLimit: number;
    price: number

}



export interface CreateTicketTypeResponse{
    success: boolean;
    message: string;
    ticket: TicketType;
}


export type EditTicketFormValues = CreateTicketFormValues & { id?: number };

export interface EventDetailOrganizer {
  id: number;
  name: string;
  email: string;
}

export interface EventDetailTicket {
  id: number;
  name: string; 
  price: number;
  seatLimit: number;
  createdAt: string;
  updatedAt: string;
  remainingSeats?: number; 
}

export interface EventDetailReportedEvent {
  id: number;
  reason: string;
  status: string; 
  createdAt: string;
}

export interface EventReviewUser {
  id: number;
  name: string;
  email: string;
}

export interface EventReview {
  id: number;
  rating: number; // 1–5
  comment: string | null;
  createdAt: string;
  user?: EventReviewUser; 
}

export interface EventDetail {
  id: number;
  title: string;
  description: string;
  bannerImageUrl: string | null;
  teasorVideoUrl: string | null;
  location: string;
  category: string;
  startDateTime: string; // ISO
  capacity: number | null;
  updatedAt: string;
  isBlocked: boolean;
  organizer: EventDetailOrganizer;
  ticket_type: EventDetailTicket[];
  reviews: EventReview[];
  reportedEvents: EventDetailReportedEvent[];
  remainingCapacity?: number | null; 
}

export interface EventDetailResponse {
  success: boolean;
  message: string;
  event: EventDetail;
}

export interface BookEventRequest {
  ticketTypeId: number;
  quantity: number;
}

export interface BookEventResponse {
  success: boolean;
  message: string;
  booking: any; // you can tighten this later if you like
}


export interface UserBookingEventSummary {
  id: number;
  title: string;
  category: string;
  location: string;
  startDateTime: string;
}

export interface UserBookingTicketType {
  id: number;
  name: string;
  price: number;
  seatLimit: number;
  remainingSeats?: number;
  event: UserBookingEventSummary;
}
export interface UserBooking {
  id: number;
  quantity: number;
  totalPrice: number;
  status: string; // "confirmed" | "cancelled" etc.
  createdAt: string;
  ticketType: UserBookingTicketType;
}

export interface GetUserBookingsResponse {
  success: boolean;
  message: string;
  bookings: UserBooking[];
}

export interface GetMeUser {
  id: number;
  name: string;
  email: string;
  role: string; // "attendee" | "organizer" | "admin"
}

export interface GetMeResponse {
  success: boolean;
  message: string;
  user: GetMeUser;
}
export interface CreateReviewRequest {
  rating: number; // 1–5
  comment?: string | null;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string | null;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  review: EventReview;
}

export interface EventAttendee {
  bookingId: number;
  userId: number;
  name: string;
  email: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  bookedAt: string;
}

export interface EventAttendeeResponse {
  success: boolean;
  message: string;
  eventId: number;
  attendees: EventAttendee[];
}


    


// interface for model objects (Event, TicketType, Organizer)

// type for unions & API helpers (EventCategory, ApiResponse<T>)