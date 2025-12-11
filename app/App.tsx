import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar as CalendarIcon, LogOut, Plus, 
  BarChart3, LayoutDashboard, Heart, Search, Settings, Pencil, X,
  ChevronLeft, ChevronRight, Building, Tag, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

import { MissionCard } from './components/MissionCard';
import { ChatDrawer } from './components/ChatDrawer';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Modal } from './components/ui/Modal';
import { MOCK_MISSIONS, MOCK_USERS, MOCK_ORG } from './constants';
import { AppState, Mission, Role, User, Organization } from './types';

// --- MAIN APP COMPONENT ---

export default function App() {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    currentRole: 'none',
    currentOrganization: null,
    managedOrganization: MOCK_ORG,
    missions: MOCK_MISSIONS,
    users: MOCK_USERS
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'volunteers'>('dashboard');
  const [activeChatMissionId, setActiveChatMissionId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tout'); // New: Category Filter State
  
  // UI State (Modals)
  const [showOrgLogin, setShowOrgLogin] = useState(false);
  const [showVolunteerLogin, setShowVolunteerLogin] = useState(false);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isOrgNameModalOpen, setIsOrgNameModalOpen] = useState(false);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const [isCreateVolunteerModalOpen, setIsCreateVolunteerModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // New: Logout Confirmation State
  
  // New: View Participants Modal
  const [viewingParticipantsMissionId, setViewingParticipantsMissionId] = useState<string | null>(null);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Forms State
  const [orgLoginData, setOrgLoginData] = useState({ email: '', password: '' });
  const [volunteerLoginData, setVolunteerLoginData] = useState({ username: '', password: '' });
  const [createVolunteerData, setCreateVolunteerData] = useState({ firstName: '', lastName: '', username: '', password: '' });
  
  const [rememberOrg, setRememberOrg] = useState(false);
  
  const [profileFormData, setProfileFormData] = useState<Partial<User>>({});
  const [interestInput, setInterestInput] = useState('');
  
  // Mission Form Data
  const [missionFormData, setMissionFormData] = useState<Partial<Mission>>({
    id: undefined,
    title: '', location: '', description: '', category: 'Event', dateStart: '', dateEnd: ''
  });
  const [orgNameInput, setOrgNameInput] = useState('');
  const [createOrgName, setCreateOrgName] = useState('');


  // --- INITIALIZATION ---

  useEffect(() => {
    // Check for "Remember me" session
    const savedSession = localStorage.getItem('bnevo_org_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.role === 'organizer') {
          setState(prev => ({
            ...prev,
            currentUser: MOCK_USERS.find(u => u.role === 'organizer') || null,
            currentRole: 'organizer',
            currentOrganization: session.organization || prev.managedOrganization,
            managedOrganization: session.organization || prev.managedOrganization
          }));
        }
      } catch (e) {
        console.error("Failed to parse session", e);
        localStorage.removeItem('bnevo_org_session');
      }
    }
  }, []);


  // --- HELPERS ---
  
  // Helper to format Date to datetime-local string (YYYY-MM-DDThh:mm)
  const toLocalISOString = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  // Scroll Helper
  const scrollToMissions = () => {
    const element = document.getElementById('available-missions');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayObj = new Date(year, month, 1);
    let firstDay = firstDayObj.getDay(); // 0 = Sunday
    // Convert to Monday start (0=Mon, 6=Sun)
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    return { daysInMonth, offset, year, month };
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCalendarDate(newDate);
  };

  const handleCalendarDayClick = (day: number) => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    // Default start at 09:00
    const startDate = new Date(year, month, day, 9, 0);
    // Default end at 12:00
    const endDate = new Date(year, month, day, 12, 0);

    setMissionFormData({
      id: undefined, // Reset ID for new creation
      title: '', 
      location: '', 
      description: '', 
      category: 'Event',
      dateStart: toLocalISOString(startDate),
      dateEnd: toLocalISOString(endDate)
    });
    setIsMissionModalOpen(true);
  };


  // --- ACTIONS ---

  // Organization Auth
  const handleOrgLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orgLoginData.email && orgLoginData.password) {
      // Mock validation
      const orgUser = MOCK_USERS.find(u => u.role === 'organizer');
      const orgData = state.managedOrganization;

      setState(prev => ({
        ...prev,
        currentUser: orgUser || null,
        currentRole: 'organizer',
        currentOrganization: orgData
      }));
      setShowOrgLogin(false);

      if (rememberOrg) {
        localStorage.setItem('bnevo_org_session', JSON.stringify({
          role: 'organizer',
          organization: orgData
        }));
      }
    }
  };

  const handleCreateOrganization = () => {
    if (!createOrgName.trim()) return;

    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: createOrgName,
      code: `NEW-${new Date().getFullYear()}`
    };

    const newAdmin: User = {
      id: `admin-${Date.now()}`,
      firstName: 'Admin',
      lastName: createOrgName,
      username: 'admin_new',
      email: 'admin@new.org',
      avatar: '',
      role: 'organizer'
    };

    setState(prev => ({
      ...prev,
      currentUser: newAdmin,
      currentRole: 'organizer',
      currentOrganization: newOrg,
      managedOrganization: newOrg,
      missions: [], 
      users: [...prev.users, newAdmin]
    }));

    localStorage.setItem('bnevo_org_session', JSON.stringify({
      role: 'organizer',
      organization: newOrg
    }));

    setIsCreateOrgModalOpen(false);
    setShowOrgLogin(false);
  };

  // Volunteer Auth
  const handleVolunteerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple auth check against in-memory users using USERNAME
    const user = state.users.find(u => 
      u.role === 'volunteer' && 
      u.username.toLowerCase() === volunteerLoginData.username.toLowerCase() &&
      u.password === volunteerLoginData.password
    );

    if (user) {
      setState(prev => ({
        ...prev,
        currentUser: user,
        currentRole: 'volunteer',
        currentOrganization: prev.managedOrganization 
      }));
      setShowVolunteerLogin(false);
      setVolunteerLoginData({ username: '', password: '' });
      setSelectedCategory('Tout'); // Reset filter on login
    } else {
      alert("Pseudo ou mot de passe incorrect. (Essayez: vs827 / 123456)");
    }
  };

  const handleCreateVolunteer = () => {
    if (!createVolunteerData.firstName || !createVolunteerData.username || !createVolunteerData.password) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }

    // Check if username already exists
    if (state.users.some(u => u.username.toLowerCase() === createVolunteerData.username.toLowerCase())) {
        alert("Ce pseudo est déjà pris. Veuillez en choisir un autre.");
        return;
    }

    const newUser: User = {
        id: `u-${Date.now()}`,
        firstName: createVolunteerData.firstName,
        lastName: createVolunteerData.lastName || '',
        username: createVolunteerData.username,
        password: createVolunteerData.password,
        avatar: `https://ui-avatars.com/api/?name=${createVolunteerData.firstName}+${createVolunteerData.lastName || ''}&background=random`, 
        role: 'volunteer',
        interests: []
    };

    setState(prev => ({
        ...prev,
        users: [...prev.users, newUser],
        currentUser: newUser,
        currentRole: 'volunteer',
        currentOrganization: prev.managedOrganization
    }));

    setIsCreateVolunteerModalOpen(false);
    setShowVolunteerLogin(false);
    setCreateVolunteerData({ firstName: '', lastName: '', username: '', password: '' });
    setSelectedCategory('Tout'); // Reset filter
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null, currentRole: 'none' }));
    setActiveTab('dashboard');
    setShowOrgLogin(false);
    setShowVolunteerLogin(false);
    setIsLogoutModalOpen(false);
    localStorage.removeItem('bnevo_org_session');
  };

  // Profile Management
  const openProfileModal = () => {
    if (state.currentUser) {
      setProfileFormData({ ...state.currentUser });
      setIsProfileModalOpen(true);
    }
  };

  const handleAddInterest = () => {
    if (interestInput.trim() && profileFormData.interests) {
      if (!profileFormData.interests.includes(interestInput.trim())) {
        setProfileFormData({
          ...profileFormData,
          interests: [...profileFormData.interests, interestInput.trim()]
        });
      }
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    if (profileFormData.interests) {
      setProfileFormData({
        ...profileFormData,
        interests: profileFormData.interests.filter(i => i !== interest)
      });
    }
  };

  const handleSaveProfile = () => {
    if (profileFormData.interests && profileFormData.interests.length < 3) {
      alert("Merci d'ajouter au moins 3 centres d'intérêt pour aider les autres à vous connaître !");
      return;
    }

    setState(prev => ({
      ...prev,
      currentUser: { ...prev.currentUser!, ...profileFormData } as User,
      users: prev.users.map(u => u.id === prev.currentUser!.id ? { ...u, ...profileFormData } as User : u)
    }));
    setIsProfileModalOpen(false);
  };

  // Organization Management
  const handleUpdateOrgName = () => {
    if (orgNameInput.trim()) {
      const updatedOrg = { ...state.currentOrganization!, name: orgNameInput };
      
      setState(prev => ({
        ...prev,
        currentOrganization: updatedOrg,
        managedOrganization: updatedOrg
      }));
      
      if (localStorage.getItem('bnevo_org_session')) {
         localStorage.setItem('bnevo_org_session', JSON.stringify({
          role: 'organizer',
          organization: updatedOrg
        }));
      }

      setIsOrgNameModalOpen(false);
    }
  };

  // Mission Management
  const handleDeleteMission = (e: React.MouseEvent) => {
    // Prevent any form submission logic
    e.preventDefault();
    e.stopPropagation();

    const missionIdToDelete = missionFormData.id;
    
    // Safety check for ID
    if (!missionIdToDelete) {
        console.error("Tentative de suppression sans ID");
        return;
    }

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette mission ? Cette action est irréversible.")) {
        setState(prev => {
            // Filtrage de la liste pour exclure la mission
            const updatedMissions = prev.missions.filter(m => m.id !== missionIdToDelete);
            return {
                ...prev,
                missions: updatedMissions
            };
        });
        // Fermeture de la modale
        setIsMissionModalOpen(false);
        // Reset du formulaire
        setMissionFormData({ id: undefined, title: '', location: '', description: '', category: 'Event', dateStart: '', dateEnd: '' });
    }
  };

  const handleSaveMission = () => {
    if (!missionFormData.title || !missionFormData.dateStart) return;

    const finalDateEnd = missionFormData.dateEnd || missionFormData.dateStart;

    if (missionFormData.id) {
        // Mode ÉDITION
        setState(prev => ({
            ...prev,
            missions: prev.missions.map(m => 
                m.id === missionFormData.id 
                ? { ...m, ...missionFormData, dateEnd: finalDateEnd } as Mission 
                : m
            )
        }));
    } else {
        // Mode CRÉATION
        const newMission: Mission = {
            id: `new-${Date.now()}`,
            title: missionFormData.title!,
            location: missionFormData.location || 'À définir',
            dateStart: missionFormData.dateStart!,
            dateEnd: finalDateEnd,
            description: missionFormData.description || '',
            category: (missionFormData.category as any) || 'Event',
            participants: [],
            chatMessages: []
        };
        setState(prev => ({
            ...prev,
            missions: [...prev.missions, newMission]
        }));
    }

    setIsMissionModalOpen(false);
    setMissionFormData({ id: undefined, title: '', location: '', description: '', category: 'Event', dateStart: '', dateEnd: '' });
  };

  const handleMissionAction = (missionId: string) => {
    if (state.currentRole === 'volunteer') {
      // Toggle registration
      setState(prev => {
        const mission = prev.missions.find(m => m.id === missionId);
        if (!mission || !prev.currentUser) return prev;

        const isRegistered = mission.participants.includes(prev.currentUser.id);
        let newParticipants;

        if (isRegistered) {
          newParticipants = mission.participants.filter(id => id !== prev.currentUser!.id);
        } else {
          newParticipants = [...mission.participants, prev.currentUser.id];
        }

        const updatedMissions = prev.missions.map(m => 
          m.id === missionId ? { ...m, participants: newParticipants } : m
        );
        
        return { ...prev, missions: updatedMissions };
      });
    } else {
      // Organizer: Edit functionality
      const missionToEdit = state.missions.find(m => m.id === missionId);
      if (missionToEdit) {
          // Explicit copy to ensure we have a clean object with ID
          setMissionFormData({ ...missionToEdit });
          setIsMissionModalOpen(true);
      }
    }
  };

  const handleSendMessage = (missionId: string, text: string) => {
    if (!state.currentUser) return;

    const newMessage = {
      id: Date.now().toString(),
      userId: state.currentUser.id,
      userName: state.currentUser.firstName,
      userAvatar: state.currentUser.avatar,
      text,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      missions: prev.missions.map(m => 
        m.id === missionId ? { ...m, chatMessages: [...m.chatMessages, newMessage] } : m
      )
    }));
  };

  // --- SUB-COMPONENTS ---
  
  // Reusable Component for Participants List
  const ParticipantsList = ({ participantIds }: { participantIds: string[] }) => {
    const participants = state.users.filter(u => participantIds.includes(u.id));
    
    if (participants.length === 0) {
        return <p className="text-slate-500 text-sm italic py-2">Aucun participant pour le moment.</p>;
    }

    return (
        <div className="space-y-3 mt-2">
            {participants.map(p => (
                <div key={p.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <img src={p.avatar} alt={p.firstName} className="w-10 h-10 rounded-full object-cover border border-white dark:border-slate-600 shadow-sm flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{p.firstName} {p.lastName}</p>
                            <span className="text-xs text-slate-400">@{p.username}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {p.interests && p.interests.length > 0 ? (
                                p.interests.map((interest, i) => (
                                    <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                        <Tag className="w-3 h-3 mr-1 text-slate-400" />
                                        {interest}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-slate-400 italic">Aucun centre d'intérêt renseigné</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  // --- VIEWS ---

  // 1. LANDING VIEW
  if (state.currentRole === 'none') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-primary-50 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in-up">
          <div className="mx-auto w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center shadow-lg shadow-primary-200 dark:shadow-none">
            <Heart className="w-10 h-10 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">BNEVO</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              La plateforme ultra-simple pour gérer vos bénévoles et réenchanter le milieu associatif.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 pt-8">
            {!showOrgLogin && !showVolunteerLogin ? (
              <>
                <button 
                  onClick={() => setShowOrgLogin(true)}
                  className="group relative flex items-center justify-center p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:border-primary-500 hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-left w-full">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600">Espace Organisation</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gérez vos plannings et vos équipes</p>
                  </div>
                  <LayoutDashboard className="w-6 h-6 text-slate-300 group-hover:text-primary-500 absolute right-6" />
                </button>

                <button 
                  onClick={() => setShowVolunteerLogin(true)}
                  className="group relative flex items-center justify-center p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:border-primary-500 hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-left w-full">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600">Espace Bénévole</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Trouvez des missions et participez</p>
                  </div>
                  <Users className="w-6 h-6 text-slate-300 group-hover:text-primary-500 absolute right-6" />
                </button>
              </>
            ) : showOrgLogin ? (
              // FORMULAIRE LOGIN ORG
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 text-left animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Connexion Organisation</h3>
                  <button onClick={() => setShowOrgLogin(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5"/></button>
                </div>
                <form onSubmit={handleOrgLoginSubmit} className="space-y-4">
                  <Input 
                    label="Email" 
                    type="email" 
                    placeholder="asso@exemple.com"
                    value={orgLoginData.email}
                    onChange={e => setOrgLoginData({...orgLoginData, email: e.target.value})}
                    required
                  />
                  <Input 
                    label="Mot de passe" 
                    type="password" 
                    value={orgLoginData.password}
                    onChange={e => setOrgLoginData({...orgLoginData, password: e.target.value})}
                    required
                  />
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="rememberMe" 
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      checked={rememberOrg}
                      onChange={(e) => setRememberOrg(e.target.checked)}
                    />
                    <label htmlFor="rememberMe" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">Se souvenir de moi</label>
                  </div>

                  <Button type="submit" fullWidth>Se connecter</Button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">OU</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  </div>

                  <Button 
                    type="button" 
                    variant="secondary" 
                    fullWidth 
                    onClick={() => { setShowOrgLogin(false); setIsCreateOrgModalOpen(true); }}
                  >
                    Créer une nouvelle organisation
                  </Button>
                </form>
              </div>
            ) : (
                // FORMULAIRE LOGIN BENEVOLE
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 text-left animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Connexion Bénévole</h3>
                        <button onClick={() => setShowVolunteerLogin(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5"/></button>
                    </div>
                    <form onSubmit={handleVolunteerLoginSubmit} className="space-y-4">
                        <Input 
                            label="Identifiant / Pseudo" 
                            type="text" 
                            placeholder="Ex: vs827"
                            value={volunteerLoginData.username}
                            onChange={e => setVolunteerLoginData({...volunteerLoginData, username: e.target.value})}
                            required
                        />
                        <Input 
                            label="Mot de passe" 
                            type="password" 
                            value={volunteerLoginData.password}
                            onChange={e => setVolunteerLoginData({...volunteerLoginData, password: e.target.value})}
                            required
                        />
                        
                        <Button type="submit" fullWidth>Se connecter</Button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">Pas encore de compte ?</span>
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                        </div>

                        <Button 
                            type="button" 
                            variant="secondary" 
                            fullWidth 
                            onClick={() => { setShowVolunteerLogin(false); setIsCreateVolunteerModalOpen(true); }}
                        >
                            Devenir bénévole
                        </Button>
                    </form>
                </div>
            )}
          </div>
        </div>
        
        {/* Create Org Modal */}
        <Modal isOpen={isCreateOrgModalOpen} onClose={() => setIsCreateOrgModalOpen(false)} title="Créer une Organisation">
           <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Commencez dès maintenant à simplifier la gestion de vos bénévoles.</p>
              <Input 
                 label="Nom de l'association / structure"
                 placeholder="Ex: Les Amis de la Nature"
                 value={createOrgName}
                 onChange={e => setCreateOrgName(e.target.value)}
              />
              <Button fullWidth onClick={handleCreateOrganization} disabled={!createOrgName.trim()}>
                 Lancer mon espace
              </Button>
           </div>
        </Modal>

        {/* Create Volunteer Modal */}
        <Modal isOpen={isCreateVolunteerModalOpen} onClose={() => setIsCreateVolunteerModalOpen(false)} title="Créer un compte Bénévole">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <Input 
                        label="Prénom" 
                        value={createVolunteerData.firstName} 
                        onChange={e => setCreateVolunteerData({...createVolunteerData, firstName: e.target.value})} 
                        required
                    />
                    <Input 
                        label="Nom" 
                        value={createVolunteerData.lastName} 
                        onChange={e => setCreateVolunteerData({...createVolunteerData, lastName: e.target.value})} 
                    />
                </div>
                <Input 
                    label="Pseudo (Identifiant)" 
                    type="text" 
                    placeholder="Ex: vs827"
                    value={createVolunteerData.username} 
                    onChange={e => setCreateVolunteerData({...createVolunteerData, username: e.target.value})} 
                    required
                />
                <Input 
                    label="Mot de passe" 
                    type="password"
                    value={createVolunteerData.password} 
                    onChange={e => setCreateVolunteerData({...createVolunteerData, password: e.target.value})} 
                    required
                />
                <Button fullWidth onClick={handleCreateVolunteer} disabled={!createVolunteerData.firstName || !createVolunteerData.username || !createVolunteerData.password}>
                    Rejoindre l'aventure
                </Button>
            </div>
        </Modal>
      </div>
    );
  }

  // Common Header for Authenticated Views
  const Header = () => (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
             <Heart className="w-4 h-4 text-white fill-current" />
           </div>
           <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white hidden sm:block">BNEVO</span>
           {state.currentOrganization && (
             <div className="flex items-center gap-2 ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs rounded-full border border-slate-200 dark:border-slate-700">
               <span className="truncate max-w-[150px]">{state.currentOrganization.name}</span>
               {state.currentRole === 'organizer' && (
                 <button 
                  onClick={() => { setOrgNameInput(state.currentOrganization!.name); setIsOrgNameModalOpen(true); }}
                  className="hover:text-primary-600 flex-shrink-0"
                  title="Modifier le nom de l'organisation"
                 >
                   <Pencil className="w-3 h-3" />
                 </button>
               )}
             </div>
           )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               {state.currentRole !== 'organizer' && (
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{state.currentUser?.firstName} <span className="text-xs text-slate-400">@{state.currentUser?.username}</span></p>
               )}
               <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{state.currentRole === 'organizer' ? 'Organisateur' : 'Bénévole'}</p>
             </div>
             
             {/* Profile Trigger */}
             <button 
                onClick={state.currentRole === 'volunteer' ? openProfileModal : undefined}
                className={`relative ${state.currentRole === 'volunteer' ? 'cursor-pointer hover:ring-2 hover:ring-primary-300 rounded-full transition-all' : ''}`}
             >
                {state.currentUser?.avatar ? (
                    <img src={state.currentUser.avatar} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold">
                      {state.currentUser?.firstName ? state.currentUser.firstName[0] : 'U'}
                    </div>
                )}
                {state.currentRole === 'volunteer' && (
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-sm border border-slate-100 dark:border-slate-700">
                    <Settings className="w-3 h-3 text-slate-400" />
                  </div>
                )}
             </button>
          </div>
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );

  // 2. ORGANIZER DASHBOARD
  if (state.currentRole === 'organizer') {
    // Stats calculation
    const totalMissions = state.missions.length;
    const totalVolunteers = state.users.filter(u => u.role === 'volunteer').length;
    const totalParticipations = state.missions.reduce((acc, m) => acc + m.participants.length, 0);

    const chartData = state.missions.map(m => ({
      name: m.title.substring(0, 10) + '...',
      participants: m.participants.length,
    }));

    // Calendar Data
    const { daysInMonth, offset, year, month } = getDaysInMonth(calendarDate);

    // Finding mission for Participants Modal
    const viewingMission = viewingParticipantsMissionId 
        ? state.missions.find(m => m.id === viewingParticipantsMissionId)
        : null;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <Header />
        
        <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* Quick Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Missions</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalMissions}</p>
             </div>
             <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Bénévoles</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalVolunteers}</p>
             </div>
             <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Participations</p>
                <p className="text-3xl font-extrabold text-primary-600">{totalParticipations}</p>
             </div>
             <button 
                onClick={() => {
                  setMissionFormData({ id: undefined, title: '', location: '', description: '', category: 'Event', dateStart: '', dateEnd: '' });
                  setIsMissionModalOpen(true);
                }}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-200 dark:hover:border-primary-800 transition-colors group"
             >
                <Plus className="w-8 h-8 text-primary-500 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-primary-700 dark:text-primary-400 font-bold text-sm">Créer Mission</p>
             </button>
          </section>

          {/* Organizer Calendar */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <CalendarIcon className="w-5 h-5 text-primary-500" />
                Calendrier des Missions
              </h2>
              <div className="flex items-center gap-4">
                 <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                 <span className="font-semibold capitalize min-w-[120px] text-center text-slate-900 dark:text-white">
                   {calendarDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                 </span>
                 <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                <div key={d} className="text-center text-sm font-bold text-slate-400 py-2">{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {/* Empty slots for offset */}
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl"></div>
              ))}
              
              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const currentDayDate = new Date(year, month, day);
                const isToday = new Date().toDateString() === currentDayDate.toDateString();
                
                // Correction Calendrier: Vérifie si le jour est inclus dans la période de la mission
                const hasMission = state.missions.some(m => {
                    const mStart = new Date(m.dateStart);
                    mStart.setHours(0,0,0,0);
                    const mEnd = new Date(m.dateEnd);
                    mEnd.setHours(23,59,59,999); 
                    
                    const checkTime = currentDayDate.getTime();
                    return checkTime >= mStart.getTime() && checkTime <= mEnd.getTime();
                });

                return (
                  <button 
                    key={day}
                    onClick={() => handleCalendarDayClick(day)}
                    className={`h-16 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200 border 
                      ${hasMission 
                        ? 'bg-primary-500 text-white border-primary-600 hover:bg-primary-600 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm'
                      }
                      ${isToday && !hasMission ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900' : ''}
                      ${isToday && hasMission ? 'ring-2 ring-white dark:ring-slate-900 ring-offset-2 ring-offset-primary-500' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Missions List Management */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vos Missions à venir</h2>
            </div>
            {state.missions.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400">Aucune mission planifiée.</p>
                <Button variant="ghost" className="mt-2" onClick={() => setIsMissionModalOpen(true)}>Créer votre première mission</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.missions.map(mission => (
                  <MissionCard 
                    key={mission.id} 
                    mission={mission} 
                    role="organizer" 
                    currentUser={state.currentUser}
                    allUsers={state.users}
                    onAction={handleMissionAction}
                    onChat={setActiveChatMissionId}
                    onViewParticipants={setViewingParticipantsMissionId}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* --- MODALS ORGANIZER --- */}
        
        {/* Logout Modal */}
        <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Confirmer la déconnexion">
            <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300">Êtes-vous sûr de vouloir vous déconnecter de votre espace organisateur ?</p>
                <div className="flex gap-3">
                    <Button variant="secondary" fullWidth onClick={() => setIsLogoutModalOpen(false)}>Annuler</Button>
                    <Button variant="danger" fullWidth onClick={logout}>Déconnexion</Button>
                </div>
            </div>
        </Modal>

        {/* Create/Edit Mission Modal */}
        <Modal isOpen={isMissionModalOpen} onClose={() => setIsMissionModalOpen(false)} title={missionFormData.id ? "Modifier la mission" : "Créer une mission"}>
          <div className="space-y-4">
            <Input 
              label="Titre" 
              value={missionFormData.title} 
              onChange={e => setMissionFormData({...missionFormData, title: e.target.value})} 
            />
            <div className="grid grid-cols-2 gap-2">
               <Input 
                label="Début" 
                type="datetime-local"
                value={missionFormData.dateStart} 
                onChange={e => setMissionFormData({...missionFormData, dateStart: e.target.value})} 
               />
               <Input 
                label="Fin (Optionnel)" 
                type="datetime-local"
                value={missionFormData.dateEnd || ''} 
                onChange={e => setMissionFormData({...missionFormData, dateEnd: e.target.value})} 
               />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Catégorie</label>
                <select 
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={missionFormData.category}
                  onChange={e => setMissionFormData({...missionFormData, category: e.target.value as any})}
                >
                  <option value="Event">Event</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Social">Social</option>
                  <option value="Autre">Autre</option>
                </select>
            </div>
            <Input 
              label="Lieu" 
              value={missionFormData.location} 
              onChange={e => setMissionFormData({...missionFormData, location: e.target.value})} 
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea 
                className="w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                rows={3}
                value={missionFormData.description}
                onChange={e => setMissionFormData({...missionFormData, description: e.target.value})}
              />
            </div>

             {/* Organizer Only: Participants List inside Edit Modal */}
            {missionFormData.id && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary-500" />
                        Participants inscrits
                    </h4>
                    {/* Find the actual mission object to get participants, not the form data which might be partial */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 max-h-40 overflow-y-auto">
                         <ParticipantsList 
                            participantIds={state.missions.find(m => m.id === missionFormData.id)?.participants || []} 
                         />
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
                <Button fullWidth onClick={handleSaveMission}>
                    {missionFormData.id ? "Enregistrer les modifications" : "Publier la mission"}
                </Button>
                
                {missionFormData.id && (
                    <Button 
                        fullWidth 
                        variant="danger" 
                        type="button" 
                        onClick={(e) => handleDeleteMission(e)}
                    >
                        Supprimer la mission
                    </Button>
                )}
            </div>
          </div>
        </Modal>

        {/* Update Org Name Modal */}
        <Modal isOpen={isOrgNameModalOpen} onClose={() => setIsOrgNameModalOpen(false)} title="Nom de l'organisation">
          <div className="space-y-4">
            <Input 
              label="Nom de l'organisation"
              value={orgNameInput} 
              onChange={e => setOrgNameInput(e.target.value)} 
            />
            <Button fullWidth onClick={handleUpdateOrgName}>Sauvegarder</Button>
          </div>
        </Modal>

        {/* View Participants Modal (Shared Component logic, placed here for Organizer view) */}
        <Modal 
            isOpen={!!viewingParticipantsMissionId} 
            onClose={() => setViewingParticipantsMissionId(null)} 
            title={`Participants - ${viewingMission?.title || 'Mission'}`}
        >
            <div className="max-h-[60vh] overflow-y-auto">
                 <ParticipantsList participantIds={viewingMission?.participants || []} />
            </div>
        </Modal>

        {activeChatMissionId && (
          <ChatDrawer 
            mission={state.missions.find(m => m.id === activeChatMissionId)!}
            currentUser={state.currentUser!}
            onClose={() => setActiveChatMissionId(null)}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    );
  }

  // 3. VOLUNTEER DASHBOARD
  if (state.currentRole === 'volunteer') {
    const myMissions = state.missions.filter(m => m.participants.includes(state.currentUser!.id));
    
    // Filtering Logic for Available Missions
    const allAvailableMissions = state.missions.filter(m => !m.participants.includes(state.currentUser!.id));
    const displayedMissions = selectedCategory === 'Tout' 
        ? allAvailableMissions 
        : allAvailableMissions.filter(m => m.category === selectedCategory);
    
    const viewingMission = viewingParticipantsMissionId 
        ? state.missions.find(m => m.id === viewingParticipantsMissionId)
        : null;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        <Header />
        
        {/* Mobile Tab Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2 flex justify-around z-30 pb-safe">
           <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex flex-col items-center p-2 rounded-xl w-full ${activeTab === 'dashboard' ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-slate-400'}`}
           >
             <LayoutDashboard className="w-5 h-5" />
             <span className="text-[10px] mt-1 font-medium">Accueil</span>
           </button>
           <button 
            onClick={() => setActiveTab('calendar')} 
            className={`flex flex-col items-center p-2 rounded-xl w-full ${activeTab === 'calendar' ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-slate-400'}`}
           >
             <Search className="w-5 h-5" />
             <span className="text-[10px] mt-1 font-medium">Explorer</span>
           </button>
        </div>

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
          
          {/* Welcome Section */}
          {activeTab === 'dashboard' && (
            <>
              <div className="bg-gradient-to-r from-primary-600 to-emerald-500 dark:from-primary-700 dark:to-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-primary-200 dark:shadow-none">
                <h2 className="text-2xl font-bold mb-2">Bonjour, {state.currentUser?.firstName} !</h2>
                <p className="opacity-90 mb-6 text-sm">Prêt à changer les choses aujourd'hui ? Vous avez {myMissions.length} missions prévues.</p>
                <div className="flex gap-3">
                   <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 flex-1">
                      <span className="block text-2xl font-bold">{myMissions.length}</span>
                      <span className="text-xs opacity-80">Missions</span>
                   </div>
                   <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 flex-1">
                      <span className="block text-2xl font-bold">12h</span>
                      <span className="text-xs opacity-80">Cumulées</span>
                   </div>
                </div>
              </div>

              {/* My Planning */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary-500" /> 
                  Mon Planning
                </h3>
                {myMissions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myMissions.map(mission => (
                      <MissionCard 
                        key={mission.id} 
                        mission={mission} 
                        role="volunteer" 
                        currentUser={state.currentUser}
                        allUsers={state.users}
                        onAction={handleMissionAction}
                        onChat={setActiveChatMissionId}
                        onViewParticipants={setViewingParticipantsMissionId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
                    <p className="text-slate-400">Aucune mission prévue.</p>
                    <Button variant="ghost" size="sm" onClick={scrollToMissions} className="mt-2 text-primary-600 dark:text-primary-400">
                      Trouver une mission
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Explore / Calendar */}
          {(activeTab === 'calendar' || activeTab === 'dashboard') && (
            <div className={activeTab === 'dashboard' ? 'hidden md:block' : ''}>
               <h3 id="available-missions" className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary-500" />
                  Missions Disponibles
               </h3>
               
               {/* Categories Filters - NOW FUNCTIONAL */}
               <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                 {['Tout', 'Social', 'Maintenance', 'Event', 'Autre'].map((cat) => (
                   <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat 
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {displayedMissions.map(mission => (
                    <MissionCard 
                      key={mission.id} 
                      mission={mission} 
                      role="volunteer" 
                      currentUser={state.currentUser}
                      allUsers={state.users}
                      onAction={handleMissionAction}
                      onChat={setActiveChatMissionId}
                      onViewParticipants={setViewingParticipantsMissionId}
                    />
                 ))}
                 {displayedMissions.length === 0 && (
                   <p className="col-span-full text-center text-slate-500 dark:text-slate-400 py-10">
                     {selectedCategory === 'Tout' 
                        ? "Toutes les missions sont prises pour le moment !" 
                        : `Aucune mission disponible dans la catégorie "${selectedCategory}".`}
                   </p>
                 )}
               </div>
            </div>
          )}

        </main>
        
        {/* --- MODALS VOLUNTEER --- */}

        {/* Logout Modal */}
        <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Confirmer la déconnexion">
            <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300">Êtes-vous sûr de vouloir vous déconnecter ?</p>
                <div className="flex gap-3">
                    <Button variant="secondary" fullWidth onClick={() => setIsLogoutModalOpen(false)}>Annuler</Button>
                    <Button variant="danger" fullWidth onClick={logout}>Déconnexion</Button>
                </div>
            </div>
        </Modal>

        {/* Edit Profile Modal */}
        <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Mon Profil">
           <div className="space-y-4">
              <div className="flex justify-center mb-4">
                 <img 
                    src={profileFormData.avatar || 'https://via.placeholder.com/100'} 
                    className="w-20 h-20 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover" 
                 />
              </div>
              <Input 
                 label="Avatar URL (ex: https://...)" 
                 value={profileFormData.avatar || ''} 
                 onChange={e => setProfileFormData({...profileFormData, avatar: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  label="Prénom" 
                  value={profileFormData.firstName || ''} 
                  onChange={e => setProfileFormData({...profileFormData, firstName: e.target.value})}
                />
                <Input 
                  label="Nom" 
                  value={profileFormData.lastName || ''} 
                  onChange={e => setProfileFormData({...profileFormData, lastName: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                   Centres d'intérêt (Min. 3)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input 
                    value={interestInput}
                    onChange={e => setInterestInput(e.target.value)}
                    placeholder="Ajouter (ex: Jardinage)"
                    onKeyDown={e => e.key === 'Enter' && handleAddInterest()}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddInterest} size="sm" variant="secondary">
                     <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileFormData.interests?.map((interest, idx) => (
                    <span key={idx} className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                       {interest}
                       <button onClick={() => handleRemoveInterest(interest)} className="ml-1 hover:text-red-500">
                          <X className="w-3 h-3" />
                       </button>
                    </span>
                  ))}
                </div>
                {profileFormData.interests && profileFormData.interests.length < 3 && (
                   <p className="text-xs text-red-500 mt-1">Il manque encore {3 - profileFormData.interests.length} centre(s) d'intérêt.</p>
                )}
              </div>

              <Button 
                fullWidth 
                onClick={handleSaveProfile}
                disabled={profileFormData.interests && profileFormData.interests.length < 3}
              >
                Sauvegarder
              </Button>
           </div>
        </Modal>

        {/* View Participants Modal (Shared Component logic, placed here for Volunteer view) */}
        <Modal 
            isOpen={!!viewingParticipantsMissionId} 
            onClose={() => setViewingParticipantsMissionId(null)} 
            title={`Participants - ${viewingMission?.title || 'Mission'}`}
        >
            <div className="max-h-[60vh] overflow-y-auto">
                 <ParticipantsList participantIds={viewingMission?.participants || []} />
            </div>
        </Modal>

        {activeChatMissionId && (
          <ChatDrawer 
            mission={state.missions.find(m => m.id === activeChatMissionId)!}
            currentUser={state.currentUser!}
            onClose={() => setActiveChatMissionId(null)}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    );
  }

  return null;
}