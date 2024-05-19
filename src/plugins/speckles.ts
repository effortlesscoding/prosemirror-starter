import {PluginKey,Plugin, EditorState} from "prosemirror-state";
import { EditorView } from "prosemirror-view";

class SelectionSizeTooltip {
    tooltip: HTMLDivElement;
    plugin: Plugin<number>;

    constructor(view: EditorView, plugin: Plugin<number>) {
      this.tooltip = document.createElement("div")
      this.tooltip.className = "tooltip"
      this.plugin = plugin;
      view.dom.parentNode?.appendChild(this.tooltip)
  
      this.update(view, null)
    }
  
    update(view: EditorView, lastState: EditorState | null) {
    //   console.log('debug::speckles::update::', view, lastState);
    //   let state = view.state
    //   // Don't do anything if the document/selection didn't change
    // //   if (lastState && lastState.doc.eq(state.doc) &&
    // //       lastState.selection.eq(state.selection)) {

    // //   }
  
    //   // Hide the tooltip if the selection is empty
    //   if (state.selection.empty) {
    //     this.tooltip.style.display = "none"
    //     return
    //   }
  
    //   // Otherwise, reposition it and update its content
    //   this.tooltip.style.display = ""
    //   let {from, to} = state.selection
    //   // These are in screen coordinates
    //   let start = view.coordsAtPos(from), end = view.coordsAtPos(to)
    //   // The box in which the tooltip is positioned, to use as base
    //   let box = this.tooltip.offsetParent?.getBoundingClientRect()
    //   if (!box) {
    //     return;
    //   }
    //   // Find a center-ish x position from the selection endpoints (when
    //   // crossing lines, end may be more to the left)
    //   let left = Math.max((start.left + end.left) / 2, start.left + 3)
    //   this.tooltip.style.left = (left - box.left) + "px"
    //   this.tooltip.style.bottom = (box.bottom - start.top) + "px"
    //   this.tooltip.textContent = (to - from).toString() + ' state : ' + this.plugin.getState(state);
    }
  
    destroy() { this.tooltip.remove() }
  }

export const createSpecklePlugin = (num: string) => {
    // Short cut for getting a handle of the plugin
    const specklePluginKey = new PluginKey('speckle');

    const specklePlugin: Plugin<number> = new Plugin<number>({
        key: specklePluginKey,
        state: {
            init(_, state) {
                const { doc }  = state;
                console.log('debug::speckles::init()::' + num, doc);
                return 0;
            },
            apply(tr, pluginState, oldState, newState) {
                console.log('debug::pluginState::', pluginState);
                const pluginMeta = tr.getMeta(specklePluginKey);
                console.log('debug::pluginMeta::', pluginMeta);
                switch (pluginMeta?.type) {
                    case 'increment':
                        return pluginState + pluginMeta.payload.by;
                    case 'decrement':
                        return pluginState - pluginMeta.payload.by;
                    default:
                        return pluginState;
                }
            }
        },
        view(editorView) { 
            console.log('debug::speckles::view::editorView', editorView.state.tr);
            return new SelectionSizeTooltip(editorView, specklePlugin)
        },
        props: {
            // decorations(state) {
            //     console.log('debug::specklePlugin.decorations.getState(state)::', specklePlugin.getState(state));
            //     return specklePlugin.getState(state);
            // }
        },
    });
    
    return {
        specklePluginKey,
        specklePlugin
    };
};