'use-strict';
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TOKEN = process.env.TELEGRAM_TOKEN || '6217363266:AAEFZxZBre8i4y_iHsVcKqJwsNDoW4kHOPk';
const bot = new TelegramBot(TOKEN, { polling: true });
const webAppUrl = "https://fort-tg-web-app.vercel.app";
const stickerUrl =
  'https://tlgrm.eu/_/stickers/711/2ce/7112ce51-3cc1-42ca-8de7-62e7525dc332/3.webp';

const buttons = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'Посмотреть магазин предметов',
          web_app: { url: webAppUrl + '/shop' },
        },
      ],
      [
        {
          text: 'Посмотреть доступные игровые режимы',
          web_app: { url: webAppUrl + '/modes' },
        },
      ],
      [
        {
          text: 'Посмотреть внутреигровые достижения',
          web_app: { url: webAppUrl },
        },
      ],
    ],
  },
};

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Начальная информация' },
    { command: '/update_shop', description: 'Время до обновления магазина предметов' },
  ]);
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const firstName = msg.from.first_name;
    if (text === '/start') {
      await bot.sendSticker(chatId, stickerUrl);
      return bot.sendMessage(
        chatId,
        `Привет ${firstName}, я телеграм бот по игре Fortnite. Внизу ты можешь более подробно узнать обо мне!`,
        buttons,
      );
    }
    if (text === '/update_shop') {
      try {
        return axios
          .get('https://fortniteapi.io/v2/shop?lang=en', {
            headers: {
              Authorization: process.env.FORTNITE_TOKEN || '0d0ef984-1ed5fecb-e3100131-a5a6e943',
            },
          })
          .then(({ data: { currentRotation } }) => {
            const timer = setTimeout(() => {
              const countDownDate = new Date(currentRotation.Daily).getTime();
              const now = new Date().getTime();
              const distance = countDownDate - now;
              const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((distance % (1000 * 60)) / 1000);
              if (distance > 0) {
                return bot.sendMessage(
                  chatId,
                  `Следующее обновление магазина через ${hours}ч ${minutes} м ${seconds} сек`,
                );
              } else {
                clearTimeout(timer);
                return bot.sendMessage(chatId, `Магазин обновлен`);
              }
            }, msg.allowed_updates);
          });
      } catch (error) {
        console.log('Error!', error.message);
      }
    }
    return bot.sendMessage(
      chatId,
      'Я не понимаю тебя, возможно получил не ту команду, попробуй написать что-то другое. Например: /start или / чтобы увидеть все команды',
    );
  });
};
start();
