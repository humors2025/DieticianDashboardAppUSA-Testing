"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import EditRightSideBar from "./edit-rightsidebar";
import { fetchClientsDashboard } from "@/services/authService"; // Adjust the import path

export default function RightSidebar({ isOpen, onClose, profileId, dietitianId }) {
  console.log("profileId09:-", profileId);
  console.log("dietitianId10:-", dietitianId);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [clientData, setClientData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch client data when sidebar opens
  useEffect(() => {
    if (isOpen && dietitianId && profileId) {
      fetchClientData();
    }
  }, [isOpen, dietitianId, profileId]);

  const fetchClientData = async () => {
    setIsLoading(true);
    try {
      const dashboardResponse = await fetchClientsDashboard(dietitianId);
      
      if (dashboardResponse.status && dashboardResponse.clients) {
        // Find the specific client by profileId
        const matchedClient = dashboardResponse.clients.find(
          (client) => client.profile_id === profileId
        );
        
        if (matchedClient) {
          setClientData(matchedClient);
          setCurrentLevel(parseInt(matchedClient.level_type) || 1);
        }
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelUpdate = (newLevel) => {
    setCurrentLevel(newLevel);
  };

  // Handle closing the entire sidebar (both main and edit)
  const handleCloseAll = () => {
    setIsEditOpen(false); // Close edit sidebar first
    onClose(); // Then close main sidebar
  };

  // Format display values
  const getFitnessGoalDisplay = (fitnessGoal) => {
    const fitnessGoalMap = {
      'weight_loss': 'Weight Loss',
      'muscle_gain': 'Muscle Gain',
      'fat_loss': 'Fat Loss',
      'maintenance': 'Maintenance'
    };
    return fitnessGoalMap[fitnessGoal] || fitnessGoal || 'Not specified';
  };

  return (
    <>
      <div
        className={`absolute top-0 right-0 h-full z-50 flex items-start gap-3 transition-all duration-300 ${
          isOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Outside Close Button - Now closes everything */}
        <button
          type="button"
          onClick={handleCloseAll}
          className="mt-4 cursor-pointer text-black bg-white border border-[#E1E6ED] rounded-full w-10 h-10 flex items-center justify-center shadow-sm z-50"
        >
          X
        </button>

        {/* Sidebar */}
        <div className="h-full bg-white rounded-r-[15px] border border-[#E1E6ED] shadow-sm overflow-hidden z-50">
          <div className="h-full flex flex-col gap-4">
            <div className="flex items-center justify-between pl-5 pt-[27px] pr-5">
              <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                Client Details
              </p>
            </div>

            <div className="flex-1 overflow-y-auto group-hover-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading client data...</p>
                </div>
              ) : clientData ? (
                <div className="flex flex-col">
                  {/* Client Profile Section */}
                  <div className="flex gap-5 rounded-[10px] py-7 pl-[15px] pr-14 mb-[30px] mx-[15px] bg-[#F5F7FA]">
                    <div className="w-[80px] h-[80px] p-5 bg-white rounded-full">
                      <Image
                        src={clientData.p_image || "/icons/hugeicons_user-circle-02.svg"}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="cursor-pointer rounded-full object-cover"
                        onError={(imageError) => {
                          imageError.target.src = "/icons/hugeicons_user-circle-02.svg";
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-[18px] py-1">
                      <p className="text-[#252525] text-[20px] font-semibold leading-[110%] tracking-[-0.4px]">
                        {clientData.client_name}
                      </p>

                      <div>
                        <div className="flex gap-1.5 items-center">
                          <p className="text-[#535359] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                            {clientData.phone_no !== "NA" ? clientData.phone_no : "Phone not available"}
                          </p>
                          <Image
                            src="/icons/Ellipse 765.svg"
                            alt="separator"
                            width={3}
                            height={3}
                          />
                          <p className="text-[#535359] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                            {clientData.email !== "NA" ? clientData.email : "Email not available"}
                          </p>
                        </div>

                        <div className="flex gap-2.5 items-center">
                          <p className="text-[#252525] text-[12px] font-semibold leading-[110%] tracking-[-0.24px]">
                            Reference ID
                          </p>
                          <p className="text-[#535359] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                            {clientData.profile_id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Personal Info */}
                    <div className="flex justify-between px-5 pt-6 pb-9 border-t border-b border-[#E1E6ED]">
                      <div className="flex flex-col gap-[15px]">
                        <p className="text-[#252525] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                          Personal Info
                        </p>
                        <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                          {`${clientData.gender}, ${clientData.age} years, ${clientData.height} cm, ${clientData.weight} kg`}
                        </p>
                      </div>
                    </div>

                    {/* Performance Level */}
                    <div className="flex justify-between px-5 pt-6 pb-9 border-t border-b border-[#E1E6ED]">
                      <div className="flex flex-col gap-[15px]">
                        <p className="text-[#252525] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                          Performance Level
                        </p>
                        <div className="w-[68px] bg-[#E9F3FF] rounded-[5px] px-2.5 py-2">
                          <p className="text-[#006FFF] text-[15px] font-semibold leading-[126%] tracking-[-0.3px] whitespace-nowrap">
                            LEVEL {currentLevel}
                          </p>
                        </div>
                      </div>

                      <Image
                        src="/icons/hugeicons_edit-0466.svg"
                        alt="Edit"
                        width={24}
                        height={24}
                        className="cursor-pointer"
                        onClick={() => setIsEditOpen(true)}
                      />
                    </div>

                    {/* Fitness Goal */}
                    <div className="flex justify-between px-5 pt-6 pb-9 border-t border-b border-[#E1E6ED]">
                      <div className="flex flex-col gap-[15px]">
                        <p className="text-[#252525] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                          Fitness Goal
                        </p>
                        <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                          {clientData.fitness_goal_display || getFitnessGoalDisplay(clientData.fitness_goal)}
                        </p>
                      </div>
                    </div>

                    {/* Activity Level - You might want to add this to the API or set a default */}
                    <div className="flex justify-between px-5 pt-6 pb-9 border-t border-b border-[#E1E6ED]">
                      <div className="flex flex-col gap-[15px]">
                        <p className="text-[#535359] text-[12px] font-normal leading-[110%] tracking-[-0.24px]">
                          Activity Level
                        </p>
                        <div className="flex flex-col gap-2.5">
                          <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                            Sedentary
                          </p>
                          <p className="text-[#252525] text-[12px] font-normal leading-[110%] tracking-[-0.24px] whitespace-nowrap">
                            Little to no exercise. Mostly sitting during the day.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dietary Preferences */}
                    <div className="flex justify-between px-5 pt-6 pb-9 border-t border-b border-[#E1E6ED]">
                      <div className="flex flex-col gap-[15px]">
                        <p className="text-[#252525] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                          Dietary Preferences
                        </p>
                        <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                          No Dietary Preferences
                        </p>
                      </div>
                    </div>

                    {/* Location/Region instead of Cuisine Preferences */}
                    <div className="flex justify-between px-5 pt-6 pb-9 border-t border-b border-[#E1E6ED]">
                      <div className="flex flex-col gap-[15px]">
                        <p className="text-[#252525] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                          Location
                        </p>
                        <div className="flex items-center gap-2.5">
                          <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                            {clientData.region && clientData.region !== "NA" ? clientData.region : "Not specified"}
                            {clientData.location && clientData.location !== "NA" && clientData.location !== clientData.region 
                              ? `, ${clientData.location}` 
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info - Metabolism Score */}
                    {clientData.metabolism_score && (
                      <div className="flex justify-between px-5 pt-6 pb-9 border-t border-b border-[#E1E6ED]">
                        <div className="flex flex-col gap-[15px]">
                          <p className="text-[#252525] text-[12px] font-normal leading-normal tracking-[-0.24px]">
                            Metabolism Score
                          </p>
                          <div className="flex items-center gap-2.5">
                            <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                              {clientData.metabolism_score}
                            </p>
                            {clientData.zone && (
                              <>
                                <div className="border-r border-[#252525] h-[13px]"></div>
                                <p className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px]">
                                  {clientData.zone}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No client data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditOpen && (
        <div className="absolute top-0 right-0 z-[60] h-full w-[465px] bg-white rounded-r-[15px]">
          <EditRightSideBar 
            onClose={() => setIsEditOpen(false)}
            currentLevel={currentLevel}  
            onLevelUpdate={handleLevelUpdate}  
            profileId={profileId}
            dietitianId={dietitianId}
            clientData={clientData} // Pass client data to edit sidebar if needed
          />
        </div>
      )}
    </>
  );
}