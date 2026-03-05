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
}

export interface SiteConfig {
  name: string;
  briefDescription: string;
  description: string;
  emailSubject: string;
  emailHtml: string;
  timezone: number;
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