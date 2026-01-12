import express, { Application, Request, Response } from "express";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler";
import { AuthRoutes } from "./modules/auth/auth.route";
import { UserRoutes } from "./modules/user/user.route";
import { TraineeRoutes } from "./modules/trainee/trainee.route";
import { TrainerRoutes } from "./modules/trainer/trainer.route";
import { ScheduleRoutes } from "./modules/schedule/schedule.route";
import { BookingRoutes } from "./modules/booking/booking.route";

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/trainees", TraineeRoutes);
app.use("/api/trainers", TrainerRoutes);
app.use("/api/schedules", ScheduleRoutes);
app.use("/api/bookings", BookingRoutes);

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Gym Class Management API is running!",
  });
});

// Global error handler
app.use(errorHandler);

export default app;
