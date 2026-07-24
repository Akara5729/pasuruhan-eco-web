export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

export const logToServer = async (level: LogLevel, message: string, data?: any) => {
  // Tetap tampilkan di browser console
  if (level === 'ERROR') console.error(message, data || '');
  else if (level === 'WARN') console.warn(message, data || '');
  else console.log(`[${level}] ${message}`, data || '');

  try {
    const payload = data ? `${message} | Data: ${JSON.stringify(data)}` : message;
    
    // Kirim ke backend secara background (tidak perlu await agar tidak memblokir UI)
    fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ level, message: payload })
    }).catch(() => {
      // Abaikan jika gagal (misal sedang offline)
    });
  } catch (e) {
    // Abaikan error logger
  }
};
