'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Hhhmm...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say(`*Un robot inanimé posé sur une table* \n *Des larges yeux perplexes s'ouvrent à votre passage* \n Je suis le bot personnel de Maxime, un jeune-diplômé en communication et innovation, il m'a chargé de discuter à sa place. \n ![maxime](https://raw.githubusercontent.com/MaximeNialiv/EstherBot/master/img/maxime.jpg)`)
                .then(() => 'askName');
        }
    },

    askName: {
        prompt: (bot) => bot.say(`Puis-je connaître ton nom avant de commencer ?`),
        receive: (bot, message) => {
            const name = message.text;
            return bot.setProp('name', name)
                .then(() => bot.say(` ${name}... C'est un joli nom ! \n Enfin, c'est ce que l'on m'a dit de dire. Je ne saurais juger^^'\n Ma conversation est un peu laborieuse, vous ne pouvez me répondre qu'au moyen des mots en capitales, allez-y parlez BOT pour voir :) \n`))
                .then(() => 'speak');
        }
    },
    error: {
        prompt: (bot) => bot.say(` Désolé ${name}... Je ne suis qu\'un BOT, qu\'un reflet... Je ne comprends pas tout, utilise des mots simples, ou les boutons proposé`),
        receive: () => 'speak'
    },
    speak: {
        prompt: (bot) => bot.say(`Avant de commencer à discuter, je dois te prévenir, je comprends les mots-clés, mais les phrases m\'échappent... \n Mais ne t\'inquiètes pas ${name} , on va bien arriver à discuter :) `),
        receive: (bot, message) => {

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case "CONNECT ME":
                        return bot.setProp("silent", true);
                    case "DISCONNECT":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }

            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }

                if (!_.has(scriptRules, upperText)) {
                    return bot.say(` Désolé ${name}... Je ne suis qu'un BOT, qu'un reflet... Je ne comprends pas tout, utilise des mots simples, ou les boutons proposés`).then(() => 'speak');
                }

                var response = scriptRules[upperText];
                var lines = response.split('\n');

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    p = p.then(function() {
                        console.log(line);
                        return bot.say(line);
                    });
                })

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});
