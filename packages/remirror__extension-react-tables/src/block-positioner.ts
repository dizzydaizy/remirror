import {
  findParentNodeOfType,
  FindProsemirrorNodeResult,
  isElementDomNode,
  Selection,
} from '@remirror/core';
import {
  defaultAbsolutePosition,
  hasStateChanged,
  isPositionVisible,
  Positioner,
} from '@remirror/extension-positioner';
import { CellSelection } from '@remirror/pm/tables';

const cellNodeTypes: string[] = ['tableCell', 'tableHeaderCell'];

function findTableCell(selection: Selection): FindProsemirrorNodeResult | undefined | null {
  if (selection instanceof CellSelection && selection.$anchorCell.pos !== selection.$headCell.pos) {
    return null;
  }

  return findParentNodeOfType({ selection: selection, types: cellNodeTypes });
}

/**
 * Creates a positioner for the current table cell node.
 *
 * It spans the full width and height of the table cell node.
 */
export const cellPositioner = Positioner.create<FindProsemirrorNodeResult>({
  hasChanged: hasStateChanged,

  /**
   * This is only active for empty top level nodes. The data is the cursor start
   * and end position.
   */
  getActive(props) {
    const { state } = props;

    if (!state.selection.empty) {
      return Positioner.EMPTY;
    }

    const cellResult = findTableCell(state.selection);
    return cellResult ? [cellResult] : Positioner.EMPTY;
  },

  getPosition(props) {
    const { view, data } = props;
    const element = view.nodeDOM(data.pos);

    if (!isElementDomNode(element)) {
      // This should never happen.
      return defaultAbsolutePosition;
    }

    const rect = element.getBoundingClientRect();

    return {
      rect,
      visible: isPositionVisible(rect, element),
      x: rect.left,
      y: rect.top,
      height: rect.height,
      width: rect.width,
    };
  },
});
