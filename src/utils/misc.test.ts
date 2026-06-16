import { describe, expect, test } from "@jest/globals";
import { isEmpty } from "./misc";

describe("isEmpty", () => {
  test("returns true for empty object", () => {
    expect(isEmpty({})).toBe(true);
  });

  test("returns false for object with keys", () => {
    expect(isEmpty({ a: 1 })).toBe(false);
  });

  test("ignores prototype properties", () => {
    function Ctor(this: unknown) {
      this.own = 1;
    }
    Ctor.prototype.proto = 2;
    // @ts-ignore
    const obj = new (Ctor as unknown)();
    expect(isEmpty(obj)).toBe(false);
  });
});


