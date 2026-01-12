/**
 * SCHEDULE MODULE - HTTP REQUEST HANDLER
 *
 * Handles incoming HTTP requests for schedule operations
 */

import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import { ScheduleService } from "./schedule.service";
import { IScheduleFilters } from "./schedule.interface";

/**
 * POST /api/schedules/create
 * Admin creates a new class schedule
 */
const createSchedule = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user!.userId;
  const result = await ScheduleService.createSchedule(adminId, req.body);

  res
    .status(201)
    .json(new ApiResponse(201, result, "Schedule created successfully"));
});

/**
 * GET /api/schedules
 * Get all schedules (with optional filters)
 */
const getAllSchedules = asyncHandler(async (req: Request, res: Response) => {
  const filters: IScheduleFilters = {
    date: req.query.date as string,
    trainerId: req.query.trainerId as string,
  };

  const result = await ScheduleService.getAllSchedules(filters);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Schedules retrieved successfully"));
});

/**
 * GET /api/schedules/:id
 * Get schedule by ID with booking details
 */
const getScheduleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ScheduleService.getScheduleById(id as string);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Schedule retrieved successfully"));
});

/**
 * DELETE /api/schedules/:id
 * Admin deletes a schedule
 */
const deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ScheduleService.deleteSchedule(id as string);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Schedule deleted successfully"));
});

export const ScheduleController = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  deleteSchedule,
};
