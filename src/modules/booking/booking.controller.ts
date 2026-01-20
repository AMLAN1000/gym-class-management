/**
 * BOOKING MODULE - HTTP REQUEST HANDLER
 *
 * Handles incoming HTTP requests for booking operations
 */

import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import { BookingService } from "./booking.service";

/**
 * POST /api/bookings/book
 * Trainee books a class
 */
const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await BookingService.createBooking(userId, req.body);

  res
    .status(201)
    .json(new ApiResponse(201, result, "Class booked successfully"));
});

/**
 * GET /api/bookings/my-bookings
 * Trainee views their bookings
 */
const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await BookingService.getMyBookings(userId);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Bookings retrieved successfully"));
});

/**
 * DELETE /api/bookings/:id
 * Trainee cancels a booking
 */
const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const result = await BookingService.cancelBooking(userId, id as string);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Booking cancelled successfully"));
});

//get/api/bookings admin see all bookings
const getAllBookings = asyncHandler(async (req: Request, res: Response) => {
  const result = await BookingService.getAllBookings();
  res
    .status(200)
    .json(new ApiResponse(200, result, "Bookings retrieved successfully"));
});
export const BookingController = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
};
