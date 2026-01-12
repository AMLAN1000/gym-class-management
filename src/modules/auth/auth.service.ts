import { PrismaClient, UserRole } from '@prisma/client';
import ApiError from '../../utils/ApiError';
import { comparePassword, hashPassword } from '../../utils/password.utils';
import { generateToken } from '../../utils/jwt.utils';
import { ILoginRequest, ILoginResponse, IRegisterRequest } from './auth.interface';

const prisma = new PrismaClient();

const loginUser = async (payload: ILoginRequest): Promise<ILoginResponse> => {
  const { email, password } = payload;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
};

const registerTrainee = async (payload: IRegisterRequest): Promise<ILoginResponse> => {
  const { email, password, name, phone } = payload;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists.');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user with TRAINEE role
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: UserRole.TRAINEE,
      phone,
    },
  });

  // Create trainee profile
  await prisma.trainee.create({
    data: {
      userId: user.id,
    },
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
};

export const AuthService = {
  loginUser,
  registerTrainee,
};