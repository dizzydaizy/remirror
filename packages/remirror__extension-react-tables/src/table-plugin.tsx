import { CreateExtensionPlugin, EditorState, findParentNodeOfType } from '@remirror/core';
import { blockNodePositioner, Positioner } from '@remirror/extension-positioner';
import { PluginKey } from '@remirror/pm/state';
import { Decoration, DecorationSet } from '@remirror/pm/view';

import { ClassName } from './const';

export function newTableDecorationPlugin(): CreateExtensionPlugin {
  return {
    props: {
      decorations: (state: EditorState) => {
        const tableNodeResult = findParentNodeOfType({
          types: 'table',
          selection: state.selection,
        });

        if (tableNodeResult) {
          const decorations = [
            Decoration.node(tableNodeResult.pos, tableNodeResult.end, {
              class: ClassName.TABLE_SHOW_CONTROLLERS,
            }),
          ];
          return DecorationSet.create(state.doc, decorations);
        }

        return null;
      },
    },
  };
}

export const key = new PluginKey('tablePreviewDelete');

/**
 * Returns the block node position only when it is empty and the selection is
 * empty.
 */
export const tableBlockNodePositioner = blockNodePositioner.clone(({ getActive }) => ({
  getActive: (props) => {
    const [parentNodeResult] = getActive(props);

    if (parentNodeResult?.node.type.name.startsWith('table')) {
      // console.log('tableBlockNodePositioner:', parentNodeResult.node.type.name);
      return [parentNodeResult];
    }

    return Positioner.EMPTY;
  },
}));