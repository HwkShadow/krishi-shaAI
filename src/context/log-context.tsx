
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import * as z from 'zod';

const logSchema = z.object({
  activity: z.string().min(1, 'Activity is required'),
  crop: z.string().min(1, 'Crop name is required'),
  date: z.date({ required_error: 'A date is required.' }),
  notes: z.string().optional(),
});

export type LogEntry = z.infer<typeof logSchema> & { id: string };

type LogContextType = {
  logs: LogEntry[];
  addLog: (log: LogEntry) => void;
  deleteLog: (id: string) => void;
};

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  useEffect(() => {
    const storedLogs = localStorage.getItem("farmLogs");
    if (storedLogs) {
      const parsedLogs = JSON.parse(storedLogs).map((log: any) => ({
        ...log,
        date: new Date(log.date),
      }));
      setLogs(parsedLogs);
    } else {
        setLogs([]);
    }
  }, []);

  const addLog = (log: LogEntry) => {
    const newLogs = [log, ...logs];
    setLogs(newLogs);
    localStorage.setItem("farmLogs", JSON.stringify(newLogs));
  };

  const deleteLog = (id: string) => {
    const newLogs = logs.filter(log => log.id !== id);
    setLogs(newLogs);
    localStorage.setItem("farmLogs", JSON.stringify(newLogs));
  }

  return (
    <LogContext.Provider value={{ logs, addLog, deleteLog }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogs() {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error("useLogs must be used within a LogProvider");
  }
  return context;
}
