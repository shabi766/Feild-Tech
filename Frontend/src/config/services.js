export const SERVICE_PORTS = {
  GATEWAY: 8000,
  AUTH: 8001,
  WORKORDER: 8002,
  APPLICATION: 8003,
  NOTIFICATION: 8004,
  PAYMENT: 8005,
  CHAT: 8006,
  ADMIN: 8008, // Admin service running on 8008
  COMPANY: 8009,
  CLIENT: 8010,
  REVIEW: 8011,
  SEARCH: 8012,
};

export const getServiceUrl = (port) => `http://localhost:${port}/api/v1`;
