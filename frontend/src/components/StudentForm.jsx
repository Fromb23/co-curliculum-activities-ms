import React, { useState, useEffect } from "react";
import { updateStudent, createStudent } from "../services/students";
import { useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { queryClient } from "../lib/queryClient";

const StudentForm = ({ mode = "new", initialData = null }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [studentData, setStudentData] = useState({
    fullName: "",
    email: "",
    phoneNo: "",
    role: "STUDENT",
    parentName: "",
  });

  const studentUpdateMutation = useMutation({
    mutationFn: (studentData) => {
      updateStudent(id, studentData);
    },
    onSuccess: () => {
      toast.success("Student updated successfully");
      queryClient.invalidateQueries("students");
      navigate("/students");
    },
    onError: (error) => {
      console.error("Error creating student:", error);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const studentMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      toast.success("Student created successfully");
      queryClient.invalidateQueries("students");
      handleReset();
      navigate("/students");
    },
    onError: (error) => {
      console.error("Error creating activity:", error);
      // Optionally, you can show an error message here
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "edit") {
      studentUpdateMutation.mutate(studentData);
    }
    if (mode === "new") {
      studentMutation.mutate(studentData);
    }
  };
  const handleReset = () => {
    setStudentData({
      fullName: "",
      email: "",
      phoneNo: "",
      role: "STUDENT",
      parentName: "",
    });
  };

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setStudentData({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        phoneNo: initialData.phoneNo || "",
        parentName: initialData.student.parentName || "",
      });
    } else {
      setStudentData({
        fullName: "",
        email: "",
        phoneNo: "",
        role: "STUDENT",
        parentName: "",
      });
    }
  }, [mode, initialData]);

  return (
    <div>
      <form
        action=""
        className="w-full max-w-md mx-auto bg-white p-5 rounded-lg shadow-md"
        onSubmit={handleSubmit}
      >
        {mode === "new" ? (
          <h6 className="text-xl text-blue-400 mb-3">Add Student</h6>
        ) : (
          <h6 className="text-xl text-blue-400 mb-3">Edit Student</h6>
        )}

        <div className="mb-3 flex flex-col space-y-2">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            value={studentData.fullName}
            onChange={handleChange}
            className="p-2 rounded-md border border-gray-300 focus:outline-blue-400"
          />
        </div>
        <div className="mb-3 flex flex-col space-y-2">
          <label htmlFor="role">Role</label>
          <select
            name="role"
            id="role"
            value={studentData.role}
            onChange={handleChange}
            className="p-2 rounded-md border border-gray-300 focus:outline-blue-400"
            disabled='true'
          >
            <option value="">Select Role</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STUDENT">STUDENT</option>
            <option value="TRAINER">TRAINER</option>
          </select>
        </div>

        <div className="mb-3 flex flex-col space-y-2">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={studentData.email}
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
            value={studentData.phoneNo}
            onChange={handleChange}
            className="p-2 rounded-md border border-gray-300 focus:outline-blue-400"
          />
        </div>
        <div className="mb-3 flex flex-col space-y-2">
          <label htmlFor="parentName">Parent's Name</label>
          <input
            type="text"
            name="parentName"
            id="parentName"
            value={studentData.parentName}
            onChange={handleChange}
            className="p-2 rounded-md border border-gray-300 focus:outline-blue-400"
          />
        </div>
        <div className="flex mt-5">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            {mode === "new" ? "Add Student" : "Update Student"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
