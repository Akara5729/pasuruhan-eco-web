export type TrashCategory = "PLASTIK" | "KERTAS" | "ORGANIK" | "RESIDU" | "BUKAN_SAMPAH" | "GAMBAR_BURAM";

export interface EcoValueInfo {
  basePrice: string;
  proTip: string;
  monthlyProjection: string;
}

export interface AIResult {
  category: TrashCategory;
  confidence: number;
  label: string;
  disposalGuide: string;
  ecoTip: string;
  ecoValue: EcoValueInfo | null;
}

export const mockResults: Record<TrashCategory, Omit<AIResult, 'confidence' | 'category'>> = {
  PLASTIK: {
    label: "Anorganik Plastik",
    disposalGuide: "Masukkan ke Tong Sampah Kuning / Setor ke Bank Sampah",
    ecoTip: "Remas botol plastik dan lepas tutupnya sebelum dibuang untuk menghemat ruang!",
    ecoValue: {
      basePrice: "Rp 2.000 - Rp 4.000 / kg",
      proTip: "TIPS MAHAL: Remukkan botol, buang isinya, dan pisahkan tutup/labelnya agar pengepul berani bayar harga maksimal!",
      monthlyProjection: "Jika kumpul 1 karung (±10kg) sebulan, Anda bisa dapat tambahan ~Rp 40.000 (Setara 2.5 liter beras!)"
    },
  },
  KERTAS: {
    label: "Anorganik Kertas",
    disposalGuide: "Masukkan ke Tong Sampah Biru",
    ecoTip: "Pastikan kertas tidak basah atau tercampur minyak agar bisa didaur ulang.",
    ecoValue: {
      basePrice: "Rp 1.500 - Rp 3.000 / kg",
      proTip: "TIPS MAHAL: Lipat pipih kardus, ikat dengan tali, dan pastikan kering bebas minyak agar harganya tidak anjlok.",
      monthlyProjection: "Kumpulkan tumpukan kardus 10kg sebulan, bisa untuk beli token listrik Rp 30.000!"
    },
  },
  ORGANIK: {
    label: "Organik",
    disposalGuide: "Masukkan ke Tong Sampah Hijau / Komposter",
    ecoTip: "Sisa makanan dan daun kering bisa dijadikan pupuk kompos yang menyuburkan tanah.",
    ecoValue: null,
  },
  RESIDU: {
    label: "Residu / B3",
    disposalGuide: "Masukkan ke Tong Sampah Merah",
    ecoTip: "Baterai dan limbah medis sangat berbahaya, pisahkan dari sampah rumah tangga lain.",
    ecoValue: null,
  },
  BUKAN_SAMPAH: {
    label: "Bukan Sampah",
    disposalGuide: "Tidak perlu dibuang!",
    ecoTip: "Tampaknya AI mendeteksi bahwa ini bukanlah sampah.",
    ecoValue: null,
  },
  GAMBAR_BURAM: {
    label: "Gambar Tidak Jelas",
    disposalGuide: "Mohon foto ulang",
    ecoTip: "Pastikan cahaya cukup terang dan kamera fokus pada sampah.",
    ecoValue: null,
  }
};
