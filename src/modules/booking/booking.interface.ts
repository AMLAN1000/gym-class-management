/**
 * BOOKING MODULE - TYPE DEFINITIONS
 *
 * Defines TypeScript interfaces for booking operations
 */

export interface ICreateBookingRequest {
  scheduleId: string;
}

export interface IBookingResponse {
  id: string;
  traineeId: string;
  scheduleId: string;
  bookedAt: Date;
  cancelledAt: Date | null;
  trainee: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  schedule: {
    id: string;
    className: string;
    date: Date;
    startTime: string;
    endTime: string;
    trainer: {
      user: {
        name: string;
      };
    };
  };
}
