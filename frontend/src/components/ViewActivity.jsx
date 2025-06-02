import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import {
  fetchActivities,
  assignActivityToStudent,
  fetchActivitiesByStudentId,
  removeActivityFromStudent,
  fetchActivitiesByTrainerId,
  assignActivityToTrainer,
  removeActivityFromTrainer,
} from "../services/activities";

const ViewActivity = ({ userType = "" }) => {
  const queryClient = useQueryClient();
  const { id: userId } = useParams();
  const [selectedActivityId, setSelectedActivityId] = useState("");

  // Fetch all activities
  const {
    data: allActivities = [],
    isLoading: isLoadingActivities,
    isError: isActivitiesError,
  } = useQuery({
    queryKey: ["allActivities"],
    queryFn: fetchActivities,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch user-specific activities based on userType
  const {
    data: userActivitiesResponse = { activities: [], userId: null },
    isLoading: isLoadingUserActivities,
    isError: isUserActivitiesError,
  } = useQuery({
    queryKey: [`${userType}Activities`, userId],
    queryFn: () =>
      userType === "student"
        ? fetchActivitiesByStudentId(userId)
        : fetchActivitiesByTrainerId(userId),
    staleTime: 1000 * 60 * 5,
  });

  const userActivities =
    userType === "student"
      ? userActivitiesResponse.activities || []
      : userActivitiesResponse || [];

  // Mutation for assigning activity
  const { mutate: assignActivity, isPending: isAssigning } = useMutation({
    mutationFn: (activityId) =>
      userType === "student"
        ? assignActivityToStudent({
            studentId: Number(userId),
            activityId: Number(activityId),
          })
        : assignActivityToTrainer({
            trainerId: Number(userId),
            activityId: Number(activityId),
            nationalIdNo: localStorage.getItem("nationalIdNo"),
          }),
    onSuccess: () => {
      toast.success("Activity assigned successfully");
      setSelectedActivityId("");
      queryClient.invalidateQueries([`${userType}Activities`, userId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign activity");
    },
  });

  // Mutation for removing activity
  const { mutate: removeActivity, isPending: isRemoving } = useMutation({
    mutationFn: (activityId) => {
      return userType === "student"
        ? removeActivityFromStudent(userId, activityId)
        : removeActivityFromTrainer(userId, activityId);
    },
    onSuccess: () => {
      toast.success("Activity removed successfully");
      queryClient.invalidateQueries([`${userType}Activities`, userId]);
    },
    onError: (error) => {
      console.error("Error removing activity:", error);
      toast.error(error.message || "Failed to remove activity");
    },
  });

  // Calculate available activities
  const availableActivities =
    isLoadingActivities || isLoadingUserActivities
      ? []
      : allActivities.filter(
          (activity) =>
            !userActivities.some(
              (userActivity) => userActivity.id === activity.id
            )
        );

  const handleAssign = () => {
    if (!selectedActivityId) {
      toast.warning("Please select an activity");
      return;
    }
    assignActivity(Number(selectedActivityId));
  };

  const handleRemove = (activityId) => {
    if (window.confirm("Are you sure you want to remove this activity?")) {
      removeActivity(activityId);
    }
  };

  return (
    <div className="p-4  rounded shadow">
      <h2 className="text-lg font-bold mb-2">
        {userType === "student" ? "Student Activities" : "Trainer Activities"}
      </h2>

      {isLoadingUserActivities ? (
        <p>Loading activities...</p>
      ) : userActivities.length === 0 ? (
        <p className="text-gray-500">No activities assigned yet.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {userActivities.map((activity) => (
            <li
              key={activity.id}
              className="flex justify-between items-center p-2 bg-gray-50 rounded"
            >
              <span className="flex-1">
                <span className="font-medium">{activity.name}</span>
                <span className="text-sm text-gray-600 ml-2">
                  ({activity.type} - {activity.location})
                </span>
              </span>
              <button
                className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                onClick={() => handleRemove(activity.id)}
                disabled={isRemoving}
              >
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Activity Assign Section */}
      <div className="flex gap-2 items-center mt-4">
        <select
          value={selectedActivityId}
          onChange={(e) => setSelectedActivityId(e.target.value)}
          className="border px-3 py-2 rounded flex-1"
          disabled={
            isLoadingActivities || isLoadingUserActivities || isAssigning
          }
        >
          <option value="">-- Select Activity to Assign --</option>
          {isLoadingActivities || isLoadingUserActivities ? (
            <option>Loading activities...</option>
          ) : isActivitiesError ? (
            <option>Error loading activities</option>
          ) : (
            availableActivities.map((act) => (
              <option key={act.id} value={act.id}>
                -- {act.name}
              </option>
            ))
          )}
        </select>

        <button
          onClick={handleAssign}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={
            !selectedActivityId || isAssigning || isLoadingUserActivities
          }
        >
          {isAssigning ? "Assigning..." : "Assign"}
        </button>
      </div>
    </div>
  );
};

export default ViewActivity;
