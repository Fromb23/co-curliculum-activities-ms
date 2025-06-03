import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./Layout";
import DashboardPage from "./pages/DashboardPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import TrainersPage from "./pages/TrainersPage";
import StudentsPage from "./pages/StudentsPage";
import TrainningSchedulePage from "./pages/TrainningSchedulePage";
import NewTrainerPage from "./pages/NewTrainerPage";
import NewStudentPage from "./pages/NewStudentPage";
import CreateSchedulePage from "./pages/CreateSchedulePage";
import NewActivityPage from "./pages/NewActivityPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import EditActivityPage from "./pages/EditActivityPage";
import EditStudentPage from "./pages/EditStudentPage";
import EditTrainerPage from "./pages/EditTrainerPage";
import TrainerDashboard from "./pages/TrainerDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import SetPassword from "./pages/SetPassword";
import ReportComponent from "./components/ReportComponent";
import SettingsPage from "./pages/SettingsPage";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./components/NotFound";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute />}>
          {/* Only trainers */}
          <Route element={<RoleProtectedRoute allowedRoles={['trainer']} />}>
            <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
            <Route path="/reports" element={<ReportComponent />} />
          </Route>

          {/* Only students */}
          <Route element={<RoleProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student-dashboard" element={<StudentDashboard />} />
          </Route>

          {/* Only admins */}
          <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/activities/new" element={<NewActivityPage />} />
              <Route path="/activities/:id/edit" element={<EditActivityPage />} />
              <Route path="/trainers" element={<TrainersPage />} />
              <Route path="/trainers/:id/edit" element={<EditTrainerPage />} />
              <Route path="/trainers/new" element={<NewTrainerPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/students/new" element={<NewStudentPage />} />
              <Route path="/students/:id/edit" element={<EditStudentPage />} />
              <Route path="/trainning-schedules" element={<TrainningSchedulePage />} />
              <Route path="/trainning-schedules/create" element={<CreateSchedulePage />} />
            </Route>
          </Route>
        </Route>
<Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
