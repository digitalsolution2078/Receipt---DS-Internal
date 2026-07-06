import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (email: string, role: 'admin' | 'staff') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  login: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem('demo_session');
    if (storedSession) {
      try {
        const parsedProfile = JSON.parse(storedSession);
        setProfile(parsedProfile);
        setUser({ uid: parsedProfile.uid, email: parsedProfile.email });
      } catch (err) {
        console.error("Error parsing session", err);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, role: 'admin' | 'staff') => {
    const newProfile: UserProfile = {
      uid: 'demo-' + role,
      email,
      role,
      createdAt: Date.now()
    };
    localStorage.setItem('demo_session', JSON.stringify(newProfile));
    setProfile(newProfile);
    setUser({ uid: newProfile.uid, email: newProfile.email });
  };

  const logout = async () => {
    localStorage.removeItem('demo_session');
    setProfile(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
