import React, { createContext, useContext, useMemo, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

/**
 * Shared React state for the consultancy area.
 * UI-only: there is no backend endpoint for consultant profile/services yet,
 * so selections live in React memory (no localStorage, no new API calls).
 * They reset on page refresh — clearly marked "not connected" in the UI.
 */
const ConsultantContext = createContext(null);

export const CONSULTANCY_SERVICES = [
  { id: 'application-review', name: 'Application Review', desc: 'Review and polish university applications before submission.' },
  { id: 'sop-lor', name: 'SOP / LOR Guidance', desc: 'Step-by-step help with statements and recommendation letters.' },
  { id: 'shortlisting', name: 'University Shortlisting', desc: 'Build a balanced safe / target / ambitious university list.' },
  { id: 'visa-assistance', name: 'Visa Assistance', desc: 'Document checklists and visa interview preparation.' },
  { id: 'scholarship', name: 'Scholarship Guidance', desc: 'Find and apply for scholarships that match your profile.' },
  { id: 'interview-prep', name: 'Interview Preparation', desc: 'Mock interviews with university admission panels.' },
  { id: 'profile-eval', name: 'Profile Evaluation', desc: 'GRE/TOEFL/IELTS/CGPA based candidature assessment.' },
  { id: 'end-to-end', name: 'End-to-End Counselling', desc: 'Full assistance from shortlisting to enrollment.' },
  { id: 'finance', name: 'Education Loan & Finance', desc: 'Loan options, bank tie-ups and finance planning.' },
];

export const DESTINATIONS = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'Ireland', 'New Zealand', 'Singapore', 'France', 'Netherlands',
];

export const ConsultantProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Profile — seeded with the logged-in user's basic info.
  const [profile, setProfile] = useState({
    consultancyName: '',
    tagline: '',
    about: '',
    logoUrl: '',
    email: user?.email || '',
    phone: '',
    city: '',
    country: '',
    website: '',
    linkedin: '',
    facebook: '',
    instagram: '',
    youtube: '',
    yearsOfExperience: '',
    studentsPlaced: '',
  });

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);

  // Account settings UI state (not connected to any API).
  const [account, setAccount] = useState({ email: user?.email || '' });

  const toggleService = (id) =>
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const toggleDestination = (dest) =>
    setSelectedDestinations((prev) =>
      prev.includes(dest) ? prev.filter((d) => d !== dest) : [...prev, dest]
    );

  const value = useMemo(
    () => ({
      profile, setProfile,
      selectedServices, toggleService,
      selectedDestinations, toggleDestination,
      account, setAccount,
    }),
    [profile, selectedServices, selectedDestinations, account]
  );

  return (
    <ConsultantContext.Provider value={value}>
      {children}
    </ConsultantContext.Provider>
  );
};

export const useConsultant = () => {
  const ctx = useContext(ConsultantContext);
  if (!ctx) throw new Error('useConsultant must be used within ConsultantProvider');
  return ctx;
};
