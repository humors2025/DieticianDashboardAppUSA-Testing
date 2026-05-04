// "use client";

// import { useState, useRef, useEffect } from "react";
// import { useRouter } from "next/navigation"; 
// import { sendOtpService, resetPasswordService } from "@/services/authService";
// import { toast } from "sonner";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"


// export default function ResetPassword() {
//   const [step, setStep] = useState("reset"); 
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState(["", "", "", ""]);
//   const [serverOtp, setServerOtp] = useState(""); 
//   const [emailError, setEmailError] = useState(""); 
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [resendTimer, setResendTimer] = useState(0); // Timer state

//   const inputRefs = useRef([]);
//   const router = useRouter();

//   // Timer effect
//   useEffect(() => {
//     let interval;
//     if (resendTimer > 0) {
//       interval = setInterval(() => {
//         setResendTimer((prev) => prev - 1);
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [resendTimer]);

//   // Validate passwords match
//   useEffect(() => {
//     if (password && confirmPassword && password !== confirmPassword) {
//       setPasswordError("Passwords do not match");
//     } else {
//       setPasswordError("");
//     }
//   }, [password, confirmPassword]);

//   const handleResetSubmit = async (e) => {
//     e.preventDefault();
//     setEmailError(""); 

//     if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       setEmailError("Please enter a valid email address.");
//       return;
//     }

//     try {
//       const response = await sendOtpService(email);

//       if (response.success) {
//         toast.success(response.message || "OTP sent successfully.");
//         setServerOtp(String(response.otp));
//         setStep("otp");
//         setResendTimer(60); // Start the 60-second timer
//       } else {
//         setEmailError(response.message || "Failed to send OTP."); 
//       }
//     } catch (error) {
//       if (error.isApiError) {
//         if (error.status === 404) {
//           setEmailError(error.data?.message || "Email not found."); 
//         } else {
//           setEmailError(error.data?.message || "Something went wrong."); 
//         }
//         return;
//       }
//       console.error("Unexpected error:", error);
//       setEmailError("Unexpected error occurred. Please try again."); 
//     }
//   };

//   // Handle OTP resend
//   const handleResendOtp = async () => {
//     if (resendTimer > 0) return; // Prevent resend if timer is active
    
//     try {
//       const response = await sendOtpService(email);
      
//       if (response.success) {
//         toast.success("OTP resent successfully!");
//         setResendTimer(60); // Reset the timer
//         setServerOtp(String(response.otp));
//       } else {
//         toast.error(response.message || "Failed to resend OTP.");
//       }
//     } catch (error) {
//       toast.error("Failed to resend OTP. Please try again.");
//     }
//   };

//   // 👉 Verify OTP
//   const handleOtpSubmit = (e) => {
//     e.preventDefault();
//     const enteredOtp = otp.join("");

//     if (enteredOtp === serverOtp) {
//       toast.success("OTP verified successfully!");
//       setStep("forgot");
//     } else {
//       toast.error("Invalid OTP. Please enter the correct code.");
//     }
//   };

//   const handleOtpChange = (value, index) => {
//     if (/^[0-9]?$/.test(value)) {
//       const newOtp = [...otp];
//       newOtp[index] = value;
//       setOtp(newOtp);

//       if (value && index < otp.length - 1) {
//         inputRefs.current[index + 1].focus();
//       }
//     }
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0) {
//       inputRefs.current[index - 1].focus();
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const pasteData = e.clipboardData.getData("text").trim();

//     if (/^[0-9]+$/.test(pasteData)) {
//       const digits = pasteData.split("").slice(0, otp.length);
//       const newOtp = [...otp];

//       digits.forEach((digit, i) => {
//         newOtp[i] = digit;
//         if (inputRefs.current[i]) {
//           inputRefs.current[i].value = digit;
//         }
//       });

//       setOtp(newOtp);
//       const lastIndex = digits.length - 1;
//       if (lastIndex < otp.length) {
//         inputRefs.current[lastIndex].focus();
//       }
//     }
//   };

//   const handlePasswordReset = async (e) => {
//     e.preventDefault();
    
//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       const res = await resetPasswordService(email, password);
//       toast.success(res.message || "Password updated successfully.");
//       setTimeout(() => {
//         router.push("/login");
//       }, 1000);
//     } catch (error) {
//         toast.error(error.data?.message || "Something went wrong. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
//         {step === "reset" && (
//           <>
//           <div className="">
//             <h2 className="text-2xl font-bold text-gray-800 text-center">
//               Reset Password
//             </h2>
//             <p className="text-gray-500 text-center mt-2">
//               Enter your email to receive an OTP.
//             </p> 
//             </div>

//              {/* <CardHeader>
//           <CardTitle>Reset Password</CardTitle>
//           <CardDescription className="whitespace-nowrap">
//            Enter your email to receive an OTP.
//           </CardDescription>
//         </CardHeader> */}

//             <form onSubmit={handleResetSubmit} className="mt-6">
//               {/* <input
//                 type="text"
//                 placeholder="Enter email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
//                   emailError
//                     ? "border-red-500 focus:ring-red-500"
//                     : "focus:ring-blue-500"
//                 }`}
//               /> */}


//                {/* <input 
//                                 id="email" 
//                                 type="email" 
//                                 placeholder="Enter email"
//                                  value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
//                   emailError
//                     ? "border-red-500 focus:ring-red-500"
//                     : "focus:ring-blue-500"
//                 }`}
//                                 required 
//                               /> */}


//                               <div>
//           {/* <label htmlFor="email" className="block text-sm font-medium mb-2">
//             Email
//           </label> */}
//           <input
//             id="email"
//             type="email"
//             placeholder="m@example.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>




//               {emailError && (
//                 <p className="text-red-500 text-sm mt-2">{emailError}</p>
//               )}

//               <Button
//                 type="submit"
//                 className="w-full mt-4 cursor-pointer bg-[#308BF9] text-white py-2 rounded-lg  border border-transparent hover:bg-white hover:text-black hover:border-[#308BF9] transition"
//               >
                
//                 Send OTP
//               </Button>
              
//             </form>
//  <div className="flex justify-center mt-4">
//               <Link
//                 href="/"
//                 className="text-sm font-medium text-gray-600 hover:text-gray-900"
//                 prefetch={false}
//               >
//                 Back to login
//               </Link>
//             </div>

//           </>
//         )}










//         {step === "otp" && (
//           <>
//             <h2 className="text-2xl font-bold text-gray-800 text-center">
//               Enter OTP
//             </h2>
//             <p className="text-gray-500 text-center mt-2">
//               We sent a 4-digit OTP to your email.
//             </p>

//             <form onSubmit={handleOtpSubmit} className="mt-6 space-y-6">
//               <div className="flex justify-center gap-4" onPaste={handlePaste}>
//                 {otp.map((digit, index) => (
//                   <input
//                     key={index}
//                     type="text"
//                     value={digit}
//                     onChange={(e) => handleOtpChange(e.target.value, index)}
//                     onKeyDown={(e) => handleKeyDown(e, index)}
//                     ref={(el) => (inputRefs.current[index] = el)}
//                     className="w-12 h-12 border border-black rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     maxLength="1"
//                   />
//                 ))}
//               </div>

//               <button
//                 type="submit"
//                 className="w-full mt-4 cursor-pointer bg-[#308BF9] text-white py-2 rounded-lg font-semibold border border-transparent hover:bg-white hover:text-black hover:border-[#308BF9] transition"
//               >
//                 Verify OTP
//               </button>
//             </form>

//             <p className="text-sm text-gray-500 text-center mt-4">
//             {resendTimer > 0 ? (
//     <>
//       Resend OTP in{" "}
//       <span className="text-red-500 font-semibold">{resendTimer}</span> seconds
//     </>
//   )  : (
//                 <>
//                   Didn't receive OTP?{" "}
//                   <button
//                     type="button"
//                     className="cursor-pointer text-[#308BF9] hover:underline"
//                     onClick={handleResendOtp}
//                   >
//                     Resend
//                   </button>
//                 </>
//               )}
//             </p>

//              <div className="flex justify-center mt-4">
//               <Link
//                 href="/"
//                 className="text-sm font-medium text-gray-600 hover:text-gray-900"
//                 prefetch={false}
//               >
//                 Back to login
//               </Link>
//             </div>
//           </>
//         )}

//         {step === "forgot" && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-800 text-center">
//               Reset your password
//             </h2>
//             <p className="text-gray-500 text-center">
//               Enter your new password for {email}
//             </p>

//             <form onSubmit={handlePasswordReset} className="space-y-4">
//               <div>
//                 <Label htmlFor="password" className="block text-sm font-medium mb-2">
//                   New Password
//                 </Label>
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   required
//                   placeholder="Enter new password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
//                   Confirm Password
//                 </Label>
//                 <input
//                   id="confirmPassword"
//                   name="confirmPassword"
//                   type="password"
//                   required
//                   placeholder="Confirm your password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 {passwordError && (
//                   <p className="mt-1 text-sm text-red-600">{passwordError}</p>
//                 )}
//               </div>

//               <Button 
//                 type="submit" 
//                 className="w-full cursor-pointer border border-transparent hover:bg-white hover:text-black hover:border-[#308BF9] transition" 
//                 disabled={loading || password !== confirmPassword || !password || !confirmPassword}
//               >
//                 {loading ? "Resetting..." : "Reset password"}
//               </Button>
//             </form>

//             <div className="flex justify-center">
//               <Link
//                 href="/login"
//                 className="text-sm font-medium text-gray-600 hover:text-gray-900"
//                 prefetch={false}
//               >
//                 Back to login
//               </Link>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }











"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendOtpService, resetPasswordService } from "@/services/authService";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

/** ✅ ADDED (no changes to your existing logic) */
function PasswordRule({ label, active }) {
  return (
    <li
      className={`flex items-center gap-2 ${
        active ? "text-green-600" : "text-[#6B7280]"
      }`}
    >
      <span className="text-sm">{active ? "✔" : "✖"}</span>
      <span className="text-sm">{label}</span>
    </li>
  );
}

export default function ResetPassword() {
  const [step, setStep] = useState("reset");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [serverOtp, setServerOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpError, setOtpError] = useState("");

  const inputRefs = useRef([]);
  const router = useRouter();

  // Strong password validation helper
  const isStrongPassword = (value) => {
    // min 8, 1 upper, 1 lower, 1 digit, 1 special
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return strongRegex.test(value);
  };

  /** ✅ ADDED (only for UI hints) */
  const passwordRules = {
    minLength: (pwd) => pwd.length >= 8,
    lowercase: (pwd) => /[a-z]/.test(pwd),
    uppercase: (pwd) => /[A-Z]/.test(pwd),
    numbers: (pwd) => /\d/.test(pwd),
    special: (pwd) => /[^A-Za-z0-9]/.test(pwd),
  };

  /** ✅ ADDED (only for UI hints) */
  const getStrengthScore = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    Object.values(passwordRules).forEach((rule) => {
      if (rule(pwd)) score++;
    });
    return score; // 0..5
  };

  /** ✅ ADDED (only for UI hints) */
  const strengthLabels = [
    "Empty",
    "Weak",
    "Medium",
    "Strong",
    "Very Strong",
    "Super Strong",
  ];

  /** ✅ ADDED (only for UI hints) */
  const strengthScore = getStrengthScore(password);
  const strengthLabel = strengthLabels[strengthScore];

  // Timer effect
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Validate passwords match and strength
  useEffect(() => {
    // if user started typing password
    if (password) {
      if (!isStrongPassword(password)) {
        setPasswordError(
          "Password must be Strong"
        );
        return;
      }
    }

    // matching check
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError("Password not matching");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await sendOtpService(email);

      if (response.success) {
        toast.success(response.message || "OTP sent successfully.");
        setServerOtp(String(response.otp));
        setStep("otp");
        setResendTimer(60);
      } else {
        setEmailError(response.message || "Failed to send OTP.");
      }
    } catch (error) {
      if (error.isApiError) {
        if (error.status === 404) {
          setEmailError(error.data?.message || "Email not found.");
        } else {
          setEmailError(error.data?.message || "Something went wrong.");
        }
        return;
      }
      console.error("Unexpected error:", error);
      setEmailError("Unexpected error occurred. Please try again.");
    }
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      const response = await sendOtpService(email);

      if (response.success) {
        toast.success("OTP resent successfully!");
        setResendTimer(60);
        setServerOtp(String(response.otp));
      } else {
        toast.error(response.message || "Failed to resend OTP.");
      }
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  // Verify OTP
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp === serverOtp) {
      toast.success("OTP verified successfully!");
      setStep("forgot");
      setOtpError("");
    } else {
      toast.error("Invalid OTP. Please enter the correct code.");
      setOtpError("Invalid OTP. Please enter the correct code.");
    }
  };

  const handleOtpChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();

    if (/^[0-9]+$/.test(pasteData)) {
      const digits = pasteData.split("").slice(0, otp.length);
      const newOtp = [...otp];

      digits.forEach((digit, i) => {
        newOtp[i] = digit;
        if (inputRefs.current[i]) {
          inputRefs.current[i].value = digit;
        }
      });

      setOtp(newOtp);
      const lastIndex = digits.length - 1;
      if (lastIndex < otp.length) {
        inputRefs.current[lastIndex].focus();
      }
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!isStrongPassword(password)) {
      toast.error("Please enter a strong password.");
      setPasswordError(
        "Password must be 8+ chars with uppercase, lowercase, number & special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password not matching");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordService(email, password);
      toast.success(res.message || "Password updated successfully.");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      toast.error(error.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex items-center justify-start min-h-screen">
      <div className="w-full max-w-md bg-white shadow-lg px-[62px] pt-[60px] pb-[54px]">
        {step === "reset" && (
          <>
            <h2 className="text-[34px] font-normal leading-normal tracking-[-2.04] text-[#252525] text-center whitespace-nowrap">
              Forgot Password
            </h2>

            <form onSubmit={handleResetSubmit} className="mt-[73px] space-y-4">
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder=" "
                  value={email}
                  autoComplete="false"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E1E6ED] peer ${
                    emailError ? "border-red-500" : ""
                  }`}
                />
                <label
                  htmlFor="email"
                  className="absolute left-3 top-3 text-[#A1A1A1] transition-all duration-200 pointer-events-none 
                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
                   peer-focus:top-[-10px] peer-focus:text-[12px] peer-focus:text-[#252525]
                   peer-not-placeholder-shown:top-[-10px] peer-not-placeholder-shown:text-sm
                   bg-white px-1"
                >
                  Enter Registered Email 
                </label>
                {emailError && (
                  <p className="text-red-500 text-[12px] mt-1">{emailError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer bg-[#308BF9] text-white font-semibold py-[15px] px-[93px] rounded-[10px] text-[12px] border border-transparent hover:bg-white hover:text-[#252525] hover:border-[#308BF9] transition disabled:opacity-60"
              >
                Send OTP
              </button>
            </form>

            <div className="flex justify-center mt-4">
              <Link
                href="/"
                className="text-[#A1A1A1] text-[12px] font-normal leading-[110%] tracking-[-0.24px] hover:underline"
                prefetch={false}
              >
                Back to login
              </Link>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <h2 className="text-[34px] font-normal leading-normal tracking-[-2.04] text-[#252525] text-center whitespace-nowrap">
              Enter OTP
            </h2>
            <p className="text-[#A1A1A1] text-[14px] font-normal leading-[110%] tracking-[-0.24px] text-center mt-4">
              We sent a 4-digit OTP to your email.
            </p>

            <form onSubmit={handleOtpSubmit} className="mt-[73px] space-y-6">
              <div className="flex justify-center gap-4" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-12 h-12 border border-[#E1E6ED] rounded-lg text-center text-lg focus:outline-none focus:ring-1 focus:ring-[#E1E6ED] peer"
                    maxLength="1"
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-red-500 text-[12px] mt-2 text-center">
                  {otpError}
                </p>
              )}

              <button
                type="submit"
                className="w-full mt-4 cursor-pointer bg-[#308BF9] text-white py-[15px] rounded-lg font-semibold border border-transparent hover:bg-white hover:text-[#252525] hover:border-[#308BF9] transition"
              >
                Verify OTP
              </button>
            </form>

            <p className="text-[#A1A1A1] text-[12px] font-normal leading-[110%] tracking-[-0.24px] text-center mt-4">
              {resendTimer > 0 ? (
                <>
                  Resend OTP in{" "}
                  <span className="text-red-500 font-semibold">
                    {resendTimer}
                  </span>{" "}
                  seconds
                </>
              ) : (
                <>
                  Didn't receive OTP?{" "}
                  <button
                    type="button"
                    className="cursor-pointer text-[#308BF9] hover:underline"
                    onClick={handleResendOtp}
                  >
                    Resend
                  </button>
                </>
              )}
            </p>

            <div className="flex justify-center mt-4">
              <Link
                href="/"
                className="text-[#A1A1A1] text-[12px] font-normal leading-[110%] tracking-[-0.24px] hover:underline"
                prefetch={false}
              >
                Back to login
              </Link>
            </div>
          </>
        )}

        {step === "forgot" && (
          <>
            <h2 className="text-[34px] font-normal leading-normal tracking-[-2.04] text-[#252525] text-center whitespace-nowrap">
              Reset your password
            </h2>
            <p className="text-[#A1A1A1] text-[14px] font-normal leading-[110%] tracking-[-0.24px] text-center mt-4">
              Enter your new password for {email}
            </p>

            <form
              onSubmit={handlePasswordReset}
              className="mt-[73px] space-y-4"
            >
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={password}
                  autoComplete="false"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E1E6ED] peer pr-10"
                />
                <label
                  htmlFor="password"
                  className="absolute left-3 top-3 text-[#A1A1A1] transition-all duration-200 pointer-events-none 
                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
                   peer-focus:top-[-10px] peer-focus:text-[12px] peer-focus:text-[#252525]
                   peer-not-placeholder-shown:top-[-10px] peer-not-placeholder-shown:text-sm
                   bg-white px-1"
                >
                  Enter new password
                </label>

                {/* Password visibility toggle */}
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
              </div>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder=" "
                  value={confirmPassword}
                  autoComplete="false"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E1E6ED] peer pr-10"
                />
                <label
                  htmlFor="confirmPassword"
                  className="absolute left-3 top-3 text-[#A1A1A1] transition-all duration-200 pointer-events-none 
                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
                   peer-focus:top-[-10px] peer-focus:text-[12px] peer-focus:text-[#252525]
                   peer-not-placeholder-shown:top-[-10px] peer-not-placeholder-shown:text-sm
                   bg-white px-1"
                >
                  Confirm new password
                </label>

                {/* Confirm Password visibility toggle */}
                <div
                  className="absolute right-3 top-4 cursor-pointer"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  <Image
                    src="/icons/hugeicons_view.svg"
                    alt={showConfirmPassword ? "Hide password" : "Show password"}
                    width={15}
                    height={15}
                    className={showConfirmPassword ? "opacity-50" : "opacity-100"}
                  />
                </div>
              </div>

              {passwordError && (
                <p className="text-red-500 text-[12px] mt-1">{passwordError}</p>
              )}


                <div className="mt-3 text-sm">
                  
                    <ul className="space-y-1">
                      <PasswordRule
                        label="Minimum number of characters is 8."
                        active={passwordRules.minLength(password)}
                      />
                      <PasswordRule
                        label="Should contain lowercase."
                        active={passwordRules.lowercase(password)}
                      />
                      <PasswordRule
                        label="Should contain uppercase."
                        active={passwordRules.uppercase(password)}
                      />
                      <PasswordRule
                        label="Should contain numbers."
                        active={passwordRules.numbers(password)}
                      />
                      <PasswordRule
                        label="Should contain special characters."
                        active={passwordRules.special(password)}
                      />
                    </ul>
                  </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  password !== confirmPassword ||
                  !password ||
                  !confirmPassword ||
                  !isStrongPassword(password)
                }
                className="w-full mt-5 cursor-pointer bg-[#308BF9] text-white py-[15px] px-[93px] rounded-lg font-semibold border border-transparent hover:bg-white hover:text-[#252525] hover:border-[#308BF9] transition disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>

            <div className="flex justify-center mt-4">
              <Link
                href="/"
                className="text-[#A1A1A1] text-[12px] font-normal leading-[110%] tracking-[-0.24px] hover:underline"
                prefetch={false}
              >
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
