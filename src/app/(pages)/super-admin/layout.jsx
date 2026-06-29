import SuperAdminHeader from "@/components/SuperAdminHeader";

export default function SuperAdminLayout({ children }) {
  return (
    <div className="h-screen overflow-hidden">
      <SuperAdminHeader />
      {children}
    </div>
  );
}
