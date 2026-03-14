import { 
  UserCheck,
  Mail,
  Phone,
  Briefcase,
  Award,
  GraduationCap,
  MoreHorizontal,
  Search,
  MessageSquare
} from 'lucide-react';
import '../Styles/Auditeurs.css';
import { useAuditeurs } from '../hooks/useAuditeurs';

export function Auditeurs() {
  const {
    loading,
    searchQuery,
    setSearchQuery,
    openMenuId,
    setOpenMenuId,
    filteredAuditeurs,
    handleCreateConversation,
  } = useAuditeurs();

  return (
    <div className="auditeurs-page">
      <div className="auditeurs-header">
        <div>
          <h1 className="auditeurs-title">Liste des auditeurs</h1>
          <p className="auditeurs-subtitle">Consultez tous les auditeurs disponibles</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="auditeurs-search-section">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Rechercher un auditeur..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="auditeurs-count">
          {filteredAuditeurs.length} auditeur{filteredAuditeurs.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="empty-state-card">
          <p className="empty-state-text">Chargement des auditeurs...</p>
        </div>
      ) : filteredAuditeurs.length > 0 ? (
        <div className="auditeurs-grid">
          {filteredAuditeurs.map((auditeur) => (
            <div key={auditeur._id} className="auditeur-card">
              <div className="auditeur-card-header">
                <div className="auditeur-avatar">
                  <UserCheck size={24} />
                </div>
                <div style={{ position: 'relative' }}>
                  <button 
                    className="auditeur-menu-button"
                    onClick={() => setOpenMenuId(openMenuId === auditeur._id ? null : auditeur._id)}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {openMenuId === auditeur._id && (
                    <div className="user-menu-dropdown">
                      <button 
                        className="menu-item"
                        onClick={() => handleCreateConversation(auditeur._id)}
                      >
                        <MessageSquare size={14} style={{ marginRight: '8px' }} />
                        Créer conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="auditeur-info">
                <h3 className="auditeur-name">{auditeur.prenom} {auditeur.nom}</h3>
                
                <div className="auditeur-details">
                  {auditeur.email && (
                    <div className="auditeur-detail-item">
                      <Mail size={14} />
                      <span>{auditeur.email}</span>
                    </div>
                  )}
                  
                  {auditeur.telephone && (
                    <div className="auditeur-detail-item">
                      <Phone size={14} />
                      <span>{auditeur.telephone}</span>
                    </div>
                  )}
                  
                  {auditeur.grade && (
                    <div className="auditeur-detail-item">
                      <Briefcase size={14} />
                      <span>{auditeur.grade}</span>
                    </div>
                  )}
                  
                  {auditeur.specialite && (
                    <div className="auditeur-detail-item">
                      <Award size={14} />
                      <span>{auditeur.specialite}</span>
                    </div>
                  )}
                  
                  {auditeur.formation && (
                    <div className="auditeur-detail-item">
                      <GraduationCap size={14} />
                      <span>{auditeur.formation}</span>
                    </div>
                  )}
                </div>

                <div className="auditeur-footer">
                  <span className={`auditeur-status-badge ${auditeur.actif ? 'active' : 'inactive'}`}>
                    {auditeur.actif ? 'Actif' : 'Inactif'}
                  </span>
                  {auditeur.dateembauche && (
                    <span className="auditeur-date">
                      Depuis {new Date(auditeur.dateembauche).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-card">
          <div className="empty-state-icon-wrapper">
            <Search size={24} />
          </div>
          <h3 className="empty-state-title">Aucun auditeur trouvé</h3>
          <p className="empty-state-text">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}
    </div>
  );
}
