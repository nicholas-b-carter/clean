const builder = require('botbuilder');
const restify = require('restify');
const apiairecognizer = require('api-ai-recognizer');

//= ========================================================
// Bot Setup
//= ========================================================

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
const connector = new builder.ChatConnector({
  appId: 'f69da74b-5fa6-4d4a-a3d5-cf6cf5906dff',
  appPassword: 'OCyBMTKBuRTuWmPZt1eeMDh',
});

/* eslint-disable */
const bot = new builder.UniversalBot(connector, { persistConversationData: true });
/* eslint-enable */

// this line is to set the listen method for the connector. allows messages to be parsed
server.post('/api/messages', connector.listen());

// setup the recognizer, this lets us use api-ai in place of luis
const recognizer = new apiairecognizer('c95f5a9618fe45acbc1d16a4726ed9e1');

// setup the bot buolder intentDialog to match the intents passed from api-ai
const intents = new builder.IntentDialog({ recognizers: [recognizer] });

// tell the bot to pass intents to the bot builder intents
bot.dialog('/', intents);
console.log(intents);

// map each intent to the business logic
// small talk is the small talk domain from api-ai
intents.matches('smalltalk.greetings', (session, args) => {
  console.log('smalltalk.greetings');
  // hopefully this lets up persist the session data; session persistence
  const data = session.conversationData || [];
  data.push(session.message);
  session.conversationData = data;
  // if allowed will show the user is typing thing :)
  session.sendTyping();
  // fulfillment is the reponse from api-ai if a domain has generated a response, which we can just
  // return if we didnt there would be no response.
  const fulfillment = builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
  session.send(fulfillment ? fulfillment.entity : 'Sorry...not sure how to respond to that');
});

// input.unknown is the action/intent returned from api-ai for this message
intents.matches('input.unknown', (session, args) => {
  const data = session.conversationData || [];
  data.push(session.message);
  session.conversationData = data;
  console.log('input.unknown');
});

// this is the onDefault intent method which is part of bot framework
intents.onDefault((session) => {
  console.log('defaulted');
  const data = session.conversationData || [];
  data.push(session.message);
  session.conversationData = data;
  session.send('Sorry...can you please rephrase?');
});
