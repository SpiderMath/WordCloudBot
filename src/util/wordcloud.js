const { Message } = require("discord.js");

const ignoredWords = ["a", "the", "an"];

/**
 * 
 * @param {Message[]} msgArray
 */
function getListFromMessageArray(msgArray) {
    const frequencyMap = new Map();

    for(const msg of msgArray) {
        if(msg.author.bot || !msg.content || msg.content === "")
            continue;

        // breaking the sentence into words
        let words = msg.content
            .toLowerCase()
            .replace(/[^\s\w']|_/g, " ").split(/ +/g);

        for(const word of words) {
            if(ignoredWords.includes(word))
                continue;

            if(frequencyMap.has(word))
                frequencyMap.set(word, frequencyMap.get(word) + 1);
            else
                frequencyMap.set(word, 1);
        }
    }

    const frequencyList = Array.from(frequencyMap.entries());
    return frequencyList;
}

module.exports = {
    getListFromMessageArray,
}