/**
 * TRAINEE MODULE - HTTP REQUEST HANDLER
 *
 * Handles incoming HTTP requests for trainee operations
 * Delegates business logic to trainee.service
 *
 * USES: asyncHandler, ApiResponse, trainee.service
 * USED BY: trainee.route
 */

import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import { TraineeService } from "./trainee.service";

/**
 * GET /api/trainees/profile
 * Trainee views their own profile
 */
const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await TraineeService.getMyProfile(userId);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Profile retrieved successfully"));
});

/**
 * PUT /api/trainees/profile
 * Trainee updates their own profile
 */
const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await TraineeService.updateMyProfile(userId, req.body);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Profile updated successfully"));
});

export const TraineeController = {
  getMyProfile,
  updateMyProfile,
};
