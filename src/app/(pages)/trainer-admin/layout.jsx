import TrainerAdminHeader from "@/components/TrainerAdminHeader";

export default function TrainerAdminLayout({ children }) {
  return (
    <>
      <TrainerAdminHeader />
      {children}
    </>
  );
}
