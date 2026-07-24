import type { AIResult, TrashCategory } from './aiTypes';
import { mockResults } from './aiTypes';

export const predictCloudflare = async (imageSrc: string): Promise<AIResult> => {
  try {
    const response = await fetch('/api/cloudflare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageSrc }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Gagal mendapatkan analisis dari Cloudflare AI");
    }

    // Menggabungkan data Panduan Buang dan Tips dari mockResults berdasarkan kategorinya
    return {
      ...mockResults[result.data.category as TrashCategory],
      ...result.data
    } as AIResult;
  } catch (error) {
    console.error("Cloudflare Vision Error:", error);
    throw error;
  }
};
