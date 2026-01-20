/**
 * BOOKING MODULE - BUSINESS LOGIC LAYER (MongoDB Optimized)
 *
 * Handles booking operations with business rules:
 * - Max 10 trainees per schedule
 * - No time conflicts for trainees
 * - Booking cancellation
 *
 *
 */
import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import { ICreateBookingRequest, IBookingResponse } from "./booking.interface";

const prisma = new PrismaClient();

/**
 * Helper function to check if two time ranges overlap
 */
const doTimesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean => {
  const [h1, m1] = start1.split(":").map(Number);
  const [h2, m2] = end1.split(":").map(Number);
  const [h3, m3] = start2.split(":").map(Number);
  const [h4, m4] = end2.split(":").map(Number);

  const start1Minutes = h1 * 60 + m1;
  const end1Minutes = h2 * 60 + m2;
  const start2Minutes = h3 * 60 + m3;
  const end2Minutes = h4 * 60 + m4;

  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};

/**
 * Create a new booking
 *
 */
const createBooking = async (
  userId: string,
  payload: ICreateBookingRequest,
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
  });

  if (!schedule) {
    throw new ApiError(404, "Schedule not found.");
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

  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      traineeId: trainee.id,
      cancelledAt: null,
      schedule: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        OR: [
          {
            AND: [
              { startTime: { lte: schedule.startTime } },
              { endTime: { gt: schedule.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: schedule.endTime } },
              { endTime: { gte: schedule.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: schedule.startTime } },
              { endTime: { lte: schedule.endTime } },
            ],
          },
        ],
      },
    },
  });

  if (conflictingBooking) {
    throw new ApiError(
      400,
      "You already have a class booked during this time slot.",
    );
  }

  // This will ONLY increment if activeBookingsCount < maxTrainees
  const incrementResult = await prisma.classSchedule.updateMany({
    where: {
      id: scheduleId,
      activeBookingsCount: {
        lt: schedule.maxTrainees, //  Only update if under limit
      },
    },
    data: {
      activeBookingsCount: {
        increment: 1, //  Atomic increment
      },
    },
  });

  console.log(`📊 Schedule: ${schedule.className}`);
  console.log(
    ` Atomic increment result: ${incrementResult.count} row(s) updated`,
  );

  // If no rows were updated, the class is full
  if (incrementResult.count === 0) {
    throw new ApiError(
      400,
      `Class schedule is full. Maximum ${schedule.maxTrainees} trainees allowed per schedule.`,
    );
  }

  // Create the booking
  let booking;
  try {
    booking = await prisma.booking.create({
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

    console.log(
      ` Booking created! Active bookings: ${schedule.activeBookingsCount + 1}/${schedule.maxTrainees}`,
    );
  } catch (error) {
    //  ROLLBACK: If booking creation fails, decrement the counter
    await prisma.classSchedule.update({
      where: { id: scheduleId },
      data: {
        activeBookingsCount: {
          decrement: 1,
        },
      },
    });
    throw error;
  }

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
  bookingId: string,
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

  // Cancel the booking and decrement the counter atomically
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

  //  Decrement the active bookings counter
  await prisma.classSchedule.update({
    where: { id: booking.scheduleId },
    data: {
      activeBookingsCount: {
        decrement: 1,
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
