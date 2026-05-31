import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.kroo.sail",
  appName: "Kroo",
  webDir: "out",
  server: {
    url: "https://kroo-weld.vercel.app",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#ffffff",
    preferredContentMode: "mobile",
  },
  android: {
    backgroundColor: "#ffffff",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#02123e",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
  },
};

export default config;
