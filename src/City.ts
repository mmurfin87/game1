import { isConsonant, randomConsonant, randomIntBetween, randomLetter, randomVowel, testChance } from "./Util.js";

export class City
{
	private static readonly staticNames: string[] = [
		'Rome',
		'Beijing',
		'London',
		'Madrid',
		'Washington'
	];

	private static readonly generatedNames: string[] = City.generateNames(50);

	private static generateNames(count: number): string[]
	{
		const result: string[] = [];

		for (let i: number = 0; i < count; i++)
		{
			const length = randomIntBetween(3, 10);
			let name = '', last = null, slast = null;
			for (let n: number = 0; n < length; n++)
			{
				let letter: string = last == null 
					? randomLetter()
					: isConsonant(last)
						? randomVowel()
						: slast != null && isConsonant(slast) && testChance(0.5)
							? last
							: randomConsonant()
				;

				name += (last == null ? letter.toUpperCase() : letter);
				slast = last;
				last = letter;
			}
			result.push(name);
		}

		return result;
	}

	public static readonly names: string[] = City.generatedNames;
	private static nameIndex = 0;
	
	public static name(): string
	{
		return City.names[City.nameIndex++];
	}

    constructor() 
	{
    }
}