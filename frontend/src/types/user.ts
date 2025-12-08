export interface OrganizerProfile {
    organizationName: string | null,
    website: string | null,
    bio: string | null
}


export interface OrganizerUser {
  id: number;
  name: string;
  email: string;
  role: "organizer";
  isApproved: boolean; 
  organizerProfile: OrganizerProfile;
}

export interface FetchOrganizersResponse {
    success: boolean,
    organizers: OrganizerUser[];
}

