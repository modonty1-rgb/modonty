import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

interface LongParagraphHighlightOptions {
  maxLength: number;
  className: string;
}

const pluginKey = new PluginKey("longParagraphHighlight");

export const LongParagraphHighlight = Extension.create<LongParagraphHighlightOptions>({
  name: "longParagraphHighlight",

  addOptions() {
    return {
      maxLength: 500,
      className: "border-l-2 border-amber-500/60 bg-amber-500/5",
    };
  },

  addProseMirrorPlugins() {
    const { maxLength, className } = this.options;

    return [
      new Plugin({
        key: pluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, _old, _oldState, newState) {
            const { doc } = newState;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (node.type.name === "paragraph") {
                const text = node.textContent.trim();
                if (text.length > maxLength) {
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: className,
                    })
                  );
                }
              }
              return true;
            });

            return DecorationSet.create(doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return pluginKey.getState(state) as DecorationSet;
          },
        },
      }),
    ];
  },
});

