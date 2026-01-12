/**
 * TRAINER MODULE - HTTP REQUEST HANDLER
 *
 * Handles incoming HTTP requests for trainer operations
 * Delegates business logic to trainer.service
 *
 * USES: asyncHandler, ApiResponse, trainer.service
 * USED BY: trainer.route
 */

import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import { TrainerService } from "./trainer.service";

/**
 * GET /api/trainers/profile
 * Trainer views their own profile
 */
const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await TrainerService.getMyProfile(userId);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Profile retrieved successfully"));
});

/**
 * PUT /api/trainers/profile
 * Trainer updates their own profile
 */
const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await TrainerService.updateMyProfile(userId, req.body);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Profile updated successfully"));
});

/**
 * GET /api/trainers/schedules
 * Trainer views their assigned class schedules
 */
const getMySchedules = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await TrainerService.getMySchedules(userId);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Schedules retrieved successfully"));
});

export const TrainerController = {
  getMyProfile,
  updateMyProfile,
  getMySchedules,
};
