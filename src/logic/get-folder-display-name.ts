import { TFolder } from "obsidian";
import { stripSearchGraphFilenameSuffixes } from "./filename-suffixes";

//////////////////
//////////////////

/**
 * Display label for a folder/project. Strips plugin-managed `[HIDDEN]` / `[DRAFT]` markers
 * so search/graph hide suffixes stay out of cards, breadcrumbs, and chrome titles.
 */
export function getFolderDisplayName(folder: TFolder): string {
	return stripSearchGraphFilenameSuffixes(folder.name);
}
