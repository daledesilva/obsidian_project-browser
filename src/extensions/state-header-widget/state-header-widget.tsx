import { Extension, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, WidgetType } from "@codemirror/view";
import * as React from "react";
import * as ReactDom from "react-dom";
import { createRoot } from "react-dom/client";
import ProjectCardsPlugin from 'src/main';
import { PluginContext } from "src/utils/plugin-context";


class StateHeaderWidget extends WidgetType {
	toDOM(view: EditorView): HTMLElement {
		const rootEl = document.createElement('div');
		const root = createRoot(rootEl);
		root.render(<div>
			{/* <PluginContext.Provider value={this.plugin}> */}
				This is the header widget
			{/* </PluginContext.Provider> */}
		</div>);
		return rootEl;
	}
}
const widget = Decoration.widget({widget: new StateHeaderWidget()});


// Define a StateField to monitor the state of all underline decorations in the set
const widgetStateField = StateField.define<DecorationSet>({

	// Starts with an empty DecorationSet
	create(): DecorationSet {
		let set = Decoration.none;
		set = set.update({
			add: [widget.range(0)]	// Just place it on the 1st row
		})
		return set;
	},
	
	update(oldState, transaction): DecorationSet {
		// No updates needed
		return oldState;
	},

	// Tell the editor to use the decorations from this StateField
	provide(thisStateField): Extension {
		return EditorView.decorations.from(thisStateField);
	}
})



export function registerStateHeaderWidget(plugin: ProjectCardsPlugin) {
	plugin.registerEditorExtension([
		widgetStateField
	]);
}


