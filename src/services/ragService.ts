import { trashDictionary, unknownTrashFacts, type TrashFacts } from '../data/trashDictionary';

// Ekspor kamus untuk digunakan langsung di UI Katalog
export const ecoDictionary = trashDictionary;
export type { TrashFacts };

/**
 * Mencari data dari Kamus Sampah berdasarkan label dan kategori hasil AI Vision.
 * Menggunakan pencocokan kata kunci (keyword matching) untuk menemukan entri yang paling relevan.
 */
export const retrieveTrashContext = (label: string, kategori: string): TrashFacts => {
  const labelLower = label.toLowerCase();

  // Coba cocokkan dengan keywords di kamus
  let bestMatch: TrashFacts | undefined;
  let highestScore = 0;

  for (const entry of trashDictionary) {
    // Bonus score jika kategori cocok
    const categoryBonus = entry.kategori === kategori ? 2 : 0;

    // Hitung skor berdasarkan jumlah keyword yang cocok dengan label
    let score = categoryBonus;
    for (const keyword of entry.keywords) {
      if (labelLower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(labelLower)) {
        score += 3;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  // Jika skor terlalu rendah (hanya dapat category bonus atau tidak sama sekali), kembalikan entri generik per kategori
  if (!bestMatch || highestScore <= 2) {
    // Fallback ke entri pertama yang cocok kategorinya
    const categoryFallback = trashDictionary.find(e => e.kategori === kategori);
    if (categoryFallback) return categoryFallback;

    // Ultimate fallback: kembalikan data tidak diketahui
    return {
      namaResmi: label,
      kategori: kategori as TrashFacts['kategori'],
      subKategori: 'Tidak diketahui',
      keywords: [],
      ...unknownTrashFacts,
    };
  }

  return bestMatch;
};

/**
 * Memformat data kamus menjadi teks konteks yang siap diinjeksi ke System Prompt Llama 3.1.
 * Ini adalah inti dari RAG - "Augmented" step.
 */
export const buildRagContext = (facts: TrashFacts): string => {
  return `
=== KONTEKS SAMPAH DARI KAMUS LOKAL ===
Nama Resmi: ${facts.namaResmi}
Kategori: ${facts.kategori}
Sub-Kategori: ${facts.subKategori}

FAKTA MATERIAL:
- Deskripsi: ${facts.facts.materialDescription}
- Waktu Penguraian: ${facts.facts.decompositionTime}
- Nilai Ekonomi/Harga Jual: ${facts.facts.economicValue}
- Lokasi Penyetoran: ${facts.facts.buybackLocations.join(', ')}
- Dampak Lingkungan: ${facts.facts.ecoImpact}
- Bahaya: ${facts.facts.hazards.join('; ')}
- Metode Pengolahan: ${facts.facts.processingMethod}

IDE KREATIF DAUR ULANG (DIY):
${facts.facts.diyIdeas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}

PANDUAN PEMBUANGAN:
${facts.disposalTip}
=== AKHIR KONTEKS ===
`.trim();
};
