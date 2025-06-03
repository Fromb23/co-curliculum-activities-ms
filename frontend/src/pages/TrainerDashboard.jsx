import React, { useState, useEffect } from "react";
import {
  FiActivity,
  FiUsers,
  FiMessageSquare,
  FiBell,
  FiCalendar,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
  FiMenu,
  FiUser,
  FiClock,
  FiX,
  FiHome,
  FiFileText,
} from "react-icons/fi";
import { FaExclamationCircle } from "react-icons/fa";
import UserHeader from "../components/UserHeader";
import UserFooter from "../components/UserFooter";
import ActivityList from "../components/ActivityList";
import StudentCommentsModal from "../components/StudentCommentsModal";
import CreateAnnouncementModal from "../components/CreateAnnouncementModal";
import ReportComponent from "../components/ReportComponent";
import { useQuery } from "@tanstack/react-query";
import { fetchActivitiesByTrainerId } from "../services/activities";
import { fetchCommentsByTrainerId } from "../services/comments";
import { fetchStudentsByTrainerId } from "../services/studentTrainer";
import { motion, AnimatePresence } from "framer-motion";

const TrainerDashboard = () => {
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [activities, setActivities] = useState([]);
  const [noticeMessage, setNoticeMessage] = useState("");
  const [comments, setComments] = useState([]);
  const [students, setStudents] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    stats: true,
    activities: true,
  });
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showCommentNotice, setShowCommentNotice] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const navItems = [
    { id: "dashboard", icon: <FiHome />, label: "Dashboard" },
    { id: "reports", icon: <FiFileText />, label: "Reports" },
    { id: "messages", icon: <FiMessageSquare />, label: "Messages" },
    { id: "schedule", icon: <FiCalendar />, label: "Schedule" },
  ];

  const user = JSON.parse(localStorage.getItem("user"));
  const trainerId = user.id;
  
  // Fetching comments for the trainer
  const {
    data: commentsData,
    error: commentsError,
    isLoading: commentsLoading,
  } = useQuery({
    queryKey: ["comments", trainerId],
    queryFn: () => fetchCommentsByTrainerId(trainerId),
  });
  useEffect(() => {
    if (commentsData) {
      console.log("Fetched comments in trainer dashboard:", commentsData);
      setComments(commentsData);
    }
  }, [commentsData]);

  // Data fetching
  const {
    data: activityData,
    error: activityError,
    isLoading: activityLoading,
  } = useQuery({
    queryKey: ["activities"],
    queryFn: () => fetchActivitiesByTrainerId(trainerId),
  });

  const {
    data: studentData,
    error: studentError,
    isLoading: studentLoading,
  } = useQuery({
    queryKey: ["students"],
    queryFn: () => fetchStudentsByTrainerId(user.id),
  });

  useEffect(() => {
    if (activityData) setActivities(activityData);
  }, [activityData]);

  useEffect(() => {
    if (studentData) {
      const updatedData = studentData.map((student) => ({
        ...student,
        attendant: student.attendant.toLowerCase(),
      }));
      setStudents(updatedData);
    }
  }, [studentData]);

  // Helper functions
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleStudentSelect = (activity, student) => {
    setSelectedActivity(activity);
    setSelectedStudent(student);
    setShowCommentsModal(true);
  };

  const saveComment = () => {
    setActivities((prevActivities) =>
      prevActivities.map((activity) =>
        activity.id === selectedActivity.id
          ? {
              ...activity,
              students: students.map((student) =>
                student.id === selectedStudent.id ? { ...student } : student
              ),
            }
          : activity
      )
    );
    showNotification("Comment saved successfully!");
    setShowCommentsModal(false);
  };

  const createAnnouncement = (announcement) => {
    setActivities((prevActivities) =>
      prevActivities.map((activity) =>
        activity.id === announcement.activityId
          ? {
              ...activity,
              announcements: [
                ...(activity.announcements || []),
                { ...announcement },
              ],
            }
          : activity
      )
    );
    showNotification("Announcement created successfully!");
    setShowAnnouncementModal(false);
  };

  const showNotification = (message) => {
    setNoticeMessage(message);
    setShowCommentNotice(true);
    setTimeout(() => setShowCommentNotice(false), 3000);
  };

  // Component definitions
  const DashboardHome = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <button
          onClick={() => setShowAnnouncementModal(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
        >
          <FiPlus className="mr-2" />
          New Announcement
        </button>
      </div>

      <div
        id="stats"
        className="flex justify-between items-center cursor-pointer mb-2"
        onClick={() => toggleSection("stats")}
      >
        <h2 className="text-xl font-semibold">Quick Stats</h2>
        {expandedSections.stats ? <FiChevronUp /> : <FiChevronDown />}
      </div>

      {expandedSections.stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <DashboardCard
            icon={<FiActivity className="text-blue-600" size={20} />}
            title="Total Activities"
            value={activities.length}
            className="bg-white hover:bg-blue-50 transition-colors"
          />
          <DashboardCard
            icon={<FiUsers className="text-green-600" size={20} />}
            title="Total Students"
            value={students.length}
            className="bg-white hover:bg-green-50 transition-colors"
          />
          <DashboardCard
            icon={<FiCalendar className="text-purple-600" size={20} />}
            title="Upcoming Sessions"
            value={
              activities.filter((a) => new Date(a.date) >= new Date()).length
            }
            className="bg-white hover:bg-purple-50 transition-colors"
          />
        </div>
      )}

      <div
        id="activities"
        className="flex justify-between items-center cursor-pointer mb-2"
        onClick={() => toggleSection("activities")}
      >
        <h2 className="text-xl font-semibold">Your Activities</h2>
        {expandedSections.activities ? <FiChevronUp /> : <FiChevronDown />}
      </div>

      {expandedSections.activities && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ActivityList
            activities={activities}
            students={students}
            onStudentSelect={handleStudentSelect}
          />
        </div>
      )}
    </>
  );

  const MessagesComponent = ({ comments }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h2 className="text-2xl font-semibold mb-6">Messages</h2>
    {comments.length === 0 ? (
      <div className="text-center py-12 text-gray-500">
        <FiMessageSquare className="mx-auto text-4xl mb-4" />
        <p>Your messages will appear here</p>
      </div>
    ) : (
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 bg-gray-50 rounded-lg shadow-md hover:shadow transition-shadow duration-200"
          >
            <div className="flex items-center gap-2 mb-1 text-sm text-gray-700">
              <p className="text-gray-800 font-semibold">
 
  {comment.senderType === "STUDENT" ? (
    <>
      <span className="text-green-600">From: </span>
      {comment.studentFullName}
    </>
  ) : (
    "Me"
  )}
</p>
            </div>

            <div className="flex items-start gap-2 text-gray-800">
              <FiMessageSquare className="mt-1 text-blue-500" />
              <p>{comment.comment}</p>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
              <FiClock />
              <span>
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

  const ScheduleComponent = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold mb-6">Training Schedule</h2>
      <div className="text-center py-12 text-gray-500">
        <FiCalendar className="mx-auto text-4xl mb-4" />
        <p>Your schedule will appear here</p>
      </div>
    </div>
  );

  const components = {
    dashboard: <DashboardHome />,
    reports: <ReportComponent studentData={studentData} />,
    messages: <MessagesComponent comments={comments} />,
    schedule: <ScheduleComponent />,
  };

  if (activityLoading || studentLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <UserHeader role="trainer" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg text-gray-600">
            Loading dashboard...
          </div>
        </main>
        <UserFooter />
      </div>
    );
  }

  if (activityError || studentError) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <UserHeader role="trainer" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center bg-red-100 p-4 rounded-lg">
            <FaExclamationCircle className="text-red-600 mr-2" />
            <span className="text-red-600">
              {activityError?.message || studentError?.message}
            </span>
          </div>
        </main>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <UserHeader
        role="trainer"
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="absolute top-0 right-0 h-full w-4/5 bg-white shadow-lg p-4">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
            <div className="mt-12 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveComponent(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg flex items-center ${
                    activeComponent === item.id
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-gray-200">
          <div className="flex flex-col p-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveComponent(item.id)}
                className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                  activeComponent === item.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeComponent}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {components[activeComponent]}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <UserFooter />

      {/* Modals */}
      <AnimatePresence>
        {showCommentsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <StudentCommentsModal
                activity={selectedActivity}
                student={selectedStudent}
                comments={comments}
                setNoticeMessage={setNoticeMessage}
                onClose={() => setShowCommentsModal(false)}
                onSave={saveComment}
              />
            </motion.div>
          </motion.div>
        )}

        {showAnnouncementModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <CreateAnnouncementModal
                activities={activities}
                setNoticeMessage={setNoticeMessage}
                onClose={() => setShowAnnouncementModal(false)}
                onCreate={createAnnouncement}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      {showCommentNotice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow-lg z-50 flex items-center"
        >
          <FiBell className="mr-2" />
          {noticeMessage}
        </motion.div>
      )}
    </div>
  );
};

const DashboardCard = ({ icon, title, value, className, onClick }) => (
  <div
    className={`p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 ${className} transition-all hover:shadow-md`}
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className="p-2 md:p-3 rounded-lg bg-opacity-20 bg-blue-100 mr-3">
        {icon}
      </div>
      <div>
        <p className="text-xs md:text-sm font-medium text-gray-500">{title}</p>
        <p className="text-xl md:text-2xl font-semibold text-gray-800">
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default TrainerDashboard;
