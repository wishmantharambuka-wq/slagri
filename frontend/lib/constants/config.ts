// Application configuration

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const API_TIMEOUT = 10000; // ms

// Map Configuration
export const MAP_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
export const MAP_ATTRIBUTION = '© OpenStreetMap contributors © CARTO';

// Auth Configuration
export const TOKEN_KEY = 'agriflow_token';
export const USER_KEY = 'agriflow_user';
export const TOKEN_EXPIRY_DAYS = 7;

// SSE Configuration
export const SSE_RECONNECT_DELAY = 5000; // ms
export const SSE_HEARTBEAT_INTERVAL = 25000; // ms

// App Info
export const APP_NAME = 'AgriFlow';
export const APP_TAGLINE = 'National Intelligence Platform';
