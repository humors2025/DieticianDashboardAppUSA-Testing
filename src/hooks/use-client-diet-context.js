import { useEffect, useState } from "react";
import { getClientProfileDetails } from "../services/authService";
import { cookieManager } from "../lib/cookies";

// Fetches the client's dietary context from GETCLIENTPROFILEDETAILS so food
// search can be tailored to the client. Returns:
//   dietType -> profile.diet_type
//   country  -> profile.primary_cuisine
// The dietitian id is read from the "dietician" cookie (client-only) unless one
// is passed explicitly.
export function useClientDietContext(profileId, dietitianId) {
  const [dietContext, setDietContext] = useState({ dietType: "", country: "" });

  useEffect(() => {
    const finalDietitianId =
      dietitianId || cookieManager.getJSON("dietician")?.dietician_id;

    if (!profileId || !finalDietitianId) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await getClientProfileDetails(profileId, finalDietitianId);
        const data = response?.data;
        if (!cancelled && data) {
          setDietContext({
            dietType: data.diet_type || "",
            country: data.primary_cuisine || "",
          });
        }
      } catch (error) {
        console.error("Error fetching client diet context:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileId, dietitianId]);

  return dietContext;
}
