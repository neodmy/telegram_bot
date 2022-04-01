require('dotenv').config();
const { Telegraf } = require('telegraf');
const corpus = require('./corpus-es.json');
const initNlp = require('./nlp');
const initMongo = require('./mongodb');

const extractGuessData = ({ text: message, chat }, { utterance, intent, score }) => ({
  id: chat.id,
  message,
  firstName: chat.first_name,
  lastName: chat.last_name,
  utterance,
  intent,
  score,
});

(async () => {
  const nlp = await initNlp();
  const db = await initMongo();

  const bot = new Telegraf(process.env.BOT_TOKEN);

  const fallbackResponse = corpus.data.find(({ intent }) => intent === 'None').answers[0];

  const minScore = parseFloat(process.env.MIN_SCORE) || 0.7;

  const welcomeMessage = process.env.WELCOME_MESSAGE || 'Encantada de conocerte';

  bot.start(async (ctx) => {
    const { from: { first_name: firstName }, chat } = ctx.update.message;
    const currentChat = await db.findOneByChatId(chat.id);
    if (ctx.startPayload !== process.env.UNIQUE_CODE && !currentChat) {
      ctx.reply(`Hola ${firstName}. Estoy configurada para responder a determinados usuarios solamente. Disculpas`);
      return;
    }
    await db.upsertOneByChatId(chat);
    ctx.reply(`Hola ${firstName}. ${welcomeMessage}`);
  });

  bot.on('sticker', async (ctx) => {
    await ctx.replyWithSticker(ctx.update.message.sticker.file_id);
  });

  bot.on('message', async (ctx) => {
    const { text: message, chat } = ctx.update.message;
    const currentChat = await db.findOneByChatId(chat.id);
    if (!currentChat) return;

    const response = await nlp.process('es', message);
    const guess = extractGuessData(ctx.update.message, response);
    if (response.score < minScore || response.answer === fallbackResponse) {
      await db.insertBadGuess(guess);
      ctx.reply(fallbackResponse);
    } else {
      await db.insertGoodGuess(guess);
      ctx.reply(response.answer);
    }
  });

  await bot.launch();

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
})();
