import { useState } from 'react';
import api from '../services/api';
import type { UseRefuseModalOptions } from '../types/Affectation.d';

export function useRefuseModal({ affectationId, onClose, onSuccess }: UseRefuseModalOptions) {
  const [justificatif, setJustificatif] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefuse = async () => {
    if (!justificatif.trim()) {
      setError('Veuillez saisir la raison du refus');
      return;
    }

    setError(null);

    try {
      setSubmitting(true);

      await api.put(`/affectations/${affectationId}`, {
        statutAffectation: 'REFUSEE',
        justificatif,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erreur lors du refus';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    justificatif,
    setJustificatif,
    submitting,
    error,
    handleRefuse,
  };
}
