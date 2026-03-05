import { Collection, Document } from 'mongodb';
import clientPromise from './mongodb';
import type { EmailCode, User, SiteConfig, Team, Event, LayoutConfig, Booking, Tournament } from '@/lib/types';

const DB_NAME = process.env.MONGODB_NAME || 'db';

async function getDb() {
  const client = await clientPromise
  return client.db(DB_NAME)
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}

export const collections = {
  emailCodes: () => { return getCollection<EmailCode>("emailCodes") },
  users: () => { return getCollection<User>("users") },
  siteConfig: () => { return getCollection<SiteConfig>("siteConfig") },
  teams: () => { return getCollection<Team>("teams") },
  events: () => { return getCollection<Event>("events") },
  bookings: () => { return getCollection<Booking>("bookings") },
  layout: () => { return getCollection<LayoutConfig>("layout") },
  tournaments: () => { return getCollection<Tournament>("tournaments") },
}