import { Mission, User, Organization } from './types';

export const MOCK_ORG: Organization = {
  id: 'org-1',
  name: 'Le Chant du Coq Solidaire',
  code: 'COQ-2025'
};

export const MOCK_USERS: User[] = [
  { 
    id: 'u_valentin', 
    username: 'vs827',
    firstName: 'Valentin', 
    lastName: 'Aviles', 
    email: 'valentin@bnevo.com',
    password: '123456',
    avatar: 'https://ui-avatars.com/api/?name=Valentin+Aviles&background=0D8ABC&color=fff', 
    role: 'volunteer', 
    interests: ['Sport', 'Informatique'] 
  },
  { 
    id: 'u1', 
    username: 'maried',
    firstName: 'Marie', 
    lastName: 'Dupont', 
    email: 'marie@bnevo.com',
    password: 'password123',
    avatar: 'https://picsum.photos/100/100?random=1', 
    role: 'volunteer', 
    interests: ['Jardinage', 'Cuisine', 'Social'] 
  },
  { 
    id: 'u2', 
    username: 'jean_lefevre',
    firstName: 'Jean', 
    lastName: 'Lefevre', 
    email: 'jean@bnevo.com',
    password: 'password123',
    avatar: 'https://picsum.photos/100/100?random=2', 
    role: 'volunteer', 
    interests: ['Bricolage', 'Logistique'] 
  },
  { 
    id: 'u3', 
    username: 'sophiem',
    firstName: 'Sophie', 
    lastName: 'Martin', 
    email: 'sophie@bnevo.com',
    password: 'password123',
    avatar: 'https://picsum.photos/100/100?random=3', 
    role: 'volunteer', 
    interests: ['Communication', 'Accueil'] 
  },
  { 
    id: 'u4', 
    username: 'thomas_d',
    firstName: 'Thomas', 
    lastName: 'Dubois', 
    email: 'thomas@bnevo.com',
    password: 'password123',
    avatar: 'https://picsum.photos/100/100?random=4', 
    role: 'volunteer', 
    interests: ['Sport', 'Jeunesse'] 
  },
  { 
    id: 'admin1', 
    username: 'admin',
    firstName: 'Admin', 
    lastName: 'Orga', 
    email: 'asso@bnevo.com',
    password: 'admin',
    avatar: '', 
    role: 'organizer' 
  },
];

export const MOCK_MISSIONS: Mission[] = [
  { 
    id: 'm1', 
    title: 'Nettoyage des Berges', 
    location: 'Parc Central', 
    dateStart: '2025-06-15T09:00:00', 
    dateEnd: '2025-06-15T12:00:00', 
    description: 'Une matinée pour rendre notre parc plus propre. Gants fournis !', 
    participants: ['u1', 'u2'],
    maxParticipants: 10,
    category: 'Maintenance',
    chatMessages: [
      { id: 'c1', userId: 'u1', userName: 'Marie', userAvatar: 'https://picsum.photos/100/100?random=1', text: 'Est-ce qu\'il faut apporter des bottes ?', timestamp: 1718000000000 },
      { id: 'c2', userId: 'admin1', userName: 'Orga', userAvatar: '', text: 'Oui Marie, c\'est préférable !', timestamp: 1718000500000 }
    ]
  },
  { 
    id: 'm2', 
    title: 'Distribution Alimentaire', 
    location: 'Salle Polyvalente', 
    dateStart: '2025-06-20T18:00:00', 
    dateEnd: '2025-06-20T21:00:00', 
    description: 'Distribution des paniers repas aux bénéficiaires.', 
    participants: ['u3', 'u1', 'u4'],
    maxParticipants: 5,
    category: 'Social',
    chatMessages: []
  },
  { 
    id: 'm3', 
    title: 'Atelier Peinture', 
    location: 'Centre Culturel', 
    dateStart: '2025-06-22T14:00:00', 
    dateEnd: '2025-06-22T17:00:00', 
    description: 'Animation d\'un atelier pour les enfants du quartier.', 
    participants: [],
    maxParticipants: 3,
    category: 'Event',
    chatMessages: []
  },
];