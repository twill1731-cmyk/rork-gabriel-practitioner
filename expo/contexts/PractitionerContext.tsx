import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import {
  MOCK_PATIENTS,
  MOCK_MESSAGES,
  MOCK_APPOINTMENTS,
  MOCK_PROTOCOL_TEMPLATES,
  getAllAlerts,
  getPractitionerStats,
  getTotalUnreadMessages,
  getUnreadAlertCount,
} from '../constants/practitioner-data';
import type {
  Patient,
  PatientAlert,
  PractitionerMessage,
  Appointment,
  ProtocolTemplate,
  PractitionerStats,
} from '../constants/practitioner-data';

export const [PractitionerProvider, usePractitioner] = createContextHook(() => {
  const [patients] = useState<Patient[]>(MOCK_PATIENTS);
  const [messages] = useState<PractitionerMessage[]>(MOCK_MESSAGES);
  const [appointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [protocolTemplates] = useState<ProtocolTemplate[]>(MOCK_PROTOCOL_TEMPLATES);
  const [readAlertIds, setReadAlertIds] = useState<Set<string>>(new Set());

  const stats = useMemo<PractitionerStats>(() => getPractitionerStats(), [patients]);

  const alerts = useMemo<PatientAlert[]>(() => getAllAlerts(), [patients]);

  const unreadAlerts = useMemo(() => {
    return alerts.filter(a => !a.read && !readAlertIds.has(a.id));
  }, [alerts, readAlertIds]);

  const totalUnreadMessages = useMemo(() => getTotalUnreadMessages(), [messages]);

  const markAlertRead = useCallback((alertId: string) => {
    setReadAlertIds(prev => new Set([...prev, alertId]));
    console.log('[Practitioner] Alert marked read:', alertId);
  }, []);

  const getPatient = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);

  const getPatientMessages = useCallback((patientId: string): PractitionerMessage | undefined => {
    return messages.find(m => m.patientId === patientId);
  }, [messages]);

  const searchPatients = useCallback((query: string): Patient[] => {
    if (!query.trim()) return patients;
    const lower = query.toLowerCase();
    return patients.filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.primaryConditions.some(c => c.toLowerCase().includes(lower)) ||
      p.status.includes(lower)
    );
  }, [patients]);

  const getPatientsByStatus = useCallback((status: Patient['status']): Patient[] => {
    return patients.filter(p => p.status === status);
  }, [patients]);

  return {
    patients,
    messages,
    appointments,
    protocolTemplates,
    stats,
    alerts,
    unreadAlerts,
    totalUnreadMessages,
    markAlertRead,
    getPatient,
    getPatientMessages,
    searchPatients,
    getPatientsByStatus,
    readAlertIds,
  };
});
