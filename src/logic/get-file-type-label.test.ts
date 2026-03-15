import { describe, expect, test } from "@jest/globals";
import { getFileTypeLabel, hasFrontmatterSupport } from "./get-file-type-label";

describe("getFileTypeLabel", () => {
  test("returns null for markdown", () => {
    expect(getFileTypeLabel("md")).toBeNull();
  });

  test("returns null for pdf", () => {
    expect(getFileTypeLabel("pdf")).toBeNull();
  });

  test("returns null for svg, png, gif", () => {
    expect(getFileTypeLabel("svg")).toBeNull();
    expect(getFileTypeLabel("png")).toBeNull();
    expect(getFileTypeLabel("gif")).toBeNull();
  });

  test("returns null for mp3, wav", () => {
    expect(getFileTypeLabel("mp3")).toBeNull();
    expect(getFileTypeLabel("wav")).toBeNull();
  });

  test("returns CANVAS for canvas", () => {
    expect(getFileTypeLabel("canvas")).toBe("CANVAS");
  });

  test("returns BASE for base", () => {
    expect(getFileTypeLabel("base")).toBe("BASE");
  });

  test("handles empty or null extension", () => {
    expect(getFileTypeLabel("")).toBeNull();
  });
});

describe("hasFrontmatterSupport", () => {
  test("returns true for md", () => {
    expect(hasFrontmatterSupport("md")).toBe(true);
    expect(hasFrontmatterSupport("MD")).toBe(true);
  });

  test("returns false for canvas, base, pdf, images", () => {
    expect(hasFrontmatterSupport("canvas")).toBe(false);
    expect(hasFrontmatterSupport("base")).toBe(false);
    expect(hasFrontmatterSupport("pdf")).toBe(false);
    expect(hasFrontmatterSupport("png")).toBe(false);
  });

  test("returns false for empty or null", () => {
    expect(hasFrontmatterSupport("")).toBe(false);
  });
});
