import OrganizerNavbar from "./OrganizerNavbar";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OrganizerNavbar />
      <main className="bg-[#F7F9FA] min-h-screen">{children}</main>
    </>
  );
}
