'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Processing...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            //return bot.say(`Hello! Please choose your language. Bonjour ! Choisissez votre langue, s'il vous plait.\n%[More rooms](postback:more_rooms) %[Français](postback:francais)`)
            return bot.say(`Hello!\n I'm Izzy thanks for stopping by, I'm going to ask a few questions to answer your design questions\n Select Room\n%[Living Room](postback:livingroom) %[Bedroom](postback:bedroom) %[Dining Room](postback:diningroom) %[More rooms](postback:more_rooms)`)
                .then(() => 'speak');
        }
    },

    speak: {
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
                    return bot.say(`[EN] Sorry, I didn\'t understand what you said. Remember, I\'m just a bot.` ).then(() => 'speak');
                }

                var response = scriptRules[upperText];
                var lines = response.split('\n');

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    p = p.then(function() {
                        console.log(line);
                        return wait(50).then(function() {
                            return bot.say(line);
                        });
                    });
                });

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});
