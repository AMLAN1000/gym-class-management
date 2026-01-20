/**
 * TRAINER MODULE - BUSINESS LOGIC LAYER
 *
 * Handles all trainer-related database operations and business rules
 *
 * USES: @prisma/client, ApiError, trainer.interface
 * USED BY: trainer.controller
 */

import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import { IUpdateTrainerProfile, ITrainerProfile } from "./trainer.interface";

const prisma = new PrismaClient();

/**
 * Get trainer profile by userId
 * Returns complete profile with user details
 */
const getMyProfile = async (userId: string): Promise<ITrainerProfile> => {
  const trainer = await prisma.trainer.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
        },
      },
    },
  });

  if (!trainer) {
    throw new ApiError(404, "Trainer profile not found.");
  }

  return trainer as ITrainerProfile;
};

/**
 * Update trainer profile
 * Can update specialization, experience, bio, and user info
 */
const updateMyProfile = async (
  userId: string,
  payload: IUpdateTrainerProfile,
): Promise<ITrainerProfile> => {
  const { specialization, experience, bio, phone, name } = payload;

  // Check if trainer exists
  const trainer = await prisma.trainer.findUnique({
    where: { userId },
  });

  if (!trainer) {
    throw new ApiError(404, "Trainer profile not found.");
  }

  // Update trainer-specific fields
  await prisma.trainer.update({
    where: { userId },
    data: {
      ...(specialization && { specialization }),
      ...(experience !== undefined && { experience }),
      ...(bio && { bio }),
    },
  });

  // Update user fields if provided
  if (phone || name) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(phone && { phone }),
        ...(name && { name }),
      },
    });
  }

  // Fetch updated profile
  return getMyProfile(userId);
};

/**
 * Get trainer's assigned class schedules
 * Returns all schedules where this trainer is assigned
 */
const getMySchedules = async (userId: string) => {
  const trainer = await prisma.trainer.findUnique({
    where: { userId },
  });

  if (!trainer) {
    throw new ApiError(404, "Trainer profile not found.");
  }

  const schedules = await prisma.classSchedule.findMany({
    where: { trainerId: trainer.id },
    include: {
      bookings: {
        where: { cancelledAt: null },
        select: {
          id: true,
          trainee: {
            select: {
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
    orderBy: { date: "asc" },
  });

  return schedules;
};

export const TrainerService = {
  getMyProfile,
  updateMyProfile,
  getMySchedules,
};
