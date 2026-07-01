export interface Product {
  id: string;
  name: string; // Nama Pestisida
  activeIngredient: string; // Bahan Aktif
  category: string; // Kategori dinamis
  stock: number;
  unit: string; // Botol, Bungkus, Liter, Kg, dll.
  shelfLocation: string; // Lokasi Rak (misal: Rak A1)
  expiryDate: string; // Tanggal Kedaluwarsa (YYYY-MM-DD)
  minStock: number; // Stok Minimal
  purchasePrice: number; // Harga Beli (Rp)
  sellingPrice: number; // Harga Jual (Rp)
  supplierId: string; // ID Penyuplai
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out'; // 'in' = Masuk (Restock), 'out' = Keluar (Terjual/Rusak)
  amount: number;
  date: string; // Waktu Transaksi (YYYY-MM-DD HH:mm)
  notes: string; // Catatan (misal: Penjualan Harian, Restock dari Supplier A)
}

export interface Supplier {
  id: string;
  name: string; // Nama Distributor / Penyuplai
  phone: string; // No HP / WhatsApp
  address: string; // Alamat
  description: string; // Keterangan (misal: Distributor Resmi Syngenta)
}
