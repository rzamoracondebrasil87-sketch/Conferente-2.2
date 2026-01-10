import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.conferente.app',
  appName: 'Conferente',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://conferente-2-2.vercel.app',
    cleartext: false
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  }
};

export default config;
