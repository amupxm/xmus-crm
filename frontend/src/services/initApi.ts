import api from './apiConfig';
import { setupApiInterceptors } from './apiInterceptors';

let isInitialized = false;

export const initializeApi = () => {
  if (!isInitialized) {
    setupApiInterceptors(api);
    isInitialized = true;
  }
  return api;
};
