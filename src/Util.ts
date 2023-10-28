export function element(tag: string, attrs?: Record<string, string>, text?: string): HTMLElement
{
	const e = document.createElement(tag);
	if (attrs)
		Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k]));
	if (text)
		e.appendChild(document.createTextNode(text));
	return e;
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