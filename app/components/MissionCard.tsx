import React from 'react';
import { Calendar, MapPin, Users, MessageCircle, Eye } from 'lucide-react';
import { Mission, User } from '../types';
import { Button } from './ui/Button';

interface MissionCardProps {
  mission: Mission;
  allUsers: User[];
  currentUser: User | null;
  onAction: (missionId: string) => void;
  onChat: (missionId: string) => void;
  onViewParticipants: (missionId: string) => void;
  role: 'volunteer' | 'organizer';
}

export const MissionCard: React.FC<MissionCardProps> = ({ 
  mission, 
  allUsers, 
  currentUser, 
  onAction,
  onChat,
  onViewParticipants,
  role 
}) => {
  const participants = allUsers.filter(u => mission.participants.includes(u.id));
  const isRegistered = currentUser && mission.participants.includes(currentUser.id);
  
  const startDate = new Date(mission.dateStart);
  const endDate = mission.dateEnd ? new Date(mission.dateEnd) : startDate;
  
  // Formatage des dates
  const dateStr = startDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStartStr = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const timeEndStr = endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Logique d'affichage de la date de fin
  const isSameDay = startDate.toDateString() === endDate.toDateString();
  const showEndDate = mission.dateEnd && startDate.getTime() !== endDate.getTime();

  let dateDisplay = `${dateStr} • ${timeStartStr}`;
  if (showEndDate) {
    if (isSameDay) {
        dateDisplay += ` - ${timeEndStr}`;
    } else {
        const endDateStr = endDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
        dateDisplay += ` au ${endDateStr} ${timeEndStr}`;
    }
  }

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Social': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300';
      case 'Maintenance': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300';
      case 'Event': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case 'Autre': return 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="h-full bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-200 flex flex-col relative group">
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getCategoryColor(mission.category)}`}>
          {mission.category}
        </span>
        {role === 'volunteer' && isRegistered && (
          <span className="flex items-center text-primary-600 dark:text-primary-400 text-xs font-bold bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
            Inscrit
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 pr-8 leading-tight">{mission.title}</h3>
      
      <div className="flex flex-col gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="truncate">{dateDisplay}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="truncate">{mission.location}</span>
        </div>
      </div>

      <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
        {mission.description}
      </p>

      {/* Participants */}
      <div className="flex items-center justify-between mb-4 mt-auto">
        <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
            {participants.slice(0, 4).map((p) => (
                <img 
                key={p.id} 
                src={p.avatar} 
                alt={p.firstName} 
                className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 object-cover"
                title={`${p.firstName} ${p.lastName}`}
                />
            ))}
            {participants.length === 0 && (
                <span className="text-xs text-slate-400 dark:text-slate-500 italic">Aucun participant</span>
            )}
            {participants.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-medium text-slate-600 dark:text-slate-300">
                +{participants.length - 4}
                </div>
            )}
            </div>
            {participants.length > 0 && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onViewParticipants(mission.id); }}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors"
                    title="Voir les détails des participants"
                >
                    <Eye className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
           <Users className="w-3 h-3" />
           <span>{participants.length} participant{participants.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-50 dark:border-slate-800">
        {role === 'organizer' ? (
          <div className="flex-1">
            <Button variant="secondary" fullWidth onClick={() => onAction(mission.id)}>
              Gérer
            </Button>
          </div>
        ) : (
          <div className="flex-1">
            <Button 
              variant={isRegistered ? "secondary" : "primary"} 
              fullWidth 
              onClick={() => onAction(mission.id)}
            >
              {isRegistered ? 'Se désister' : 'Participer'}
            </Button>
          </div>
        )}
        
        <button 
          onClick={() => onChat(mission.id)}
          className="flex-none p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
          title="Discussion"
        >
          <MessageCircle className="w-5 h-5 text-slate-400 hover:text-primary-600" />
          {mission.chatMessages.length > 0 && (
             <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
          )}
        </button>
      </div>
    </div>
  );
};