import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Vehicle } from '../types/Vehicle';

export function useVehicles() {
  const [directionFilter, setDirectionFilter] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles');
      setVehicles(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur lors de la recuperation des vehicules:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer ce vehicule ?')) {
      return;
    }

    try {
      await api.delete(`/vehicles/${vehicleId}`);
      await fetchVehicles();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du vehicule:', error);
      alert('Erreur lors de la suppression du vehicule');
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setOpenMenuId(null);
  };

  const handleCloseModal = async () => {
    setShowCreateModal(false);
    setEditingVehicle(null);
    await fetchVehicles();
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      vehicle.immatriculation.toLowerCase().includes(query) ||
      (vehicle.marque?.toLowerCase() || '').includes(query) ||
      (vehicle.modele?.toLowerCase() || '').includes(query);
    const matchesDirection = directionFilter === 'all' || vehicle.direction === directionFilter;
    return matchesSearch && matchesDirection;
  });

  const getVehiclesByDirection = (direction: string) =>
    vehicles.filter((vehicle) => vehicle.direction === direction).length;

  return {
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
  };
}
