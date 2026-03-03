import { template, TemplateExecutor } from 'lodash';

interface IConfig {
  name: string,
  briefDescription: string,
  description: string,
  emailSubject: TemplateExecutor,
  emailHtml: TemplateExecutor,
};

const Config:IConfig = {
  name: "Кибер Арена",
  briefDescription: "Сервис, который помогает студентам бронировать зоны, видеть занятость и развивать активность вокруг арены",
  description: `
Сервис, который помогает студентам бронировать зоны, видеть занятость и развивать активность вокруг арены.
`,
  emailSubject: template("Вход в <%= name %>"),
  emailHtml: template(`
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
  `),
};

export default Config;

