/* js/data.js */

const ORGANIZATION = { code: "ORGA-2025-ABC", nom: "Le Chant du Coq Solidaire" };
const ORGA_CREDENTIALS = { user: 'admin', pass: 'pass' };
const DEFAULT_ORGA_LIST = [{ code: ORGANIZATION.code, nom: ORGANIZATION.nom }];

let organizationCode = ORGANIZATION.code;
let savedOrgas = JSON.parse(localStorage.getItem('savedOrgas')) || DEFAULT_ORGA_LIST;

let BENEVOLES = [
    { id: 'B001', nom: 'Dupont', prenom: 'Marie', email: 'marie.d@ex.com', photo: 'M', interets: ['Jardinage', 'Animaux', 'Cuisine'] },
    { id: 'B002', nom: 'Lefevre', prenom: 'Jean', email: 'jean.l@ex.com', photo: 'J', interets: ['Bricolage', 'Logistique', 'Informatique'] },
    { id: 'B003', nom: 'Martin', prenom: 'Sophie', email: 'sophie.m@ex.com', photo: 'S', interets: ['Vente', 'Accueil', 'Photographie'] },
    { id: 'B004', nom: 'Test', prenom: 'Bénévole', email: 'test@ex.com', photo: 'T', interets: ['Test', 'Debugging'], isDefault: true } 
];

let MISSIONS = [
    { id: 'M001', titre: 'Mission Nettoyage Ville', lieu: 'Parc Central', date: '2025-12-20', dateFin: '2025-12-20', description: 'Ramassage des déchets verts et nettoyage des berges.', participants: ['B001', 'B002'] },
    { id: 'M002', titre: 'Événement Noël Solidaire', lieu: 'Salle Communale', date: '2025-12-24', dateFin: '2025-12-25', description: 'Aide à la distribution de repas et à l\'accueil des familles.', participants: ['B001', 'B003'] },
    { id: 'M003', titre: 'Rénovation du local', lieu: 'Local Association', date: '2025-12-28', dateFin: '2025-12-30', description: 'Peinture des murs et petites réparations.', participants: [] },
    { id: 'M004', titre: 'Formation Équipe', lieu: 'Bureau', date: '2026-01-15', dateFin: '2026-01-15', description: 'Session de formation des nouveaux membres.', participants: ['B003'] }
];

let currentUser = 'B001';
let currentRole = 'none';
let currentMonth = new Date(2025, 11, 1);