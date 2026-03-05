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
  siteConfig: z.object({
    name: z.string().trim().min(1, "Название обязательно"),
    briefDescription: z.string().trim().min(1, "Краткое описание обязательно"),
    description: z.string().trim().min(1, "Описание обязательно"),
    emailSubject: z.string().trim().min(1, "Тема письма обязательна"),
    emailHtml: z.string().trim().min(1, "HTML письма обязателен"),
  })
}
