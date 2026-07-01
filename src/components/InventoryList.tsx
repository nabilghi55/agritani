'use client';

import React, { useState } from 'react';
import { Product, Supplier } from '../types';
import styles from './InventoryList.module.css';

interface InventoryListProps {
  products: Product[];
  suppliers: Supplier[];
  categories: string[];
  onAddCategory: (category: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAdjustStock: (productId: string, amount: number, type: 'in' | 'out', notes: string) => void;
  initialSelectedProductId?: string | null;
  onClearSelectedProductId?: () => void;
}

type CategoryFilter = string;

export default function InventoryList({
  products,
  suppliers,
  categories,
  onAddCategory,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAdjustStock,
  initialSelectedProductId,
  onClearSelectedProductId,
}: InventoryListProps) {
  // State Pencarian & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Semua');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [filterExpired, setFilterExpired] = useState(false);

  // State Modal Edit / Tambah
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // State Modal Penyesuaian Stok Cepat (+ / -)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('out');
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(1);
  const [adjustNote, setAdjustNote] = useState<string>('');

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formActiveIngredient, setFormActiveIngredient] = useState('');
  const [formCategory, setFormCategory] = useState<string>('');
  const [formStock, setFormStock] = useState<number>(0);
  const [formUnit, setFormUnit] = useState('Botol (250 ml)');
  const [formShelfLocation, setFormShelfLocation] = useState('Rak A-1');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formMinStock, setFormMinStock] = useState<number>(5);
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formSupplierId, setFormSupplierId] = useState('');

  // Inline Category Addition State
  const [isAddingNewCategoryInline, setIsAddingNewCategoryInline] = useState(false);
  const [newCategoryInputValue, setNewCategoryInputValue] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper evaluasi kedaluwarsa
  const getExpiryStatus = (dateStr: string) => {
    if (!dateStr) return { status: 'safe', label: '' };
    const expDate = new Date(dateStr);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', label: 'SUDAH KEDALUWARSA' };
    } else if (diffDays <= 30) {
      return { status: 'near-expiry', label: `Kedaluwarsa ${diffDays} hari lagi` };
    }
    return { status: 'safe', label: 'Aman' };
  };

  // Filter produk
  const filteredProducts = products.filter((product) => {
    // 1. Filter Kategori
    if (selectedCategory !== 'Semua' && product.category !== selectedCategory) {
      return false;
    }

    // 2. Filter Pencarian (Nama atau Bahan Aktif)
    const query = searchQuery.toLowerCase();
    const matchSearch =
      product.name.toLowerCase().includes(query) ||
      product.activeIngredient.toLowerCase().includes(query) ||
      product.shelfLocation.toLowerCase().includes(query);
    if (!matchSearch) return false;

    // 3. Filter Stok Tipis
    if (filterLowStock && product.stock > product.minStock) {
      return false;
    }

    // 4. Filter Kedaluwarsa
    if (filterExpired) {
      const exp = getExpiryStatus(product.expiryDate);
      if (exp.status !== 'expired' && exp.status !== 'near-expiry') {
        return false;
      }
    }

    return true;
  });

  // Membuka modal tambah produk
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormActiveIngredient('');
    setFormCategory(categories[0] || '');
    setFormStock(10);
    setFormUnit('Botol (250 ml)');
    setFormShelfLocation('Rak B-1');
    setIsAddingNewCategoryInline(false);
    setNewCategoryInputValue('');
    
    // Default expiry 1 tahun ke depan
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setFormExpiryDate(nextYear.toISOString().split('T')[0]);
    
    setFormMinStock(5);
    setFormPurchasePrice(50000);
    setFormSellingPrice(60000);
    setFormSupplierId(suppliers[0]?.id || '');
    setIsFormModalOpen(true);
  };

  // Membuka modal edit produk
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormActiveIngredient(product.activeIngredient);
    setFormCategory(product.category);
    setFormStock(product.stock);
    setFormUnit(product.unit);
    setFormShelfLocation(product.shelfLocation);
    setFormExpiryDate(product.expiryDate);
    setFormMinStock(product.minStock);
    setFormPurchasePrice(product.purchasePrice);
    setFormSellingPrice(product.sellingPrice);
    setFormSupplierId(product.supplierId);
    setIsAddingNewCategoryInline(false);
    setNewCategoryInputValue('');
    setIsFormModalOpen(true);
  };

  // Menyimpan data form (Tambah / Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Nama produk tidak boleh kosong!');
      return;
    }

    const productData = {
      name: formName,
      activeIngredient: formActiveIngredient,
      category: formCategory,
      stock: Number(formStock),
      unit: formUnit,
      shelfLocation: formShelfLocation,
      expiryDate: formExpiryDate,
      minStock: Number(formMinStock),
      purchasePrice: Number(formPurchasePrice),
      sellingPrice: Number(formSellingPrice),
      supplierId: formSupplierId,
    };

    if (editingProduct) {
      onEditProduct({ ...productData, id: editingProduct.id });
    } else {
      onAddProduct(productData);
    }
    setIsFormModalOpen(false);
  };

  // Buka modal stok cepat (+ / -)
  const handleOpenAdjustModal = (product: Product, type: 'in' | 'out') => {
    setAdjustProduct(product);
    setAdjustType(type);
    setAdjustAmount(type === 'out' ? 1 : 10); // Penjualan biasanya eceran (1), kulakan biasanya grosir (10)
    setAdjustNote(type === 'out' ? 'Penjualan Eceran' : 'Pembelian Baru (Restok)');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = () => {
    if (!adjustProduct) return;
    if (adjustAmount <= 0) {
      alert('Jumlah penyesuaian harus lebih dari 0!');
      return;
    }

    if (adjustType === 'out' && adjustProduct.stock < adjustAmount) {
      alert(`Stok tidak mencukupi! Stok saat ini: ${adjustProduct.stock}`);
      return;
    }

    onAdjustStock(adjustProduct.id, adjustAmount, adjustType, adjustNote);
    setIsAdjustModalOpen(false);
  };

  // Format Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Otomatis tangani produk terpilih dari dashboard
  React.useEffect(() => {
    if (initialSelectedProductId) {
      const targetProduct = products.find((p) => p.id === initialSelectedProductId);
      if (targetProduct) {
        handleOpenAdjustModal(targetProduct, 'in');
      }
      if (onClearSelectedProductId) {
        onClearSelectedProductId();
      }
    }
  }, [initialSelectedProductId]);

  return (
    <div className={styles.container}>
      {/* 1. Bar Pencarian dan Tombol Tambah */}
      <div className={styles.controlBar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            id="inventory-search"
            type="text"
            className={styles.searchInput}
            placeholder="Cari nama obat, bahan aktif, atau lokasi rak..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          id="btn-add-product"
          className={styles.addButton} 
          onClick={handleOpenAddModal}
        >
          ➕ Tambah Obat Baru
        </button>
      </div>

      {/* 2. Filter Kategori & Status */}
      <div className={styles.filterSection} id="filter-section">
        {/* Kategori */}
        <div className={styles.categoryScroll}>
          {['Semua', ...categories].map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryTab} ${selectedCategory === cat ? styles.categoryTabActive : ''}`}
              onClick={() => setSelectedCategory(cat)}
              id={`tab-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat}
            </button>
          ))}
          {categories.length === 0 && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
              💡 Belum ada jenis obat. Klik "Tambah Obat Baru" untuk menulis jenis obat pertama!
            </span>
          )}
        </div>

        {/* Filter Cepat (Checkbox) */}
        <div className={styles.quickFilters}>
          <label className={styles.checkboxLabel} id="lbl-filter-low-stock">
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
            />
            ⚠️ Hanya Obat Mau Habis / Habis
          </label>
          <label className={styles.checkboxLabel} id="lbl-filter-expired">
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={filterExpired}
              onChange={(e) => setFilterExpired(e.target.checked)}
            />
            ⏰ Hanya Obat Kedaluwarsa / Hampir Kedaluwarsa
          </label>
        </div>
      </div>

      {/* 3. Daftar Produk */}
      <div className={styles.productListGrid} id="product-list-grid">
        {filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyStateIcon}>🔍</span>
            <h3>Obat Tidak Ditemukan</h3>
            <p>Tidak ada obat yang cocok dengan pencarian atau saringan Anda.</p>
            {(searchQuery || selectedCategory !== 'Semua' || filterLowStock || filterExpired) && (
              <button
                className={styles.resetFilterBtn}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Semua');
                  setFilterLowStock(false);
                  setFilterExpired(false);
                }}
              >
                Atur Ulang Pencarian & Saringan
              </button>
            )}
          </div>
        ) : (
          filteredProducts.map((product) => {
            const exp = getExpiryStatus(product.expiryDate);
            const isLowStock = product.stock <= product.minStock;
            
            // Tentukan warna status
            let stripeClass = styles.stripeNormal;
            let statusBadge = null;

            if (exp.status === 'expired') {
              stripeClass = styles.stripeDanger;
              statusBadge = <span className={`${styles.badge} ${styles.badgeStatusDanger}`}>Kedaluwarsa</span>;
            } else if (exp.status === 'near-expiry') {
              stripeClass = styles.stripeWarning;
              statusBadge = <span className={`${styles.badge} ${styles.badgeStatusWarning}`}>Hampir Exp</span>;
            } else if (product.stock === 0) {
              stripeClass = styles.stripeDanger;
              statusBadge = <span className={`${styles.badge} ${styles.badgeStatusDanger}`}>Stok Habis</span>;
            } else if (isLowStock) {
              stripeClass = styles.stripeWarning;
              statusBadge = <span className={`${styles.badge} ${styles.badgeStatusWarning}`}>Stok Sedikit</span>;
            }

            const supplierName = suppliers.find(s => s.id === product.supplierId)?.name || 'Tanpa Sales / Agen';

            return (
              <div key={product.id} className={styles.productCard} id={`product-card-${product.id}`}>
                {/* Garis Warna Status */}
                <div className={`${styles.statusStripe} ${stripeClass}`} />

                {/* Info Produk */}
                <div className={styles.productDetails}>
                  <div className={styles.productHeader}>
                    <span className={styles.productName}>{product.name}</span>
                    <span className={`${styles.badge} ${styles.badgeCategory}`}>{product.category}</span>
                    {statusBadge}
                  </div>
                  <span className={styles.activeIngredient}>
                    Bahan Aktif: {product.activeIngredient || '-'}
                  </span>
                  
                  <div className={styles.metaInfoGroup}>
                    <div className={styles.metaItem}>
                      📍 <span>Rak: <strong>{product.shelfLocation}</strong></span>
                    </div>
                    <div className={styles.metaItem}>
                      📅 <span>Exp: <strong style={{ color: exp.status !== 'safe' ? 'var(--danger-600)' : 'inherit' }}>{product.expiryDate}</strong></span>
                    </div>
                    <div className={styles.metaItem}>
                      🚚 <span>Sales: <strong>{supplierName}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Pengontrol Stok Cepat (+ / -) - COCOK UNTUK GAPTEK */}
                <div className={styles.stockSection}>
                  <span className={styles.stockLabel}>Sisa Stok</span>
                  <div className={styles.stockCount}>
                    <span className={styles.stockValue}>{product.stock}</span>
                    <span className={styles.stockUnit}>{product.unit}</span>
                  </div>
                  
                  <div className={styles.adjustControls}>
                    <button
                      className={`${styles.adjustBtn} ${styles.minusBtn}`}
                      title="Kurangi Stok (Terjual)"
                      onClick={() => handleOpenAdjustModal(product, 'out')}
                      id={`btn-minus-${product.id}`}
                    >
                      -
                    </button>
                    <button
                      className={`${styles.adjustBtn} ${styles.plusBtn}`}
                      title="Tambah Stok (Beli Baru)"
                      onClick={() => handleOpenAdjustModal(product, 'in')}
                      id={`btn-plus-${product.id}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Harga dan Aksi */}
                <div className={styles.priceSection}>
                  <div>
                    <span className={styles.priceLabel}>Harga Jual</span>
                    <div className={styles.priceValue}>{formatRupiah(product.sellingPrice)}</div>
                  </div>
                  <div className={styles.pricePurchase}>
                    Modal Beli: {formatRupiah(product.purchasePrice)}
                  </div>
                  
                  <div className={styles.cardActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleOpenEditModal(product)}
                      id={`btn-edit-${product.id}`}
                    >
                      📝 Ubah
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => {
                        if (confirm(`Hapus obat ${product.name} dari daftar?`)) {
                          onDeleteProduct(product.id);
                        }
                      }}
                      id={`btn-delete-${product.id}`}
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. MODAL FORM (TAMBAH / EDIT PRODUK) */}
      {isFormModalOpen && (
        <div className={styles.modalOverlay} id="form-modal-overlay">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle} id="form-modal-title">
                {editingProduct ? '📝 Ubah Data Obat' : '➕ Tambah Obat Baru'}
              </h3>
              <button className={styles.closeBtn} onClick={() => setIsFormModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSaveProduct}>
              <div className={styles.modalBody}>
                {/* Nama & Bahan Aktif */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nama Obat / Merk *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Roundup 486 SL"
                    className={styles.formInput}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    id="input-product-name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bahan Aktif</label>
                  <input
                    type="text"
                    placeholder="Contoh: Isopropilamina Glifosat"
                    className={styles.formInput}
                    value={formActiveIngredient}
                    onChange={(e) => setFormActiveIngredient(e.target.value)}
                    id="input-product-active-ingredient"
                  />
                </div>

                {/* Kategori & Satuan */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Jenis Obat *</label>
                    {!isAddingNewCategoryInline ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          className={styles.formInput}
                          style={{ flex: 1 }}
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          id="input-product-category"
                          required
                        >
                          <option value="" disabled>-- Pilih Jenis Obat --</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className={styles.editBtn}
                          style={{ margin: 0, padding: '10px 14px', whiteSpace: 'nowrap' }}
                          onClick={() => setIsAddingNewCategoryInline(true)}
                        >
                          ➕ Baru
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Tulis Jenis Obat Baru..."
                          className={styles.formInput}
                          style={{ flex: 1 }}
                          value={newCategoryInputValue}
                          onChange={(e) => setNewCategoryInputValue(e.target.value)}
                          id="input-new-category-inline"
                        />
                        <button
                          type="button"
                          className={styles.btnSave}
                          style={{ margin: 0, padding: '10px 14px' }}
                          onClick={() => {
                            const trimmed = newCategoryInputValue.trim();
                            if (trimmed) {
                              onAddCategory(trimmed);
                              setFormCategory(trimmed);
                              setNewCategoryInputValue('');
                              setIsAddingNewCategoryInline(false);
                            } else {
                              alert('Nama jenis obat tidak boleh kosong!');
                            }
                          }}
                        >
                          ✔
                        </button>
                        <button
                          type="button"
                          className={styles.btnCancel}
                          style={{ margin: 0, padding: '10px 14px' }}
                          onClick={() => setIsAddingNewCategoryInline(false)}
                        >
                          ✘
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Kemasan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Botol (1 Liter), Bungkus (500g)"
                      className={styles.formInput}
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      id="input-product-unit"
                    />
                  </div>
                </div>

                {/* Stok & Minimal Stok */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Stok Sekarang</label>
                    <input
                      type="number"
                      min="0"
                      className={styles.formInput}
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      disabled={!!editingProduct} // Supaya edit stok pakai tombol cepat +/- demi pencatatan riwayat transaksi
                      id="input-product-stock"
                    />
                    {editingProduct && (
                      <span className={styles.formHelper}>Mengubah stok dilakukan lewat tombol + / - di luar</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Batas Stok Sedikit</label>
                    <input
                      type="number"
                      min="1"
                      className={styles.formInput}
                      value={formMinStock}
                      onChange={(e) => setFormMinStock(Number(e.target.value))}
                      id="input-product-min-stock"
                    />
                    <span className={styles.formHelper}>Aplikasi akan memberi tanda jika stok obat di bawah batas ini</span>
                  </div>
                </div>

                {/* Harga Beli & Harga Jual */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Harga Beli (Modal) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="Harga beli dari sales/agen"
                      className={styles.formInput}
                      value={formPurchasePrice}
                      onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                      id="input-product-purchase-price"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Harga Jual ke Petani *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="Harga jual di toko"
                      className={styles.formInput}
                      value={formSellingPrice}
                      onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                      id="input-product-selling-price"
                    />
                  </div>
                </div>

                {/* Tanggal Exp & Rak */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tanggal Kedaluwarsa *</label>
                    <input
                      type="date"
                      required
                      className={styles.formInput}
                      value={formExpiryDate}
                      onChange={(e) => setFormExpiryDate(e.target.value)}
                      id="input-product-expiry-date"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Simpan di Rak Mana</label>
                    <input
                      type="text"
                      placeholder="Contoh: Rak A-1, Rak B-2"
                      className={styles.formInput}
                      value={formShelfLocation}
                      onChange={(e) => setFormShelfLocation(e.target.value)}
                      id="input-product-shelf-location"
                    />
                  </div>
                </div>

                {/* Penyuplai */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sales / Agen Penyedia</label>
                  <select
                    className={styles.formInput}
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    id="input-product-supplier-id"
                  >
                    <option value="">-- Pilih Sales / Agen --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setIsFormModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className={styles.btnSave} id="btn-save-product">
                  Simpan Obat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL PENYESUAIAN STOK CEPAT (+ / -) - DESAIN GAPTEK FRIENDLY */}
      {isAdjustModalOpen && adjustProduct && (
        <div className={styles.modalOverlay} id="adjust-modal-overlay">
          <div className={styles.modalContent} style={{ maxWidth: '450px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle} id="adjust-modal-title">
                {adjustType === 'in' ? '📈 Tambah Stok (Belanja Baru)' : '📉 Kurangi Stok (Terjual/Rusak)'}
              </h3>
              <button className={styles.closeBtn} onClick={() => setIsAdjustModalOpen(false)}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={`${styles.quickTxInfo} ${adjustType === 'out' ? styles.quickTxInfoDanger : ''}`}>
                <strong>{adjustProduct.name}</strong> ({adjustProduct.category})<br />
                Sisa Stok di Toko: <strong>{adjustProduct.stock} {adjustProduct.unit.split(' ')[0]}</strong>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} style={{ fontSize: '15px' }}>
                  Jumlah yang {adjustType === 'in' ? 'Masuk (+)' : 'Keluar (-)'} ({adjustProduct.unit.split(' ')[0]})
                </label>
                <input
                  type="number"
                  min="1"
                  className={styles.formInput}
                  style={{ fontSize: '20px', fontWeight: 'bold', padding: '12px', textAlign: 'center' }}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  id="input-adjust-amount"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Catatan Stok</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Tulis catatan di sini..."
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  id="input-adjust-notes"
                />
                
                {/* TOMBOL PINTAS CATATAN - GAPTEK FRIENDLY: TINGGAL KLIK TANPA KETIK */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {adjustType === 'out' ? (
                    <>
                      <button
                        type="button"
                        className={styles.editBtn}
                        style={{ margin: 0, padding: '8px 12px', fontSize: '12px' }}
                        onClick={() => setAdjustNote('Terjual Eceran')}
                      >
                        🛍️ Terjual Eceran
                      </button>
                      <button
                        type="button"
                        className={styles.editBtn}
                        style={{ margin: 0, padding: '8px 12px', fontSize: '12px' }}
                        onClick={() => setAdjustNote('Obat Rusak / Bocor')}
                      >
                        💥 Obat Rusak
                      </button>
                      <button
                        type="button"
                        className={styles.editBtn}
                        style={{ margin: 0, padding: '8px 12px', fontSize: '12px' }}
                        onClick={() => setAdjustNote('Kedaluwarsa & Dibuang')}
                      >
                        🗑️ Expired Dibuang
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.editBtn}
                        style={{ margin: 0, padding: '8px 12px', fontSize: '12px' }}
                        onClick={() => setAdjustNote('Belanja Baru dari Sales')}
                      >
                        🚚 Belanja Baru
                      </button>
                      <button
                        type="button"
                        className={styles.editBtn}
                        style={{ margin: 0, padding: '8px 12px', fontSize: '12px' }}
                        onClick={() => setAdjustNote('Pengembalian Pelanggan')}
                      >
                        🔄 Retur Pelanggan
                      </button>
                      <button
                        type="button"
                        className={styles.editBtn}
                        style={{ margin: 0, padding: '8px 12px', fontSize: '12px' }}
                        onClick={() => setAdjustNote('Koreksi Sisa Stok')}
                      >
                        ✏️ Koreksi Stok
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setIsAdjustModalOpen(false)}
              >
                Batal
              </button>
              <button 
                type="button" 
                className={styles.btnSave} 
                style={{ backgroundColor: adjustType === 'out' ? 'var(--danger-600)' : 'var(--primary-600)' }}
                onClick={handleSaveAdjustment}
                id="btn-save-adjust"
              >
                {adjustType === 'in' ? '📈 Ya, Tambahkan' : '📉 Ya, Kurangkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
