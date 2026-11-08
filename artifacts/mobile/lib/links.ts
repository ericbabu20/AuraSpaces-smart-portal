import { Linking } from "react-native";

export const USWITCH_ENERGY_URL = "https://www.uswitch.com/gas-electricity/";

export function openUswitch() {
  return Linking.openURL(USWITCH_ENERGY_URL);
}
