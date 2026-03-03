import { ObjectId } from 'mongodb'

export interface EmailCode {
  _id: ObjectId,
  email: string,
  "attempts": number,
  "code": number,
  "createdAt": Date
}

export type Role = "admin" | "user";

export interface User {
  _id: ObjectId,
  email: string,
  username: string,
  role: Role
}

export interface JWTPayload {
  userId: string,
  email: string;
  role: Role;
}