import Header from "@/components/Header";

export default function TrainerLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
