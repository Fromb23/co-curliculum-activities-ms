import React, { useEffect, useState } from "react";
import DashCard from "../components/DashCard";
import { fetchActivities } from "../services/activities";
import { fetchStudents } from "../services/students";
import { fetchTrainers } from "../services/trainer";
import {
  GraduationCap,
  ScissorsLineDashed,
  SquareActivity,
  Users,
} from "lucide-react";

const DashboardPage = () => {
  const [students, setStudents] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const stats = {
    totalStudents: students.length,
    totalTrainers: trainers.length,
    totalActivities: activities.length,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [studentsData, trainersData, activitiesData] = await Promise.all([
          fetchStudents(),
          fetchTrainers(),
          fetchActivities(),
        ]);
        setStudents(studentsData);
        setTrainers(trainersData);
        setActivities(activitiesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#3B82F6]">
          Admin Panel
        </h1>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <DashCard
            title="Students"
            subtitle="Total Number of Students"
            iconClass={() => (
              <GraduationCap
                className="text-[#3B82F6]"
                size={34}
                count={stats.totalStudents}
              />
            )}
            count={stats.totalStudents}
            link="/students"
            isLoading={isLoading}
          />
          <DashCard
            title="Trainers"
            subtitle="Total Number of Trainers"
            iconClass={() => (
              <ScissorsLineDashed
                className="text-[#10B981]"
                size={34}
                count={stats.totalTrainers}
              />
            )}
            count={stats.totalTrainers}
            link="/trainers"
            isLoading={isLoading}
          />
          <DashCard
            title="Activities"
            subtitle="Total Number of Activities"
            iconClass={() => (
              <SquareActivity
                className="text-[#8B5CF6]"
                size={34}
                count={stats.totalActivities}
              />
            )}
            count={stats.totalActivities}
            link="/activities"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="mt-6 md:mt-8">
        <div className="flex justify-between items-center mb-4">
          <h6 className="text-lg md:text-xl font-medium text-[#3B82F6]">
            Recent Activities
          </h6>
        </div>

        <div className="flex flex-col gap-3 md:gap-4">
          <div className="p-4 border border-[#E5E7EB] rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-200 flex items-center gap-4 hover:bg-[#F9FAFB]">
            <div className="p-2 bg-[#EFF6FF] rounded-full">
              <Users className="text-[#3B82F6]" size={24} />
            </div>
            <div>
              <p className="font-medium text-[#111827]">
                John Doe has been promoted to Level 2
              </p>
              <p className="text-sm text-[#6B7280]">2 hours ago</p>
            </div>
          </div>

          <div className="p-4 border border-[#E5E7EB] rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-200 flex items-center gap-4 hover:bg-[#F9FAFB]">
            <div className="p-2 bg-[#EFF6FF] rounded-full">
              <Users className="text-[#3B82F6]" size={24} />
            </div>
            <div>
              <p className="font-medium text-[#111827]">
                Jane Smith completed the Advanced Training
              </p>
              <p className="text-sm text-[#6B7280]">1 day ago</p>
            </div>
          </div>

          <div className="p-4 border border-[#E5E7EB] rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-200 flex items-center gap-4 hover:bg-[#F9FAFB]">
            <div className="p-2 bg-[#EFF6FF] rounded-full">
              <Users className="text-[#3B82F6]" size={24} />
            </div>
            <div>
              <p className="font-medium text-[#111827]">
                Michael Brown joined the Basketball Program
              </p>
              <p className="text-sm text-[#6B7280]">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
