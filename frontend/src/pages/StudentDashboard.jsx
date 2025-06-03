import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  FiMessageSquare,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiClock,
  FiSend,
  FiChevronDown,
  FiChevronUp,
  FiMenu,
  FiX,
  FiHome,
  FiFileText,
  FiPlus,
  FiBell,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import TrainerHeader from "../components/UserHeader";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import UserFooter from "../components/UserFooter";
import { fetchActivitiesByStudentId } from "../services/activities";
import { fetchAnnouncementsByActivityId } from "../services/announcements";
import {
  createComment,
  fetchCommentsByStudentId,
  fetchTrainerByTrainerId,
} from "../services/comments";
import ThreadItem from "../components/ThreadItem";
import MessageThreadModal from "../components/MessageThreadModal";
import { organizeMessagesIntoThreads } from "../components/utilis";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    stats: true,
    activities: true,
    messages: true,
    announcements: true,
  });

  // Message and announcement states
  const [newMessage, setNewMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [repliedToId, setRepliedToId] = useState(null);
  const [replyingToId, setReplyingToId] = useState(null);

  const queryClient = new QueryClient();

  const { data: announcements = [], isLoading: announcementLoading } = useQuery(
    {
      queryKey: ["announcements"],
      queryFn: () =>
        fetchAnnouncementsByActivityId(
          JSON.parse(localStorage.getItem("activities"))[0].id
        ),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    }
  );
  const user = JSON.parse(localStorage.getItem("user"));
  const { data: messages = [], isLoading: commentLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: () => fetchCommentsByStudentId(user.id),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });



  //   const messages = useMemo(() => {
  //     console.log("Raw Messages:", rawMessages);
  //   if (!rawMessages) return [];
  //   return buildThreadTree(rawMessages);
  // }, [rawMessages]);

  const trainerId = messages.length > 0 ? messages[0].trainerId : null;
  const { data: trainerName, isLoading: trainerLoading } = useQuery({
    queryKey: ["trainerName"],
    queryFn: () => fetchTrainerByTrainerId(trainerId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  console.log("Trainer Name:", trainerName);

  const {
    data: responseData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["activities"],
    queryFn: () =>
      fetchActivitiesByStudentId(JSON.parse(localStorage.getItem("user")).id),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
  const activities = responseData?.activities || [];
  localStorage.setItem("activities", JSON.stringify(activities));
  // if (isLoading) return <div>Loading...</div>;
  // if (isError) return <div>Error fetching activities</div>;

  // Available trainers for messaging
  const trainerNames = [
    ...new Set(activities.map((activity) => activity?.trainerUser?.fullName)),
  ];

  // Helper functions
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/comments/read-message/${id}`);
      console.log("Marking message as read:", messages);
      queryClient.setQueryData(["messages"], (oldData) =>
        oldData.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }

  const {
    mutate,
    isLoading: replyLoadingMsg,
    isError: replyError,
    isSuccess,
  } = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      setNewMessage("");
      setSelectedTrainer("");
      setShowMessageModal(false);
      setNoticeMessage("Message sent successfully!");
      setTimeout(() => {
        setNoticeMessage("");
      }, 3000);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });
  // if (replyLoadingMsg) return <div>Sending...</div>;
  // if (replyError) return <div>Error sending message</div>;

  const handleSendMessage = (text, parentId) => {
    console.log("Sending message:", newMessage);
    if (text.trim() || newMessage.trim()) {
      mutate({
        comment: text,
        studentId: user.student.id,
        activityId: activities[0].id,
        senderType: user.role,
        userId: activities[0].trainerUser?.id,
        parentId: parentId || replyingToId,
      });
      setNewMessage("");
      setReplyingToId(null);
      if (!selectedMessage) {
        setShowMessageModal(false);
      }
    }
  };

  const handleCreateAnnouncement = (content) => {
    const newAnnouncement = {
      id: announcements.length + 1,
      title: "New Announcement",
      content,
      date: "Just now",
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setShowAnnouncementModal(false);
  };



  // Add this handler for inline replies
  const handleInlineReply = (messageId, replyText) => {
    console.log("Reply text before send:", replyText);
    console.log("Message ID for reply:", messageId);
    handleSendMessage(replyText, messageId);
    console.log("Sending message in inline:", newMessage);
  };

  // Component definitions
  const DashboardTab = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <DashboardCard
          icon={<FiMessageSquare className="text-blue-600" />}
          title="Unread Messages"
          value={messages.filter((m) => !m.read).length}
          onClick={() => setActiveTab("messages")}
        />
        <DashboardCard
          icon={<FiCalendar className="text-green-600" />}
          title="Upcoming Sessions"
          value={activities.length}
        />
        <DashboardCard
          icon={<FiUser className="text-purple-600" />}
          title="Active Trainers"
          value={trainerNames.length}
        />
      </div>

      {/* Activities Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => toggleSection("activities")}
        >
          <h2 className="text-lg font-semibold flex items-center">
            <FiCalendar className="mr-2 text-green-600" />
            My Activities
          </h2>
          {expandedSections.activities ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expandedSections.activities && (
          <div className="p-4 pt-0">
            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <ActivityTable activities={activities} />
            </div>
          </div>
        )}
      </div>

      {/* Announcements Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => toggleSection("announcements")}
        >
          <h2 className="text-lg font-semibold">Announcements</h2>
          {expandedSections.announcements ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expandedSections.announcements && (
          <div className="p-4 pt-0 space-y-3">
            {announcementLoading && <div>Loading announcements...</div>}
            {announcements.length === 0 && !announcementLoading && (
              <div className="text-gray-500">No announcements available</div>
            )}

            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );

  const MessagesTab = () => {
    const threads = organizeMessagesIntoThreads(messages);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center">
            <FiMessageSquare className="mr-2 text-blue-600" />
            Message Threads
          </h2>
          <button
            onClick={() => {
              setSelectedMessage(null);
              setShowMessageModal(true);
            }}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            <FiPlus className="mr-1" /> New Message
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {threads.length === 0 ? (
            <p className="text-center text-gray-500 p-4">No messages available</p>
          ) : (
            threads.map((msg) => (
              <ThreadItem
                key={msg.id}
                message={msg}
                onClick={() => {
                  // setSelectedMessage(msg);
                  markAsRead(msg.id);
                }}
                trainerName={trainerName?.fullName || "Coach"}
                depth={0}
                onReply={handleInlineReply}
                isActiveThread={selectedMessage?.id === msg.id}
                selectedMessageId={selectedMessage?.id}
              />

            ))
          )}
        </div>
      </div>
    );
  };

  // Replace the old message modal with:
  {
    selectedMessage && (
      <MessageThreadModal
        selectedMessage={selectedMessage}
        setSelectedMessage={setSelectedMessage}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        trainerName={trainerName?.fullName || "Coach"}
      />
    )
  }

  const ScheduleTab = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
      <FiCalendar className="mx-auto text-4xl text-gray-400 mb-3" />
      <h3 className="text-lg font-medium text-gray-900">
        My Training Schedule
      </h3>
      <p className="text-gray-500">Your upcoming sessions will appear here</p>
    </div>
  );

  const ReportsTab = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
      <FiFileText className="mx-auto text-4xl text-gray-400 mb-3" />
      <h3 className="text-lg font-medium text-gray-900">My Progress Reports</h3>
      <p className="text-gray-500">Your training reports will appear here</p>
    </div>
  );

  // Tab configuration
  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FiHome />,
      component: <DashboardTab />,
    },
    {
      id: "messages",
      label: "Messages",
      icon: <FiMessageSquare />,
      component: <MessagesTab />,
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: <FiCalendar />,
      component: <ScheduleTab />,
    },
    {
      id: "reports",
      label: "Reports",
      icon: <FiFileText />,
      component: <ReportsTab />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {noticeMessage && (
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow-lg z-50 flex items-center"
          >
            <FiBell className="mr-2" />
            {noticeMessage}
          </motion.div>
        </div>
      )}

      <TrainerHeader
        role="student"
        messages={messages}
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
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg flex items-center ${activeTab === tab.id
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-100"
                    }`}
                >
                  <span className="text-xl mr-3">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-56 bg-white border-r border-gray-200">
          <div className="p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center p-3 rounded-lg text-left ${activeTab === tab.id
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <span className="text-lg mr-3">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tabs.find((tab) => tab.id === activeTab)?.component}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-200 sticky top-0 bg-white flex justify-end">
                {/* <h3 className="font-semibold">{selectedMessage.comment}</h3> */}
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-4">
                {/* Here, use selectedMessage.comment */}
                <p className="text-gray-700 mb-4">{selectedMessage.comment}</p>
                <div className="text-xs text-gray-500">
                  {new Date(selectedMessage.createdAt).toLocaleDateString(
                    "us-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}{" "}
                  {/* Assuming `createdAt` is the timestamp */}
                </div>
              </div>

              {/* <div className="p-4 border-t border-gray-200">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send Reply
                  </button>
                </div>
              </div> */}

            </motion.div>
          </motion.div>

        )}
      </AnimatePresence>

      {/* New Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-lg w-full max-w-md"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center ">
                <h3 className="font-semibold">New Message</h3>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To:
                  </label>
                  <select
                    value={selectedTrainer}
                    onChange={(e) => setSelectedTrainer(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Trainer</option>
                    {trainerNames.map((trainer) => (
                      <option key={trainer} value={trainer}>
                        {trainer}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message:
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Type your message here..."
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendMessage(newMessage, replyingToId)}
                  disabled={!selectedTrainer || !newMessage.trim()}
                  className={`px-4 py-2 rounded-lg text-white ${!selectedTrainer || !newMessage.trim()
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                  Send Message
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Announcement Modal */}
      <AnimatePresence>
        {showAnnouncementModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-lg w-full max-w-md"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold">Create Announcement</h3>
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-4">
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Type your announcement here..."
                />
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleCreateAnnouncement("Sample announcement content")
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Post Announcement
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UserFooter />
    </div>
  );
};

// Reusable Components
const DashboardCard = ({ icon, title, value, onClick }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className="p-2 rounded-lg bg-opacity-20 bg-blue-100 mr-3">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  </motion.div>
);

const ActivityCard = ({ activity }) => (
  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
    <h3 className="font-medium">{activity.name}</h3>
    <div className="text-sm text-gray-600 mt-2 space-y-1">
      <div className="flex items-center">
        <FiUser className="mr-2 text-gray-400" />
        {activity.trainerUser?.fullName || "Trainer unknown"}
      </div>
      <div className="flex items-center">
        <FiMapPin className="mr-2 text-gray-400" />
        {activity.location}
      </div>
      <div className="flex items-center">
        <FiClock className="mr-2 text-gray-400" />
        {activity.time}
      </div>
    </div>
    <div className="mt-3 text-sm text-blue-600">Next: {activity.upcoming}</div>
  </div>
);

const ActivityTable = ({ activities }) => (
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
          Activity
        </th>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
          Trainer
        </th>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
          Venue
        </th>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
          Schedule
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {activities.map((activity) => (
        <tr key={activity.id} className="hover:bg-gray-50">
          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
            {activity.name}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm">
            {activity?.trainerUser?.fullName || "No trainer assigned"}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm">
            <div className="flex items-center">
              <FiMapPin className="mr-1" />
              {activity.location}
            </div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm">
            <div className="flex items-center">
              <FiClock className="mr-1" />
              {activity.time}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const AnnouncementCard = ({ announcement }) => (
  <div className="border-l-4 border-blue-500 pl-4 py-2">
    <div className="flex justify-between items-start">
      <h3 className="font-medium">{announcement.title}</h3>
      <span className="text-xs text-gray-500">
        {new Date(announcement.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </span>
    </div>
    <p className="text-gray-600 text-sm mt-1">{announcement.announcement}</p>
  </div>
);

const MessageItem = ({ message, onClick, trainerName = "Coach unknown" }) => (
  <div
    className={`p-4 cursor-pointer ${!message.read ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    onClick={onClick}
  >
    <div className="flex justify-between">
      <h3 className="font-medium">{trainerName}</h3>
      <span className="text-xs text-gray-500">
        {new Date(message.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </span>
    </div>
    <p className="text-gray-600 text-sm mt-1 truncate">{message.comment}</p>
    {!message.read && (
      <div className="mt-2 w-2 h-2 rounded-full bg-blue-500"></div>
    )}
  </div>
);

export default StudentDashboard;
