'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

// Tipe Data
import { Product, Transaction, Supplier } from '../types';

// Data Tiruan
import { initialProducts, initialTransactions, initialSuppliers } from '../data/mockData';

// Komponen
import Dashboard from '../components/Dashboard';
import InventoryList from '../components/InventoryList';
import StockTransaction from '../components/StockTransaction';
import Suppliers from '../components/Suppliers';

type TabType = 'dashboard' | 'inventory' | 'transactions' | 'suppliers';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // State Utama Aplikasi
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // State navigasi detail untuk tambah stok cepat dari dashboard
  const [selectedProductIdForQuickAdjust, setSelectedProductIdForQuickAdjust] = useState<string | null>(null);

  // State untuk modal konfirmasi hapus semua data
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // 1. Loading Awal & Sinkronisasi LocalStorage
  useEffect(() => {
    const initialized = localStorage.getItem('agristok_initialized');

    if (!initialized) {
      // First time loading the app: load mock data
      setProducts(initialProducts);
      setTransactions(initialTransactions);
      setSuppliers(initialSuppliers);
      const defaultCategories = ['Herbisida', 'Insektisida', 'Fungisida'];
      setCategories(defaultCategories);

      localStorage.setItem('agristok_products', JSON.stringify(initialProducts));
      localStorage.setItem('agristok_transactions', JSON.stringify(initialTransactions));
      localStorage.setItem('agristok_suppliers', JSON.stringify(initialSuppliers));
      localStorage.setItem('agristok_categories', JSON.stringify(defaultCategories));
      localStorage.setItem('agristok_initialized', 'true');
    } else {
      // Not first time: load from storage or default empty array
      const storedProducts = localStorage.getItem('agristok_products');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts([]);
        localStorage.setItem('agristok_products', JSON.stringify([]));
      }

      const storedTransactions = localStorage.getItem('agristok_transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        setTransactions([]);
        localStorage.setItem('agristok_transactions', JSON.stringify([]));
      }

      const storedSuppliers = localStorage.getItem('agristok_suppliers');
      if (storedSuppliers) {
        setSuppliers(JSON.parse(storedSuppliers));
      } else {
        setSuppliers([]);
        localStorage.setItem('agristok_suppliers', JSON.stringify([]));
      }

      const storedCategories = localStorage.getItem('agristok_categories');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories([]);
        localStorage.setItem('agristok_categories', JSON.stringify([]));
      }
    }

    setMounted(true);
  }, []);

  // Helper fungsi untuk update state dan menyimpan ke localStorage
  const saveProductsToStorage = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('agristok_products', JSON.stringify(updatedProducts));
  };

  const saveTransactionsToStorage = (updatedTransactions: Transaction[]) => {
    setTransactions(updatedTransactions);
    localStorage.setItem('agristok_transactions', JSON.stringify(updatedTransactions));
  };

  const saveSuppliersToStorage = (updatedSuppliers: Supplier[]) => {
    setSuppliers(updatedSuppliers);
    localStorage.setItem('agristok_suppliers', JSON.stringify(updatedSuppliers));
  };

  // 2. Handler Aksi untuk Produk
  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: `prod-${Date.now()}`,
    };
    const updated = [newProduct, ...products];
    saveProductsToStorage(updated);

    // Otomatis buat log transaksi masuk awal
    if (newProduct.stock > 0) {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'in',
        amount: newProduct.stock,
        date: getFormattedCurrentTime(),
        notes: 'Stok awal barang baru didaftarkan',
      };
      saveTransactionsToStorage([newTx, ...transactions]);
    }
  };

  const handleEditProduct = (updatedProduct: Product) => {
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    saveProductsToStorage(updated);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveProductsToStorage(updated);
  };

  // Penyesuaian stok (+/-) & otomatis buat transaksi baru
  const handleAdjustStock = (productId: string, amount: number, type: 'in' | 'out', notes: string) => {
    const updatedProducts = products.map((p) => {
      if (p.id === productId) {
        const newStock = type === 'in' ? p.stock + amount : Math.max(0, p.stock - amount);
        return { ...p, stock: newStock };
      }
      return p;
    });

    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    // Buat objek transaksi baru
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      productId,
      productName: targetProduct.name,
      type,
      amount,
      date: getFormattedCurrentTime(),
      notes: notes || (type === 'in' ? 'Stok masuk cepat' : 'Penjualan cepat'),
    };

    saveProductsToStorage(updatedProducts);
    saveTransactionsToStorage([newTx, ...transactions]);
  };

  // 3. Handler Aksi untuk Distributor/Supplier
  const handleAddSupplier = (newSupplierData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...newSupplierData,
      id: `sup-${Date.now()}`,
    };
    const updated = [newSupplier, ...suppliers];
    saveSuppliersToStorage(updated);
  };

  const handleEditSupplier = (updatedSupplier: Supplier) => {
    const updated = suppliers.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s));
    saveSuppliersToStorage(updated);
  };

  const handleDeleteSupplier = (id: string) => {
    const updated = suppliers.filter((s) => s.id !== id);
    saveSuppliersToStorage(updated);
  };

  // Reset semua data ke kosong dari awal
  const handleResetData = () => {
    localStorage.setItem('agristok_products', JSON.stringify([]));
    localStorage.setItem('agristok_transactions', JSON.stringify([]));
    localStorage.setItem('agristok_suppliers', JSON.stringify([]));
    localStorage.setItem('agristok_categories', JSON.stringify([]));
    localStorage.setItem('agristok_initialized', 'true');
    setProducts([]);
    setTransactions([]);
    setSuppliers([]);
    setCategories([]);
    setActiveTab('dashboard');
    setIsResetConfirmOpen(false);
  };

  // Menambahkan kategori baru
  const handleAddCategory = (newCat: string) => {
    if (!categories.includes(newCat)) {
      const updated = [...categories, newCat];
      setCategories(updated);
      localStorage.setItem('agristok_categories', JSON.stringify(updated));
    }
  };

  // 4. Helper tanggal dan waktu
  const getFormattedCurrentTime = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const getIndonesianDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const date = new Date();
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${monthName} ${year}`;
  };

  // Pengarah navigasi cepat dari Dashboard ke Inventory
  const handleQuickRestockRedirect = (productId: string) => {
    setSelectedProductIdForQuickAdjust(productId);
    setActiveTab('inventory');
  };

  // Tampilkan loader saat memuat state lokal
  if (!mounted) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinner}></div>
        <div className={styles.loaderText}>Membuka Aplikasi AgriStok...</div>
      </div>
    );
  }

  return (
    <div className={styles.mainLayout}>
      {/* SIDEBAR - HANYA DI DESKTOP */}
      <aside className={styles.sidebar} id="main-sidebar">
        <div>
          <div className={styles.brandSection}>
            <span className={styles.brandIcon}>🌾</span>
            <span className={styles.brandName}>AgriStok</span>
          </div>

          <nav className={styles.navigationList}>
            <button
              className={`${styles.navButton} ${activeTab === 'dashboard' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveTab('dashboard')}
              id="sidebar-link-dashboard"
            >
              <span className={styles.navIcon}>📊</span> Halaman Utama
            </button>
            <button
              className={`${styles.navButton} ${activeTab === 'inventory' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveTab('inventory')}
              id="sidebar-link-inventory"
            >
              <span className={styles.navIcon}>📦</span> Daftar Obat Tani
            </button>
            <button
              className={`${styles.navButton} ${activeTab === 'transactions' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveTab('transactions')}
              id="sidebar-link-transactions"
            >
              <span className={styles.navIcon}>🔄</span> Catatan Keluar Masuk
            </button>
            <button
              className={`${styles.navButton} ${activeTab === 'suppliers' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveTab('suppliers')}
              id="sidebar-link-suppliers"
            >
              <span className={styles.navIcon}>👥</span> Kontak Sales / Agen
            </button>
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.systemStatus}>
            <span className={styles.statusDot}></span>
            <span>Aplikasi Aktif</span>
          </div>
          <button 
            className={styles.resetBtn} 
            onClick={() => setIsResetConfirmOpen(true)}
            id="btn-reset-database"
          >
            ⚠️ Kosongkan Semua Data
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className={styles.mobileHeader} id="mobile-header">
        <div className={styles.mobileBrand}>
          <span className={styles.brandIcon}>🌾</span>
          <span className={styles.mobileBrandName}>AgriStok</span>
        </div>
        <div className={styles.systemStatus} style={{ padding: 0, backgroundColor: 'transparent' }}>
          <span className={styles.statusDot}></span>
        </div>
      </header>

      {/* RENDER KONTEN UTAMA */}
      <main className={styles.contentArea}>
        <div className={styles.topBar}>
          <div className={styles.storeInfo}>
            <span className={styles.storeName}>Toko Tani Berkah</span>
            <span className={styles.storeSub}>Catatan Obat Tani & Tanggal Kedaluwarsa</span>
          </div>
          <div className={styles.dateDisplay} id="date-display">
            📅 {getIndonesianDate()}
          </div>
        </div>

        <div className="animate-fade-in">
          {activeTab === 'dashboard' && (
            <Dashboard
              products={products}
              transactions={transactions}
              suppliers={suppliers}
              categories={categories}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onQuickRestock={handleQuickRestockRedirect}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryList
              products={products}
              suppliers={suppliers}
              categories={categories}
              onAddCategory={handleAddCategory}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onAdjustStock={handleAdjustStock}
              initialSelectedProductId={selectedProductIdForQuickAdjust}
              onClearSelectedProductId={() => setSelectedProductIdForQuickAdjust(null)}
            />
          )}

          {activeTab === 'transactions' && (
            <StockTransaction transactions={transactions} />
          )}

          {activeTab === 'suppliers' && (
            <Suppliers
              suppliers={suppliers}
              onAddSupplier={handleAddSupplier}
              onEditSupplier={handleEditSupplier}
              onDeleteSupplier={handleDeleteSupplier}
            />
          )}
        </div>
      </main>

      {/* MOBILE FOOTER NAVBAR (GAPTEK FRIENDLY - BESAR DAN TINGGAL TAP) */}
      <nav className={styles.mobileNav} id="mobile-nav">
        <button
          className={`${styles.mobileNavButton} ${activeTab === 'dashboard' ? styles.mobileNavButtonActive : ''}`}
          onClick={() => setActiveTab('dashboard')}
          id="mobile-link-dashboard"
        >
          <span className={styles.mobileNavIcon}>📊</span>
          <span>Halaman Utama</span>
        </button>
        <button
          className={`${styles.mobileNavButton} ${activeTab === 'inventory' ? styles.mobileNavButtonActive : ''}`}
          onClick={() => setActiveTab('inventory')}
          id="mobile-link-inventory"
        >
          <span className={styles.mobileNavIcon}>📦</span>
          <span>Daftar Obat</span>
        </button>
        <button
          className={`${styles.mobileNavButton} ${activeTab === 'transactions' ? styles.mobileNavButtonActive : ''}`}
          onClick={() => setActiveTab('transactions')}
          id="mobile-link-transactions"
        >
          <span className={styles.mobileNavIcon}>🔄</span>
          <span>Catatan Stok</span>
        </button>
        <button
          className={`${styles.mobileNavButton} ${activeTab === 'suppliers' ? styles.mobileNavButtonActive : ''}`}
          onClick={() => setActiveTab('suppliers')}
          id="mobile-link-suppliers"
        >
          <span className={styles.mobileNavIcon}>👥</span>
          <span>Kontak Sales</span>
        </button>
      </nav>

      {/* CUSTOM CONFIRMATION MODAL FOR RESET DATABASE */}
      {isResetConfirmOpen && (
        <div className={styles.modalOverlay} id="confirm-reset-overlay">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Hapus Semua Data Toko?</h3>
            </div>
            <div className={styles.modalBody}>
              <p>Apakah bapak/ibu yakin ingin menghapus semua data obat, catatan stok, kontak sales, dan jenis obat untuk memulai kembali dari awal?</p>
              <p style={{ marginTop: '12px', fontWeight: 'bold', color: 'var(--danger-700)' }}>⚠️ Data yang sudah dihapus tidak bisa dikembalikan!</p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.btnCancel} 
                onClick={() => setIsResetConfirmOpen(false)}
              >
                Batal
              </button>
              <button 
                className={styles.btnConfirm} 
                onClick={handleResetData}
                id="btn-confirm-reset-database"
              >
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
