import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.superconnect.app',
  appName: 'SuperConnect',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
