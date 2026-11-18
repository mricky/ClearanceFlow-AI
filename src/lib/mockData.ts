import { ShipmentRecord, KnowledgeDocument } from "./types";

export const SAMPLE_SHIPMENTS: ShipmentRecord[] = [
  {
    id: "SHP-2026-033",
    waybillNo: "WBL-2026-033",
    containerNo: "MSKU-992104",
    carrier: "Maersk Line (Vessel: Maersk Mc-Kinney Moller)",
    vessel: "Voyage 2601W",
    pol: "IDJKT (Tanjung Priok, Indonesia)",
    pod: "JPTYO (Tokyo Port, Japan)",
    commodity: "Frozen Black Tiger Prawns (Export)",
    hsCode: "0306.17.00 (Crustaceans, Frozen)",
    incoterm: "CIF Tokyo",
    status: "CUSTOMS_HOLD_RED_CHANNEL",
    statusLabel: "Customs Hold: Red Channel (SPJM Issued)",
    temperatureCelsius: -20.4,
    freeTimeDaysLeft: 2,
    demurrageDaysOverdue: 0,
    demurrageDailyRateUsd: 150,
    grossMassKg: 24500,
    sealNo: "ID-JKT-998124-H",
    timeline: [
      {
        time: "14:00 - 16 Feb 2026",
        label: "Port Gate-in Completed",
        detail: "Container weighed. SOLAS VGM Certificate verified: 24,500 kg.",
        status: "completed",
      },
      {
        time: "16:30 - 16 Feb 2026",
        label: "CEISA 4.0 Customs Notice: SPJM Terbit",
        detail: "Selected for Red Channel physical inspection at TPP Behandle Tanjung Priok.",
        status: "error",
      },
      {
        time: "18:00 - 16 Feb 2026",
        label: "Reefer Telemetry Active",
        detail: "Continuous temperature monitoring set-point: -20.4°C (Stable).",
        status: "completed",
      },
      {
        time: "Pending Resolution",
        label: "Behandle Inspection & TPP Pullout",
        detail: "Mandatory attendance with Customs Officer within 3x24h deadline.",
        status: "warning",
      },
    ],
  },
  {
    id: "SHP-2026-089",
    waybillNo: "WBL-2026-089",
    containerNo: "OCLU-883192",
    carrier: "OOCL Ocean Alliance",
    vessel: "OOCL Hong Kong Voy 104S",
    pol: "CNSHA (Shanghai Port, China)",
    pod: "IDJKT (Tanjung Priok, Indonesia)",
    commodity: "Heavy Industrial CNC Lathe & Milling Machinery (Import)",
    hsCode: "8458.11.00 (Machine Tools)",
    incoterm: "FOB Shanghai",
    status: "DEMURRAGE_OVERDUE",
    statusLabel: "Demurrage Overdue: 4 Days Accrued ($600 Exposure)",
    temperatureCelsius: null,
    freeTimeDaysLeft: 0,
    demurrageDaysOverdue: 4,
    demurrageDailyRateUsd: 150,
    grossMassKg: 28100,
    sealNo: "CN-SHA-771922-A",
    timeline: [
      {
        time: "09:00 - 10 Feb 2026",
        label: "Vessel Discharged at Terminal",
        detail: "Container stacked in yard. 5-day standard demurrage clock started.",
        status: "completed",
      },
      {
        time: "11:00 - 11 Feb 2026",
        label: "PIB Filed in CEISA 4.0",
        detail: "Assigned Red Channel due to Lartas Persetujuan Impor (PI) verification.",
        status: "warning",
      },
      {
        time: "15:00 - 14 Feb 2026",
        label: "Terminal Yard Congestion Delays",
        detail: "TPS transfer truck queue backed up 36 hours (Documented Port Congestion).",
        status: "error",
      },
      {
        time: "Overdue Since 15 Feb",
        label: "Demurrage Incurred ($600 Total)",
        detail: "Eligible for Force Majeure dispute letter due to official port backlog notice.",
        status: "error",
      },
    ],
  },
  {
    id: "SHP-2026-112",
    waybillNo: "WBL-2026-112",
    containerNo: "CMAU-410291",
    carrier: "CMA CGM Group",
    vessel: "CMA CGM Palais Royal",
    pol: "THLCH (Laem Chabang, Thailand)",
    pod: "IDJKT (Tanjung Priok, Indonesia)",
    commodity: "Fresh Cavendish Bananas & Tropical Fruits",
    hsCode: "0803.90.00 (Fresh Fruits)",
    incoterm: "CIF Jakarta",
    status: "RELEASED_GREEN_CHANNEL",
    statusLabel: "Customs Released: Green Channel (SPPB Issued)",
    temperatureCelsius: 13.5,
    freeTimeDaysLeft: 4,
    demurrageDaysOverdue: 0,
    demurrageDailyRateUsd: 120,
    grossMassKg: 19800,
    sealNo: "TH-BKK-339101-C",
    timeline: [
      {
        time: "08:00 - 17 Feb 2026",
        label: "Vessel Berth & Discharge",
        detail: "Discharged to reefer plug point #42.",
        status: "completed",
      },
      {
        time: "10:30 - 17 Feb 2026",
        label: "Barantin Quarantine Clearance",
        detail: "Phytosanitary inspection passed. Release certificate issued.",
        status: "completed",
      },
      {
        time: "13:00 - 17 Feb 2026",
        label: "SPPB Customs Release Issued",
        detail: "CEISA 4.0 Green Lane automated release. Ready for Gate-Out dispatch.",
        status: "completed",
      },
    ],
  },
  {
    id: "SHP-2026-145",
    waybillNo: "WBL-2026-145",
    containerNo: "EGLV-771820",
    carrier: "Evergreen Marine",
    vessel: "Ever Given Voy 009E",
    pol: "SGSIN (Port of Singapore)",
    pod: "IDJKT (Tanjung Priok, Indonesia)",
    commodity: "Industrial Solvents (IMO Class 8 Corrosive Liquid)",
    hsCode: "2905.11.00 (Chemical Reagents)",
    incoterm: "DAP Jakarta",
    status: "QUARANTINE_INSPECTION_PENDING",
    statusLabel: "Regulatory Pending: IMDG Placard & MSDS Verification",
    temperatureCelsius: null,
    freeTimeDaysLeft: 3,
    demurrageDaysOverdue: 0,
    demurrageDailyRateUsd: 180,
    grossMassKg: 21400,
    sealNo: "SG-SIN-110943-D",
    timeline: [
      {
        time: "12:00 - 16 Feb 2026",
        label: "Port Discharge into Dangerous Goods Yard",
        detail: "Container placed in designated IMO Class 8 isolation bunker.",
        status: "completed",
      },
      {
        time: "15:00 - 16 Feb 2026",
        label: "Safety Compliance Flag",
        detail: "Requires 16-section UN GHS MSDS submission and terminal safety clearance.",
        status: "warning",
      },
    ],
  },
];

export const KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 1,
    title: "SOP Alur Pengajuan Dokumen Ekspor: Pemberitahuan Ekspor Barang (PEB) & NPE di CEISA 4.0",
    category: "export_compliance_sop",
    subCategory: "export_clearance",
    content:
      "Eksportir atau PPJK wajib mengirim data PEB melalui modul CEISA 4.0 paling cepat 7 hari dan paling lambat sebelum barang masuk kawasan pabean pelabuhan. Setelah verifikasi dokumen dan validasi sistem Indonesia National Single Window (INSW) selesai tanpa terkena nota pencegahan, sistem menerbitkan Nota Pelayanan Ekspor (NPE) sebagai izin resmi pemuatan barang ke atas kapal (loading permission).",
  },
  {
    id: 2,
    title: "Kepatuhan Regulasi Devisa Hasil Ekspor Sumber Daya Alam (DHE SDA PP No. 36/2023)",
    category: "export_compliance_sop",
    subCategory: "financial_regulation",
    content:
      "Eksportir komoditas SDA (pertambangan, perkebunan, kehutanan, perikanan) dengan nilai PEB minimal USD 250,000 atau ekuivalennya wajib menempatkan DHE SDA minimal 30 persen ke dalam Rekening Khusus (Reksus) perbankan domestik Indonesia selama minimal 3 bulan kalender sejak penerbitan dokumen pabean ekspor. Pelanggaran aturan dikenakan sanksi pemblokiran akses layanan ekspor.",
  },
  {
    id: 3,
    title: "SOP Verifikasi Berat Kotor Peti Kemas (SOLAS Verified Gross Mass / VGM) Sebelum Gate-In",
    category: "export_compliance_sop",
    subCategory: "maritime_safety",
    content:
      "Sesuai konvensi keselamatan maritim IMO SOLAS Chapter VI, setiap kontainer ekspor wajib memiliki sertifikat VGM yang diperoleh melalui penimbangan kontainer terisi (Metode 1) atau penjumlahan berat tara dan kargo berkalibrasi (Metode 2). Kontainer tanpa sertifikat data VGM valid dilarang keras dinaikkan ke kapal dan ditolak di pintu gerbang utama pelabuhan (gate-in).",
  },
  {
    id: 4,
    title: "Kepatuhan Standar Perlakuan Palet Kayu Ekspor Internasional (ISPM #15 Fumigasi Phyto)",
    category: "export_compliance_sop",
    subCategory: "quarantine_phytosanitary",
    content:
      "Semua bahan kemasan kayu (solid wood packaging, palet, krat) untuk muatan ekspor wajib memenuhi standar ISPM #15 melalui perlakuan panas (Heat Treatment / HT) atau fumigasi Methyl Bromide (MB) oleh provider berlisensi Badan Karantina. Palet wajib dibubuhi stempel logo gandum resmi IPPC beserta nomor registrasi perusahaan fumigator yang jelas.",
  },
  {
    id: 5,
    title: "SOP Penerbitan Surat Keterangan Asal (Certificate of Origin / COO Form D, Form E, Form AK)",
    category: "export_compliance_sop",
    subCategory: "trade_preference",
    content:
      "Untuk memperoleh preferensi tarif bea masuk 0 persen di negara tujuan ekspor mitra perjanjian perdagangan bebas (FTA), eksportir wajib mengajukan e-COO melalui portal e-SKA Kementerian Perdagangan dengan melampirkan invoice, packing list, PEB final, dan Bill of Lading (B/L). Nilai Local Content (Regional Value Content - RVC) minimal 40 persen wajib dipenuhi sesuai Rule of Origin.",
  },
  {
    id: 6,
    title: "SOP Jalur Pelayanan Impor Bea Cukai: Jalur Hijau, Jalur Kuning, dan Jalur Merah (SPJM)",
    category: "import_compliance_sop",
    subCategory: "import_clearance",
    content:
      "Pengeluaran barang impor dari kawasan pabean ditentukan oleh profil risiko importir dan jenis barang melalui PIB CEISA: Jalur Hijau (dokumen langsung terbit SPPB), Jalur Kuning (pemeriksaan dokumen sebelum SPPB terbit), dan Jalur Merah (wajib terbit SPJM dan pemeriksaan fisik barang di TPP Behandle). Proses pemeriksaan fisik wajib dihadiri importir/kuasanya dalam waktu 3x24 jam sejak SPJM terbit.",
  },
  {
    id: 7,
    title: "Kepatuhan Regulasi Larangan dan Pembatasan Impor (Lartas) & Kuota Impor Kementerian",
    category: "import_compliance_sop",
    subCategory: "lartas_regulation",
    content:
      "Sebelum mengajukan PIB, importir wajib memastikan kepatuhan komoditas terhadap aturan Lartas pada portal INSW. Untuk barang yang dibatasi (seperti besi baja, tekstil, pangan olahan, elektronik), importir wajib memiliki Persetujuan Impor (PI) dari Kementerian Perdagangan dan Laporan Surveyor (LS) dari negara asal sebelum barang dikapalkan (pre-shipment inspection).",
  },
  {
    id: 8,
    title: "SOP Penanganan Surat Penetapan Tarif dan Nilai Pabean (SPTNP / Notul Denda Bea Masuk)",
    category: "import_compliance_sop",
    subCategory: "dispute_tariff_value",
    content:
      "Jika Pejabat Bea Cukai menetapkan nilai pabean atau tarif HS Code lebih tinggi dari yang dideklarasikan importir, diterbitkan SPTNP (Nota Pembetulan). Importir wajib melunasi kekurangan bea masuk dan denda administrasi dalam waktu 30 hari kalender, atau mengajukan surat keberatan resmi kepada Direktur Jenderal Bea dan Cukai dengan jaminan bank/tunai 100 persen.",
  },
  {
    id: 9,
    title: "SOP Fasilitas Tempat Penimbunan Berikat (Kawasan Berikat & Gudang Berikat TPB)",
    category: "import_compliance_sop",
    subCategory: "bonded_facility",
    content:
      "Pemasukan bahan baku impor ke Kawasan Berikat untuk diolah menjadi barang ekspor mendapatkan fasilitas penangguhan bea masuk dan tidak dipungut PPN/PPh 22 impor. Perusahaan berikat wajib memiliki sistem IT Inventory terintegrasi dengan Closed-Circuit Television (CCTV) real-time yang dapat diakses oleh kantor pabean pengawas 24/7.",
  },
  {
    id: 10,
    title: "Kepatuhan Registrasi Izin Edar BPOM & Standar Nasional Indonesia (SNI Wajib) Barang Impor",
    category: "import_compliance_sop",
    subCategory: "regulatory_standards",
    content:
      "Produk makanan, minuman, obat-obatan, dan kosmetik impor wajib memiliki Surat Keterangan Impor (SKI) dari Badan POM sebelum deklarasi pabean. Untuk produk industri yang terkena regulasi SNI Wajib (seperti semen, helm, keramik, mainan anak), importir wajib melampirkan Sertifikat Produk Penggunaan Tanda SNI (SPPT-SNI) yang masih berlaku.",
  },
  {
    id: 11,
    title: "SOP Sanggahan Biaya Demurrage & Detention Kontainer Akibat Keterlambatan Pemeriksaan Fisik Pabean",
    category: "dispute_and_claims_sop",
    subCategory: "demurrage_disputes",
    content:
      "Jika timbul biaya demurrage kontainer di terminal akibat antrean panjang pemeriksaan fisik jalur merah (behandle) atau kendala operasional TPS pelabuhan di luar kendali importir, PPJK dapat mengajukan permohonan keringanan denda kepada shipping line dengan melampirkan Berita Acara Pelaksanaan Pemeriksaan Fisik dan lembar SPJM pabean resmi.",
  },
  {
    id: 12,
    title: "SOP Klaim Asuransi Kerusakan Kargo Impor Laut (Marine Cargo Insurance Claim)",
    category: "dispute_and_claims_sop",
    subCategory: "cargo_claims",
    content:
      "Saat kontainer tiba dalam kondisi rusak atau segel putus, consignee wajib segera mencantumkan klausul klaim pada Surat Jalan (Delivery Order) dan menerbitkan Notice of Claim kepada carrier dalam waktu maksimal 3 hari sejak bongkar muat. Surveyor independen (seperti Lloyd / Sucofindo) wajib ditunjuk untuk menerbitkan Survey Report estimasi nilai kerugian.",
  },
  {
    id: 13,
    title: "Prosedur Pengajuan Keberatan dan Banding Sengketa Kepabeanan ke Pengadilan Pajak",
    category: "dispute_and_claims_sop",
    subCategory: "customs_legal_appeal",
    content:
      "Eksportir/Importir yang menolak penetapan pabean berhak mengajukan Surat Keberatan dalam jangka waktu maksimal 60 hari kalender sejak tanggal penetapan pabean. Apabila keberatan ditolak oleh Direktur Jenderal Bea Cukai, pihak pemohon dapat mengajukan gugatan banding ke Pengadilan Pajak Republik Indonesia dalam waktu 60 hari sejak keputusan penolakan diterima.",
  },
  {
    id: 14,
    title: "SOP Pengembalian Barang Impor Rusak ke Negara Asal (Re-Ekspor Barang Cacat / Salah Kirim)",
    category: "dispute_and_claims_sop",
    subCategory: "re_export_handling",
    content:
      "Barang impor yang belum disetujui keluar dari kawasan pabean dan terbukti tidak sesuai pesanan, rusak, atau salah kirim dapat diajukan re-ekspor ke negara asal. Importir wajib mengajukan surat permohonan re-ekspor kepada Kepala Kantor Pabean dengan melampirkan surat persetujuan dari supplier luar negeri dan bukti hasil pemeriksaan fisik bersama pabean.",
  },
  {
    id: 15,
    title: "Kepatuhan Penanganan Barang Tertahan Unit Penindakan P2 Bea Cukai (Customs Seizure / Audit)",
    category: "dispute_and_claims_sop",
    subCategory: "customs_enforcement",
    content:
      "Jika peti kemas disegel dengan pita tanda pengaman kuning/merah oleh Pejabat Pengawasan dan Penindakan (P2), dilarang keras merusak segel pengaman. Direksi perusahaan importir/kuasanya wajib memenuhi panggilan klarifikasi resmi Berita Acara Wawancara (BAW) dan menyediakan buku rekening koran, korespondensi email pembelian, serta kontrak freight invoice asli.",
  },
];
