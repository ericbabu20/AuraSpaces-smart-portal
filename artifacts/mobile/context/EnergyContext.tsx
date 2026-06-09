import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Device {
  id: string;
  name: string;
  category: "climate" | "lighting" | "appliance" | "ev";
  isOn: boolean;
  powerDraw: number;
  icon: string;
  room: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  savingsPerMonth: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  icon: string;
}

export interface ActivityItem {
  id: string;
  description: string;
  timestamp: Date;
  type: "device" | "automation" | "savings" | "alert";
  icon: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isEnabled: boolean;
  icon: string;
}

interface EnergyContextType {
  devices: Device[];
  toggleDevice: (id: string) => void;
  recommendations: Recommendation[];
  activity: ActivityItem[];
  automations: AutomationRule[];
  toggleAutomation: (id: string) => void;
  currentUsage: number;
  usagePercent: number;
  moneySaved: number;
  carbonOffset: number;
  weeklyData: number[];
  thermostatTemp: number;
  setThermostatTemp: (temp: number) => void;
  thermostatMode: "cool" | "heat" | "fan" | "off";
  setThermostatMode: (mode: "cool" | "heat" | "fan" | "off") => void;
}

const EnergyContext = createContext<EnergyContextType | null>(null);

const INITIAL_DEVICES: Device[] = [
  {
    id: "1",
    name: "Thermostat",
    category: "climate",
    isOn: true,
    powerDraw: 1200,
    icon: "thermometer-outline",
    room: "Living Room",
  },
  {
    id: "2",
    name: "Living Room Lights",
    category: "lighting",
    isOn: true,
    powerDraw: 60,
    icon: "bulb-outline",
    room: "Living Room",
  },
  {
    id: "3",
    name: "Bedroom Lights",
    category: "lighting",
    isOn: false,
    powerDraw: 40,
    icon: "bulb-outline",
    room: "Bedroom",
  },
  {
    id: "4",
    name: "Washing Machine",
    category: "appliance",
    isOn: false,
    powerDraw: 500,
    icon: "water-outline",
    room: "Laundry",
  },
  {
    id: "5",
    name: "Refrigerator",
    category: "appliance",
    isOn: true,
    powerDraw: 150,
    icon: "cube-outline",
    room: "Kitchen",
  },
  {
    id: "6",
    name: "EV Charger",
    category: "ev",
    isOn: false,
    powerDraw: 7200,
    icon: "car-outline",
    room: "Garage",
  },
  {
    id: "7",
    name: "AC Unit",
    category: "climate",
    isOn: true,
    powerDraw: 1500,
    icon: "snow-outline",
    room: "Bedroom",
  },
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "1",
    title: "Shift dishwasher to off-peak",
    description:
      "Running after 9 PM saves up to 40% on electricity rates in your area.",
    savingsPerMonth: 12,
    category: "appliance",
    difficulty: "easy",
    icon: "time-outline",
  },
  {
    id: "2",
    title: "Lower thermostat by 2°",
    description:
      "Reducing from 24°C to 22°C cuts heating costs by up to 15% with no noticeable comfort difference.",
    savingsPerMonth: 28,
    category: "climate",
    difficulty: "easy",
    icon: "thermometer-outline",
  },
  {
    id: "3",
    title: "Smart EV overnight charging",
    description:
      "Enabling scheduled off-peak charging between 11 PM–6 AM saves significantly on energy costs.",
    savingsPerMonth: 45,
    category: "ev",
    difficulty: "medium",
    icon: "car-outline",
  },
  {
    id: "4",
    title: "Switch to LED bulbs",
    description:
      "Replacing remaining incandescent bulbs reduces lighting energy use by up to 75%.",
    savingsPerMonth: 8,
    category: "lighting",
    difficulty: "easy",
    icon: "bulb-outline",
  },
];

const ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    description: "Thermostat adjusted to 22°C by Aura AI",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: "device",
    icon: "thermometer-outline",
  },
  {
    id: "2",
    description: "Peak hours detected — 3 devices switched to eco mode",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    type: "automation",
    icon: "flash-outline",
  },
  {
    id: "3",
    description: "Washing machine cycle completed",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    type: "device",
    icon: "water-outline",
  },
  {
    id: "4",
    description: "Saved $3.40 by shifting EV charging to off-peak",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: "savings",
    icon: "leaf-outline",
  },
  {
    id: "5",
    description: "Living room lights turned off automatically",
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
    type: "automation",
    icon: "bulb-outline",
  },
  {
    id: "6",
    description: "Energy bill estimate updated: $87 this month",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    type: "alert",
    icon: "document-text-outline",
  },
  {
    id: "7",
    description: "AC Unit switched to eco mode for 2 hours",
    timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000),
    type: "automation",
    icon: "snow-outline",
  },
];

const AUTOMATIONS: AutomationRule[] = [
  {
    id: "1",
    name: "Peak Hours Eco Mode",
    trigger: "Peak pricing detected",
    action: "Reduce AC + dim lights by 30%",
    isEnabled: true,
    icon: "flash-outline",
  },
  {
    id: "2",
    name: "Away Mode",
    trigger: "All phones leave home",
    action: "Turn off lights, lower thermostat",
    isEnabled: true,
    icon: "exit-outline",
  },
  {
    id: "3",
    name: "EV Night Charging",
    trigger: "After 11 PM",
    action: "Start EV charge at off-peak rate",
    isEnabled: true,
    icon: "car-outline",
  },
  {
    id: "4",
    name: "Morning Warm-up",
    trigger: "6:30 AM on weekdays",
    action: "Heat home to 21°C before wake-up",
    isEnabled: false,
    icon: "sunny-outline",
  },
  {
    id: "5",
    name: "Sleep Mode",
    trigger: "10 PM daily",
    action: "Dim all lights, lower AC to 20°C",
    isEnabled: true,
    icon: "moon-outline",
  },
];

const WEEKLY_DATA = [12.4, 9.8, 11.2, 14.6, 10.3, 8.9, 11.7];

export function EnergyProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [automations, setAutomations] =
    useState<AutomationRule[]>(AUTOMATIONS);
  const [thermostatTemp, setThermostatTempState] = useState(22);
  const [thermostatMode, setThermostatModeState] = useState<
    "cool" | "heat" | "fan" | "off"
  >("cool");

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem("aura_device_states");
      if (stored) {
        const states: Record<string, boolean> = JSON.parse(stored);
        setDevices((prev) =>
          prev.map((d) => ({ ...d, isOn: states[d.id] ?? d.isOn }))
        );
      }
      const temp = await AsyncStorage.getItem("aura_thermostat_temp");
      if (temp) setThermostatTempState(Number(temp));
      const mode = await AsyncStorage.getItem("aura_thermostat_mode");
      if (mode)
        setThermostatModeState(mode as "cool" | "heat" | "fan" | "off");
    } catch {}
  };

  const toggleDevice = async (id: string) => {
    setDevices((prev) => {
      const updated = prev.map((d) =>
        d.id === id ? { ...d, isOn: !d.isOn } : d
      );
      const states: Record<string, boolean> = {};
      updated.forEach((d) => {
        states[d.id] = d.isOn;
      });
      AsyncStorage.setItem("aura_device_states", JSON.stringify(states)).catch(
        () => {}
      );
      return updated;
    });
  };

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  const setThermostatTemp = (temp: number) => {
    setThermostatTempState(temp);
    AsyncStorage.setItem("aura_thermostat_temp", String(temp)).catch(() => {});
  };

  const setThermostatMode = (mode: "cool" | "heat" | "fan" | "off") => {
    setThermostatModeState(mode);
    AsyncStorage.setItem("aura_thermostat_mode", mode).catch(() => {});
  };

  const activeDevices = devices.filter((d) => d.isOn);
  const currentUsage =
    activeDevices.reduce((sum, d) => sum + d.powerDraw, 0) / 1000;
  const maxUsage = 5.5;
  const usagePercent = Math.min(currentUsage / maxUsage, 1);

  return (
    <EnergyContext.Provider
      value={{
        devices,
        toggleDevice,
        recommendations: RECOMMENDATIONS,
        activity: ACTIVITY,
        automations,
        toggleAutomation,
        currentUsage,
        usagePercent,
        moneySaved: 47.8,
        carbonOffset: 23.4,
        weeklyData: WEEKLY_DATA,
        thermostatTemp,
        setThermostatTemp,
        thermostatMode,
        setThermostatMode,
      }}
    >
      {children}
    </EnergyContext.Provider>
  );
}

export function useEnergy() {
  const ctx = useContext(EnergyContext);
  if (!ctx) throw new Error("useEnergy must be used within EnergyProvider");
  return ctx;
}
