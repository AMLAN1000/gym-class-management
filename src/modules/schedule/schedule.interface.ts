/**
 * SCHEDULE MODULE - TYPE DEFINITIONS
 *
 * Defines TypeScript interfaces for schedule operations
 */

export interface ICreateScheduleRequest {
  className: string;
  date: string; // ISO format: "2025-02-15"
  startTime: string; // "10:00"
  endTime: string; // "12:00"
  trainerId: string;
}

export interface IScheduleResponse {
  id: string;
  className: string;
  date: Date;
  startTime: string;
  endTime: string;
  trainerId: string;
  adminId: string;
  maxTrainees: number;
  currentBookings: number;
  trainer: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IScheduleFilters {
  date?: string;
  trainerId?: string;
}
