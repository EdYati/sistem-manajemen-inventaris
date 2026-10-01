# 📦 Sistem Manajemen Inventaris - StockApp

Aplikasi web untuk manajemen inventaris dan stok barang dengan dashboard, master produk, operasional stok, dan buku mutasi.

## Fitur

- Dashboard statistik real-time dan peringatan stok minimum.
- CRUD master produk dan kategori.
- Transaksi stok masuk dan keluar dengan validasi ketersediaan.
- Riwayat mutasi stok dan filter transaksi.
- Penyimpanan lokal melalui `localStorage`.
- Struktur JavaScript modular berbasis ES modules.
- Vite untuk development dan production build.

## Quick start

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` setelah server development berjalan.

```bash
npm run build
npm run preview
```

## Struktur project

```text
src/
├── index.html
├── js/
│   ├── modules/
│   │   ├── storage.js
│   │   ├── product.js
│   │   └── transaction.js
│   └── utils/
│       ├── formatters.js
│       └── validators.js
└── styles/
```

## Catatan pengembangan

Data saat ini disimpan di browser menggunakan `localStorage`. Arsitektur modul dirancang agar mudah dihubungkan ke REST API dan database pada tahap berikutnya.

## Scripts

- `npm run dev` — menjalankan Vite development server.
- `npm run build` — membuat production build.
- `npm run preview` — melihat production build secara lokal.
- `npm run lint` — menjalankan ESLint.
- `npm test` — menjalankan Jest.

## License

MIT © EdYati
