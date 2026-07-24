export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const chatWithCloudflare = async (
  messages: ChatMessage[],
  onToken: (token: string) => void
): Promise<void> => {
  try {
    const response = await fetch('/api/chat-cloudflare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) throw new Error('Response body is null');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      const lines = buffer.split('\n');
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.trim() === 'data: [DONE]') return;
        
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6); // Remove 'data: '
          try {
            const json = JSON.parse(jsonStr);
            if (json.response) {
              onToken(json.response);
            }
          } catch (e) {
            // Abaikan error parsing JSON chunk yang terpotong
          }
        }
      }
    }
  } catch (error) {
    console.error('Cloudflare Chat Error:', error);
    throw new Error('Gagal terhubung ke Cloudflare AI. Pastikan internet Anda aktif dan API Key sudah dikonfigurasi.');
  }
};
