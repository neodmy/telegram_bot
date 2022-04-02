// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();
const { MongoClient } = require('mongodb');

const init = async () => {
  const connectionString = process.env.MONGODB_CONNECTION_STRING;
  const databaseName = process.env.DATABASE_NAME;

  const client = await MongoClient.connect(connectionString);
  const db = client.db(databaseName);

  const upsertOneByChatId = async (payload) => (await db.collection('chats').findOneAndUpdate(
    { id: payload.id },
    { $set: payload },
    { projection: { _id: 0 }, upsert: true, returnDocument: 'after' },
  ))?.value;

  const findOneByChatId = async (id) => db.collection('chats').findOne({ id });

  const insertBadGuess = async (message) => db.collection('guesses_failed').insertOne(message);

  const insertGoodGuess = async (message) => db.collection('guesses_success').insertOne(message);

  const findCorpus = async () => db.collection('corpus').findOne({}, { projection: { _id: 0 } });

  const disconnect = () => client.close();

  return {
    upsertOneByChatId,
    findOneByChatId,
    insertBadGuess,
    insertGoodGuess,
    findCorpus,
    disconnect,
  };
};

module.exports = init;
