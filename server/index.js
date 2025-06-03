import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import activityRoutes from "./routes/activities.js";
import userRouter from "./routes/users.js";
import scheduleRoutes from "./routes/schedules.js";
import commentRoutes from "./routes/comments.js";
import announcementRoutes from "./routes/announcements.js";
import reportRoutes from "./routes/reports.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/activities", activityRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
