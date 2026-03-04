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