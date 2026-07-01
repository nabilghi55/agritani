import { Product, Supplier, Transaction } from '../types';

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'PT Syngenta Indonesia',
    phone: '081234567890',
    address: 'Kawasan Industri Pulogadung, Jl. Rawa Sumur No. 4, Jakarta',
    description: 'Agen Penjual Gramoxone & Curacron',
  },
  {
    id: 'sup-2',
    name: 'PT Bayer Indonesia',
    phone: '087712345678',
    address: 'Menara Astra Lantai 28-30, Jl. Jend. Sudirman Kav. 5-6, Jakarta',
    description: 'Agen Penjual Decis & Antracol',
  },
  {
    id: 'sup-3',
    name: 'CV Tani Subur Makmur',
    phone: '085298765432',
    address: 'Jl. Pemuda No. 120, Sekayu, Semarang Tengah, Kota Semarang',
    description: 'Pusat Pupuk & Obat Tani Terlengkap',
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Gramoxone 276 SL',
    activeIngredient: 'Parakuat Diklorida 276 g/l',
    category: 'Herbisida',
    stock: 24,
    unit: 'Botol (1 Liter)',
    shelfLocation: 'Rak A-1',
    expiryDate: '2027-05-15',
    minStock: 10,
    purchasePrice: 85000,
    sellingPrice: 98000,
    supplierId: 'sup-1',
  },
  {
    id: 'prod-2',
    name: 'Decis 25 EC',
    activeIngredient: 'Deltametrin 25 g/l',
    category: 'Insektisida',
    stock: 6, // di bawah minStock (10)
    unit: 'Botol (250 ml)',
    shelfLocation: 'Rak B-2',
    expiryDate: '2027-01-20',
    minStock: 10,
    purchasePrice: 42000,
    sellingPrice: 50000,
    supplierId: 'sup-2',
  },
  {
    id: 'prod-3',
    name: 'Dithane M-45 80 WP',
    activeIngredient: 'Mankozeb 80%',
    category: 'Fungisida',
    stock: 15,
    unit: 'Bungkus (500g)',
    shelfLocation: 'Rak C-1',
    expiryDate: '2026-07-16', // exp dalam 15 hari (kritis/near-expiry)
    minStock: 5,
    purchasePrice: 65000,
    sellingPrice: 78000,
    supplierId: 'sup-3',
  },
  {
    id: 'prod-4',
    name: 'Roundup 486 SL',
    activeIngredient: 'Isopropilamina Glifosat 486 g/l',
    category: 'Herbisida',
    stock: 0, // stok habis (kritis)
    unit: 'Botol (200 ml)',
    shelfLocation: 'Rak A-2',
    expiryDate: '2027-09-10',
    minStock: 5,
    purchasePrice: 35000,
    sellingPrice: 42000,
    supplierId: 'sup-3',
  },
  {
    id: 'prod-5',
    name: 'Curacron 500 EC',
    activeIngredient: 'Profenofos 500 g/l',
    category: 'Insektisida',
    stock: 12,
    unit: 'Botol (100 ml)',
    shelfLocation: 'Rak B-3',
    expiryDate: '2026-06-20', // sudah kedaluwarsa
    minStock: 5,
    purchasePrice: 38000,
    sellingPrice: 45000,
    supplierId: 'sup-1',
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    productId: 'prod-1',
    productName: 'Gramoxone 276 SL',
    type: 'in',
    amount: 30,
    date: '2026-06-25 09:15',
    notes: 'Belanja masuk dari Syngenta',
  },
  {
    id: 'tx-2',
    productId: 'prod-1',
    productName: 'Gramoxone 276 SL',
    type: 'out',
    amount: 6,
    date: '2026-06-28 14:30',
    notes: 'Terjual eceran 6 botol ke Kelompok Tani',
  },
  {
    id: 'tx-3',
    productId: 'prod-2',
    productName: 'Decis 25 EC',
    type: 'in',
    amount: 10,
    date: '2026-06-24 11:00',
    notes: 'Stok masuk pertama dari Bayer',
  },
  {
    id: 'tx-4',
    productId: 'prod-2',
    productName: 'Decis 25 EC',
    type: 'out',
    amount: 4,
    date: '2026-06-29 16:15',
    notes: 'Terjual eceran 4 botol',
  },
  {
    id: 'tx-5',
    productId: 'prod-4',
    productName: 'Roundup 486 SL',
    type: 'out',
    amount: 15,
    date: '2026-06-30 10:00',
    notes: 'Terjual borongan dibeli Pak RT',
  },
  {
    id: 'tx-6',
    productId: 'prod-5',
    productName: 'Curacron 500 EC',
    type: 'in',
    amount: 12,
    date: '2026-06-15 08:30',
    notes: 'Koreksi sisa stok obat',
  }
];
