import Header from "@/components/Header";

export default function AppLayout({children}){
    return(
        <>
        <Header/>
        <main className="mx-[25px]  my-3">
          {children} 
        </main>
        </>
    )
}