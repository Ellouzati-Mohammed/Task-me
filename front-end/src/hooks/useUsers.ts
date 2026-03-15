import { useEffect, useState } from 'react';
import api from '../services/api';
import type { User, UserStatus } from '../types/User.d';

export function useUsers() {
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Etes-vous sur de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      setActiveMenuUserId(null);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditMode(true);
    setActiveMenuUserId(null);
  };

  const handleCloseModal = async () => {
    setShowCreateModal(false);
    setEditMode(false);
    setSelectedUser(undefined);
    await fetchUsers();
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      user.prenom.toLowerCase().includes(query) ||
      user.nom.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.specialite.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.actif) ||
      (statusFilter === 'inactive' && !user.actif);
    return matchesSearch && matchesStatus;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getYearsOfService = (hireDate: string) => {
    const hire = new Date(hireDate);
    const now = new Date();
    return now.getFullYear() - hire.getFullYear();
  };

  return {
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    showCreateModal,
    setShowCreateModal,
    activeMenuUserId,
    setActiveMenuUserId,
    selectedUser,
    editMode,
    users,
    loading,
    filteredUsers,
    handleDeleteUser,
    handleEditUser,
    handleCloseModal,
    getInitials,
    getYearsOfService,
  };
}