import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import { AuthService } from "./auth.service";

const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  res.status(200).json(new ApiResponse(200, result, "Login successful"));
});

const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.registerTrainee(req.body);

  res
    .status(201)
    .json(new ApiResponse(201, result, "Trainee registered successfully"));
});

export const AuthController = {
  login,
  register,
};
