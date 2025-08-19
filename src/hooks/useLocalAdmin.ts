import { useState, useEffect } from 'react';

const ADMIN_CONFIG_KEY = 'inventory_admin_config';
const DEFAULT_ADMIN_PIN = '0000';

interface AdminConfig {
  pin: string;
}

// Funciones auxiliares para localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const useLocalAdmin = () => {
  const [adminPin, setAdminPin] = useState<string | null>(null);
  const [isAdminPinLoading, setIsAdminPinLoading] = useState(true);

  useEffect(() => {
    // Cargar configuración de admin del localStorage
    const loadAdminConfig = () => {
      try {
        console.log('Loading admin config from localStorage...');
        
        const config = loadFromStorage<AdminConfig>(ADMIN_CONFIG_KEY, { pin: DEFAULT_ADMIN_PIN });
        
        // Si no existe, crear configuración por defecto
        if (!config.pin) {
          config.pin = DEFAULT_ADMIN_PIN;
          saveToStorage(ADMIN_CONFIG_KEY, config);
          console.log('Default admin config created');
        }
        
        setAdminPin(config.pin);
        setIsAdminPinLoading(false);
        console.log('Admin config loaded successfully');
      } catch (error) {
        console.error('Error loading admin config:', error);
        setAdminPin(DEFAULT_ADMIN_PIN);
        setIsAdminPinLoading(false);
      }
    };

    loadAdminConfig();
  }, []);

  // Función para actualizar el PIN de admin
  const updateAdminPin = (newPin: string) => {
    try {
      const config: AdminConfig = { pin: newPin };
      saveToStorage(ADMIN_CONFIG_KEY, config);
      setAdminPin(newPin);
      console.log('Admin pin updated successfully');
    } catch (error) {
      console.error('Error updating admin pin:', error);
    }
  };

  return { 
    adminPin, 
    isAdminPinLoading,
    updateAdminPin 
  };
};