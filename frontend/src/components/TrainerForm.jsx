import React, { useState, useEffect } from "react";
import { updateTrainer, createTrainer } from "../services/trainer";
import { useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { queryClient } from "../lib/queryClient";

const TrainerForm = ({ mode = "new", initialData = null }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trainerData, setTrainerData] = useState({
    fullName: "",
    email: "",
    phoneNo: "",
    role: "TRAINER",
    nationalIdNo: "",
  });

  const trainerUpdateMutation = useMutation({
    mutationFn: (trainerData) => {
      updateTrainer(id, trainerData);
    },
    onSuccess: () => {
      toast.success("Trainer updated successfully");
      queryClient.invalidateQueries("trainers");
      navigate("/trainers");
    },
    onError: (error) => {
      console.error("Error creating trainer:", error);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrainerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const trainerMutation = useMutation({
    mutationFn: createTrainer,
    onSuccess: () => {
      toast.success("Trainer created successfully");
      queryClient.invalidateQueries("trainers");
      handleReset();
      navigate("/trainers");
    },
    onError: (error) => {
      console.error("Error creating activity:", error);
      // Optionally, you can show an error message here
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "edit") {
      trainerUpdateMutation.mutate(trainerData);
    }
    if (mode === "new") {
      trainerMutation.mutate(trainerData);
    }
  };
  const handleReset = () => {
    setTrainerData({
      fullName: "",
      email: "",
      phoneNo: "",
      role: "TRAINER",
      nationalIdNo: "",
    });
  };

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTrainerData({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        phoneNo: initialData.phoneNo || "",
        nationalIdNo: initialData.trainer.nationalIdNo || "",
      });
    } else {
      setTrainerData({
        fullName: "",
        email: "",
        phoneNo: "",
        nationalIdNo: "",
        role: "TRAINER",
      });
    }
  }, [mode, initialData]);

  console.log("Trainer Data in trainer form:", trainerData);

  return (
    <div>
      <form
        action=""
        className="w-full max-w-md mx-auto bg-white p-5 rounded-lg shadow-md"
        onSubmit={handleSubmit}
      >
        {mode === "new" ? (
          <h6 className="text-xl text-blue-400 mb-3">Add Trainer</h6>
        ) : (
          <h6 className="text-xl text-blue-400 mb-3">Edit Trainer</h6>
        )}
        <div className="mb-3 flex flex-col space-y-2">
          <label htmlFor="role">Role</label>
          <select
            name="role"
            id="role"
            value={trainerData.role}
            onChange={handleChange}
            className="p-2 rounded-md border border-gray-300 focus:outline-blue-400"
            disabled="true"
          >
            <option value="">Select Role</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STUDENT">STUDENT</option>
            <option value="TRAINER">TRAINER</option>
          </select>
        </div>

        <div className="mb-3 flex flex-col space-y-2">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            value={trainerData.fullName}
            onChange={handleChange}
            className="p-2 rounded-md border border-gray-300 focus:outline-blue-400"
          />
        </div>
        <div className="mb-3 flex flex-col space-y-2">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={trainerData.email}
            onChange={handleChange}
            className="p-2 rounded-md border border-gray-300 focus:outline-blue-400"
          />
        </div>
        <div className="mb-3 flex flex-col space-y-2">
          <label htmlFor="phoneNo">Phone No</label>
          <input
            type="text"
            name="phoneNo"
            id="phoneNo"
            value={trainerData.phoneNo}
            onChange={handleChange}
            className="p-2 rounded-md border border-gray-300 focus:outline-blue-400"
          />
        </div>
        <div className="mb-3 flex flex-col space-y-2">
          <label htmlFor="nationalIdNo">National ID</label>
          <input
            type="text"
            name="nationalIdNo"
            id="nationalIdNo"
            value={trainerData.nationalIdNo}
            onChange={handleChange}
            className="p-2 rounded-md border border-gray-300 focus:outline-blue-400"
          />
        </div>
        <div className="flex mt-5">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            {mode === "new" ? "Add Trainer" : "Update Trainer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrainerForm;
