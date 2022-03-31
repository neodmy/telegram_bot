const { dockStart } = require('@nlpjs/basic');

module.exports = async () => {
  const dock = await dockStart();
  return dock.get('nlp');
};
