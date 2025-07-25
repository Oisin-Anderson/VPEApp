import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

type PuffContextType = {
  puffCount: number;
  setPuffCount: Dispatch<SetStateAction<number>>;
  quitGoal: string;
  setQuitGoal: Dispatch<SetStateAction<string>>;
  nicotineMg: number;
  setNicotineMg: Dispatch<SetStateAction<number>>;
};

const PuffContext = createContext<PuffContextType | undefined>(undefined);

export const PuffProvider = ({ children }: { children: ReactNode }) => {
  const [puffCount, setPuffCount] = useState<number>(0);
  const [quitGoal, setQuitGoal] = useState<string>('');
  const [nicotineMg, setNicotineMg] = useState<number>(0);

  return (
    <PuffContext.Provider
      value={{
        puffCount,
        setPuffCount,
        quitGoal,
        setQuitGoal,
        nicotineMg,
        setNicotineMg,
      }}
    >
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