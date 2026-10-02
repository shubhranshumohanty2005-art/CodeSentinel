import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import LEGAL_CONFIG from '../content/legal/config';

/**
 * ConsentContext — manages cookie/storage consent state.
 *
 * Storage keys (documented in Cookie Policy):
 *   cs_consent          – current preferences { essential, functional, analytics, version, timestamp }
 *   cs_consent_records  – array of past consent records for audit
 *
 * Any component can use `useConsent()` to:
 *   - check `hasConsent('functional')` before loading optional scripts
 *   - call `updateConsent({ functional: true, analytics: false })` to save choices
 *   - call `openPreferences()` to show the banner
 */

const ConsentContext = createContext(null);

const STORAGE_KEY = LEGAL_CONFIG.consentStorageKey;
const RECORDS_KEY = LEGAL_CONFIG.consentRecordsKey;
const POLICY_VERSION = LEGAL_CONFIG.policyVersion;

function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeConsent(prefs) {
  const record = {
    ...prefs,
    version: POLICY_VERSION,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));

  // Append to audit log
  try {
    const records = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
    records.push(record);
    // Keep last 50 records
    if (records.length > 50) records.splice(0, records.length - 50);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage errors
  }

  return record;
}

export function ConsentProvider({ children }) {
  const [consent, setConsent] = useState(() => readConsent());
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Show banner if no consent or if policy version changed
  useEffect(() => {
    const saved = readConsent();
    if (!saved || saved.version !== POLICY_VERSION) {
      setShowBanner(true);
    }
  }, []);

  const hasConsent = useCallback((category) => {
    if (category === 'essential') return true;
    return consent?.[category] === true;
  }, [consent]);

  const updateConsent = useCallback((prefs) => {
    const full = {
      essential: true, // Always on
      functional: prefs.functional ?? false,
      analytics: prefs.analytics ?? false,
    };
    const record = writeConsent(full);
    setConsent(record);
    setShowBanner(false);
    setShowPreferences(false);
    return record;
  }, []);

  const acceptAll = useCallback(() => {
    return updateConsent({ functional: true, analytics: true });
  }, [updateConsent]);

  const rejectNonEssential = useCallback(() => {
    return updateConsent({ functional: false, analytics: false });
  }, [updateConsent]);

  const openPreferences = useCallback(() => {
    setShowPreferences(true);
    setShowBanner(true);
  }, []);

  const closeBanner = useCallback(() => {
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  return (
    <ConsentContext.Provider value={{
      consent,
      hasConsent,
      updateConsent,
      acceptAll,
      rejectNonEssential,
      openPreferences,
      showBanner,
      showPreferences,
      closeBanner,
      setShowPreferences,
      policyVersion: POLICY_VERSION,
    }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}
