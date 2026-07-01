'use client';

import React, { useState } from 'react';
import { Supplier } from '../types';
import styles from './Suppliers.module.css';
import formStyles from './InventoryList.module.css'; // Ganti pakai form styles inventory biar konsisten

interface SuppliersProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
}

export default function Suppliers({
  suppliers,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
}: SuppliersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setName('');
    setPhone('');
    setAddress('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setName(supplier.name);
    setPhone(supplier.phone);
    setAddress(supplier.address);
    setDescription(supplier.description);
    setIsModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama distributor wajib diisi!');
      return;
    }

    const supplierData = {
      name,
      phone,
      address,
      description,
    };

    if (editingSupplier) {
      onEditSupplier({ ...supplierData, id: editingSupplier.id });
    } else {
      onAddSupplier(supplierData);
    }
    setIsModalOpen(false);
  };

  // WhatsApp Order Generator
  const getWhatsAppLink = (supplier: Supplier) => {
    // Bersihkan nomor HP agar format internasional
    let cleanPhone = supplier.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    
    const message = `Halo ${supplier.name}, saya pemilik Toko Pertanian ingin memesan beberapa produk pestisida yang stoknya menipis di toko saya. Mohon infokan daftar harga terbaru. Terima kasih.`;
    const encodedMessage = encodeURIComponent(message);
    
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.titleSection}>
        <div className={styles.titleText}>
          <h1 id="suppliers-title">Daftar Sales / Agen Obat</h1>
          <p>Simpan nomor WhatsApp sales atau toko agen untuk memesan obat pertanian.</p>
        </div>
        <button 
          id="btn-add-supplier"
          className={styles.addButton} 
          onClick={handleOpenAddModal}
        >
          ➕ Tambah Sales Baru
        </button>
      </div>

      {/* Grid Distributor */}
      <div className={styles.supplierGrid} id="supplier-grid">
        {suppliers.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyStateIcon}>👥</span>
            <h3>Belum ada kontak sales</h3>
            <p>Klik tombol di atas untuk menambah kontak sales pertama Anda.</p>
          </div>
        ) : (
          suppliers.map((supplier) => (
            <div 
              key={supplier.id} 
              className={styles.supplierCard}
              id={`supplier-card-${supplier.id}`}
            >
              <div className={styles.supplierInfo}>
                <h3 className={styles.supplierName}>{supplier.name}</h3>
                
                {supplier.description && (
                  <p className={styles.supplierDesc}>{supplier.description}</p>
                )}

                <div className={styles.contactDetails}>
                  <div className={styles.contactItem}>
                    <span className={styles.contactIcon}>📞</span>
                    <span>Nomor WA / HP: <strong>{supplier.phone || '-'}</strong></span>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactIcon}>📍</span>
                    <span>Alamat: {supplier.address || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Footer Aksi */}
              <div className={styles.cardFooter}>
                <div className={styles.supplierAdminActions}>
                  <button
                    className={styles.btnEdit}
                    onClick={() => handleOpenEditModal(supplier)}
                    id={`btn-edit-supplier-${supplier.id}`}
                  >
                    ✏️ Ubah
                  </button>
                  <button
                    className={styles.btnDelete}
                    onClick={() => {
                      if (confirm(`Hapus kontak sales "${supplier.name}"?`)) {
                        onDeleteSupplier(supplier.id);
                      }
                    }}
                    id={`btn-delete-supplier-${supplier.id}`}
                  >
                    🗑️ Hapus
                  </button>
                </div>

                {supplier.phone && (
                  <a
                    href={getWhatsAppLink(supplier)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waButton}
                    id={`btn-wa-order-${supplier.id}`}
                  >
                    <span className={styles.waIcon}>💬</span>
                    <span>Hubungi lewat WA</span>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL FORM TAMBAH / EDIT SUPPLIER */}
      {isModalOpen && (
        <div className={formStyles.modalOverlay} id="supplier-modal-overlay">
          <div className={formStyles.modalContent} style={{ maxWidth: '500px' }}>
            <div className={formStyles.modalHeader}>
              <h3 className={formStyles.modalTitle}>
                {editingSupplier ? '📝 Ubah Data Sales' : '➕ Tambah Sales Baru'}
              </h3>
              <button className={formStyles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSaveSupplier}>
              <div className={formStyles.modalBody}>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.formLabel}>Nama Sales / Nama Toko Agen *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Syngenta Indonesia / Toko Tani Makmur"
                    className={formStyles.formInput}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="input-supplier-name"
                  />
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.formLabel}>Nomor WhatsApp / HP *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081234567890"
                    className={formStyles.formInput}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    id="input-supplier-phone"
                  />
                  <span className={formStyles.formHelper}>Digunakan untuk mempermudah kirim pesanan lewat WhatsApp</span>
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.formLabel}>Alamat Kantor / Toko</label>
                  <textarea
                    rows={2}
                    placeholder="Masukkan alamat lengkap..."
                    className={formStyles.formInput}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    id="input-supplier-address"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.formLabel}>Keterangan Obat yang Dijual</label>
                  <input
                    type="text"
                    placeholder="Contoh: Agen resmi Roundup dan Gramoxone"
                    className={formStyles.formInput}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    id="input-supplier-desc"
                  />
                </div>
              </div>

              <div className={formStyles.modalFooter}>
                <button
                  type="button"
                  className={formStyles.btnCancel}
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className={formStyles.btnSave} id="btn-save-supplier">
                  Simpan Kontak Sales
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
