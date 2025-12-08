export interface OrganizerCoreUser {
  id: number;
  name: string;
  email: string;
  role: string;
}


export interface OrganizerProfileData {
  id: number;
  organizationName: string;
  website: string | null;
  bio: string | null;
  isApproved: boolean;
}

export interface OrganizerMeResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    organizerProfile: OrganizerProfileData | null;
    attendeeProfile: any | null;
  };
}

export interface OrganizerProfileUpdateRequest {
  website?: string | null;
  bio?: string | null;
}

export interface OrganizerProfile {
  id: number;
  organizationName: string;
  website: string | null;
  bio: string | null;
  isApproved: boolean;
}
