import React, { MouseEventHandler } from 'react';
import {
  findParentNodeOfType,
  FindProsemirrorNodeResult,
  isElementDomNode,
} from '@remirror/core-utils';
import {
  defaultAbsolutePosition,
  hasStateChanged,
  isPositionVisible,
  Positioner,
} from '@remirror/extension-positioner';
import { deleteColumn, deleteRow, isCellSelection, TableMap } from '@remirror/pm/tables';
import { PositionerPortal } from '@remirror/react';
import { usePositioner, UsePositionerReturn } from '@remirror/react-hooks';

import { useRemirrorContext } from '../../../remirror__react-hooks/node_modules/@remirror/react-core/src';
import { CellSelectionType, getCellSelectionType } from '../utils/controller';
import { mergeDOMRects } from '../utils/dom';

export interface TableControllerPositionerData {
  tableResult: FindProsemirrorNodeResult;
  cellSelectionType: CellSelectionType;
  anchorCellPos: number;
  headCellPos: number;
}

export function createTableControllerPositioner({
  margin,
}: {
  margin: number;
}): Positioner<TableControllerPositionerData> {
  return Positioner.create<TableControllerPositionerData>({
    hasChanged: hasStateChanged,

    getActive(props) {
      const { state } = props;
      const { selection } = state;

      if (isCellSelection(selection)) {
        const cellSelectionType = getCellSelectionType(selection);

        if (
          cellSelectionType === CellSelectionType.col ||
          cellSelectionType === CellSelectionType.row
        ) {
          const tableResult = findParentNodeOfType({ types: 'table', selection });

          if (tableResult) {
            const positionerData: TableControllerPositionerData = {
              tableResult,
              cellSelectionType,
              anchorCellPos: selection.$anchorCell.pos,
              headCellPos: selection.$headCell.pos,
            };
            return [positionerData];
          }
        }
      }

      return Positioner.EMPTY;
    },

    getPosition(props) {
      const { view, data } = props;

      const anchorCellDOM = view.nodeDOM(data.anchorCellPos);
      const headCellDOM = view.nodeDOM(data.headCellPos);

      if (
        !anchorCellDOM ||
        !headCellDOM ||
        !isElementDomNode(anchorCellDOM) ||
        !isElementDomNode(headCellDOM)
      ) {
        return defaultAbsolutePosition;
      }

      const map = TableMap.get(data.tableResult.node);

      // Don't show the delete button if there is only one row/column (excluded controllers).
      if (data.cellSelectionType === CellSelectionType.col && map.width <= 2) {
        return defaultAbsolutePosition;
      } else if (data.cellSelectionType === CellSelectionType.row && map.height <= 2) {
        return defaultAbsolutePosition;
      }

      const anchorCellRect = anchorCellDOM.getBoundingClientRect();
      const headCellRect = headCellDOM.getBoundingClientRect();
      const rect = mergeDOMRects(anchorCellRect, headCellRect);
      const editorRect = view.dom.getBoundingClientRect();

      // The width and height of the current selected block node.
      const height = rect.height;
      const width = rect.width;

      // The top and left relative to the parent `editorRect`.
      const left = view.dom.scrollLeft + rect.left - editorRect.left;
      const top = view.dom.scrollTop + rect.top - editorRect.top;
      const visible = isPositionVisible(rect, view.dom);

      return data.cellSelectionType === CellSelectionType.row
        ? { rect, visible, height: 0, width: 0, x: left - margin, y: top + height / 2 }
        : { rect, visible, height: 0, width: 0, x: left + width / 2, y: top - margin };
    },
  });
}

export const InnerDeleleButton: React.FC<{
  position: UsePositionerReturn;
  onClick: MouseEventHandler;
}> = ({ position, onClick }) => {
  const size = 24;
  return (
    <button
      ref={position.ref}
      style={{
        position: 'absolute',
        top: position.y - size / 2,
        left: position.x - size / 2,
        width: size,
        height: size,
        zIndex: 1300,
      }}
      onClick={onClick}
    >
      x
    </button>
  );
};

export const TableDeleteRowColumnButton: React.FC<{ margin?: number }> = ({ margin = 16 }) => {
  const ctx = useRemirrorContext();
  const view = ctx.view;
  const positioner = React.useMemo(() => createTableControllerPositioner({ margin }), [margin]);
  const position = usePositioner(positioner, []);

  const handleClick = () => {
    const selection = view.state.selection;

    if (isCellSelection(selection)) {
      const cellSelectionType = getCellSelectionType(selection);

      if (cellSelectionType === CellSelectionType.row) {
        deleteRow(view.state, view.dispatch);
      } else if (cellSelectionType === CellSelectionType.col) {
        deleteColumn(view.state, view.dispatch);
      }
    }
  };

  return (
    <PositionerPortal>
      <InnerDeleleButton position={position} onClick={handleClick} />
    </PositionerPortal>
  );
};
