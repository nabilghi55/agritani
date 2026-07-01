'use client';

import React from 'react';
import { Product, Transaction, Supplier } from '../types';
import styles from './Dashboard.module.css';

interface DashboardProps {
  products: Product[];
  transactions: Transaction[];
  suppliers: Supplier[];
  categories: string[];
  onNavigateToTab: (tab: 'dashboard' | 'inventory' | 'transactions' | 'suppliers') => void;
  onQuickRestock: (productId: string) => void;
}

export default function Dashboard({
  products,
  transactions,
  suppliers,
  categories,
  onNavigateToTab,
  onQuickRestock,
}: DashboardProps) {
  // 1. Hitung total jenis barang
  const totalProducts = products.length;

  // 2. Hitung barang hampir habis (stok <= minStock)
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const totalLowStock = lowStockProducts.length;

  // 3. Hitung barang kedaluwarsa & mendekati kedaluwarsa (<= 30 hari)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getExpiryStatus = (dateStr: string) => {
    const expDate = new Date(dateStr);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', label: 'Sudah Kedaluwarsa', days: diffDays };
    } else if (diffDays <= 30) {
      return { status: 'near-expiry', label: `${diffDays} hari lagi`, days: diffDays };
    }
    return { status: 'safe', label: 'Aman', days: diffDays };
  };

  const expiredProducts = products.filter((p) => getExpiryStatus(p.expiryDate).status === 'expired');
  const nearExpiryProducts = products.filter((p) => getExpiryStatus(p.expiryDate).status === 'near-expiry');
  const totalCriticalExpiry = expiredProducts.length + nearExpiryProducts.length;

  // 4. Hitung Aset Toko (Harga Beli & Estimasi Jual)
  const totalAssetPurchase = products.reduce((sum, p) => sum + p.stock * p.purchasePrice, 0);
  const totalAssetSelling = products.reduce((sum, p) => sum + p.stock * p.sellingPrice, 0);
  const potentialProfit = totalAssetSelling - totalAssetPurchase;

  // Format rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // 5. Susun daftar barang kritis (prioritas: 1. Sudah Kedaluwarsa, 2. Mendekati Kedaluwarsa, 3. Stok Habis/Tipis)
  const criticalItems = [...products]
    .map((p) => {
      const exp = getExpiryStatus(p.expiryDate);
      const isLowStock = p.stock <= p.minStock;
      
      let priority = 0; // 0 = Aman
      let reason = '';
      let type: 'danger' | 'warning' = 'warning';

      if (exp.status === 'expired') {
        priority = 3;
        reason = `SUDAH KEDALUWARSA`;
        type = 'danger';
      } else if (exp.status === 'near-expiry') {
        priority = 2;
        reason = `Mau Kedaluwarsa (${exp.label})`;
        type = 'warning';
      } else if (isLowStock) {
        priority = 1;
        reason = p.stock === 0 ? 'Stok HABIS!' : `Stok Sedikit (Sisa ${p.stock} ${p.unit.split(' ')[0]})`;
        type = p.stock === 0 ? 'danger' : 'warning';
      }

      return { product: p, priority, reason, type };
    })
    .filter((item) => item.priority > 0)
    .sort((a, b) => b.priority - a.priority); // Urutan tertinggi dulu

  // 6. Hitung jumlah produk per kategori
  const categoryCounts: Record<string, number> = {};
  
  // Inisialisasi kategori terdaftar
  categories.forEach((cat) => {
    categoryCounts[cat] = 0;
  });

  if (categories.length === 0) {
    categoryCounts['Belum Ada Kategori'] = 0;
  }

  products.forEach((p) => {
    if (categoryCounts[p.category] !== undefined) {
      categoryCounts[p.category]++;
    } else {
      // Jika produk memiliki kategori yang tidak ada di daftar (safety check)
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }
  });

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  return (
    <div className={styles.container}>
      {/* Header Selamat Datang */}
      <div className={styles.titleSection}>
        <h1 id="dashboard-title">Laporan Toko Hari Ini</h1>
        <p>Pantau jumlah obat tani dan tanggal kedaluwarsa dengan mudah.</p>
      </div>

      {/* Grid Kartu Utama */}
      <div className={styles.statsGrid}>
        <div 
          className={`${styles.statCard} ${styles.totalCard}`}
          onClick={() => onNavigateToTab('inventory')}
          style={{ cursor: 'pointer' }}
          id="stat-total-products"
        >
          <div className={styles.iconWrapper}>📦</div>
          <div className={styles.infoWrapper}>
            <span className={styles.statLabel}>Macam Obat Tani</span>
            <span className={styles.statValue}>{totalProducts} Macam</span>
          </div>
        </div>

        <div 
          className={`${styles.statCard} ${styles.warningCard}`}
          onClick={() => onNavigateToTab('inventory')}
          style={{ cursor: 'pointer' }}
          id="stat-low-stock"
        >
          <div className={styles.iconWrapper}>⚠️</div>
          <div className={styles.infoWrapper}>
            <span className={styles.statLabel}>Obat Mau Habis</span>
            <span className={`${styles.statValue} ${totalLowStock > 0 ? styles.warningText : ''}`}>
              {totalLowStock} Obat
            </span>
          </div>
        </div>

        <div 
          className={`${styles.statCard} ${styles.dangerCard}`}
          onClick={() => onNavigateToTab('inventory')}
          style={{ cursor: 'pointer' }}
          id="stat-expired"
        >
          <div className={styles.iconWrapper}>⏰</div>
          <div className={styles.infoWrapper}>
            <span className={styles.statLabel}>Sudah Kedaluwarsa</span>
            <span className={`${styles.statValue} ${totalCriticalExpiry > 0 ? styles.dangerText : ''}`}>
              {totalCriticalExpiry} Obat
            </span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.assetCard}`} id="stat-total-assets">
          <div className={styles.iconWrapper}>💰</div>
          <div className={styles.infoWrapper}>
            <span className={styles.statLabel}>Modal Stok Obat</span>
            <span className={styles.statValue}>{formatRupiah(totalAssetPurchase)}</span>
          </div>
        </div>
      </div>

      {/* Bagian Peringatan Kritis & Grafik Kategori */}
      <div className={styles.alertSection}>
        {/* Panel 1: Daftar Tindakan Cepat (Barang Bermasalah) */}
        <div className={styles.panel} id="critical-items-panel">
          <h2 className={styles.panelTitle}>
            <span className={styles.panelTitleIcon}>🚨</span> Penting! Perlu Tindakan
          </h2>

          {criticalItems.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyStateIcon}>✅</span>
              <p>Bagus! Semua obat aman. Tidak ada obat yang mau habis atau kedaluwarsa.</p>
            </div>
          ) : (
            <div className={styles.criticalList}>
              {criticalItems.slice(0, 4).map((item) => (
                <div
                  key={item.product.id}
                  className={`${styles.criticalItem} ${
                    item.type === 'danger' ? styles.criticalItemDanger : styles.criticalItemWarning
                  }`}
                >
                  <div className={styles.itemMainInfo}>
                    <div className={styles.itemName}>{item.product.name}</div>
                    <div className={styles.itemMeta}>
                      <span className={`${styles.badge} ${styles.badgeCategory}`}>
                        {item.product.category}
                      </span>
                      <span className={`${styles.badge} ${
                        item.type === 'danger' ? styles.badgeStatusDanger : styles.badgeStatusWarning
                      }`}>
                        {item.reason}
                      </span>
                      <span>Rak: {item.product.shelfLocation}</span>
                    </div>
                  </div>
                  
                  <div>
                    {item.product.stock <= item.product.minStock ? (
                      <button
                        className={styles.actionButton}
                        onClick={() => onQuickRestock(item.product.id)}
                        id={`btn-quick-restock-${item.product.id}`}
                      >
                        + Isi Stok
                      </button>
                    ) : (
                      <button
                        className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                        onClick={() => onNavigateToTab('inventory')}
                        id={`btn-view-${item.product.id}`}
                      >
                        Lihat Obat
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {criticalItems.length > 4 && (
                <button 
                  className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                  onClick={() => onNavigateToTab('inventory')}
                  style={{ width: '100%', marginTop: '8px', padding: '12px' }}
                >
                  Lihat Semua {criticalItems.length} Masalah...
                </button>
              )}
            </div>
          )}
        </div>

        {/* Panel 2: Distribusi Kategori & Estimasi Keuntungan */}
        <div className={styles.panel} id="category-distribution-panel">
          <h2 className={styles.panelTitle}>
            <span className={styles.panelTitleIcon}>📊</span> Obat per Jenis
          </h2>
          
          <div className={styles.categoryList}>
            {Object.entries(categoryCounts).map(([catName, count]) => {
              const percentage = (count / maxCategoryCount) * 100;
              return (
                <div key={catName} className={styles.categoryRow}>
                  <div className={styles.categoryHeader}>
                    <span>{catName}</span>
                    <span>{count} Obat</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Taksiran Nilai Toko
            </h3>
            <div className={styles.assetPanelGrid}>
              <div className={styles.assetSubCard}>
                <span className={styles.assetSubLabel}>Taksiran Harga Jual (Jika Terjual Semua)</span>
                <div className={styles.assetSubValue}>{formatRupiah(totalAssetSelling)}</div>
              </div>
              <div className={styles.assetSubCard}>
                <span className={styles.assetSubLabel}>Perkiraan Untung</span>
                <div className={`${styles.assetSubValue} ${styles.profitText}`}>
                  {formatRupiah(potentialProfit)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
