export type Role = 'none' | 'organizer' | 'volunteer';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string; // URL or Initials
  role: Role;
  username: string; // Remplace l'email comme identifiant principal
  email?: string; // Devient optionnel
  password?: string;
  interests?: string[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
}

export interface Mission {
  id: string;
  title: string;
  location: string;
  dateStart: string; // ISO Date string
  dateEnd: string;   // ISO Date string
  description: string;
  participants: string[]; // User IDs
  maxParticipants?: number;
  chatMessages: ChatMessage[];
  category: 'Event' | 'Maintenance' | 'Admin' | 'Social';
}

export interface Organization {
  id: string;
  name: string;
  code: string;
}

export interface AppState {
  currentUser: User | null;
  currentRole: Role;
  currentOrganization: Organization | null;
  managedOrganization: Organization;
  missions: Mission[];
  users: User[]; // Mock database of users
}