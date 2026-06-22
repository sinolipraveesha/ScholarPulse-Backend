import { Platform } from 'react-native';

// Development URL (used for emulator testing via adb reverse)
const DEV_URL = 'http://localhost:5001/api';

// Production URL (used when anyone installs the standalone APK).
// TODO: Replace this with your deployed Render/Railway URL once you deploy the backend!
const PROD_URL = 'https://scholarpulse-backend.onrender.com/api'; 

export const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;
