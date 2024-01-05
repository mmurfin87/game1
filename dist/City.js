import { isConsonant, randomConsonant, randomIntBetween, randomLetter, randomVowel, testChance } from "./Util.js";
export class City {
    static staticNames = [
        'Rome',
        'Beijing',
        'London',
        'Madrid',
        'Washington'
    ];
    static generatedNames = City.generateNames(50);
    static generateNames(count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            const length = randomIntBetween(3, 10);
            let name = '', last = null, slast = null;
            for (let n = 0; n < length; n++) {
                let letter = last == null
                    ? randomLetter()
                    : isConsonant(last)
                        ? randomVowel()
                        : slast != null && isConsonant(slast) && testChance(0.5)
                            ? last
                            : randomConsonant();
                name += (last == null ? letter.toUpperCase() : letter);
                slast = last;
                last = letter;
            }
            result.push(name);
        }
        return result;
    }
    static names = City.generatedNames;
    static nameIndex = 0;
    static name() {
        return City.names[City.nameIndex++];
    }
    constructor() {
    }
}
