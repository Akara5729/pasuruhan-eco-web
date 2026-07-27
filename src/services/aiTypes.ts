export type TrashCategory = "PLASTIK" | "KERTAS" | "ORGANIK" | "RESIDU" | "BUKAN_SAMPAH";

export interface AIResult {
  category: TrashCategory;
  confidence: number;
  label: string;
  disposalGuide: string;
  ecoTip: string;
  ecoPoints: number;
}

export const mockResults: Record<TrashCategory, Omit<AIResult, 'confidence' | 'category'>> = {
  PLASTIK: {
    label: "Anorganik Plastik",
    disposalGuide: "Masukkan ke Tong Sampah Kuning / Setor ke Bank Sampah",
    ecoTip: "Remas botol plastik dan lepas tutupnya sebelum dibuang untuk menghemat ruang!",
    ecoPoints: 150,
  },
  KERTAS: {
    label: "Anorganik Kertas",
    disposalGuide: "Masukkan ke Tong Sampah Biru",
    ecoTip: "Pastikan kertas tidak basah atau tercampur minyak agar bisa didaur ulang.",
    ecoPoints: 50,
  },
  ORGANIK: {
    label: "Organik",
    disposalGuide: "Masukkan ke Tong Sampah Hijau / Komposter",
    ecoTip: "Sisa makanan dan daun kering bisa dijadikan pupuk kompos yang menyuburkan tanah.",
    ecoPoints: 0,
  },
  RESIDU: {
    label: "Residu / B3",
    disposalGuide: "Masukkan ke Tong Sampah Merah",
    ecoTip: "Baterai dan limbah medis sangat berbahaya, pisahkan dari sampah rumah tangga lain.",
    ecoPoints: 0,
  },
  BUKAN_SAMPAH: {
    label: "Bukan Sampah",
    disposalGuide: "Tidak perlu dibuang!",
    ecoTip: "Tampaknya AI mendeteksi bahwa ini bukanlah sampah.",
    ecoPoints: 0,
  }
};
