"use client";


import { LoginForm } from "@/components/login-form";
import Image from "next/image";


export default function Home() {


  return (
    <>
<div 
className="flex items-center pl-[25px] w-full min-h-screen"
 style={{
        backgroundImage: "url('/icons/dietician_image_freepik.jpg')", 
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
>

      <LoginForm />
      </div>
    </>
  );
}
