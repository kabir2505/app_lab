import Navbar from "./Navbar";


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        {/* This container will look good on any desktop */}
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}


