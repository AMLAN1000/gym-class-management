/**
 * SCHEDULE MODULE - BUSINESS LOGIC LAYER
 *
 * Handles class schedule operations with business rules:
 * - Max 5 schedules per day
 * - Each class = 2 hours
 * - Only admin can create schedules
 */

import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import {
  ICreateScheduleRequest,
  IScheduleFilters,
  IScheduleResponse,
} from "./schedule.interface";

const prisma = new PrismaClient();

/**
 * Create a new class schedule
 *
 * BUSINESS RULES:
 * 1. Max 5 schedules per day
 * 2. Trainer must exist
 * 3. End time must be exactly 2 hours after start time
 * 4. No overlapping schedules for the same trainer
 */
const createSchedule = async (
  adminId: string,
  payload: ICreateScheduleRequest
): Promise<IScheduleResponse> => {
  const { className, date, startTime, endTime, trainerId } = payload;

  // Parse date to check day boundaries
  const scheduleDate = new Date(date);
  const startOfDay = new Date(scheduleDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(scheduleDate);
  endOfDay.setHours(23, 59, 59, 999);

  // BUSINESS RULE 1: Check max 5 schedules per day
  const schedulesOnDate = await prisma.classSchedule.count({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  if (schedulesOnDate >= 5) {
    throw new ApiError(
      400,
      "Schedule limit reached. Maximum 5 schedules allowed per day."
    );
  }

  // BUSINESS RULE 2: Validate trainer exists
  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId },
  });

  if (!trainer) {
    throw new ApiError(404, "Trainer not found.");
  }

  // BUSINESS RULE 3: Validate 2-hour duration
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const durationMinutes = endMinutes - startMinutes;

  if (durationMinutes !== 120) {
    throw new ApiError(
      400,
      "Invalid class duration. Each class must be exactly 2 hours."
    );
  }

  // BUSINESS RULE 4: Check trainer availability (no overlapping schedules)
  const overlappingSchedule = await prisma.classSchedule.findFirst({
    where: {
      trainerId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        {
          AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
        },
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    },
  });

  if (overlappingSchedule) {
    throw new ApiError(
      400,
      "Trainer already has a class scheduled during this time slot."
    );
  }

  // Create schedule
  const schedule = await prisma.classSchedule.create({
    data: {
      className,
      date: scheduleDate,
      startTime,
      endTime,
      trainerId,
      adminId,
      maxTrainees: 10,
    },
    include: {
      trainer: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      bookings: {
        where: { cancelledAt: null },
      },
    },
  });

  return {
    ...schedule,
    currentBookings: schedule.bookings.length,
  } as IScheduleResponse;
};

/**
 * Get all schedules with optional filters
 */
const getAllSchedules = async (
  filters: IScheduleFilters
): Promise<IScheduleResponse[]> => {
  const { date, trainerId } = filters;

  const whereClause: any = {};

  // Filter by date
  if (date) {
    const scheduleDate = new Date(date);
    const startOfDay = new Date(scheduleDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(scheduleDate);
    endOfDay.setHours(23, 59, 59, 999);

    whereClause.date = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  // Filter by trainer
  if (trainerId) {
    whereClause.trainerId = trainerId;
  }

  const schedules = await prisma.classSchedule.findMany({
    where: whereClause,
    include: {
      trainer: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      bookings: {
        where: { cancelledAt: null },
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return schedules.map((schedule) => ({
    ...schedule,
    currentBookings: schedule.bookings.length,
  })) as IScheduleResponse[];
};

/**
 * Get schedule by ID
 */
const getScheduleById = async (
  scheduleId: string
): Promise<IScheduleResponse> => {
  const schedule = await prisma.classSchedule.findUnique({
    where: { id: scheduleId },
    include: {
      trainer: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      bookings: {
        where: { cancelledAt: null },
        include: {
          trainee: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!schedule) {
    throw new ApiError(404, "Schedule not found.");
  }

  return {
    ...schedule,
    currentBookings: schedule.bookings.length,
  } as IScheduleResponse;
};

/**
 * Delete a schedule (Admin only)
 */
const deleteSchedule = async (scheduleId: string): Promise<void> => {
  const schedule = await prisma.classSchedule.findUnique({
    where: { id: scheduleId },
    include: {
      bookings: {
        where: { cancelledAt: null },
      },
    },
  });

  if (!schedule) {
    throw new ApiError(404, "Schedule not found.");
  }

  if (schedule.bookings.length > 0) {
    throw new ApiError(
      400,
      "Cannot delete schedule with active bookings. Please cancel all bookings first."
    );
  }

  await prisma.classSchedule.delete({
    where: { id: scheduleId },
  });
};

export const ScheduleService = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  deleteSchedule,
};
