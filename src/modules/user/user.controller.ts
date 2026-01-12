import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import { UserService } from "./user.service";

const createUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, result, "User created successfully"));
});

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers();
  res
    .status(200)
    .json(new ApiResponse(200, result, "Users retrieved successfully"));
});

export const UserController = {
  createUser,
  getAllUsers,
};
