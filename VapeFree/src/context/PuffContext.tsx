import React, { createContext, useContext, useState, ReactNode } from 'react';

type PuffContextType = {
  puffCount: number;
  setPuffCount: React.Dispatch<React.SetStateAction<number>>;
};

const PuffContext = createContext<PuffContextType | undefined>(undefined);

export const PuffProvider = ({ children }: { children: ReactNode }) => {
  const [puffCount, setPuffCount] = useState<number>(0);
  return (
    <PuffContext.Provider value={{ puffCount, setPuffCount }}>
      {children}
    </PuffContext.Provider>
  );
};

export const usePuff = (): PuffContextType => {
  const context = useContext(PuffContext);
  if (context === undefined) {
    throw new Error('usePuff must be used inside a PuffProvider');
  }
  return context;
};