export interface Advancement {
  name: string;
  description: string;
}

export const advancements: Advancement[] = [
  { name: "Новобранец", description: "Возьмите бронь" },
  { name: "Наёмник", description: "Возьмите бронь 10 раз" },
  { name: "Завсегдатай", description: "Возьмите бронь 25 раз" },
  { name: "Ветеран", description: "Возьмите бронь 50 раз" },
  { name: "Доппельзольднер", description: "Возьмите бронь 75 раз" },
  { name: "Мастер", description: "Возьмите бронь 100 раз" },
  { name: "Мы готовы", description: "Создайте или вступите команду" },
  { name: "Волк-одиночка", description: "Примите участие в одиночном чемпионате" },
  { name: "Один из нас", description: "Примите участие в чемпионате командой" },
  { name: "Один в поле...", description: "Выиграйте одиночный чемпионат" },
  { name: "Collaboratio maximi momenti", description: "Выиграйте чемпионат в составе команды" },
]