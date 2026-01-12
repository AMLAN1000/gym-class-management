/**
 * TRAINEE MODULE - TYPE DEFINITIONS
 *
 * Defines TypeScript interfaces for trainee-related operations
 *
 * USES: Nothing
 * USED BY: trainee.service, trainee.controller
 */

export interface IUpdateTraineeProfile {
  age?: number;
  phone?: string;
  name?: string;
}

export interface ITraineeProfile {
  id: string;
  userId: string;
  age: number | null;
  user: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}
