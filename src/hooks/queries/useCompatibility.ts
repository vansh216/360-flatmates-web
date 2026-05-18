import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { createMockCompatibility } from "@/lib/api/mock-data";
import type { CompatibilityBreakdown, FlatmatesProfile } from "@/lib/api/types";
import type { CompatibilityResult } from "@/lib/compatibility/types";
import { calculateCompatibility } from "@/lib/compatibility/engine";

export function useCompatibility(peerId: number) {
  return useQuery({
    queryKey: ["compatibility", peerId],
    queryFn: async (): Promise<CompatibilityBreakdown> => {
      try {
        return await apiClient.request<CompatibilityBreakdown>({
          method: "GET",
          path: `/flatmates/web/compatibility/${peerId}`
        });
      } catch (error) {
        // Fallback to local compatibility engine when API is unavailable
        let myProfile: FlatmatesProfile;

        try {
          myProfile = await apiClient.request<FlatmatesProfile>({
            method: "GET",
            path: "/flatmates/profile"
          });
        } catch {
          if (import.meta.env.MODE !== "production") {
            return createMockCompatibility(peerId);
          }

          throw error;
        }

        const localResult: CompatibilityResult = calculateCompatibility(
          {
            id: myProfile.id,
            sleep_schedule: myProfile.sleep_schedule,
            cleanliness: myProfile.cleanliness,
            food_habits: myProfile.food_habits,
            smoking_drinking: myProfile.smoking_drinking,
            guests_policy: myProfile.guests_policy,
            work_style: myProfile.work_style
          },
          {
            id: peerId,
            sleep_schedule: myProfile.sleep_schedule,
            cleanliness: myProfile.cleanliness,
            food_habits: myProfile.food_habits,
            smoking_drinking: myProfile.smoking_drinking,
            guests_policy: myProfile.guests_policy,
            work_style: myProfile.work_style
          }
        );

        return {
          user_id: myProfile.id,
          peer_id: peerId,
          overall_percentage: localResult.overall_percentage,
          color: localResult.color,
          dimensions: localResult.dimensions.map((dim) => ({
            name: dim.name,
            weight: dim.weight,
            user_value: dim.user_value,
            peer_value: dim.peer_value,
            score: dim.score,
            match: dim.match
          })),
          summary: ["Compatibility estimated from your profile (peer profile unavailable)."]
        };
      }
    },
    enabled: peerId > 0
  });
}
