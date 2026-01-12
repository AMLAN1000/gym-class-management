/**
 * BOOKING MODULE - BUSINESS LOGIC LAYER
 *
 * Handles booking operations with business rules:
 * - Max 10 trainees per schedule
 * - No time conflicts for trainees
 * - Booking cancellation
 */
import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import { ICreateBookingRequest, IBookingResponse } from "./booking.interface";

const prisma = new PrismaClient();

/**
 * Helper function to check if two time ranges overlap
 * Returns true if they overlap, false if they don't
 */
const doTimesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const [h1, m1] = start1.split(":").map(Number);
  const [h2, m2] = end1.split(":").map(Number);
  const [h3, m3] = start2.split(":").map(Number);
  const [h4, m4] = end2.split(":").map(Number);

  const start1Minutes = h1 * 60 + m1;
  const end1Minutes = h2 * 60 + m2;
  const start2Minutes = h3 * 60 + m3;
  const end2Minutes = h4 * 60 + m4;

  // Two time ranges overlap if:
  // start1 < end2 AND start2 < end1
  // Examples:
  // 08:00-10:00 and 10:00-12:00 => 480 < 720 AND 600 < 600 => TRUE AND FALSE => NO OVERLAP ✓
  // 08:00-10:00 and 09:00-11:00 => 480 < 660 AND 540 < 600 => TRUE AND TRUE => OVERLAP ✓
  // 10:00-12:00 and 11:00-13:00 => 600 < 780 AND 660 < 720 => TRUE AND TRUE => OVERLAP ✓
  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};

/**
 * Create a new booking
 *
 * BUSINESS RULES:
 * 1. Max 10 trainees per schedule
 * 2. Trainee cannot book multiple classes in the same time slot
 * 3. Trainee cannot book the same schedule twice
 */
const createBooking = async (
  userId: string,
  payload: ICreateBookingRequest
): Promise<IBookingResponse> => {
  const { scheduleId } = payload;

  // Get trainee profile
  const trainee = await prisma.trainee.findUnique({
    where: { userId },
  });

  if (!trainee) {
    throw new ApiError(404, "Trainee profile not found.");
  }

  // Get schedule details
  const schedule = await prisma.classSchedule.findUnique({
    where: { id: scheduleId },
    include: {
      bookings: {
        where: { cancelledAt: null },
      },
    },
  });

  if (!schedule) {
    throw new ApiError(404, "Schedule not found.");
  }

  // BUSINESS RULE 1: Check max 10 trainees per schedule
  const activeBookings = schedule.bookings.length;
  if (activeBookings >= schedule.maxTrainees) {
    throw new ApiError(
      400,
      "Class schedule is full. Maximum 10 trainees allowed per schedule."
    );
  }

  // BUSINESS RULE 2: Check if trainee already booked this schedule
  const existingBooking = await prisma.booking.findFirst({
    where: {
      traineeId: trainee.id,
      scheduleId,
      cancelledAt: null,
    },
  });

  if (existingBooking) {
    throw new ApiError(400, "You have already booked this class.");
  }

  // BUSINESS RULE 3: Check time conflicts
  const scheduleDate = new Date(schedule.date);
  const startOfDay = new Date(scheduleDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(scheduleDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all trainee's bookings on the same day
  const traineeBookingsOnDate = await prisma.booking.findMany({
    where: {
      traineeId: trainee.id,
      cancelledAt: null,
      schedule: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    },
    include: {
      schedule: true,
    },
  });

  // Check if any existing booking overlaps with the new schedule
  for (const booking of traineeBookingsOnDate) {
    const hasConflict = doTimesOverlap(
      booking.schedule.startTime,
      booking.schedule.endTime,
      schedule.startTime,
      schedule.endTime
    );

    if (hasConflict) {
      throw new ApiError(
        400,
        "You already have a class booked during this time slot."
      );
    }
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      traineeId: trainee.id,
      scheduleId,
    },
    include: {
      trainee: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      schedule: {
        include: {
          trainer: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return booking as IBookingResponse;
};

/**
 * Get trainee's bookings
 */
const getMyBookings = async (userId: string): Promise<IBookingResponse[]> => {
  const trainee = await prisma.trainee.findUnique({
    where: { userId },
  });

  if (!trainee) {
    throw new ApiError(404, "Trainee profile not found.");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      traineeId: trainee.id,
      // REMOVED: cancelledAt: null - This was filtering out cancelled bookings
      // Show ALL bookings (both active and cancelled)
    },
    include: {
      trainee: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      schedule: {
        include: {
          trainer: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      bookedAt: "desc",
    },
  });

  return bookings as IBookingResponse[];
};

/**
 * Cancel a booking
 */
const cancelBooking = async (
  userId: string,
  bookingId: string
): Promise<IBookingResponse> => {
  const trainee = await prisma.trainee.findUnique({
    where: { userId },
  });

  if (!trainee) {
    throw new ApiError(404, "Trainee profile not found.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  if (booking.traineeId !== trainee.id) {
    throw new ApiError(403, "You can only cancel your own bookings.");
  }

  if (booking.cancelledAt) {
    throw new ApiError(400, "Booking is already cancelled.");
  }

  const cancelledBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      cancelledAt: new Date(),
    },
    include: {
      trainee: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      schedule: {
        include: {
          trainer: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return cancelledBooking as IBookingResponse;
};

/**
 * Get all bookings (Admin only)
 */
const getAllBookings = async (): Promise<IBookingResponse[]> => {
  const bookings = await prisma.booking.findMany({
    include: {
      trainee: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      schedule: {
        include: {
          trainer: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      bookedAt: "desc",
    },
  });

  return bookings as IBookingResponse[];
};

export const BookingService = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
};
