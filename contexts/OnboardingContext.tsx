import { useState, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OnboardingStep = 
  | 'welcome'
  | 'emr-select'
  | 'emr-connect'
  | 'sync'
  | 'complete';

export type EMRProvider = {
  id: string;
  name: string;
  hasApi: boolean;
  authType: 'oauth' | 'api-key' | 'csv' | 'none';
  icon: string;
  description: string;
};

export const EMR_PROVIDERS: EMRProvider[] = [
  { id: 'cerbo', name: 'Cerbo', hasApi: true, authType: 'oauth', icon: '🏥', description: 'Functional & integrative medicine EHR' },
  { id: 'charm', name: 'CharmHealth', hasApi: true, authType: 'oauth', icon: '💚', description: 'Integrative medicine EHR with FHIR API' },
  { id: 'canvas', name: 'Canvas Medical', hasApi: true, authType: 'oauth', icon: '🎨', description: 'Modern FHIR-based EHR platform' },
  { id: 'jane', name: 'Jane App', hasApi: false, authType: 'csv', icon: '📋', description: 'Practice management for health & wellness' },
  { id: 'practice-better', name: 'Practice Better', hasApi: false, authType: 'csv', icon: '✨', description: 'All-in-one practice management' },
  { id: 'simple-practice', name: 'SimplePractice', hasApi: false, authType: 'csv', icon: '📝', description: 'Practice management for clinicians' },
  { id: 'power2practice', name: 'Power2Practice', hasApi: false, authType: 'csv', icon: '⚡', description: 'Functional medicine EHR' },
  { id: 'other', name: 'Other / None', hasApi: false, authType: 'none', icon: '🔧', description: 'Manual setup or unsupported EMR' },
];

export interface OnboardingData {
  practitionerName: string;
  practiceName: string;
  specialty: string;
  selectedEmr: EMRProvider | null;
  emrConnected: boolean;
  patientCount: number | null;
}

const ONBOARDING_KEY = '@gabriel_onboarding_complete';

export const [OnboardingProvider, useOnboarding] = createContextHook(() => {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isComplete, setIsComplete] = useState<boolean | null>(null);
  const [data, setData] = useState<OnboardingData>({
    practitionerName: '',
    practiceName: '',
    specialty: '',
    selectedEmr: null,
    emrConnected: false,
    patientCount: null,
  });

  const checkOnboarding = useCallback(async () => {
    const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
    setIsComplete(stored === 'true');
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setIsComplete(true);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    setIsComplete(false);
    setStep('welcome');
    setData({
      practitionerName: '',
      practiceName: '',
      specialty: '',
      selectedEmr: null,
      emrConnected: false,
      patientCount: null,
    });
  }, []);

  const updateData = useCallback((partial: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  return {
    step,
    setStep,
    isComplete,
    data,
    updateData,
    checkOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
});
