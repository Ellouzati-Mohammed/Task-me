import { User, Mail, Phone, GraduationCap, Lock, Save } from 'lucide-react';
import '../Styles/Profile.css';
import { useProfile } from '../hooks/useProfile';

export function Profile() {
  const {
    user,
    profile,
    activeTab,
    setActiveTab,
    isEditing,
    loading,
    error,
    passwordData,
    setPasswordData,
    startEditing,
    cancelEditing,
    handleProfileChange,
    handleSaveProfile,
    handlePasswordChange,
  } = useProfile();

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <h1 className="profile-title">Mon Profil</h1>
          <p className="profile-subtitle">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <h1 className="profile-title">Mon Profil</h1>
          <p className="profile-subtitle" style={{ color: '#c33' }}>{error || 'Erreur de chargement'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="profile-title">Mon Profil</h1>
        <p className="profile-subtitle">Gérez vos informations personnelles</p>
      </div>

      <div className="profile-content">
        {/* Left Section - Avatar and Info */}
        <div className="profile-sidebar">
          <div className="profile-avatar-card">
            <div className="profile-avatar-large">
              {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
            </div>
            <h2 className="profile-user-name">{profile.firstName} {profile.lastName}</h2>
            <p className="profile-user-role">{profile.role}</p>
            <button className="change-photo-btn">Changer la photo</button>
          </div>

          <div className="profile-stats-card">
           
            {user?.role === 'auditeur' && profile.grade && (
              <div className="profile-stat-item">
                <span className="stat-labeled">Grade</span>
                <span className="stat-value">Grade {profile.grade}</span>
              </div>
            )}
            {profile.hireDate && (
              <div className="profile-stat-item">
                <span className="stat-labeled">Date d'embauche</span>

                <span className="stat-value">{new Date(profile.hireDate).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Tabs and Forms */}
        <div className="profile-main">
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <User size={16} />
              Informations personnelles
            </button>
            <button
              className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <Lock size={16} />
              Sécurité
            </button>
          </div>

          <div className="profile-tab-content">
            {activeTab === 'info' ? (
              <div className="info-form">
                <div className="form-header">
                  <h3 className="form-title">Informations personnelles</h3>
                  {!isEditing ? (
                    <button className="edit-btn" onClick={startEditing}>
                      Modifier
                    </button>
                  ) : (
                    <div className="form-actions">
                      <button className="cancel-btn" onClick={cancelEditing}>
                        Annuler
                      </button>
                      <button className="save-btn" onClick={handleSaveProfile}>
                        <Save size={16} />
                        Enregistrer
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      <User size={14} />
                      Prénom
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <User size={14} />
                      Nom
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Mail size={14} />
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={profile.email}
                      disabled={true}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Phone size={14} />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      value={profile.phone || ''}
                       disabled={true}
                    />
                  </div>

                  {user?.role === 'auditeur' && profile.grade && (
                    <div className="form-group">
                      <label className="form-label">
                        <GraduationCap size={14} />
                        Grade
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={`Grade ${profile.grade}`}
                        disabled
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="password-form">
                <h3 className="form-title">Changer le mot de passe</h3>
                <p className="form-description">
                  Assurez-vous d'utiliser un mot de passe fort avec au moins 8 caractères
                </p>

                <div className="form-grid-single">
                  <div className="form-group">
                    <label className="form-label">
                      <Lock size={14} />
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Lock size={14} />
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Entrez votre nouveau mot de passe"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Lock size={14} />
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                  </div>

                  <button className="save-btn-full" onClick={handlePasswordChange}>
                    <Save size={16} />
                    Changer le mot de passe
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
