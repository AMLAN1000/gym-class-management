import { PrismaClient, UserRole } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import { hashPassword } from "../../utils/password.utils";
import { ICreateUserRequest } from "./user.interface";

const prisma = new PrismaClient();

const createUser = async (payload: ICreateUserRequest) => {
  const { email, password, name, role, phone } = payload;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, "User with this email already exists.");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      phone,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      createdAt: true,
    },
  });

  // If role is TRAINER, create trainer profile
  if (role === UserRole.TRAINER) {
    await prisma.trainer.create({
      data: {
        userId: user.id,
      },
    });
  }

  // If role is TRAINEE, create trainee profile
  if (role === UserRole.TRAINEE) {
    await prisma.trainee.create({
      data: {
        userId: user.id,
      },
    });
  }

  return user;
};

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      createdAt: true,
    },
  });
};

export const UserService = {
  createUser,
  getAllUsers,
};
