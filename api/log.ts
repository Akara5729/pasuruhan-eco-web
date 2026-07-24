import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { level, message } = req.body || {};
    
    let color = '\x1b[37m'; 
    if (level === 'ERROR') color = '\x1b[31m'; 
    else if (level === 'WARN') color = '\x1b[33m'; 
    else if (level === 'INFO') color = '\x1b[36m'; 
    else if (level === 'SUCCESS') color = '\x1b[32m'; 
    
    // In Vercel, console.log goes to the Deployment Logs dashboard
    console.log(`${color}[FRONTEND ${level}]\x1b[0m ${message}`);
    
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(400).send("Bad Request");
  }
}
