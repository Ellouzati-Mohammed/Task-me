import { 
  Car,
  MapPin,
  MoreHorizontal,
  Filter,
  Pencil,
  Trash2
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { VehicleFormModal } from '../components/VehiculeFormModal';
import '../Styles/Vehicles.css';
import { useVehicles } from '../hooks/useVehicles';

const directionFilters = [
  { value: 'all' as const, label: 'Tous' },
  { value: 'Rabat-Casa' as const, label: 'Rabat-Casa' },
  { value: 'Meknès-Errachidia' as const, label: 'Meknès-Errachidia' },
  { value: 'Marrakech-Agadir' as const, label: 'Marrakech-Agadir' },
];

export function Vehicles() {
  const viewMode: 'list' | 'grid' = 'grid';
  const {
    directionFilter,
    setDirectionFilter,
    searchQuery,
    setSearchQuery,
    showCreateModal,
    setShowCreateModal,
    vehicles,
    loading,
    editingVehicle,
    openMenuId,
    setOpenMenuId,
    filteredVehicles,
    getVehiclesByDirection,
    handleDeleteVehicle,
    handleEditVehicle,
    handleCloseModal,
  } = useVehicles();

  return (
    <div className="vehicles-page">
      

      <PageHeader
        title="Gestion des véhicules"
        subtitle="Gérez la flotte de véhicules"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={directionFilters}
        activeFilter={directionFilter}
        onFilterChange={(value) => setDirectionFilter(value)}
        onNewClick={() => setShowCreateModal(true)}
        newButtonText="Ajouter un véhicule"
        resultsCount={filteredVehicles.length}
        getFilterCount={(value) => value === 'all' ? vehicles.length : getVehiclesByDirection(value)}
      />

      {/* Vehicle List */}
      {loading ? (
        <div className="empty-state-card">
          <p className="empty-state-text">Chargement des véhicules...</p>
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className={`vehicles-container ${viewMode}`}>
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle._id} className="vehicle-card">
              <div className="vehicle-card-header">
                <div className="vehicle-icon-section">
                  <div className="vehicle-icon">
                    <Car size={20} />
                  </div>
                  <div className="vehicle-info-section">
                    <h3 className="vehicle-name">{vehicle.marque || 'N/A'} {vehicle.modele || ''}</h3>
                    <p className="vehicle-registration">{vehicle.immatriculation}</p>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <button 
                    className="vehicle-menu-button"
                    onClick={() => setOpenMenuId(openMenuId === vehicle._id ? null : vehicle._id)}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {openMenuId === vehicle._id && (
                    <div className="user-menu-dropdown">
                      <button 
                        className="menu-item"
                        onClick={() => handleEditVehicle(vehicle)}
                      >
                        <Pencil size={14} style={{ marginRight: '8px' }} />
                        Modifier
                      </button>
                      <button 
                        className="menu-item delete"
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                      >
                        <Trash2 size={14} style={{ marginRight: '8px' }} />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="vehicle-card-body">
                {vehicle.direction && (
                  <span className="vehicle-status-badge">
                    {vehicle.direction}
                  </span>
                )}
                <div className="vehicle-location">
                  <MapPin size={14} />
                  <span>{vehicle.direction || 'Non défini'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-card">
          <div className="empty-state-icon-wrapper">
            <Filter size={24} />
          </div>
          <h3 className="empty-state-title">Aucun véhicule trouvé</h3>
          <p className="empty-state-text">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}

      {showCreateModal && (
        <VehicleFormModal 
          onClose={handleCloseModal} 
          mode="create" 
        />
      )}
      
      {editingVehicle && (
        <VehicleFormModal 
          onClose={handleCloseModal} 
          vehicle={editingVehicle}
          mode="edit" 
        />
      )}
    </div>
  );
}
