import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgriStok - Sistem Manajemen Stok Toko Pestisida",
  description: "Aplikasi manajemen stok dan kedaluwarsa pestisida yang mudah digunakan dan ramah bagi pelaku usaha tani.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

