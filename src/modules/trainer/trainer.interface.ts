/**
 * TRAINER MODULE - TYPE DEFINITIONS
 *
 * Defines TypeScript interfaces for trainer-related operations
 *
 * USES: Nothing
 * USED BY: trainer.service, trainer.controller
 */

export interface IUpdateTrainerProfile {
  specialization?: string;
  experience?: number;
  bio?: string;
  name?: string;
  phone?: string;
}

export interface ITrainerProfile {
  id: string;
  userId: string;
  specialization: string | null;
  experience: number | null;
  bio: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}
