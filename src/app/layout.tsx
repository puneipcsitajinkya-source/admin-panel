import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'FirstMart Admin Panel',
  description: 'Manage products and orders for FirstMart',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="admin-layout">
          <Sidebar />
          <div className="main-content">{children}</div>
        </div>
      </body>
    </html>
  );
}
