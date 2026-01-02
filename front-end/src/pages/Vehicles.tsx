import { 
  Car,
  MapPin,
  Users,
  MoreHorizontal,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import '../Styles/Vehicles.css';
import type { Vehicle, VehicleStatus } from "../types/Vehicle.d";

const statusConfig = {
  disponible: { label: 'Disponible', className: 'available' },
  en_service: { label: 'En service', className: 'in-service' },
  maintenance: { label: 'Maintenance', className: 'maintenance' },
};

const statusFilters = [
  { value: 'all' as const, label: 'Tous' },
  { value: 'disponible' as const, label: 'Disponibles' },
  { value: 'en_service' as const, label: 'En service' },
];

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    name: 'Dacia Logan',
    model: 'Logan',
    registration: '12345-A-1',
    status: 'disponible',
    location: 'Rabat'
  },
  {
    id: '2',
    name: 'Renault Clio',
    model: 'Clio',
    registration: '67890-B-2',
    status: 'en_service',
    location: 'Meknès',
    assignedTo: 2
  },
  {
    id: '3',
    name: 'Peugeot 208',
    model: '208',
    registration: '11111-C-3',
    status: 'disponible',
    location: 'Marrakech'
  },
  {
    id: '4',
    name: 'Volkswagen Polo',
    model: 'Polo',
    registration: '22222-D-4',
    status: 'disponible',
    location: 'Casablanca'
  },
  {
    id: '5',
    name: 'Fiat 500',
    model: '500',
    registration: '33333-E-5',
    status: 'en_service',
    location: 'Rabat',
    assignedTo: 1
  },
  {
    id: '6',
    name: 'Citroën C3',
    model: 'C3',
    registration: '44444-F-6',
    status: 'disponible',
    location: 'Meknès'
  }
];

export function Vehicles() {
  const [statusFilter, setStatusFilter] = useState<'all' | VehicleStatus>('all');
  const [viewMode] = useState<'list' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = mockVehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vehicle.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vehicle.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTotalVehicles = () => mockVehicles.length;
  const getAvailableVehicles = () => mockVehicles.filter(v => v.status === 'disponible').length;
  const getInServiceVehicles = () => mockVehicles.filter(v => v.status === 'en_service').length;

  return (
    <div className="vehicles-page">
      {/* Stats Cards */}
      <div className="vehicles-stats">
        <div className="vehicle-stat-card">
          <div className="stat-content">
            <p className="stat-label">Total véhicules</p>
            <p className="stat-value">{getTotalVehicles()}</p>
          </div>
          <div className="stat-icon gray">
            <Car size={20} />
          </div>
        </div>
        <div className="vehicle-stat-card">
          <div className="stat-content">
            <p className="stat-label">Disponibles</p>
            <p className="stat-value green">{getAvailableVehicles()}</p>
          </div>
          <div className="stat-icon green">
            <CheckCircle size={20} />
          </div>
        </div>
        <div className="vehicle-stat-card">
          <div className="stat-content">
            <p className="stat-label">En service</p>
            <p className="stat-value orange">{getInServiceVehicles()}</p>
          </div>
          <div className="stat-icon orange">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      <PageHeader
        title="Gestion des véhicules"
        subtitle="Gérez la flotte de véhicules"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={statusFilters}
        activeFilter={statusFilter}
        onFilterChange={(value) => setStatusFilter(value as 'all' | VehicleStatus)}
        onNewClick={() => console.log('New vehicle')}
        newButtonText="Ajouter un véhicule"
        resultsCount={filteredVehicles.length}
        getFilterCount={(value) => value === 'all' ? mockVehicles.length : mockVehicles.filter(v => v.status === value).length}
      />

      {/* Vehicle List */}
      {filteredVehicles.length > 0 ? (
        <div className={`vehicles-container ${viewMode}`}>
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="vehicle-card">
              <div className="vehicle-card-header">
                <div className="vehicle-icon-section">
                  <div className={`vehicle-icon ${statusConfig[vehicle.status].className}`}>
                    <Car size={20} />
                  </div>
                  <div className="vehicle-info-section">
                    <h3 className="vehicle-name">{vehicle.name}</h3>
                    <p className="vehicle-registration">{vehicle.registration}</p>
                  </div>
                </div>
                <button className="vehicle-menu-button">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <div className="vehicle-card-body">
                <span className={`vehicle-status-badge ${statusConfig[vehicle.status].className}`}>
                  {statusConfig[vehicle.status].label}
                </span>
                <div className="vehicle-location">
                  <MapPin size={14} />
                  <span>{vehicle.location}</span>
                </div>
              </div>

              {vehicle.assignedTo && (
                <div className="vehicle-card-footer">
                  <Users size={14} />
                  <span className="assignment-text">
                    Assigné à {vehicle.assignedTo} auditeur{vehicle.assignedTo > 1 ? 's' : ''}
                  </span>
                </div>
              )}
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
    </div>
  );
}
