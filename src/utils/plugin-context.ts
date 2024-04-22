import ProjectBrowserPlugin from "src/main";
import { createContext } from "react";

////////
////////

export const PluginContext = createContext<null | ProjectBrowserPlugin>(null);