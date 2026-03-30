export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'provider' | 'admin';
}

export interface Provider {
  _id: string;
  user: { _id: string; name: string; phone: string; email: string };
  category: string;
  bio: string;
  skills: string[];
  state: string;
  city: string;
  address: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  yearsOfExperience: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  paystackSubaccountCode: string;
}

export interface Booking {
  _id: string;
  customer: string;
  provider: Provider;
  service: string;
  description: string;
  scheduledDate: string;
  address: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  totalAmount: number;
  rating?: number;
  review?: string;
  createdAt: string;
}

export const SERVICE_CATEGORIES = [
  'Plumber',
  'Electrician',
  'Mechanic',
  'Cleaner',
  'Carpenter',
  'Painter',
  'Generator Technician',
  'AC Technician',
  'Welder',
  'Bricklayer',
  'Security Guard',
  'Driver',
];

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];
