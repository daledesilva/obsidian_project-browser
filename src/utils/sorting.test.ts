import { describe, expect, test, jest } from "@jest/globals";
import { TFile, TFolder } from "obsidian";
import {
  compareItemNamesNaturally,
  sortItemsByName,
  sortItemsByNaturalName,
  sortItemsByCreationDate,
  sortItemsByModifiedDate,
  sortItemsByPriority,
  sortItemsByPriorityThenName,
  sortItemsByPriorityThenNaturalName,
  sortItemsByPriorityThenCreationDate,
  sortItemsByPriorityThenModifiedDate,
  sortItems,
} from "./sorting";
import { DEFAULT_PROJECT_PAGE_STATELESS_SETTINGS, StateViewOrder } from "src/types/types-map";

jest.mock("src/logic/frontmatter-processes", () => ({
  getFilePrioritySettings: (file: TFile) => (file as any).__priority || null,
}));

function makeFile(name: string, ctime: number, mtime: number, priority?: "High" | "Low") {
  const f = new TFile() as any;
  f.name = name;
  f.basename = name.replace(/\.[^.]+$/, "");
  f.extension = name.split(".").pop();
  f.stat = { ctime, mtime };
  f.__priority = priority ? { name: priority } : null;
  return f as TFile;
}

function makeFolder(name: string) {
  const folder = new TFolder() as TFolder & { name: string };
  folder.name = name;
  return folder;
}

function makeProjectFolder(name: string, priority?: "High" | "Low") {
  const folder = new TFolder() as TFolder & { name: string; priority?: string };
  folder.name = name;
  folder.priority = priority;
  return folder;
}

describe("sorting utils", () => {
  const fA = makeFile("a.md", 1, 10, "High");
  const fB = makeFile("b.md", 3, 30, "Low");
  const fC = makeFile("c.md", 2, 20);
  const folder = makeFolder("folder");

  test("compareItemNamesNaturally orders numeric suffixes naturally", () => {
    const names = ["Page 18.md", "Page 2.md", "Page 20.md", "Page 19.md", "Page 10.md"];
    const sortedNames = [...names].sort((a, b) => compareItemNamesNaturally({ name: a }, { name: b }));

    expect(sortedNames).toEqual(["Page 2.md", "Page 10.md", "Page 18.md", "Page 19.md", "Page 20.md"]);
  });

  test("compareItemNamesNaturally still sorts non-numeric names alphabetically", () => {
    const names = ["Gamma.md", "alpha.md", "Beta.md"];
    const sortedNames = [...names].sort((a, b) => compareItemNamesNaturally({ name: a }, { name: b }));

    expect(sortedNames).toEqual(["alpha.md", "Beta.md", "Gamma.md"]);
  });

  test("sortItemsByName ascending/descending", () => {
    const asc = sortItemsByName([fB, fC, fA], "ascending").map((i) => i.name);
    const desc = sortItemsByName([fB, fC, fA], "descending").map((i) => i.name);
    expect(asc).toEqual(["a.md", "b.md", "c.md"]);
    expect(desc).toEqual(["c.md", "b.md", "a.md"]);
  });

  test("sortItemsByNaturalName ascending/descending", () => {
    const numberedFiles = [
      makeFile("Page 18.md", 1, 10),
      makeFile("Page 2.md", 2, 20),
      makeFile("Page 20.md", 3, 30),
      makeFile("Page 10.md", 4, 40),
    ];

    const asc = sortItemsByNaturalName(numberedFiles, "ascending").map((i) => i.name);
    const desc = sortItemsByNaturalName(numberedFiles, "descending").map((i) => i.name);

    expect(asc).toEqual(["Page 2.md", "Page 10.md", "Page 18.md", "Page 20.md"]);
    expect(desc).toEqual(["Page 20.md", "Page 18.md", "Page 10.md", "Page 2.md"]);
  });

  test("sortItemsByCreationDate respects only files, leaves folders equal", () => {
    const out = sortItemsByCreationDate([folder, fB, fA], "ascending");
    expect(out[0]).toBe(folder);
  });

  test("sortItemsByModifiedDate ascending/descending", () => {
    const asc = sortItemsByModifiedDate([fB, fC, fA], "ascending").map((i) => (i as TFile).stat.mtime);
    const desc = sortItemsByModifiedDate([fB, fC, fA], "descending").map((i) => (i as TFile).stat.mtime);
    expect(asc).toEqual([10, 20, 30]);
    expect(desc).toEqual([30, 20, 10]);
  });

  test("sortItemsByPriority puts High before Low and leaves folders", () => {
    const out = sortItemsByPriority([folder, fB, fA, fC]).map((i) => (i as any).name || "folder");
    // High a.md should come before Low b.md; folder unchanged relative where equal-comparisons occur
    expect(out).toContain("a.md");
    expect(out.indexOf("a.md")).toBeLessThan(out.indexOf("b.md"));
  });

  test("sortItemsByPriority sorts project folders by stored folder priority", () => {
    const highProject = makeProjectFolder("High Project", "High");
    const lowProject = makeProjectFolder("Low Project", "Low");

    const out = sortItemsByPriority([lowProject, highProject]).map((item) => item.name);

    expect(out).toEqual(["High Project", "Low Project"]);
  });

  test("sortItemsByPriorityThenName", () => {
    const out = sortItemsByPriorityThenName([fB, fA, fC], "ascending");
    const names = out.map((i) => (i as any).name);
    // Within same priority, name ascending; High before Low; nulls after defined priorities
    expect(names.indexOf("a.md")).toBeLessThan(names.indexOf("b.md"));
  });

  test("sortItemsByPriorityThenNaturalName", () => {
    const numberedHigh = makeFile("Page 10.md", 1, 10, "High");
    const numberedLow = makeFile("Page 2.md", 2, 20, "Low");
    const numberedNone = makeFile("Page 18.md", 3, 30);

    const out = sortItemsByPriorityThenNaturalName([numberedNone, numberedHigh, numberedLow], "ascending");
    const names = out.map((i) => (i as any).name);

    expect(names).toEqual(["Page 10.md", "Page 18.md", "Page 2.md"]);
  });

  test("sortItems uses natural ordering for Alias or Filename sections", () => {
    const numberedFiles = [
      makeFile("Page 18.md", 1, 10),
      makeFile("Page 2.md", 2, 20),
      makeFile("Page 20.md", 3, 30),
      makeFile("Page 10.md", 4, 40),
    ];
    const statelessSettings = {
      ...DEFAULT_PROJECT_PAGE_STATELESS_SETTINGS,
      defaultViewOrder: StateViewOrder.AliasOrFilename,
      defaultViewPriorityGrouping: false,
    };

    const out = sortItems(numberedFiles, statelessSettings).map((i) => i.name);

    expect(out).toEqual(["Page 2.md", "Page 10.md", "Page 18.md", "Page 20.md"]);
  });

  test("sortItemsByPriorityThenCreationDate", () => {
    const out = sortItemsByPriorityThenCreationDate([fB, fA, fC], "ascending");
    const names = out.map((i) => (i as any).name);
    expect(names.indexOf("a.md")).toBeLessThan(names.indexOf("b.md"));
  });

  test("sortItemsByPriorityThenModifiedDate", () => {
    const out = sortItemsByPriorityThenModifiedDate([fB, fA, fC], "descending");
    const names = out.map((i) => (i as any).name);
    expect(names.indexOf("a.md")).toBeLessThan(names.indexOf("b.md"));
  });
});


