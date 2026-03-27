import { describe, expect, test, beforeEach, jest } from "@jest/globals";
import { getProjectPageStateByName, getStateByName } from "./get-state-by-name";
import { getPriorityByName } from "./get-priority-by-name";

jest.mock("./stores", () => ({
  getGlobals: () => ({
    plugin: {
      settings: {
        states: {
          visible: [
            { name: "Todo" },
            { name: "In Progress" },
          ],
          hidden: [
            { name: "Done" },
          ],
        },
        projectPageStates: {
          visible: [
            { name: "First Draft" },
            { name: "Work in Progress" },
          ],
          hidden: [
            { name: "Abandoned" },
          ],
        },
        priorities: [
          { name: "High" },
          { name: "Low" },
        ],
      },
    },
  }),
}));

describe("getStateByName", () => {
  test("finds state in visible states", () => {
    const state = getStateByName("Todo");
    expect(state).toEqual({ name: "Todo" });
  });

  test("finds state in hidden states", () => {
    const state = getStateByName("Done");
    expect(state).toEqual({ name: "Done" });
  });

  test("sanitizes internal link style names", () => {
    const state = getStateByName("[[In Progress]]");
    expect(state).toEqual({ name: "In Progress" });
  });

  test("returns null if not found", () => {
    const state = getStateByName("Missing");
    expect(state).toBeNull();
  });
});

describe("getProjectPageStateByName", () => {
  test("finds project page state in visible states", () => {
    const state = getProjectPageStateByName("First Draft");
    expect(state).toEqual({ name: "First Draft" });
  });

  test("finds project page state in hidden states", () => {
    const state = getProjectPageStateByName("Abandoned");
    expect(state).toEqual({ name: "Abandoned" });
  });
});

describe("getPriorityByName", () => {
  test("finds priority by exact name", () => {
    const priority = getPriorityByName("High");
    expect(priority).toEqual({ name: "High" });
  });

  test("sanitizes link brackets before matching", () => {
    const priority = getPriorityByName("[[Low]]");
    expect(priority).toEqual({ name: "Low" });
  });

  test("returns null if not found", () => {
    const priority = getPriorityByName("Medium");
    expect(priority).toBeNull();
  });
});


