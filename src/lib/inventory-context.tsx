'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryStatus } from './inventory-data';

interface InventoryContextType {
  inventoryStatuses: InventoryStatus[];
  setInventoryStatuses: (statuses: InventoryStatus[]) => void;
  refreshInventoryStatuses: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventoryStatuses, setInventoryStatuses] = useState<InventoryStatus[]>([]);

  const fetchInventoryStatuses = async () => {
    try {
      const response = await fetch('/api/inventory-status');
      if (response.ok) {
        const data = await response.json();
        setInventoryStatuses(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory statuses:', error);
    }
  };

  const refreshInventoryStatuses = async () => {
    await fetchInventoryStatuses();
  };

  useEffect(() => {
    fetchInventoryStatuses();
  }, []);

  return (
    <InventoryContext.Provider value={{ inventoryStatuses, setInventoryStatuses, refreshInventoryStatuses }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
}