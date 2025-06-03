import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import {
  FiFileText,
  FiDownload,
  FiMail,
  FiPrinter,
  FiPlus,
  FiSearch,
  FiUser,
  FiCalendar,
  FiBell,
} from "react-icons/fi";

const ReportComponent = ({ studentData }) => {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReports, setFilteredReports] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [newReport, setNewReport] = useState({
    studentId: "",
    title: "",
    content: "",
    performanceRating: 3,
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const trainerId = user?.trainer?.id;

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const response = await api.get(`/reports/trainer/${trainerId}`);
      console.log("Fetched reports:", response.data);
      setFilteredReports(response.data);
      return response.data;
    },
    enabled: !!trainerId,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });

  // Filter reports based on search term
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === "") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(
        reports.filter(
          (report) =>
            report.studentName?.toLowerCase().includes(term.toLowerCase()) ||
            report.title?.toLowerCase().includes(term.toLowerCase())
        )
      );
    }
  };

  // Filter by tab selection
  const filterByTab = (tab) => {
    setActiveTab(tab);
    if (tab === "all") {
      setFilteredReports(reports);
    } else if (tab === "recent") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      setFilteredReports(
        reports.filter((report) => new Date(report.date) > oneWeekAgo)
      );
    }
  };

  const createReportMutation = useMutation({
    mutationFn: async (newReportObj) => {
      const response = await api.post("/reports", newReportObj);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reports"]);
    },
  });

  const handleCreateReport = () => {
    const selectedStudent = students.find(
      (student) => student.id === parseInt(newReport.studentId)
    );

    if (!selectedStudent) {
      console.error("Student not found.");
      return;
    }

    const newReportObj = {
      studentId: selectedStudent.id,
      trainerId: trainerId,
      activityName: selectedStudent.activity || "General",
      title: newReport.title,
      content: newReport.content,
      performanceRating: newReport.performanceRating,
      date: new Date().toISOString().split("T")[0],
      studentName: selectedStudent.name,
      attachments: null,
    };

    createReportMutation.mutate(newReportObj);

    setNewReport({
      studentId: "",
      title: "",
      content: "",
      performanceRating: 3,
    });
    setShowCreateForm(false);
  };

  const shareReport = (method, reportId) => {
    const report = reports.find((r) => r.id === reportId);
    alert(
      `${method === "email" ? "Emailing" : "Downloading"} report: ${report?.title || "Untitled"}`
    );
  };

  const students = studentData?.map(s => ({
    id: s.id,
    name: s.user?.fullName || "Unknown Student",
    activity: s.activity || "General"
  })) || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      {/* Header with notification bell */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FiFileText className="h-8 w-8 text-blue-600" />
          <h1 className="ml-2 text-xl font-bold text-gray-900">
            Student Reports
          </h1>
        </div>
        <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
          <span className="sr-only">Notifications</span>
          <FiBell className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold mb-4 md:mb-0">Student Reports</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 whitespace-nowrap"
          >
            <FiPlus className="mr-2" />
            Create Report
          </button>
        </div>
      </div>

      {/* Create Report Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Create New Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newReport.studentId}
                onChange={(e) =>
                  setNewReport({ ...newReport, studentId: e.target.value })
                }
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Report title"
                value={newReport.title}
                onChange={(e) =>
                  setNewReport({ ...newReport, title: e.target.value })
                }
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Performance Rating
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                className="w-full mr-4"
                value={newReport.performanceRating}
                onChange={(e) =>
                  setNewReport({
                    ...newReport,
                    performanceRating: parseFloat(e.target.value),
                  })
                }
              />
              <span className="text-lg font-medium">
                {newReport.performanceRating}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Content
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter report details..."
              value={newReport.content}
              onChange={(e) =>
                setNewReport({ ...newReport, content: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateReport}
              disabled={!newReport.studentId || !newReport.title}
              className={`px-4 py-2 rounded-lg text-white ${
                !newReport.studentId || !newReport.title
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Save Report
            </button>
          </div>
        </div>
      )}

      {/* Report Filter Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "all"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => filterByTab("all")}
        >
          All Reports
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "recent"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => filterByTab("recent")}
        >
          Recent
        </button>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="text-center py-8">Loading reports...</div>
      ) : filteredReports.length > 0 ? (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                selectedReport?.id === report.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{report.title || "Untitled Report"}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <FiUser className="mr-1" />
                    <span className="mr-3">{report?.student?.user?.fullName || "Unknown Student"}</span>
                    <FiCalendar className="mr-1" />
                  <span>{new Date(report.date).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    {report.performanceRating || 0} ★
                  </div>
                </div>
              </div>
              {selectedReport?.id === report.id && (
                <div className="mt-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium mb-2">Report Details</h4>
                    <p className="text-gray-700 mb-4">{report.content || "No content provided"}</p>
                    {report.attachments && report.attachments.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Attachments
                        </h5>
                        <ul className="space-y-1">
                          {report.attachments.map((file, index) => (
                            <li
                              key={index}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              <a
                                href={`#${file}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {file}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          shareReport("email", report.id);
                        }}
                        className="flex items-center px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                      >
                        <FiMail className="mr-1" /> Email
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          shareReport("download", report.id);
                        }}
                        className="flex items-center px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                      >
                        <FiDownload className="mr-1" /> Download
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.print();
                        }}
                        className="flex items-center px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                      >
                        <FiPrinter className="mr-1" /> Print
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FiFileText className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No reports found
          </h3>
          <p className="mt-1 text-gray-500">
            {searchTerm
              ? "Try a different search term"
              : "No reports have been created yet"}
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <FiPlus className="mr-2" /> Create your first report
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportComponent;