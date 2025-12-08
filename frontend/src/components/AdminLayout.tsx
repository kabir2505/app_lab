// src/components/AdminLayout.tsx
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 py-10">
        {children}
      </main>
    </div>
  );
}
