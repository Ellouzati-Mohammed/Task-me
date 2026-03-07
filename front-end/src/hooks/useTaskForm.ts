import { useState, useEffect } from 'react';
import api from '../services/api';
import type { TaskFormData, TypeTache, DirectionAssociee, TaskFormModalProps } from '../types/TaskForm.d';
import type { Vehicle } from '../types/Vehicle.d';

const initialFormData: TaskFormData = {
  nom: '',
  description: '',
  typeTache: 'Formateur',
  statutTache: 'CREEE',
  dateDebut: '',
  dateFin: '',
  dateCreation: new Date().toISOString().split('T')[0],
  remuneree: false,
  specialites: [],
  grades: [],
  necessiteVehicule: false,
  directionAssociee: 'Rabat-Casa',
  nombrePlaces: 1,
  urgent: false,
};

function getInitialFormData(
  task: TaskFormModalProps['task'],
  mode: 'create' | 'edit'
): TaskFormData {
  if (task && mode === 'edit') {
    return {
      nom: task.nom || '',
      description: task.description || '',
      typeTache: task.typeTache || 'Formateur',
      statutTache: task.statutTache || 'CREEE',
      dateDebut: task.dateDebut ? task.dateDebut.split('T')[0] : '',
      dateFin: task.dateFin ? task.dateFin.split('T')[0] : '',
      dateCreation: task.dateCreation
        ? task.dateCreation.split('T')[0]
        : new Date().toISOString().split('T')[0],
      remuneree: task.remuneree || false,
      specialites: task.specialites || [],
      grades: task.grades || [],
      necessiteVehicule: task.necessiteVehicule || false,
      vehiculeId: task.vehiculeId || '',
      directionAssociee: task.directionAssociee || 'Rabat-Casa',
      nombrePlaces: task.nombrePlaces || 1,
      urgent: task.urgent || false,
    };
  }
  return initialFormData;
}

export function useTaskForm({ onClose, task, mode = 'create' }: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskFormData>(() =>
    getInitialFormData(task, mode)
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [errors, setErrors] = useState<{ grades?: string; specialites?: string; date?: string }>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);

  useEffect(() => {
    if (task && mode === 'edit' && (task as { fichierJoint?: string }).fichierJoint) {
      setExistingFile((task as { fichierJoint?: string }).fichierJoint as string);
    }
  }, [task, mode]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (
        formData.necessiteVehicule &&
        formData.directionAssociee &&
        formData.dateDebut &&
        formData.dateFin
      ) {
        try {
          setLoadingVehicles(true);
          const taskId =
            mode === 'edit' && task
              ? (task as { _id?: string; id?: string })?._id ||
                (task as { _id?: string; id?: string })?.id
              : undefined;
          const response = await api.get('/vehicles/available', {
            params: {
              direction: formData.directionAssociee,
              dateDebut: formData.dateDebut,
              dateFin: formData.dateFin,
              ...(taskId && { excludeTaskId: taskId }),
            },
          });
          const available = (response.data.data || []).filter(
            (v: { isAvailable?: boolean }) => v.isAvailable
          );
          setVehicles(available);
        } catch {
          setVehicles([]);
        } finally {
          setLoadingVehicles(false);
        }
      } else {
        setVehicles([]);
      }
    };

    fetchVehicles();
  }, [
    formData.necessiteVehicule,
    formData.directionAssociee,
    formData.dateDebut,
    formData.dateFin,
    mode,
    task,
  ]);

  const handleSpecialiteToggle = (specialite: string) => {
    setFormData((prev) => ({
      ...prev,
      specialites: prev.specialites.includes(specialite)
        ? prev.specialites.filter((s) => s !== specialite)
        : [...prev.specialites, specialite],
    }));
    if (errors.specialites) setErrors((prev) => ({ ...prev, specialites: undefined }));
  };

  const handleGradeToggle = (grade: string) => {
    setFormData((prev) => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter((g) => g !== grade)
        : [...prev.grades, grade],
    }));
    if (errors.grades) setErrors((prev) => ({ ...prev, grades: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { grades?: string; specialites?: string; date?: string } = {};

    if (formData.grades.length === 0)
      newErrors.grades = 'Veuillez sélectionner au moins un grade';

    if (formData.specialites.length === 0)
      newErrors.specialites = 'Veuillez sélectionner au moins une spécialité';

    if (formData.dateDebut && formData.dateFin) {
      if (new Date(formData.dateDebut) > new Date(formData.dateFin))
        newErrors.date = 'La date de début doit être antérieure ou égale à la date de fin';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const { vehiculeId, ...restData } = formData;
      const formDataToSend = new FormData();

      Object.keys(restData).forEach((key) => {
        const value = restData[key as keyof typeof restData];
        if (value !== null && value !== undefined) {
          formDataToSend.append(
            key,
            Array.isArray(value) ? JSON.stringify(value) : String(value)
          );
        }
      });

      if (vehiculeId) formDataToSend.append('vehicule', vehiculeId);

      formDataToSend.set(
        'directionAssociee',
        formData.necessiteVehicule ? formData.directionAssociee : ''
      );

      if (selectedFile) formDataToSend.append('fichierJoint', selectedFile);

      const taskId =
        (task as { _id?: string; id?: string })?._id ||
        (task as { _id?: string; id?: string })?.id;

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (mode === 'edit' && taskId) {
        await api.put(`/tasks/${taskId}`, formDataToSend, config);
      } else {
        await api.post('/tasks', formDataToSend, config);
      }

      onClose();
    } catch {
      alert("Erreur lors de l'enregistrement de la tâche");
    }
  };

  const updateField = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateDirection = (value: DirectionAssociee) => {
    setFormData((prev) => ({ ...prev, directionAssociee: value, vehiculeId: '' }));
  };

  const updateTypeTache = (value: TypeTache) => {
    setFormData((prev) => ({ ...prev, typeTache: value }));
  };

  return {
    formData,
    vehicles,
    loadingVehicles,
    errors,
    selectedFile,
    existingFile,
    setSelectedFile,
    handleSubmit,
    handleSpecialiteToggle,
    handleGradeToggle,
    updateField,
    updateDirection,
    updateTypeTache,
  };
}
