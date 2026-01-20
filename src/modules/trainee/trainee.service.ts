/**
 * TRAINEE MODULE - BUSINESS LOGIC LAYER
 *
 * Handles all trainee-related database operations and business rules
 *
 * USES: @prisma/client, ApiError, trainee.interface
 * USED BY: trainee.controller
 */

import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import { IUpdateTraineeProfile, ITraineeProfile } from "./trainee.interface";

const prisma = new PrismaClient();

/**
 * Get trainee profile by userId
 * Returns complete profile with user details
 */
const getMyProfile = async (userId: string): Promise<ITraineeProfile> => {
  const trainee = await prisma.trainee.findUnique({
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

  if (!trainee) {
    throw new ApiError(404, "Trainee profile not found.");
  }

  return trainee as ITraineeProfile;
};

/**
 * Update trainee profile
 * Can update age, and user info (name, phone)
 */
const updateMyProfile = async (
  userId: string,
  payload: IUpdateTraineeProfile,
): Promise<ITraineeProfile> => {
  const { age, phone, name } = payload;

  // Check if trainee exists
  const trainee = await prisma.trainee.findUnique({
    where: { userId },
  });

  if (!trainee) {
    throw new ApiError(404, "Trainee profile not found.");
  }

  // Update trainee-specific fields
  const updatedTrainee = await prisma.trainee.update({
    where: { userId },
    data: {
      ...(age && { age }),
    },
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

export const TraineeService = {
  getMyProfile,
  updateMyProfile,
};
