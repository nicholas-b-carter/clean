var builder = require('botbuilder');
var restify = require('restify');
var apiairecognizer = require('api-ai-recognizer');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: 'f69da74b-5fa6-4d4a-a3d5-cf6cf5906dff',
    appPassword: 'OCyBMTKBuRTuWmPZt1eeMDh'
});
var bot = new builder.UniversalBot(connector, { persistConversationData: true });
server.post('/api/messages', connector.listen());

var recognizer = new apiairecognizer('c95f5a9618fe45acbc1d16a4726ed9e1');
var intents = new builder.IntentDialog({
  recognizers: [recognizer]
});

// BEGINS LOGIC
intents.matches('smalltalk.greetings', function(session, args){
  session.conversationData = (session.conversationData || []).push(session.message);
  session.sendTyping();
  debuggerLogs('smalltalk.greetings', session, args);
  const fulfillment =  builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
  session.send(fulfillment ? fulfillment.entity : 'Sorry...not sure how to respond to that')
});

intents.matches('input.unknown', function(session, args) {
  session.conversationData = (session.conversationData || []).push(session.message);

   debuggerLogs('input.unknown', session, args);

});
/*
 * END SyscoOrdering Agent
 */


intents.matches('hi',function(session){
    session.send('Hey there! I can help you find wifi passwords at Airports');
});

intents.matches('findPassword',function(session,args){
    session.sendTyping();
    var airport = builder.EntityRecognizer.findEntity(args.entities,'airports');
    var city = builder.EntityRecognizer.findEntity(args.entities,'geo-city');
    var country = builder.EntityRecognizer.findEntity(args.entities,'geo-country');


    if (country){

        if (country.entity == 'United States of America'){
            session.send("That's too broad. Which city or airport are you looking for?");
        }else{
            var airports = data.airports.filter(function(element){
            return element.country.toLowerCase() === country.entity.toLowerCase();
            });

            if (airports.length == 0){
                session.endDialog("Sorry I do not have much info about the airports there");
            }
            var attchments = [];

            for (var i=0;i<airports.length;i++){
                var attachment = new builder.HeroCard(session)
                                    .title(airports[i]['name'])
                                    .subtitle(airports[i]['city'])
                                    .buttons([
                                        builder.CardAction.imBack(session, airports[i]['name'], "Select")
                                    ]);
                attchments.push(attachment);
            }

            var msg = new builder.Message(session)
                            .attachmentLayout(builder.AttachmentLayout.carousel)
                            .attachments(attchments);
            session.endDialog(msg);
        }
    }
    else if(city){
        var airports = data.airports.filter(function(element){
            return element.city.toLowerCase() === city.entity.toLowerCase();
        });

        if (airports.length == 0){
                session.endDialog("Sorry I do not have much info about the airports there");
        }

        var attchments = [];

        for (var i=0;i<airports.length;i++){
            var attachment = new builder.HeroCard(session)
                                .title(airports[i]['name'])
                                .subtitle(airports[i]['city'])
                                .buttons([
                                    builder.CardAction.imBack(session, airports[i]['name'], "Select")
                                ]);
            attchments.push(attachment);
        }

        var msg = new builder.Message(session)
                        .attachmentLayout(builder.AttachmentLayout.carousel)
                        .attachments(attchments);
        session.endDialog(msg);
    }
    else if (airport){
        var airports = data.airports.filter(function(element){
            return element.name === airport.entity;
        });

        if (airports.length > 0){
            session.send("Here's the info for " + airports[0]['name'] + " : " + airports[0]['description']);
        } else{
            var airport_name = airport.entity.replace(/(^|\s)[a-z]/g,function(f){return f.toUpperCase();});
            var airport_name = airport_name.replace('Airport','International Airport');
            var airports = data.airports.filter(function(element){
                return element.name === airport_name;
            });

            if (airports.length > 0){
                session.send("Here's the info for " + airports[0]['name'] + " : " + airports[0]['description']);
            } else{
                var city = airport.entity;

                var airports = data.airports.filter(function(element){
                    return element.city.toLowerCase() === city.entity.toLowerCase();
                });

                if (airports.length == 0){
                    session.endDialog("Sorry I do not know much about that airport");
                }

                var attchments = [];

                for (var i=0;i<airports.length;i++){
                    var attachment = new builder.HeroCard(session)
                                        .title(airports[i]['name'])
                                        .subtitle(airports[i]['city'])
                                        .buttons([
                                            builder.CardAction.imBack(session, airports[i]['name'], "Select")
                                        ]);
                    attchments.push(attachment);
                }

                var msg = new builder.Message(session)
                                .attachmentLayout(builder.AttachmentLayout.carousel)
                                .attachments(attchments);
                session.endDialog(msg);
            }
        }
    }
    else{
        session.send("Can you be more specific? Type in the airport name, city name or the country name?");
    }
});

intents.onDefault(function(session){
   debuggerLogs('onDefault', session, {});

    session.send("Sorry...can you please rephrase?");
});

function upperCaseFirst(str){
    return str.charAt(0).toUpperCase() + str.substring(1);
}
