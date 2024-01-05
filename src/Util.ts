export type With<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export function element(tag: string, attrs?: Record<string, string>, text?: string): HTMLElement
{
	const e = document.createElement(tag);
	if (attrs)
		Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k]));
	if (text)
		e.appendChild(document.createTextNode(text));
	return e;
}

export function randomIntBetween(lower: number, upper: number): number
{
	if (lower == upper)
		return lower;
	if (lower > upper)
	{
		const tmp = lower;
		lower = upper;
		upper = tmp;
	}

	return lower + Math.floor(Math.random() * (upper - lower));
}

const letters = 'abcdefghijklmnopqrstuvwxyz';
const consonants = 'bcdfghjklmnpqrstvwxyz';
const vowels = 'aeiou';
export function randomLetter(): string
{
	return letters.charAt(Math.floor(Math.random() * letters.length));
}

export function isConsonant(letter: string): boolean
{
	return letter.length > 0 && consonants.search(letter.substring(0, 1)) != -1;
}

export function randomConsonant(): string
{
	return consonants.charAt(Math.floor(Math.random() * consonants.length));
}

export function randomVowel(): string
{
	return vowels.charAt(Math.floor(Math.random() * vowels.length));
}

/**
 * Calling this function over a long period of time with the same probability argument will return true a `probability` amount of times, and false the remaining
 * Example: Calling this 100 times with a probablity of 0.33 will return true roughly 33 times and false 77 times.
 * Not cryptographically safe.
 * @param probability a floating point number between 0 and 1 inclusive
 * @returns true if the probability was hit, false otherwise
 */
export function testChance(probability: number): boolean
{
	return Math.random() < probability;
}

export function logReturn<T>(returnValue: T, ...messages: any[]): T
{
	console.log(...messages);
	return returnValue;
}