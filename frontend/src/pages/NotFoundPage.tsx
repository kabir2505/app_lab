import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center px-4">
      <div className="bg-white border border-[#E2E8EF] shadow-sm rounded-lg p-10 max-w-lg w-full text-center">
        
        <h1 className="text-7xl font-semibold text-[#11181C] mb-4 tracking-tight">
          404
        </h1>
        
        <p className="text-lg text-[#697177] mb-3">
          This page could not be found.
        </p>
        
        <p className="text-sm text-[#8B959E] mb-8">
          The link might be broken or the page may have been removed.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-md text-sm font-medium 
                       border border-[#11181C] text-[#11181C]
                       hover:bg-[#11181C] hover:text-white 
                       transition-colors"
          >
            Go Home
          </Link>

          <Link
            to="/events"
            className="px-4 py-2 rounded-md text-sm font-medium
                       border border-[#E2E8EF] text-[#697177]
                       hover:bg-[#F0F3F5]
                       transition-colors"
          >
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
}
