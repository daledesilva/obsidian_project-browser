


export function findItemByProperty<T>(array: T[], propertyName: string, propertyValue: string): T | undefined {
    // @ts-ignore
    return array.find(item => item[propertyName] === propertyValue);
}
