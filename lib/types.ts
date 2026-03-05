import { ObjectId } from 'mongodb'
import {groups} from './groups'

export interface EmailCode {
  _id: ObjectId,
  email: string,
  "attempts": number,
  "code": number,
  "createdAt": Date
}

export type Role = "admin" | "user";
export type Group = typeof groups[number];

export interface User {
  _id: ObjectId,
  email: string,
  fio?: string,
  group?: Group,
  steam?: string,
  role: Role
}

export interface JWTPayload {
  userId: string,
  email: string;
  role: Role;
  group?: Group;
}

export interface SiteConfig {
  name: string;
  briefDescription: string;
  description: string;
  emailSubject: string;
  emailHtml: string;
  timezone: number;
  workStart: number;
  slotDuration: number;
  slotCount: number;
}

export interface ComputerSlot {
  start: [number, number];
  size:  [number, number];
}

export interface LayoutConfig {
  width:     number;
  height:    number;
  computers: ComputerSlot[];
}

export interface Booking {
  _id:        ObjectId;
  userId:     ObjectId;
  computerId: number;
  startTime:  Date;
  endTime:    Date;
}

export interface Event {
  _id: ObjectId;
  title: string;
  description?: string;
  date: Date;
}

export interface TeamMember {
  userId: ObjectId;
  joinedAt: Date;
}

export interface Team {
  _id: ObjectId;
  name: string;
  members: TeamMember[];    // sorted by joinedAt ASC — members[0] is captain
  applications: ObjectId[]; // pending applicant user IDs
}

export interface TournamentRegistration {
  teamId: ObjectId;
  registeredAt: Date;
}

export interface Tournament {
  _id: ObjectId;
  title: string;
  description?: string;
  date: Date;
  minTeamSize: number;
  maxTeamSize: number;
  registrations: TournamentRegistration[];
}