import type { Device, EnergyProfile } from "@/context/EnergyContext";
import { supabase } from "@/lib/supabase";

type EnergyInputRow = {
  has_solar: boolean;
  has_battery: boolean;
  has_ev: boolean;
  has_gas: boolean;
};

// Database types are generated during deployment. The local placeholder is
// intentionally narrow, so this boundary casts only the table layer.
const db = supabase as any;

export async function loadEnergyState(userId: string) {
  const [{ data: profile }, { data: devices }] = await Promise.all([
    db
      .from("energy_inputs")
      .select("has_solar, has_battery, has_ev, has_gas")
      .eq("user_id", userId)
      .maybeSingle(),
    db
      .from("household_devices")
      .select("id, name, category, is_on, power_draw, icon, room")
      .eq("user_id", userId)
      .order("id"),
  ]);
  return {
    profile: profile
      ? {
          hasSolar: profile.has_solar,
          hasBattery: profile.has_battery,
          hasEv: profile.has_ev,
          hasGas: profile.has_gas,
        }
      : null,
    devices: (devices ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      isOn: row.is_on,
      powerDraw: row.power_draw,
      icon: row.icon,
      room: row.room,
    })) as Device[],
  };
}

export async function saveEnergyProfile(userId: string, profile: EnergyProfile) {
  await db.from("energy_inputs").upsert(
    {
      user_id: userId,
      has_solar: profile.hasSolar,
      has_battery: profile.hasBattery,
      has_ev: profile.hasEv,
      has_gas: profile.hasGas,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export async function saveConsumption(
  userId: string,
  fuel: "electricity" | "gas",
  points: Array<{ date: string; consumption: number }>,
) {
  const rows = points
    .filter((point) => point.date && Number.isFinite(point.consumption))
    .map((point) => ({
      user_id: userId,
      fuel,
      usage_date: point.date,
      kwh: Math.max(0, point.consumption),
    }));
  if (!rows.length) return;
  await db.from("consumption_daily").upsert(rows, {
    onConflict: "user_id,fuel,usage_date",
  });
}

export async function saveDevices(userId: string, devices: Device[]) {
  await db.from("household_devices").upsert(
    devices.map((device) => ({
      user_id: userId,
      id: device.id,
      name: device.name,
      category: device.category,
      is_on: device.isOn,
      power_draw: device.powerDraw,
      icon: device.icon,
      room: device.room,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "user_id,id" },
  );
}
