import { z } from 'zod';
import {Group} from "@/lib/types";
import {groups} from "@/lib/groups";

export const schemas = {
  requestCode: z.object({
    email: z.email("Введите правильный email"),
  }),
  verifyCode: z.object({
    email: z.email(),
    code: z.string().regex(/^\d{6}$/, "Введите 6 цифр"),
  }),
  profile: z.object({
    fio: z.string().trim().transform(val =>
      val.replace(/\S+/g, word => word[0].toUpperCase() + word.slice(1).toLowerCase()))
      .refine(val => /^[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+$/.test(val),
    { message: "ФИО должно состоять из 3 слов" }),
    group: z.custom<Group>((group) => {
      return groups.includes(group as Group);
    }, { message: "Невалидная группа" }),
    steam: z.string().trim().regex(/https?:\/\/steamcommunity\.com\/(id|profiles)\/([a-zA-Z0-9_-]+)\/?/, {message: "Должна быть ссылка на профиль steam"}).or(z.literal(""))
  }),
  team: z.object({
    name: z.string().trim().min(1, "Название обязательно").max(50, "Максимум 50 символов"),
  }),
  event: z.object({
    title: z.string().trim().min(1, "Название обязательно").max(100, "Максимум 100 символов"),
    description: z.string().trim().max(2000, "Максимум 2000 символов").optional(),
    date: z.string().min(1, "Укажите дату"),
  }),
  siteConfig: z.object({
    name: z.string().trim().min(1, "Название обязательно"),
    briefDescription: z.string().trim().min(1, "Краткое описание обязательно"),
    description: z.string().trim().min(1, "Описание обязательно"),
    emailSubject: z.string().trim().min(1, "Тема письма обязательна"),
    emailHtml: z.string().trim().min(1, "HTML письма обязателен"),
    timezone: z.number().int().min(-12).max(12),
    workStart: z.number().int().min(0).max(23),
    slotDuration: z.number().int().min(1).max(120),
    slotCount: z.number().int().min(1).max(24),
  }),
  layout: z.object({
    width:  z.number().min(1).max(200),
    height: z.number().min(1).max(200),
    computers: z.array(z.object({
      start: z.tuple([z.number().min(0), z.number().min(0)]),
      size:  z.tuple([z.number().min(0.1), z.number().min(0.1)]),
    })),
  }),
  booking: z.object({
    computerId: z.number().int().min(0),
    startTime:  z.string().datetime(),
    slotCount:  z.number().int().min(1),
  }),
  tournament: z.object({
    title: z.string().trim().min(1, "Название обязательно").max(100, "Максимум 100 символов"),
    description: z.string().trim().max(2000, "Максимум 2000 символов").optional(),
    date: z.string().min(1, "Укажите дату"),
    minTeamSize: z.number().int().min(1, "Минимум 1 участник"),
    maxTeamSize: z.number().int().min(1, "Максимум хотя бы 1 участник"),
  }).refine(d => d.maxTeamSize >= d.minTeamSize, {
    message: "Максимальный размер не может быть меньше минимального",
    path: ["maxTeamSize"],
  }),
}
