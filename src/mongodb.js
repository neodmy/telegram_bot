// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();
const { MongoClient } = require('mongodb');

const init = async () => {
  const connectionString = process.env.MONGODB_CONNECTION_STRING;
  const databaseName = process.env.DATABASE_NAME;

  const db = (await MongoClient.connect(connectionString)).db(databaseName);

  const upsertOneByChatId = async (payload) => (await db.collection('chats').findOneAndUpdate(
    { id: payload.id },
    { $set: payload },
    { projection: { _id: 0 }, upsert: true, returnDocument: 'after' },
  ))?.value;

  const findOneByChatId = async (id) => db.collection('chats').findOne({ id });

  const insertBadGuess = async (message) => db.collection('guesses_failed').insertOne(message);

  const insertGoodGuess = async (message) => db.collection('guesses_success').insertOne(message);

  return {
    upsertOneByChatId,
    findOneByChatId,
    insertBadGuess,
    insertGoodGuess,
  };
};

module.exports = init;
