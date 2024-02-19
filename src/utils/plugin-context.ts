import ProjectCardsPlugin from "src/main";
import { createContext } from "react";

////////
////////

export const PluginContext = createContext<null | ProjectCardsPlugin>(null);