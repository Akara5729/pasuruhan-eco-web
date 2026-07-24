// ============================================================
// KAMUS SAMPAH PASURAHAN ECO-WEB (RAG Database)
// Sumber data: Standar KLHK, SNI, dan harga pasar pengepul
// Indonesia (2024). Digunakan sebagai konteks absolut untuk
// meminimalisir halusinasi Llama 3.1.
// ============================================================

export interface TrashFacts {
  namaResmi: string;
  kategori: 'PLASTIK' | 'KERTAS' | 'ORGANIK' | 'RESIDU';
  subKategori: string;
  keywords: string[];
  facts: {
    materialDescription: string;
    decompositionTime: string;
    economicValue: string;
    buybackLocations: string[];
    diyIdeas: string[];
    hazards: string[];
    ecoImpact: string;
    processingMethod: string;
  };
  disposalTip: string;
}

export const trashDictionary: TrashFacts[] = [

  // ==================== PLASTIK ====================
  {
    namaResmi: "Botol Plastik (PET/PETE)",
    kategori: "PLASTIK",
    subKategori: "Plastik Keras (Rigid Plastic)",
    keywords: ["botol", "plastik", "pet", "pete", "aqua", "le minerale", "vit", "club", "air mineral", "minuman", "botol minuman", "botol bening"],
    facts: {
      materialDescription: "Botol terbuat dari polietilena tereftalat (PET). Ditandai dengan kode daur ulang angka 1 di bagian bawah. Digunakan untuk wadah minuman sekali pakai.",
      decompositionTime: "450 hingga 1.000 tahun",
      economicValue: "Rp 2.000 - Rp 4.000 per kilogram di pengepul/bank sampah. Sekitar 25-30 botol 600ml setara 1 kg.",
      buybackLocations: ["Bank Sampah setempat", "Pengepul/lapak barang bekas", "TPS 3R (Tempat Pengelolaan Sampah Reduce Reuse Recycle)"],
      diyIdeas: ["Pot tanaman vertikal (dipotong dan dicat)", "Celengan anak edukatif", "Tempat pensil dekorasi", "Lampu botol dengan LED fairy lights", "Saringan/filter air sederhana"],
      hazards: ["Dapat terurai menjadi mikroplastik yang mencemari air tanah dan sungai", "Jika dibakar menghasilkan gas beracun (dioksin)", "Mikroplastik dapat masuk ke rantai makanan melalui ikan dan air minum"],
      ecoImpact: "1 botol plastik yang berhasil didaur ulang menghemat energi setara menyalakan bola lampu 60 watt selama 6 jam.",
      processingMethod: "Dikumpulkan, dicacah (shredding), dilebur, dibentuk menjadi granul plastik baru untuk produk tekstil (fleece), karpet, atau botol baru."
    },
    disposalTip: "Pastikan botol kosong dan bersih sebelum dibuang. Lepas tutup botol karena berbeda jenis plastik. Remas untuk menghemat ruang di tong sampah."
  },
  {
    namaResmi: "Kantong Kresek / Tas Plastik",
    kategori: "PLASTIK",
    subKategori: "Plastik Lunak (Soft Plastic / LDPE)",
    keywords: ["kresek", "kantong", "kantong plastik", "tas plastik", "plastik kresek", "tas belanja", "kantong belanja", "plastik tipis"],
    facts: {
      materialDescription: "Terbuat dari polietilena densitas rendah (LDPE), ditandai kode angka 4. Jenis plastik yang paling banyak mencemari lautan dunia.",
      decompositionTime: "10 hingga 20 tahun (tapi pecah menjadi mikroplastik, tidak benar-benar terurai).",
      economicValue: "Rp 500 - Rp 1.500 per kilogram. Nilai sangat rendah karena tipis dan ringan. Banyak pengepul tidak mau menerimanya.",
      buybackLocations: ["Bank Sampah yang khusus menerima plastik lunak", "Mesin pengumpul plastik (beberapa supermarket besar)"],
      diyIdeas: ["Dianyam menjadi tas belanja yang kuat (plarn/plastic yarn)", "Bahan isian bantal", "Pelindung tanaman dari hujan (sementara)", "Tas sampah kecil pengganti"],
      hazards: ["Sangat mudah terbawa angin dan masuk ke saluran air/got menyebabkan banjir", "Sangat berbahaya jika tertelan hewan ternak atau satwa liar", "Sulit didaur ulang karena sering kotor dan terkontaminasi"],
      ecoImpact: "Indonesia menghasilkan sekitar 64 juta ton sampah per tahun, dan plastik kresek menjadi penyumbang utama polusi sungai dan laut.",
      processingMethod: "Dikumpulkan dalam jumlah besar lalu diproses menjadi paving block plastik atau pot tanaman berbahan plastik daur ulang."
    },
    disposalTip: "JANGAN dibuang sembarangan atau dibakar. Kumpulkan dalam 1 plastik besar lalu serahkan ke Bank Sampah. Lebih baik lagi: ganti dengan tas belanja kain."
  },
  {
    namaResmi: "Kemasan Plastik Sachet / Saset",
    kategori: "PLASTIK",
    subKategori: "Plastik Laminasi Multi-Layer",
    keywords: ["saset", "sachet", "bungkus", "kopi saset", "mie instan", "sampo sachet", "kecap saset", "bungkus snack", "plastik laminasi", "foil", "kemasan indomie", "indomie", "mie"],
    facts: {
      materialDescription: "Terbuat dari lapisan plastik berlapis (multi-layer: PET + Aluminium Foil + PE). Desain ini membuat produk tahan lama, namun sangat sulit didaur ulang karena lapisan-lapisannya tidak bisa dipisahkan.",
      decompositionTime: "100 hingga 500 tahun di alam bebas.",
      economicValue: "Hampir tidak memiliki nilai ekonomi di pengepul konvensional. Beberapa bank sampah inovatif mengolahnya menjadi Rp 200 - Rp 500 per kg untuk bahan paving block.",
      buybackLocations: ["Program daur ulang khusus (seperti Waste4Change, Rekosistem)", "Bank Sampah yang bermitra dengan program Extended Producer Responsibility (EPR)"],
      diyIdeas: ["Ecobrick (dipadatkan ke dalam botol plastik sebagai bahan bangunan)", "Tas anyam dari sachet kopi atau detergen yang sudah dicuci bersih", "Dompet unik dari kemasan refill"],
      hazards: ["Jika dibakar, lapisan aluminium menghasilkan asap sangat beracun", "Sering tersebar ke saluran air karena ringan dan kecil", "Bukan kandidat daur ulang konvensional"],
      ecoImpact: "Salah satu jenis sampah paling sulit diatasi di Indonesia. Program EPR (produsen bertanggung jawab) sedang digalakkan pemerintah.",
      processingMethod: "Ecobrick: dijejal padat ke botol plastik lalu jadi bahan konstruksi. Atau dikumpulkan massal untuk diproses menjadi bahan bakar minyak (pirolisis)."
    },
    disposalTip: "Buat Ecobrick dari botol bekas dan isi dengan sampah sachet kering. Butuh sekitar 30-50 sachet untuk mengisi 1 botol. Ecobrick bisa diserahkan ke sekolah atau komunitas."
  },
  {
    namaResmi: "Gayung / Ember / Peralatan Plastik Keras Rumah Tangga",
    kategori: "PLASTIK",
    subKategori: "Plastik Keras Tebal (PP/HDPE)",
    keywords: ["gayung", "ember", "baskom", "timba", "kotak plastik", "peralatan plastik", "kursi plastik", "meja plastik", "hdpe", "pp", "polipropilen"],
    facts: {
      materialDescription: "Terbuat dari polipropilena (PP, kode 5) atau HDPE (kode 2). Lebih tebal dan tahan lama dari botol minuman biasa. Kode 2 dan 5 adalah plastik paling mudah didaur ulang.",
      decompositionTime: "20 hingga 30 tahun.",
      economicValue: "Rp 1.500 - Rp 3.000 per kilogram. Karena tebal, mudah dikumpulkan dalam volume berat.",
      buybackLocations: ["Tukang loak / pengepul barang bekas", "Bank Sampah"],
      diyIdeas: ["Ember rusak dijadikan pot tanaman besar", "Baskom dijadikan kolam ikan kecil", "Gayung pecah menjadi sekop tanaman"],
      hazards: ["Relatif aman jika tidak dibakar", "Jika terurai di alam, mengkontaminasi tanah"],
      ecoImpact: "Plastik HDPE adalah salah satu yang paling aktif didaur ulang di dunia karena kualitas materialnya yang bagus.",
      processingMethod: "Dicacah dan dilebur menjadi granul untuk produk plastik tebal baru seperti pipa, lantai plastik, atau produk taman."
    },
    disposalTip: "Pastikan bersih dari sisa kotoran. Serahkan ke pengepul atau bank sampah. Pertimbangkan untuk memperbaiki daripada membuang (lem plastik)."
  },
  {
    namaResmi: "Styrofoam / Gabus Putih (EPS)",
    kategori: "RESIDU",
    subKategori: "Plastik Berbusa (Expanded Polystyrene)",
    keywords: ["styrofoam", "gabus", "stereofoam", "busa putih", "kotak styrofoam", "wadah styrofoam", "tempat makanan styrofoam", "eps", "polystyrene"],
    facts: {
      materialDescription: "Terbuat dari polistirena yang diperluas (EPS, kode 6). Terdiri dari 98% udara. Sangat ringan dan mudah terbawa angin.",
      decompositionTime: "Lebih dari 500 tahun. Tidak benar-benar terurai, hanya hancur menjadi butiran-butiran kecil (bead) yang sangat berbahaya.",
      economicValue: "Sangat rendah, hampir tidak ada nilai di pengepul biasa. Beberapa pabrik khusus menerimanya dengan harga Rp 200-500/kg dalam jumlah besar.",
      buybackLocations: ["Sangat sedikit. Cari program daur ulang EPS khusus di kota besar."],
      diyIdeas: ["Pengganjal pot tanaman agar drainage baik (diletakkan di dasar pot)", "Bahan isolasi suhu buatan sendiri (pemanasan/pendinginan sementara)", "Media tanam hidroponik sementara"],
      hazards: ["Sangat mudah terbang dan mencemari lingkungan", "Butiran kecilnya sering dimakan oleh ikan dan burung karena mirip telur ikan", "Mengandung benzena dan stirena yang bersifat karsinogenik jika dipanaskan atau dibakar"],
      ecoImpact: "Butiran EPS ditemukan di hampir semua pantai di seluruh dunia dan susah dibersihkan.",
      processingMethod: "Metode kimia (dissolving dengan aseton/alkohol) untuk memadatkan volumenya sebelum dikirim ke pabrik. JANGAN DIBAKAR."
    },
    disposalTip: "Masukkan ke tong sampah RESIDU (merah). JANGAN dibakar. JANGAN dibuang ke sungai/got. Kumpulkan dalam kantong tertutup untuk mencegahnya terbawa angin."
  },

  // ==================== KERTAS ====================
  {
    namaResmi: "Kardus / Karton Gelombang",
    kategori: "KERTAS",
    subKategori: "Kertas Karton",
    keywords: ["kardus", "karton", "dus", "kotak karton", "kotak bekas", "dus bekas", "packaging karton", "kotak pengiriman", "corrugated"],
    facts: {
      materialDescription: "Terbuat dari serat kayu daur ulang yang diproses menjadi lapisan bergelombang (corrugated). Sangat mudah didaur ulang dan terurai secara alami.",
      decompositionTime: "2 hingga 6 bulan di alam (terurai secara biologis).",
      economicValue: "Rp 1.500 - Rp 2.500 per kilogram. Salah satu kertas dengan nilai tertinggi di pengepul karena bobotnya.",
      buybackLocations: ["Tukang loak / pengepul barang bekas", "Bank Sampah", "Tukang rongsok keliling"],
      diyIdeas: ["Kotak penyimpanan / organizer DIY", "Mainan anak (mobil-mobilan, rumah-rumahan)", "Media tanam benih (langsung tanam dengan kotaknya)", "Bahan kerajinan seni dan lukis", "Pupuk kompos (sobek kecil-kecil, campurkan ke kompos)"],
      hazards: ["Minim bahaya lingkungan", "Jika basah/lembab, bisa menjadi sarang kecoa dan tikus"],
      ecoImpact: "Mendaur ulang 1 ton kardus menghemat sekitar 17 pohon, 26.000 liter air, dan 4.100 kWh energi.",
      processingMethod: "Dikumpulkan, dipres menjadi bal besar, dikirim ke pabrik kertas untuk dijadikan bubur kertas (pulp), lalu dicetak menjadi kardus baru."
    },
    disposalTip: "Simpan dalam kondisi kering. Ratakan (dilipat) untuk menghemat ruang sebelum disetorkan. Pisahkan dari kardus yang basah atau berminyak (tidak laku)."
  },
  {
    namaResmi: "Kertas HVS / Kertas Bekas Tulis",
    kategori: "KERTAS",
    subKategori: "Kertas Putih",
    keywords: ["kertas", "hvs", "kertas tulis", "kertas buku", "kertas sekolah", "kertas bekas", "buku bekas", "kertas printer", "kertas putih"],
    facts: {
      materialDescription: "Kertas putih berkualitas tinggi, terbuat dari serat selulosa kayu yang diputihkan. Salah satu bahan yang paling mudah dan menguntungkan untuk didaur ulang.",
      decompositionTime: "2 hingga 5 bulan.",
      economicValue: "Rp 1.000 - Rp 2.000 per kilogram.",
      buybackLocations: ["Bank Sampah", "Tukang loak", "Pengepul kertas"],
      diyIdeas: ["Kertas daur ulang buatan tangan (untuk kartu ucapan atau buku harian)", "Kertas serbuk untuk pembungkus hadiah", "Bahan kompos"],
      hazards: ["Tidak berbahaya. Hindari kertas yang terkontaminasi bahan kimia (kertas receipt/struk kasir)"],
      ecoImpact: "Mendaur ulang 1 rim kertas (500 lembar) setara menyelamatkan sebagian dari 1 pohon.",
      processingMethod: "Direndam air, dihancurkan menjadi pulp, disaring dari tinta (de-inking), lalu dicetak ulang menjadi kertas baru atau tisu."
    },
    disposalTip: "Pisahkan dari kertas berminyak, kertas receipt kasir (mengandung BPA), dan kardus. Ikat dengan karet agar tidak berantakan saat dibawa."
  },
  {
    namaResmi: "Koran / Majalah / Buku Bekas",
    kategori: "KERTAS",
    subKategori: "Kertas Cetak",
    keywords: ["koran", "majalah", "buku", "tabloid", "brosur", "koran bekas", "majalah bekas", "buku bekas", "kertas koran"],
    facts: {
      materialDescription: "Kertas koran terbuat dari serat kayu dengan kualitas rendah (newsprint). Warnanya agak kekuningan dan cepat menguning jika terkena cahaya.",
      decompositionTime: "6 bulan hingga 1 tahun.",
      economicValue: "Rp 800 - Rp 1.500 per kilogram.",
      buybackLocations: ["Tukang loak / rongsok keliling", "Bank Sampah"],
      diyIdeas: ["Pembungkus barang pecah belah saat pindahan", "Alas cat saat mengecat", "Bahan kompos yang sangat baik", "Origami dan seni kertas", "Bahan baku papier-mâché"],
      hazards: ["Tinta cetak lama (berbasis minyak) mengandung logam berat, namun proses daur ulang modern sudah aman"],
      ecoImpact: "Daur ulang koran mengurangi kebutuhan pohon pinus dan ekaliptus secara signifikan.",
      processingMethod: "Dijadikan pulp, tinta dihilangkan, lalu dicetak ulang menjadi koran baru atau kertas pembungkus coklat."
    },
    disposalTip: "Kumpulkan dalam kondisi kering. Koran basah nilai jualnya sangat turun. Boleh diikat tali atau dimasukkan dalam kardus."
  },

  // ==================== ORGANIK ====================
  {
    namaResmi: "Sisa Makanan / Sayuran / Buah",
    kategori: "ORGANIK",
    subKategori: "Sampah Organik Basah",
    keywords: ["sisa makanan", "nasi", "sayur", "sayuran", "buah", "kulit buah", "wortel", "bayam", "kangkung", "tomat", "cabe", "bawang", "makanan basi", "sisa nasi", "kulit pisang", "kulit mangga"],
    facts: {
      materialDescription: "Sampah organik basah yang kaya nutrisi. Sangat mudah terurai secara biologis dan menjadi sumber daya berharga untuk tanah pertanian.",
      decompositionTime: "1 hingga 3 minggu dengan pengomposan yang benar.",
      economicValue: "Secara langsung tidak memiliki nilai jual. Namun jika dikomposkan, 100 kg sampah organik bisa menghasilkan 30-40 kg pupuk kompos senilai Rp 1.500 - Rp 2.000 per kg.",
      buybackLocations: ["Komposter komunal desa", "Bank Sampah yang menerima organik", "Langsung dijadikan kompos mandiri di rumah"],
      diyIdeas: ["Pupuk kompos untuk kebun (metode takakura atau komposter)", "Pupuk cair fermentasi (eco-enzyme) dengan campuran gula dan air", "Pakan ternak (ayam, kambing, ikan)", "Larva BSF (Black Soldier Fly) untuk pakan ternak protein tinggi"],
      hazards: ["Jika dibiarkan menumpuk, menjadi sumber bau, lalat, dan gas metana (rumah kaca)", "Cairan lindi dari sampah organik bisa mencemari tanah dan air tanah"],
      ecoImpact: "Sampah organik yang berakhir di TPA menghasilkan gas metana, 25x lebih kuat dari CO2 sebagai gas rumah kaca.",
      processingMethod: "Pengomposan aerobik (dengan oksigen): dicacah, dicampur dengan bahan kering (daun), diaduk rutin. Atau metode biogas untuk menghasilkan energi."
    },
    disposalTip: "Pisahkan segera dari sampah lain. Masukkan ke komposter atau tong organik. Tambahkan EM4 (Effective Microorganism) untuk mempercepat penguraian dan mengurangi bau."
  },
  {
    namaResmi: "Daun Kering / Ranting / Rumput",
    kategori: "ORGANIK",
    subKategori: "Sampah Organik Kering",
    keywords: ["daun", "daun kering", "ranting", "rumput", "potongan tanaman", "dedaunan", "sampah kebun", "sampah halaman", "daun gugur", "jerami", "sekam"],
    facts: {
      materialDescription: "Bahan organik kering yang kaya karbon. Merupakan komponen ideal dalam pembuatan kompos (sebagai 'bahan coklat').",
      decompositionTime: "3 bulan hingga 1 tahun tergantung ukuran.",
      economicValue: "Tidak memiliki nilai jual langsung. Sebagai bahan kompos, memiliki nilai ekonomi tidak langsung.",
      buybackLocations: ["Tidak ada nilai jual di pengepul"],
      diyIdeas: ["Bahan kompos utama ('bahan coklat' yang menyeimbangkan bahan hijau)", "Mulsa (penutup tanah untuk menjaga kelembaban dan mencegah gulma)", "Biochar jika dibakar dengan oksigen terbatas (tidak dianjurkan di permukiman)", "Alas kandang ternak"],
      hazards: ["Relatif aman. Penumpukan daun basah bisa menjadi sarang nyamuk"],
      ecoImpact: "Daun kering yang dikembalikan ke tanah adalah cara paling alami mendaur ulang nutrisi hutan.",
      processingMethod: "Langsung dikomposkan atau dijadikan mulsa. Idealnya dicacah dulu agar lebih cepat terurai."
    },
    disposalTip: "Jangan dibakar (mencemari udara). Tumpuk di pojok kebun, biarkan terurai secara alami (metode sheet mulching). Atau masukkan ke komposter bersama sampah dapur."
  },
  {
    namaResmi: "Ampas Kopi / Teh",
    kategori: "ORGANIK",
    subKategori: "Sampah Organik Dapur",
    keywords: ["ampas kopi", "kopi", "ampas teh", "teh", "bubuk kopi", "sachet teh", "teh celup"],
    facts: {
      materialDescription: "Limbah dapur yang kaya nitrogen dan nutrisi. Sangat bermanfaat untuk pertanian organik.",
      decompositionTime: "1 hingga 2 minggu.",
      economicValue: "Tidak ada nilai jual. Namun sangat bernilai sebagai pupuk organik gratis.",
      buybackLocations: ["Tidak ada nilai jual"],
      diyIdeas: ["Pupuk langsung ke tanah (tabur di sekitar tanaman)", "Penolak hama alami (serangga tidak suka aroma kopi)", "Scrub kulit alami (campurkan dengan minyak kelapa)", "Menyuburkan tanaman cabe, tomat, dan tanaman buah"],
      hazards: ["Perhatian: kantong/sachet teh sering mengandung plastik mikro, pisahkan ampasnya saja"],
      ecoImpact: "Memanfaatkan ampas kopi/teh mengurangi volume sampah organik dan kebutuhan pupuk kimia.",
      processingMethod: "Taburkan langsung ke tanah atau campur ke komposter sebagai aktivator (mempercepat pengomposan)."
    },
    disposalTip: "Kumpulkan ampas kopi/teh dalam wadah kecil. Taburkan langsung ke pot tanaman atau kebun. Jangan membuangnya ke saluran air."
  },

  // ==================== RESIDU / B3 ====================
  {
    namaResmi: "Puntung Rokok",
    kategori: "RESIDU",
    subKategori: "Limbah Beracun Ringan",
    keywords: ["rokok", "puntung", "puntung rokok", "batang rokok", "filter rokok", "bekas rokok", "cigarette butt"],
    facts: {
      materialDescription: "Filter puntung rokok terbuat dari selulosa asetat (jenis plastik) yang mengandung ribuan zat kimia beracun: nikotin, formaldehida, arsenik, dan timbal yang terserap dari asap rokok.",
      decompositionTime: "10 hingga 15 tahun. Selulosa asetat akan hancur menjadi fragmen mikro, bukan benar-benar terurai.",
      economicValue: "Tidak ada nilai ekonomi konvensional. Program khusus (seperti TerraCycle) membayar sekitar Rp 50-100 per puntung dalam program recycle khusus.",
      buybackLocations: ["Program TerraCycle (online)", "Inisiatif komunitas lingkungan tertentu"],
      diyIdeas: ["Penolak hama tanaman: rendam puntung dalam air 24 jam, semprot ke tanaman (HATI-HATI: Nikotin beracun untuk banyak serangga DAN manusia)", "Lebih baik tidak ada DIY, langsung buang ke tempat khusus"],
      hazards: ["Zat beracun dari puntung dapat larut dalam air hujan dan mencemari sungai", "1 puntung dapat mencemari hingga 1.000 liter air", "Nikotin dan logam berat berbahaya untuk biota air dan hewan tanah", "JANGAN dibuang sembarangan atau ke got/sungai"],
      ecoImpact: "Puntung rokok adalah sampah yang paling sering ditemukan di pantai dan sungai di seluruh dunia. Sekitar 4,5 triliun puntung dibuang sembarangan setiap tahun.",
      processingMethod: "Tidak bisa didaur ulang secara konvensional. Harus dimusnahkan di insinerator bersuhu tinggi atau melalui program khusus seperti TerraCycle."
    },
    disposalTip: "WAJIB dipadamkan sempurna (celupkan ke air) sebelum dibuang. Masukkan ke tong sampah RESIDU (merah), JANGAN ke got/sungai/tanah. Ajarkan kebiasaan ini ke masyarakat."
  },
  {
    namaResmi: "Baterai Bekas",
    kategori: "RESIDU",
    subKategori: "Limbah B3 (Berbahaya dan Beracun)",
    keywords: ["baterai", "battery", "baterai AA", "baterai AAA", "baterai remote", "baterai mainan", "baterai jam", "baterai kotak", "sel kering"],
    facts: {
      materialDescription: "Mengandung logam berat berbahaya: merkuri (air raksa), kadmium, timbal, litium, dan mangan. Tergolong Limbah B3 (Berbahaya dan Beracun) sesuai regulasi KLHK Indonesia.",
      decompositionTime: "100 tahun. Namun bahan kimia di dalamnya bocor ke tanah jauh sebelum itu.",
      economicValue: "Tidak ada nilai jual. Sebaliknya, pembuangan yang salah dapat menimbulkan biaya remediasi lingkungan yang sangat besar.",
      buybackLocations: ["Tempat pengumpulan B3 khusus (Hazardous Waste Facility)", "Beberapa toko elektronik besar yang memiliki program take-back", "Program pengumpulan komunal pemerintah daerah"],
      diyIdeas: ["TIDAK DIANJURKAN. Tidak ada penggunaan ulang yang aman untuk baterai bekas oleh masyarakat awam."],
      hazards: ["1 baterai AA dapat mencemari 600.000 liter air tanah", "Merkuri menyerang sistem saraf, terutama berbahaya untuk anak-anak dan ibu hamil", "Kadmium menyebabkan kerusakan ginjal dan kanker", "JANGAN sesekali membuka atau menghancurkan baterai"],
      ecoImpact: "Limbah B3 yang tidak dikelola dengan benar adalah ancaman serius bagi kesehatan masyarakat generasi mendatang.",
      processingMethod: "Harus dikirim ke fasilitas pengolah limbah B3 berlisensi untuk dinetralkan dan logam berharganya (kobalt, mangan) di-recovery secara aman."
    },
    disposalTip: "Simpan dalam wadah kering dan tertutup. Kumpulkan hingga banyak lalu serahkan ke tempat pengumpulan B3, dinas lingkungan hidup setempat, atau toko elektronik yang menerimanya."
  },
  {
    namaResmi: "Bola Lampu Bekas",
    kategori: "RESIDU",
    subKategori: "Limbah B3 (Berbahaya dan Beracun)",
    keywords: ["lampu", "bola lampu", "lampu bekas", "lampu neon", "lampu TL", "lampu pijar", "lampu LED bekas", "lampu bohlam", "lampu hemat energi", "CFL"],
    facts: {
      materialDescription: "Lampu neon/CFL/TL mengandung uap merkuri (raksa) di dalamnya. Lampu LED mengandung timbal dan arsenik. Lampu pijar (incandescent) relatif lebih aman namun tetap mengandung tungsten.",
      decompositionTime: "Komponen kaca: ratusan tahun. Bahan kimia di dalamnya: sangat berbahaya sebelum terurai.",
      economicValue: "Tidak ada nilai jual untuk lampu bekas. Bahkan bisa dikenakan biaya pembuangan jika diserahkan ke fasilitas khusus.",
      buybackLocations: ["Program take-back produsen lampu (Philips, Osram, dll.)", "Dinas Lingkungan Hidup setempat", "Fasilitas pengolah limbah B3"],
      diyIdeas: ["Lampu bohlam bekas bisa menjadi vas bunga mini atau terrarium jika BERHATI-HATI saat membersihkan bagian dalam.", "PERHATIAN: Lampu neon/CFL TIDAK BOLEH dibuat DIY karena mengandung merkuri."],
      hazards: ["Lampu neon yang pecah melepas uap merkuri yang berbahaya jika terhirup", "Jika pecah di dalam ruangan: buka jendela, hindari kontak langsung, bersihkan dengan kain lembab bukan disapu (agar tidak menyebarkan debu merkuri)", "JANGAN dibuang ke tempat sampah biasa"],
      ecoImpact: "Pembuangan lampu neon sembarangan adalah sumber utama kontaminasi merkuri di tempat pembuangan sampah.",
      processingMethod: "Di fasilitas khusus, kaca dipisah, gas merkuri di-recovery dan dimurnikan, logam komponen di-recycle."
    },
    disposalTip: "Masukkan ke dalam wadah/kotak agar tidak pecah. Beri label 'BERBAHAYA - LAMPU BEKAS'. Serahkan ke toko lampu, dinas LH, atau fasilitas B3. JANGAN dibuang ke tempat sampah umum."
  },
  {
    namaResmi: "Minyak Goreng Bekas (Jelantah)",
    kategori: "RESIDU",
    subKategori: "Limbah Cair Berbahaya",
    keywords: ["minyak goreng", "jelantah", "minyak bekas", "minyak goreng bekas", "oli bekas", "minyak dapur"],
    facts: {
      materialDescription: "Minyak goreng yang telah digunakan berkali-kali mengandung senyawa akrolein, aldehida, dan polimer yang bersifat karsinogenik. Sangat berbahaya jika dikonsumsi, namun sangat berharga jika diolah.",
      decompositionTime: "Dalam air: mencemari selama bertahun-tahun karena membentuk lapisan yang menghalangi oksigen.",
      economicValue: "Rp 4.000 - Rp 7.000 per liter (2024). Nilai cukup tinggi! Minyak jelantah adalah bahan baku biodiesel.",
      buybackLocations: ["Program Jelantahku milik pemerintah daerah", "Pengepul jelantah keliling", "Bank Sampah yang menerima jelantah", "Startup pengolah biodiesel (Rekosistem, dll.)"],
      diyIdeas: ["Bahan baku sabun cuci tradisional (dicampur soda api/NaOH)", "Pelumas sederhana untuk engsel pintu atau mesin kecil (tidak untuk mesin besar)", "Bahan lilin hias (dicampur sumbu dan pewarna)"],
      hazards: ["1 liter minyak jelantah yang dibuang ke saluran air dapat mencemari hingga 1 juta liter air", "Memblokir saluran air dan got, menyebabkan banjir", "Lapisan minyak di permukaan air menghalangi oksigen sehingga ikan dan biota mati"],
      ecoImpact: "Minyak jelantah yang diolah menjadi biodiesel menghasilkan bahan bakar yang lebih bersih dari solar, mengurangi emisi CO2 hingga 78%.",
      processingMethod: "Dikumpulkan, disaring, dipanaskan untuk menghilangkan air, lalu diproses kimia (transesterifikasi) menjadi biodiesel yang bisa digunakan oleh mesin diesel."
    },
    disposalTip: "Simpan dalam botol plastik tertutup. JANGAN buang ke wastafel, got, atau tanah. Setorkan ke bank sampah/pengepul jelantah untuk mendapatkan uang tunai atau poin!"
  },
  {
    namaResmi: "Popok Bayi / Pembalut Sekali Pakai",
    kategori: "RESIDU",
    subKategori: "Limbah Higienis",
    keywords: ["popok", "pampers", "diaper", "pembalut", "popok bayi", "popok bekas", "pembalut wanita", "pantyliner"],
    facts: {
      materialDescription: "Campuran kompleks dari plastik (polietilena, polipropilena), pulp selulosa, Super Absorbent Polymer (SAP), karet elastis, dan perekat. Sangat sulit didaur ulang karena bahan campurannya dan kontaminasi biologis.",
      decompositionTime: "200 hingga 500 tahun.",
      economicValue: "Tidak ada nilai jual. Termasuk limbah higienis yang harus dibuang khusus.",
      buybackLocations: ["Tidak ada"],
      diyIdeas: ["SAP (Super Absorbent Polymer) dari popok bersih bisa diekstrak untuk media tanam hidroponik tanaman non-pangan (sebagai eksperimen)", "Tidak ada DIY untuk popok yang sudah digunakan"],
      hazards: ["Mengandung patogen (bakteri, virus) dari limbah manusia jika sudah digunakan", "JANGAN dibuang ke saluran air, got, atau sungai (menyumbat dan mencemari air)", "Bakteri dari kotoran bayi dapat menyebabkan penyakit E.coli, hepatitis A", "JANGAN dibakar karena menghasilkan dioksin dari komponen plastik"],
      ecoImpact: "Sebuah keluarga dengan 1 bayi menghasilkan sekitar 2.500-3.000 popok per tahun. Ini setara dengan 1 ton sampah popok per bayi.",
      processingMethod: "Di fasilitas khusus, disterilisasi dengan autoklaf, lalu dipisahkan komponen plastik, pulp, dan SAP untuk didaur ulang secara terpisah. Di Indonesia masih sangat terbatas."
    },
    disposalTip: "Bungkus rapat dengan kantong plastik sebelum dibuang ke tong sampah RESIDU. JANGAN dibuka atau diurai. JANGAN dibuang ke toilet, got, atau sungai. Ganti ke popok kain untuk mengurangi dampak lingkungan."
  },
  {
    namaResmi: "Kaleng Bekas (Aluminium / Tin Steel)",
    kategori: "PLASTIK", // Dalam konteks 4 kategori ini, kaleng masuk RESIDU di beberapa sistem, tapi lebih sering dikategorikan sebagai bisa didaur ulang
    subKategori: "Logam Daur Ulang",
    keywords: ["kaleng", "kaleng minuman", "kaleng makanan", "kaleng sarden", "kaleng susu", "kaleng cat", "kaleng rokok", "tin", "aluminium", "besi kaleng"],
    facts: {
      materialDescription: "Kaleng minuman terbuat dari aluminium murni (kode daur ulang 'ALU'). Kaleng makanan (sarden, kornet) terbuat dari baja lapis timah (tin-plated steel). Keduanya adalah material yang paling mudah dan menguntungkan untuk didaur ulang.",
      decompositionTime: "Aluminium: 80-200 tahun. Baja: 50 tahun.",
      economicValue: "Kaleng aluminium: Rp 10.000 - Rp 15.000 per kilogram (sangat tinggi!). Sekitar 70 kaleng minuman = 1 kg. Kaleng baja: Rp 500 - Rp 1.500 per kg.",
      buybackLocations: ["Pengepul barang bekas (sangat dicari!)", "Bank Sampah", "Tukang rongsok keliling"],
      diyIdeas: ["Pot tanaman unik (dicat dan diberi lubang drainase)", "Tempat pensil / organizer meja", "Lampu hias (dilubangi pola tertentu, masukkan lilin/LED)", "Celengan", "Tempat bumbu dapur", "Kaleng cat besar: ember cor/tempat sampah kecil"],
      hazards: ["Pinggiran kaleng yang terbuka sangat tajam, hati-hati saat handling", "Kaleng cat atau kaleng kimia: JANGAN disalahgunakan, buang sebagai RESIDU"],
      ecoImpact: "Mendaur ulang 1 kaleng aluminium menghemat energi yang cukup untuk menyalakan TV selama 3 jam. Aluminium bisa didaur ulang tanpa batas dan tidak kehilangan kualitas.",
      processingMethod: "Dikumpulkan, dipres menjadi bal, dilebur dalam dapur peleburan suhu tinggi, dicetak menjadi aluminium batangan (ingot) baru untuk produk baru."
    },
    disposalTip: "Cuci bersih, remuk agar tidak memakan tempat, dan kumpulkan dalam kantong atau kardus. Serahkan ke pengepul atau bank sampah untuk mendapatkan harga terbaik. Jangan campur dengan sampah lain."
  },
  {
    namaResmi: "Besi / Baja Bekas (Besi Tua)",
    kategori: "RESIDU",
    subKategori: "Logam Berat Daur Ulang",
    keywords: ["besi", "baja", "besi tua", "besi bekas", "logam", "paku", "kawat", "pipa besi", "seng", "atap seng", "besi cor"],
    facts: {
      materialDescription: "Material logam berbasis besi (ferrous metal). Sangat berat dan tahan lama. Industri baja adalah salah satu pemakai terbesar energi global.",
      decompositionTime: "Besi berkarat: 10-100 tahun. Baja stainless: hingga 1.000 tahun.",
      economicValue: "Rp 1.000 - Rp 3.000 per kilogram. Karena berat, mengumpulkan besi tua bisa sangat menguntungkan.",
      buybackLocations: ["Pengepul besi tua (mudah ditemukan di setiap kota)", "Tukang rongsok keliling", "Pabrik baja mini (untuk jumlah besar)"],
      diyIdeas: ["Besi pipa: pagar tanaman, rangka greenhouse sederhana", "Kawat: pengikat tanaman, kerajinan wire art", "Besi plat: alas kompor outdoor improvisasi"],
      hazards: ["Besi berkarat (karat tetanus) berbahaya jika melukai kulit, dapat menyebabkan tetanus", "Penanganan besi tua harus menggunakan sarung tangan tebal", "Hati-hati besi yang mengandung cat lama berbahan timbal"],
      ecoImpact: "Mendaur ulang baja menggunakan 75% lebih sedikit energi dibanding memproduksi baja baru dari bijih besi.",
      processingMethod: "Dikumpulkan, disortir, dipres, dan dilebur di Electric Arc Furnace (EAF) untuk membuat baja baru. Siklus daur ulang yang sangat efisien."
    },
    disposalTip: "Kumpulkan terpisah dari sampah lain. Gunakan karung goni atau wadah kuat karena berat. Jangan biarkan terkena hujan terus-menerus karena karat mengurangi nilai jual."
  },
  {
    namaResmi: "Limbah Elektronik / E-Waste",
    kategori: "RESIDU",
    subKategori: "Limbah B3 Elektronik",
    keywords: ["hp bekas", "handphone", "ponsel", "elektronik", "charger", "kabel", "laptop", "tv bekas", "kipas angin", "radio", "baterai hp", "ewaste", "e-waste", "barang elektronik", "gadget bekas"],
    facts: {
      materialDescription: "Mengandung campuran ratusan material: plastik, logam mulia (emas, perak, tembaga, palladium di PCB), logam berbahaya (timbal, merkuri, kadmium, berilium, dan arsenik). Sangat berbahaya jika dibakar atau dibuang sembarangan.",
      decompositionTime: "Ratusan hingga ribuan tahun tergantung komponen.",
      economicValue: "Di tangan pengepul e-waste profesional: bisa sangat tinggi. 1 ton PCB komputer mengandung sekitar 100-400g emas. Namun prosesnya memerlukan teknologi khusus.",
      buybackLocations: ["Pengepul e-waste berlisensi", "Program take-back pabrikan (Samsung, Apple, dll.)", "Event pengumpulan e-waste Dinas LH", "Startup e-waste (Greeners, dll.)"],
      diyIdeas: ["HP lama: dijadikan kamera keamanan (CCTV) menggunakan aplikasi", "Laptop lama: server media lokal atau mesin belajar anak", "Komponen kecil: upcycling untuk seni elektronik (dengan keahlian teknis)"],
      hazards: ["Timbal merusak sistem saraf dan otak, terutama berbahaya untuk anak-anak", "Merkuri dari layar LCD sangat beracun", "Jika dibakar oleh pemulung informal, asap mengandung dioksin dan furan kelas 1 karsinogen", "JANGAN membuang ke tempat sampah biasa"],
      ecoImpact: "Indonesia menghasilkan sekitar 1,8 juta ton e-waste per tahun. Hanya sekitar 1% yang ditangani secara resmi.",
      processingMethod: "Di fasilitas khusus: dismantling manual untuk memisahkan komponen, smelting dan refining untuk recovery logam mulia, dan imobilisasi senyawa beracun."
    },
    disposalTip: "Simpan di rumah terlebih dahulu. Nantikan event pengumpulan e-waste dari pemerintah atau komunitas. JANGAN membuang atau membakar. Cek program trade-in merek HP Anda untuk HP lama."
  },
  {
    namaResmi: "Pecahan Kaca / Botol Kaca",
    kategori: "RESIDU",
    subKategori: "Material Tajam Berbahaya",
    keywords: ["kaca", "botol kaca", "pecahan kaca", "gelas kaca", "cermin", "glass", "piring kaca", "beling"],
    facts: {
      materialDescription: "Kaca terbuat dari pasir silika cair. Material yang sangat stabil, tahan cuaca, namun bisa sangat tajam dan berbahaya jika pecah.",
      decompositionTime: "1 Juta Tahun (salah satu material terlama yang ada di bumi).",
      economicValue: "Bervariasi (Rp 500 - Rp 1.500 per kg) tergantung warna kaca (bening, hijau, cokelat).",
      buybackLocations: ["Pengepul beling / barang bekas", "Bank Sampah tertentu"],
      diyIdeas: ["Botol kaca utuh: Pot bunga, lampu hias aesthetic", "Pecahan kaca halus (sea glass): Kerajinan seni mozaik"],
      hazards: ["Sangat berbahaya bagi petugas kebersihan jika dibuang tanpa pembungkus yang aman (menyebabkan pendarahan parah)"],
      ecoImpact: "Mendaur ulang kaca dapat mengurangi polusi udara hingga 20% dan polusi air 50% dibanding pembuatan kaca baru.",
      processingMethod: "Disortir berdasarkan warna, dipecah menjadi 'cullet', dilebur pada suhu 1.500°C, lalu dicetak menjadi botol kaca baru."
    },
    disposalTip: "Bungkus pecahan kaca dengan KERTAS KORAN TEBAL dan KARDUS. Rekat dengan lakban. Tulis 'AWAS KACA TAJAM'. Baru buang ke tong sampah RESIDU."
  },
  {
    namaResmi: "Masker Medis Sekali Pakai",
    kategori: "RESIDU",
    subKategori: "Limbah Infeksius / Domestik",
    keywords: ["masker", "masker medis", "masker sekali pakai", "masker bedah", "masker bekas", "mask", "surgical mask"],
    facts: {
      materialDescription: "Terbuat dari bahan polipropilena non-woven (sejenis plastik). Bukan terbuat dari kertas maupun kain biasa.",
      decompositionTime: "Sekitar 450 tahun di alam liar.",
      economicValue: "Tidak ada nilai jual. Sangat berbahaya jika dicoba didaur ulang secara informal karena risiko infeksi.",
      buybackLocations: ["Fasilitas pengolahan limbah infeksius", "Kotak khusus limbah masker (jika tersedia di faskes)"],
      diyIdeas: ["SANGAT DILARANG DIDAUR ULANG UNTUK ALASAN KESEHATAN."],
      hazards: ["Berpotensi menyebarkan patogen atau virus jika dibuang sembarangan", "Tali masker sering menjerat kaki satwa liar (terutama burung)"],
      ecoImpact: "Pandemi menyebabkan miliaran masker berakhir di lautan, merusak terumbu karang dan mengancam biota laut.",
      processingMethod: "Harus dimusnahkan menggunakan insinerator medis dengan suhu di atas 800 derajat celcius."
    },
    disposalTip: "Gunting masker menjadi dua bagian dan potong talinya untuk mencegah pemakaian ulang dan melindungi hewan. Bungkus dalam plastik tertutup sebelum dibuang ke tong RESIDU."
  },
  {
    namaResmi: "Kemasan Karton Minuman / Tetra Pak",
    kategori: "KERTAS",
    subKategori: "Kemasan Multi-Lapis (UBC)",
    keywords: ["tetra pak", "susu kotak", "jus kotak", "teh kotak", "kemasan karton", "minuman kotak", "karton minuman", "kemasan UHT"],
    facts: {
      materialDescription: "Terdiri dari 75% kertas karton, 20% polietilena (plastik), dan 5% aluminium foil. Menjaga minuman awet berbulan-bulan tanpa pengawet.",
      decompositionTime: "Lapisan karton terurai dalam beberapa bulan, tapi lapisan plastik dan aluminium butuh ratusan tahun.",
      economicValue: "Mulai bernilai ekonomi (Rp 500 - Rp 1.000 /kg) jika dikumpulkan dalam keadaan bersih dan dipipihkan.",
      buybackLocations: ["Dropbox khusus Tetra Pak (biasanya di supermarket/mall)", "Bank Sampah yang bekerjasama dengan pabrik daur ulang"],
      diyIdeas: ["Pot bibit semai kecil", "Bahan anyaman kerajinan (tas belanja lipat)", "Dompet koin tahan air"],
      hazards: ["Sisa minuman manis di dalamnya memicu bau busuk dan mengundang hama jika tidak dibilas"],
      ecoImpact: "Material daur ulangnya sangat serbaguna, bisa dijadikan bahan baku kertas daur ulang baru dan papan konstruksi tahan air (polyAl).",
      processingMethod: "Pabrik khusus akan melakukan proses 'pulping' basah untuk memisahkan serat kertas dari PolyAl (Polimer dan Aluminium)."
    },
    disposalTip: "Terapkan 3L: Lipat, Letakkan, Lepas. Buka lipatan kotaknya, ratakan/pipihkan, dan pastikan isinya benar-benar kosong (bilas sedikit air). Serahkan ke Dropbox atau Bank Sampah."
  },
  {
    namaResmi: "Pakaian Bekas / Limbah Tekstil",
    kategori: "RESIDU",
    subKategori: "Limbah Tekstil",
    keywords: ["pakaian", "kain", "baju", "celana", "kain bekas", "baju bekas", "kain lap", "tekstil", "kain perca", "pakaian bekas"],
    facts: {
      materialDescription: "Kombinasi antara serat alami (katun, wol, sutra) dan serat sintetis (poliester, nilon). Serat sintetis pada dasarnya adalah plastik.",
      decompositionTime: "Katun: 1-5 bulan. Poliester (sintetis): 20 hingga 200 tahun.",
      economicValue: "Sangat rendah di tingkat pengepul biasa. Baju bekas layak pakai bisa dijual/didonasikan kembali.",
      buybackLocations: ["Program donasi pakaian", "Bank Sampah yang menerima tekstil", "Tukang loak (kadang menerima untuk kain lap mesin)"],
      diyIdeas: ["Gunting menjadi kain lap serbaguna", "Isian untuk bantal atau tempat tidur hewan peliharaan", "Totebag modifikasi dari kaos lama (tanpa jahit)", "Tote bag belanja dari celana jeans lama"],
      hazards: ["Pakaian sintetis melepaskan serat mikroplastik setiap kali dicuci, mencemari laut", "Tumpukan baju bekas di TPA menghasilkan gas metana dan mengontaminasi air"],
      ecoImpact: "Industri fashion cepat (fast fashion) adalah salah satu penyumbang polusi air dan limbah padat terbesar di dunia.",
      processingMethod: "Pabrik tekstil tingkat lanjut dapat mencacah pakaian bekas menjadi serat kasar untuk insulasi bangunan, peredam suara mobil, atau bahan isian kasur."
    },
    disposalTip: "Jika masih layak pakai: Donasikan! Jika sudah rusak: Potong jadi kain lap dapur/bengkel. Jadikan tong sampah RESIDU sebagai opsi terakhir."
  },
  {
    namaResmi: "Sedotan Plastik",
    kategori: "PLASTIK",
    subKategori: "Plastik Sekali Pakai",
    keywords: ["sedotan", "sedotan plastik", "pipet", "sedotan es", "sedotan minuman", "straw", "sedotan boba"],
    facts: {
      materialDescription: "Biasanya terbuat dari polipropilena (kode 5) ukuran kecil. Sangat tipis, ringan, dan dirancang hanya untuk 10 menit penggunaan, tapi awet selamanya.",
      decompositionTime: "Sekitar 200 tahun.",
      economicValue: "Hampir 0 (nol). Karena terlalu ringan, butuh puluhan ribu sedotan untuk mencapai 1 kilogram, membuatnya tidak diminati pemulung/pengepul.",
      buybackLocations: ["Bank Sampah yang mengkhususkan kerajinan", "Organisasi peduli lautan"],
      diyIdeas: ["Bahan kerajinan bunga plastik", "Dekorasi tirai pintu", "Kerajinan tangan anak sekolah"],
      hazards: ["Ukurannya yang kecil mudah terlewat oleh mesin penyaring sampah", "Sering berakhir di hidung penyu atau tertelan burung laut karena mirip cacing/ikan kecil"],
      ecoImpact: "Jutaan sedotan dibuang setiap hari dan menempati peringkat ke-7 dari daftar sampah laut terbanyak di seluruh dunia.",
      processingMethod: "Dilebur kembali menjadi bijih plastik, meski sangat jarang pabrik yang mau menerimanya secara terpisah karena rentan menyumbat mesin."
    },
    disposalTip: "Kumpulkan di dalam sebuah botol plastik utuh agar tidak berceceran, lalu buang ke bank sampah. Solusi terbaik: TOLAK sedotan plastik saat membeli minuman!"
  }
];

export const unknownTrashFacts: Omit<TrashFacts, 'namaResmi' | 'kategori' | 'subKategori' | 'keywords'> = {
  facts: {
    materialDescription: "Jenis sampah ini tidak ditemukan dalam kamus lokal. Informasi umum mungkin tidak sepenuhnya akurat.",
    decompositionTime: "Bervariasi tergantung material.",
    economicValue: "Tidak diketahui. Periksa ke pengepul atau bank sampah setempat.",
    buybackLocations: ["Bank Sampah setempat", "Pengepul barang bekas"],
    diyIdeas: ["Coba cari inspirasi daur ulang di YouTube atau Pinterest dengan kata kunci nama barang tersebut."],
    hazards: ["Tidak diketahui secara pasti. Tangani dengan hati-hati."],
    ecoImpact: "Setiap sampah yang berhasil dikelola dengan baik berkontribusi pada lingkungan yang lebih bersih.",
    processingMethod: "Pilah sesuai kategori (Organik/Anorganik/B3) dan serahkan ke fasilitas pengelolaan sampah yang tepat."
  },
  disposalTip: "Pilah sampah ini sesuai kategorinya (Plastik/Kertas/Organik/Residu) dan buang ke tong yang sesuai."
};
