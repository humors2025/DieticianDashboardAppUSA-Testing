

"use client";

import Link from "next/link";
import React, { useState } from "react";
import { loginService, updateDietPlanStatusService } from "@/services/authService";
import { cookieManager } from "@/lib/cookies";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function LoginForm({ className, ...props }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputError, setInputError] = useState("");

  const B2B2C = ["Qua", "RespyrD01"];

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const res = await loginService(email, password);

  //     cookieManager.set("access_token", res.access_token);
  //     cookieManager.set("dietician", JSON.stringify(res.dietician));

  //     try {
  //       await updateDietPlanStatusService(res?.dietician?.dietician_id);
  //     } catch (dietPlanError) {
  //       console.error("Diet plan status update failed:", dietPlanError);
  //     }

  //     toast.success(`Welcome ${res?.dietician?.name || ""}`, {
  //       description: "You have logged in successfully",
  //     });

  //     const dieticianId = res?.dietician?.dietician_id || "";

  //     // ✅ Routing logic:
  //     // RespyrD01 and Qua -> /partners/dashboard
  //     // everyone else -> /dashboard
  //     if (B2B2C.includes(dieticianId)) {
  //       router.push("/partners/dashboard");
  //     } else {
  //       router.push("/dashboard");
  //     }
  //   } catch (error) {
  //     let errorMessage = "Invalid credentials";

  //     if (error?.isApiError) {
  //       errorMessage =
  //         error.message || error.data?.error || "Invalid credentials";
  //     }

  //     setInputError(errorMessage);
  //     toast.error(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };



const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await loginService(email, password);

    // Check if the password is reset (is_reset_password is 0)
    if (res?.dietician?.is_reset_password === 0) {
      // Don't log in the user and show an error message
      // setInputError("Please update your password before logging in.");
      toast.error("Please update your password before logging in.");

      cookieManager.set("dietician", JSON.stringify(res.dietician));
      
      // Redirect to the password update page immediately
      router.push("/updatepassword");
      
      setLoading(false); // Make sure to stop loading
      return;
    }

    // Proceed with login only if is_reset_password is not 0
    cookieManager.set("access_token", res.access_token);
    cookieManager.set("dietician", JSON.stringify(res.dietician));

    try {
      await updateDietPlanStatusService(res?.dietician?.dietician_id);
    } catch (dietPlanError) {
      console.error("Diet plan status update failed:", dietPlanError);
    }

    toast.success(`Welcome ${res?.dietician?.name || ""}`, {
      description: "You have logged in successfully",
    });

    const dieticianId = res?.dietician?.dietician_id || "";

    // Default routing based on dietician type
    // if (B2B2C.includes(dieticianId)) {
    //   router.push("/partners/dashboard");
    // } else {
    //   router.push("/dashboard");
    // }

    if (dieticianId === "Qua") {
  router.push("/dashboard");
} else {
  router.push("/partners/dashboard");
}


  } catch (error) {
    let errorMessage = "Invalid credentials";

    if (error?.isApiError) {
      errorMessage =
        error.message || error.data?.error || "Invalid credentials";
    }

    setInputError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};







  const togglePasswordVisibility = () => {
    setShowPassword((v) => !v);
  };

  return (
    <div className="flex items-center justify-start">
      <div className="w-full max-w-md bg-white shadow-lg px-[62px] pt-[60px] pb-[54px]">
        <h2 className="text-[34px] font-normal leading-normal tracking-[-2.04] text-[#252525] text-center whitespace-nowrap">
          Welcome Dietician!
        </h2>

        <form onSubmit={handleSubmit} className="mt-[73px] space-y-4">
          <div className="relative">
            <input
              id="email"
              type="email"
              placeholder=" "
              value={email}
              autoComplete="false"
              onChange={(e) => {
                setEmail(e.target.value);
                setInputError("");
              }}
              required
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-1 
                focus:ring-[#E1E6ED] peer 
                ${inputError ? "border-[#DA5747]" : "border-gray-300"}`}
            />
            <label
              htmlFor="email"
              className="absolute left-3 top-3 text-[#A1A1A1] transition-all duration-200 pointer-events-none 
                peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
                peer-focus:top-[-10px] peer-focus:text-[12px] peer-focus:text-[#252525]
                peer-not-placeholder-shown:top-[-10px] peer-not-placeholder-shown:text-sm
                bg-white px-1"
            >
              Enter Email ID
            </label>
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder=" "
              value={password}
              autoComplete="false"
              onChange={(e) => {
                setPassword(e.target.value);
                setInputError("");
              }}
              required
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-1 
                focus:ring-[#E1E6ED] peer pr-10
                ${inputError ? "border-[#DA5747]" : "border-gray-300"}`}
            />
            <label
              htmlFor="password"
              className="absolute left-3 top-3 text-[#A1A1A1] transition-all duration-200 pointer-events-none 
                peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
                peer-focus:top-[-10px] peer-focus:text-[12px] peer-focus:text-[#252525]
                peer-not-placeholder-shown:top-[-10px] peer-not-placeholder-shown:text-sm
                bg-white px-1"
            >
              Enter password
            </label>

            <div
              className="absolute right-3 top-4 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              <Image
                src="/icons/hugeicons_view.svg"
                alt={showPassword ? "Hide password" : "Show password"}
                width={15}
                height={15}
                className={showPassword ? "opacity-50" : "opacity-100"}
              />
            </div>

            <Link
              href="/resetPassword"
              className="flex justify-end mt-1 mb-[92px] text-[#A1A1A1] text-[12px] font-normal leading-[110%] tracking-[-0.24px] hover:underline"
            >
              Forgot password?
            </Link>

            {inputError && (
              <p className="text-[#DA5747] text-[12px] mt-1 absolute -bottom-6">
                {inputError}
              </p>
            )}
          </div>

          <p className="text-[#A1A1A1] text-[12px] font-normal leading-[110%] tracking-[-0.24px] whitespace-nowrap">
            By continuing, you agree to our{" "}
            <a
              href="https://respyr.in/terms-conditions/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="https://respyr.in/privacy_policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Privacy Policy
            </a>
            .
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 cursor-pointer bg-[#308BF9] text-white py-[15px] px-[93px] rounded-lg font-semibold border border-transparent hover:bg-white hover:text-[#252525] hover:border-[#308BF9] transition disabled:opacity-60"
          >
            {loading ? "Continue in..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}








// "use client";

// import Link from "next/link";
// import React, { useState } from "react";
// import { loginService, updateDietPlanStatusService } from "@/services/authService";
// import { cookieManager } from "@/lib/cookies";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// export function LoginForm({ className, ...props }) {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [inputError, setInputError] = useState("");

//   const B2B2C = ["Qua", "RespyrD01"];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await loginService(email, password);

//       cookieManager.set("access_token", res.access_token);
//       cookieManager.set("dietician", JSON.stringify(res.dietician));

//       try {
//         await updateDietPlanStatusService(res?.dietician?.dietician_id);
//       } catch (dietPlanError) {
//         console.error("Diet plan status update failed:", dietPlanError);
//       }

//       toast.success(`Welcome ${res?.dietician?.name || ""}`, {
//         description: "You have logged in successfully",
//       });

//       const dieticianId = res?.dietician?.dietician_id || "";

//       // ✅ Routing logic:
//       // RespyrD01 and Qua -> /partners/dashboard
//       // everyone else -> /dashboard
//       if (B2B2C.includes(dieticianId)) {
//         router.push("/partners/dashboard");
//       } else {
//         router.push("/dashboard");
//       }
//     } catch (error) {
//       let errorMessage = "Invalid credentials";

//       if (error?.isApiError) {
//         errorMessage =
//           error.message || error.data?.error || "Invalid credentials";
//       }

//       setInputError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword((v) => !v);
//   };

//   return (
//     <div className="flex items-center justify-start">
//       <div className="w-full max-w-md bg-white shadow-lg px-[62px] pt-[60px] pb-[54px]">
//         <h2 className="text-[34px] font-normal leading-normal tracking-[-2.04] text-[#252525] text-center whitespace-nowrap">
//           Welcome Dietician!
//         </h2>

//         <form onSubmit={handleSubmit} className="mt-[73px] space-y-4">
//           <div className="relative">
//             <input
//               id="email"
//               type="email"
//               placeholder=" "
//               value={email}
//               autoComplete="false"
//               onChange={(e) => {
//                 setEmail(e.target.value);
//                 setInputError("");
//               }}
//               required
//               className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-1 
//                 focus:ring-[#E1E6ED] peer 
//                 ${inputError ? "border-[#DA5747]" : "border-gray-300"}`}
//             />
//             <label
//               htmlFor="email"
//               className="absolute left-3 top-3 text-[#A1A1A1] transition-all duration-200 pointer-events-none 
//                 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
//                 peer-focus:top-[-10px] peer-focus:text-[12px] peer-focus:text-[#252525]
//                 peer-not-placeholder-shown:top-[-10px] peer-not-placeholder-shown:text-sm
//                 bg-white px-1"
//             >
//               Enter Dietician ID
//             </label>
//           </div>

//           <div className="relative">
//             <input
//               id="password"
//               type={showPassword ? "text" : "password"}
//               placeholder=" "
//               value={password}
//               autoComplete="false"
//               onChange={(e) => {
//                 setPassword(e.target.value);
//                 setInputError("");
//               }}
//               required
//               className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-1 
//                 focus:ring-[#E1E6ED] peer pr-10
//                 ${inputError ? "border-[#DA5747]" : "border-gray-300"}`}
//             />
//             <label
//               htmlFor="password"
//               className="absolute left-3 top-3 text-[#A1A1A1] transition-all duration-200 pointer-events-none 
//                 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
//                 peer-focus:top-[-10px] peer-focus:text-[12px] peer-focus:text-[#252525]
//                 peer-not-placeholder-shown:top-[-10px] peer-not-placeholder-shown:text-sm
//                 bg-white px-1"
//             >
//               Enter password
//             </label>

//             <div
//               className="absolute right-3 top-4 cursor-pointer"
//               onClick={togglePasswordVisibility}
//             >
//               <Image
//                 src="/icons/hugeicons_view.svg"
//                 alt={showPassword ? "Hide password" : "Show password"}
//                 width={15}
//                 height={15}
//                 className={showPassword ? "opacity-50" : "opacity-100"}
//               />
//             </div>

//             <Link
//               href="/resetPassword"
//               className="flex justify-end mt-1 mb-[92px] text-[#A1A1A1] text-[12px] font-normal leading-[110%] tracking-[-0.24px] hover:underline"
//             >
//               Forgot password?
//             </Link>

//             {inputError && (
//               <p className="text-[#DA5747] text-[12px] mt-1 absolute -bottom-6">
//                 {inputError}
//               </p>
//             )}
//           </div>

//           <p className="text-[#A1A1A1] text-[12px] font-normal leading-[110%] tracking-[-0.24px] whitespace-nowrap">
//             By continuing, you agree to our{" "}
//             <a
//               href="https://respyr.in/terms-conditions/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="underline"
//             >
//               Terms
//             </a>{" "}
//             and{" "}
//             <a
//               href="https://respyr.in/privacy_policy/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="underline"
//             >
//               Privacy Policy
//             </a>
//             .
//           </p>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full mt-5 cursor-pointer bg-[#308BF9] text-white py-[15px] px-[93px] rounded-lg font-semibold border border-transparent hover:bg-white hover:text-[#252525] hover:border-[#308BF9] transition disabled:opacity-60"
//           >
//             {loading ? "Continue in..." : "Continue"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
