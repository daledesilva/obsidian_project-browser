import { TFile } from "obsidian";
import { getGlobals } from "./stores";
import { getStateSettings, orderSections } from "./section-processes";
import { getFileStateName } from "./frontmatter-processes";

// A fake folder object so the UI doesn't break
export class TagFolder {
  name: string;
  path: string;
  vault: any;
  constructor(name: string, path: string, vault: any) {
    this.name = name;
    this.path = path;
    this.vault = vault;
  }
}

export const getSortedSectionsByTag = (currentTagPath: string = "") => {
  const { plugin } = getGlobals();
  const files = plugin.app.vault.getMarkdownFiles();

  const itemsBySection: Record<string, any[]> = {};
  const subTags = new Set<string>();

  files.forEach((file: TFile) => {
    const cache = plugin.app.metadataCache.getFileCache(file);
    if (!cache) return;

    // Get tags from frontmatter and body
    const tags = getAllTags(cache);

    // Check if file matches current tag path
    const isInTag =
      currentTagPath === ""
        ? true
        : tags.some(
            (t) =>
              t === `#${currentTagPath}` || t.startsWith(`#${currentTagPath}/`),
          );

    if (!isInTag) return;

    // Find sub-tags (folders)
    tags.forEach((tag) => {
      const tagClean = tag.substring(1); // remove #
      if (tagClean.startsWith(currentTagPath) && tagClean !== currentTagPath) {
        const relative = currentTagPath
          ? tagClean.substring(currentTagPath.length + 1)
          : tagClean;
        subTags.add(relative.split("/")[0]);
      }
    });

    // Add file if it is in this exact tag
    if (tags.includes(`#${currentTagPath}`) || currentTagPath === "") {
      const state = getFileStateName(file) || " ";
      if (!itemsBySection[state]) itemsBySection[state] = [];
      itemsBySection[state].push(file);
    }
  });

  // Create virtual folders for sub-tags
  itemsBySection["folders"] = Array.from(subTags).map((tagName) => {
    const fullPath = currentTagPath ? `${currentTagPath}/${tagName}` : tagName;
    return new TagFolder(tagName, fullPath, plugin.app.vault);
  });

  // Build Sections (Reuse existing logic structure)
  let itemsBySectionArr = [];
  for (const [key, value] of Object.entries(itemsBySection)) {
    if (key === "folders") {
      itemsBySectionArr.push({
        title: key,
        type: "folders",
        items: value,
        settings: plugin.settings.folders,
      });
    } else if (key == " ") {
      itemsBySectionArr.push({
        title: key,
        type: "stateless",
        items: value,
        settings: plugin.settings.stateless,
      });
    } else {
      itemsBySectionArr.push({
        title: key,
        type: "state",
        items: value,
        settings: getStateSettings(key),
      });
    }
  }

  return orderSections(itemsBySectionArr);
};

function getAllTags(cache: any): string[] {
  let tags = new Set<string>();
  if (cache.frontmatter?.tags) {
    const tf = cache.frontmatter.tags;
    (Array.isArray(tf) ? tf : [tf]).forEach((t) => tags.add(`#${t}`));
  }
  if (cache.tags) cache.tags.forEach((t: any) => tags.add(t.tag));
  return Array.from(tags);
}
