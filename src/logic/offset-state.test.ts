import { describe, expect, test, jest } from "@jest/globals";

// Mock obsidian types
jest.mock("obsidian", () => {
  class TFile {
    basename = "file";
    extension = "md";
  }
  return { TFile };
}, { virtual: true });

describe("offsetState", () => {
  test("moves to next state with clamp when cycle=false", async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock("./frontmatter-processes", () => ({
        getFileStateSettingsAsync: async () => ({ name: "Todo" }),
      }));
      jest.doMock("./project-page-states", () => ({
        getStateSettingsForFile: async () => ({
          visible: [ { name: "Todo" }, { name: "Doing" } ],
          hidden: [ { name: "Done" } ],
        }),
      }));
      const { offsetState } = require("./offset-state");
      const file = {} as unknown;
      const next = await offsetState(file, 1, false);
      expect(next.name).toBe("Doing");
      const clamp = await offsetState(file, 10, false);
      expect(clamp.name).toBe("Done");
    });
  });

  test("wraps around when cycle=true", async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock("./frontmatter-processes", () => ({
        getFileStateSettingsAsync: async () => ({ name: "Done" }),
      }));
      jest.doMock("./project-page-states", () => ({
        getStateSettingsForFile: async () => ({
          visible: [ { name: "Todo" }, { name: "Doing" } ],
          hidden: [ { name: "Done" } ],
        }),
      }));
      const { offsetState } = require("./offset-state");
      const file = {} as unknown;
      const wrapped = await offsetState(file, 1, true);
      expect(wrapped.name).toBe("Todo");
      const wrappedNeg = await offsetState(file, -1, true);
      expect(wrappedNeg.name).toBe("Doing");
    });
  });

  test("no current state selects first or last depending on offset sign", async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock("./frontmatter-processes", () => ({
        getFileStateSettingsAsync: async () => null,
      }));
      jest.doMock("./project-page-states", () => ({
        getStateSettingsForFile: async () => ({
          visible: [ { name: "A" }, { name: "B" } ],
          hidden: [ { name: "C" } ],
        }),
      }));
      const { offsetState } = require("./offset-state");
      const file = {} as unknown;
      expect((await offsetState(file, 1, false)).name).toBe("A");
      expect((await offsetState(file, -1, false)).name).toBe("C");
    });
  });

  test("uses project page states when the file is inside a project", async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock("./frontmatter-processes", () => ({
        getFileStateSettingsAsync: async () => ({ name: "First Draft" }),
      }));
      jest.doMock("./project-page-states", () => ({
        getStateSettingsForFile: async () => ({
          visible: [ { name: "First Draft" }, { name: "Work in Progress" } ],
          hidden: [ { name: "Abandoned" } ],
        }),
      }));
      const { offsetState } = require("./offset-state");
      const file = {} as unknown;
      const next = await offsetState(file, 1, false);
      expect(next.name).toBe("Work in Progress");
    });
  });
});


