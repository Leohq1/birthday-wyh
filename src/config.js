const DEFAULT_CONFIG = {
  recipientName: '',
  message: 'Happy Birthday! Thank you for being you.',
  signature: '',
  typewriterSpeed: 50,
  backgroundColor: '#fce4ec',
};

let config = { ...DEFAULT_CONFIG };

export async function loadConfig() {
  try {
    const response = await fetch('/config.json');
    if (!response.ok) {
      console.warn('config.json not found, using defaults');
      return config;
    }
    const data = await response.json();
    config = { ...DEFAULT_CONFIG, ...data };
    if (!config.message || typeof config.message !== 'string') {
      console.warn('config.json missing required "message" field, using default');
      config.message = DEFAULT_CONFIG.message;
    }
  } catch (err) {
    console.warn('Failed to load config.json, using defaults:', err.message);
  }
  return config;
}

export function getConfig() {
  return config;
}
