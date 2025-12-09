
export interface StatPayload {
  totalUsers: number;
  totalOrganizers: number;
  totalAttendees: number;
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  reportedEvents: number;
  pendingOrganizers: number;
}
 export interface AdminReportedEvent {
  id: number;
  reason: string;
  status: string;
  reportedAt: string;
  reportedBy: {
    id: number;
    name: string;
    email: string;
  };
  event: {
    id: number;
    title: string;
    category: string;
    location: string;
    startDateTime: string;
  };
  organizer: {
    id: number;
    name: string;
    email: string;
  };
}