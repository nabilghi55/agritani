'use client';

import React, { useState } from 'react';
import { Transaction } from '../types';
import styles from './StockTransaction.module.css';

interface StockTransactionProps {
  transactions: Transaction[];
}

export default function StockTransaction({ transactions }: StockTransactionProps) {
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filter transaksi
  const filteredTransactions = transactions
    .filter((tx) => {
      // Filter tipe
      if (filterType === 'in' && tx.type !== 'in') return false;
      if (filterType === 'out' && tx.type !== 'out') return false;

      // Filter pencarian
      const query = searchQuery.toLowerCase();
      return (
        tx.productName.toLowerCase().includes(query) ||
        tx.notes.toLowerCase().includes(query)
      );
    })
    // Urutkan transaksi terbaru di atas
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 2. Hitung total transaksi masuk & keluar dalam daftar saat ini
  const totalIn = filteredTransactions
    .filter((tx) => tx.type === 'in')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOut = filteredTransactions
    .filter((tx) => tx.type === 'out')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className={styles.container}>
      {/* Judul Halaman */}
      <div className={styles.titleSection}>
        <h1 id="transactions-title">Catatan Keluar Masuk Obat</h1>
        <p>Catatan kapan obat masuk dan keluar secara berurutan.</p>
      </div>

      {/* Kartu Ringkasan Aktivitas */}
      <div className={styles.summaryWidget}>
        <div className={styles.summaryCard} id="tx-summary-in">
          <div className={`${styles.summaryIcon} ${styles.iconIn}`}>📈</div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Total Obat Masuk</span>
            <span className={styles.summaryValue}>{totalIn} Catatan</span>
          </div>
        </div>

        <div className={styles.summaryCard} id="tx-summary-out">
          <div className={`${styles.summaryIcon} ${styles.iconOut}`}>📉</div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Total Obat Keluar</span>
            <span className={styles.summaryValue}>{totalOut} Catatan</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar} id="tx-filter-bar">
        <div className={styles.btnGroup}>
          <button
            className={`${styles.filterBtn} ${filterType === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterType('all')}
            id="btn-filter-tx-all"
          >
            Semua Catatan
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === 'in' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterType('in')}
            id="btn-filter-tx-in"
          >
            📈 Obat Masuk
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === 'out' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterType('out')}
            id="btn-filter-tx-out"
          >
            📉 Obat Keluar
          </button>
        </div>

        <input
          type="text"
          className={styles.searchInput}
          placeholder="Cari nama obat atau catatan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="input-tx-search"
        />
      </div>

      {/* Daftar Riwayat */}
      <div className={styles.historyContainer}>
        {/* Table Header (Hanya Desktop) */}
        <div className={styles.tableHeader}>
          <span>Tanggal & Jam</span>
          <span>Nama Obat</span>
          <span>Status</span>
          <span>Jumlah</span>
          <span>Keterangan (Catatan)</span>
        </div>

        {/* List Transaksi */}
        {filteredTransactions.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyStateIcon}>📭</span>
            <p>Tidak ada catatan stok obat yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className={styles.transactionList} id="tx-list">
            {filteredTransactions.map((tx) => (
              <div 
                key={tx.id} 
                className={styles.transactionItem}
                id={`tx-item-${tx.id}`}
              >
                {/* Tanggal */}
                <div className={styles.dateCol}>
                  <span style={{ marginRight: '6px' }}>⏰</span>
                  {tx.date}
                </div>

                {/* Nama Produk */}
                <div className={styles.productNameCol}>
                  {tx.productName}
                </div>

                {/* Tipe Badge */}
                <div>
                  {tx.type === 'in' ? (
                    <span className={`${styles.typeBadge} ${styles.badgeIn}`}>
                      📈 Masuk
                    </span>
                  ) : (
                    <span className={`${styles.typeBadge} ${styles.badgeOut}`}>
                      📉 Keluar
                    </span>
                  )}
                </div>

                {/* Jumlah */}
                <div className={`${styles.amountCol} ${tx.type === 'in' ? styles.amountIn : styles.amountOut}`}>
                  {tx.type === 'in' ? `+${tx.amount}` : `-${tx.amount}`}
                </div>

                {/* Keterangan */}
                <div className={styles.notesCol}>
                  {tx.notes || '-'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
