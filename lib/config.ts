import { template, TemplateExecutor } from 'lodash';
import { collections } from '@/lib/db/collections';
import { DEFAULT_TIMEZONE } from '@/lib/timezones';

interface IConfig {
  name: string,
  briefDescription: string,
  description: string,
  emailSubject: TemplateExecutor,
  emailHtml: TemplateExecutor,
  timezone: number,
  workStart: number,
  slotDuration: number,
  slotCount: number,
};

export const DEFAULT_CONFIG_STRINGS = {
  name: "Кибер Арена",
  briefDescription: "Сервис, который помогает студентам бронировать зоны, видеть занятость и развивать активность вокруг арены",
  description: "Сервис, который помогает студентам бронировать зоны, видеть занятость и развивать активность вокруг арены.",
  emailSubject: "Вход в <%= name %>",
  emailHtml: `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           max-width: 480px; margin: 0 auto; padding: 40px 20px; }
    .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;
            padding: 20px; background: #f4f4f5; border-radius: 8px; margin: 24px 0; }
    .footer { color: #71717a; font-size: 14px; margin-top: 32px; }
  </style>
  <body>
    <h1>Вход в <%= name %></h1>
    <p>Используйте этот код для входа в систему:</p>
    <div class="code"><%= code %></div>
    <p>Код действителен 10 минут.</p>
    <p class="footer">
      Если вы не запрашивали этот код, просто проигнорируйте это письмо.
    </p>
  </body>
  `,
};

const Config: IConfig = {
  name: DEFAULT_CONFIG_STRINGS.name,
  briefDescription: DEFAULT_CONFIG_STRINGS.briefDescription,
  description: DEFAULT_CONFIG_STRINGS.description,
  emailSubject: template(DEFAULT_CONFIG_STRINGS.emailSubject),
  emailHtml: template(DEFAULT_CONFIG_STRINGS.emailHtml),
  timezone: DEFAULT_TIMEZONE,
  workStart: 9,
  slotDuration: 60,
  slotCount: 9,
};

export async function getConfig(): Promise<IConfig> {
  try {
    const col = await collections.siteConfig();
    const doc = await col.findOne({});
    if (!doc) return Config;
    return {
      name: doc.name,
      briefDescription: doc.briefDescription,
      description: doc.description,
      emailSubject: template(doc.emailSubject),
      emailHtml: template(doc.emailHtml),
      timezone: doc.timezone ?? DEFAULT_TIMEZONE,
      workStart: doc.workStart ?? 9,
      slotDuration: doc.slotDuration ?? 60,
      slotCount: doc.slotCount ?? 9,
    };
  } catch {
    return Config;
  }
}

export default Config;
