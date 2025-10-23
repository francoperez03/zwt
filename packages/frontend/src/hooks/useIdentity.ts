import { useState, useEffect } from 'react';
import { IdentityData } from 'zwt-access-lib';

const IDENTITY_KEY = 'zwt_identity';

export function useIdentity() {
  const [identity, setIdentity] = useState<IdentityData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(IDENTITY_KEY);
    if (stored) {
      try {
        setIdentity(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse identity from localStorage');
      }
    }
  }, []);

  const saveIdentity = (identityData: IdentityData) => {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identityData));
    setIdentity(identityData);
  };

  const clearIdentity = () => {
    localStorage.removeItem(IDENTITY_KEY);
    setIdentity(null);
  };

  return {
    identity,
    saveIdentity,
    clearIdentity
  };
}
