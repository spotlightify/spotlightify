import { useContext } from "react";
import { SpotlightifyContext } from "../context/SpotlightifyContext";

export function useSpotlightify() {
  const context = useContext(SpotlightifyContext);
  if (!context) {
    throw new Error(
      "useSpotlightify must be used within a SpotlightifyProvider"
    );
  }
  return context;
}
