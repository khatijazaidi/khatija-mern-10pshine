import axios from 'axios';

// Use your API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Send logs from frontend to backend Pino logger.
 * @param {string} level - Log level ('info', 'error', 'warn', etc.)
 * @param {string} message - Main log message
 * @param {object} [meta={}] - Optional metadata (e.g., userId, page, action)
 */
export async function logEvent(level, message, meta = {}) {
  try {
    await axios.post(`${API_URL}/logs`, { level, message, meta });
  } catch (err) {
    // Avoid recursive logging (don’t log logging errors)
    console.error('Failed to send log:', err.message);
  }
}
