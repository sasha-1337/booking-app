export type Service = {
  id: string;
  name: string;
  price: number; // flat price in UAH
};

export type Room = {
  id: string;
  name: string;
  capacity: number;
  basePricePerHour: number;
  services: Service[];
  photoUrl?: string;
};

export type Booking = {
  id: string;
  roomId: string;
  roomName: string;
  startAt: string; // ISO datetime
  durationHours: number;
  serviceIds: string[];
  totalPrice: number;
};

export type CreateRoomPayload = {
  name: string;
  capacity: number;
  basePricePerHour: number;
  services: Omit<Service, 'id'>[] | Service[];
  photoUrl?: string;
};

export type UpdateRoomPayload = Partial<CreateRoomPayload>;

export type CreateBookingPayload = {
  roomId: string;
  startAt: string;
  durationHours: number;
  serviceIds: string[];
};

export type CreateBookingResponse = {
  bookingId: string;
  totalPrice: number;
};

export type ProblemDetails = {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
};

export type AvailableRoomsParams = {
  date: string; // YYYY-MM-DD
  from: string; // HH:mm
  to: string; // HH:mm
  capacity?: number;
};
