import { describe, expect, test } from "@jest/globals";
import { singleOrPlural } from "./string-processes";

////////////
////////////

describe(`singleOrPlural tests`, () => {

    test(`0 = plural`, () => {
        const result = singleOrPlural(0, 'daisy', 'daisies');
        expect(result).toEqual('daisies');
    })

    test(`1 = single`, () => {
        const result = singleOrPlural(1, 'daisy', 'daisies');
        expect(result).toEqual('daisy');
    })

    test(`2 = plural`, () => {
        const result = singleOrPlural(2, 'daisy', 'daisies');
        expect(result).toEqual('daisies');
    })

    test(`100 = plural`, () => {
        const result = singleOrPlural(100, 'daisy', 'daisies');
        expect(result).toEqual('daisies');
    })

});
