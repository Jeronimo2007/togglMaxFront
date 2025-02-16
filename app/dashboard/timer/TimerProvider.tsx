
import React, { useState, createContext } from 'react';

export const TimerContext = createContext<{
  time: number;
  isRunning: boolean;
  setTime: React.Dispatch<React.SetStateAction<number>>;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  time: 0,
  isRunning: false,
  setTime: () => {},
  setIsRunning: () => {},
});

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  return (
    <TimerContext.Provider value={{ time, isRunning, setTime, setIsRunning }}>
      {children}
    </TimerContext.Provider>
  );
};