import { Environment } from "../../wailsjs/runtime/runtime";

// Cache the development mode status
let devMode: boolean | null = null;

// Check if we're running in development mode
export const isDevelopmentMode = async (): Promise<boolean> => {
  if (devMode !== null) {
    return devMode;
  }

  try {
    const env = await Environment();
    devMode = env.buildType === "dev";
    return devMode;
  } catch (error) {
    console.error("Failed to check environment:", error);
    return false;
  }
};
