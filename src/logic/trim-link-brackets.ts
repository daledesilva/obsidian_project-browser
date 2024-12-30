export function trimLinkBrackets(input: string): string {
    const trimmedInput = input.trim();
    if (trimmedInput.startsWith('[[') && trimmedInput.endsWith(']]')) {
        return trimmedInput.substring(2, trimmedInput.length - 2);
    }
    return trimmedInput;
}
