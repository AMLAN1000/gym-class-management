import bcrypt from "bcryptjs";
import config from "../config";

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, config.bcrypt_salt_rounds);
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
