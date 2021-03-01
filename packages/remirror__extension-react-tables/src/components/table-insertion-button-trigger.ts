import { CSSProperties, h } from 'jsx-dom/min';
import { EditorView } from '@remirror/pm';

import { borderWidth, ControllerType } from '../const';
import { getRelativeCoord } from '../utils/dom';
import { setNodeAttrs } from '../utils/prosemirror';
import { CellAxis, FindTable } from '../utils/types';
import { InsertionButtonAttrs } from './table-insertion-button';

type TriggerAreaType = 'add_column_left' | 'add_column_right' | 'add_row_up' | 'add_row_buttom'; // TODO: use enum

function buildInsertionButtonAttrs(
  type: TriggerAreaType,
  triggerRect: DOMRect,
  editorDom: Element,
  cellAxis: CellAxis,
): InsertionButtonAttrs {
  const { row, col } = cellAxis;
  const relativeCoord = getRelativeCoord(triggerRect, editorDom);

  switch (type) {
    case 'add_column_left':
      return {
        triggerRect,
        x: relativeCoord.x - borderWidth,
        y: relativeCoord.y + 12,
        row: -1,
        col: col,
      };
    case 'add_column_right':
      return {
        triggerRect,
        x: relativeCoord.x + triggerRect.width,
        y: relativeCoord.y + 12,
        row: -1,
        col: col + 1,
      };
    case 'add_row_up':
      return {
        triggerRect,
        x: relativeCoord.x + 12,
        y: relativeCoord.y - borderWidth,
        row: row,
        col: -1,
      };
    default:
      return {
        triggerRect,
        x: relativeCoord.x + 12,
        y: relativeCoord.y + triggerRect.height,
        row: row + 1,
        col: -1,
      };
  }
}

function showButton(
  trigger: HTMLElement,
  findTable: FindTable,
  type: TriggerAreaType,
  getAxis: () => CellAxis,
  view: EditorView,
): void {
  const triggerRect = trigger?.getBoundingClientRect();

  if (!triggerRect || !(triggerRect.width || triggerRect.height)) {
    return;
  }

  const tableResult = findTable();

  if (!tableResult) {
    return;
  }

  const insertionButtonAttrs = buildInsertionButtonAttrs(type, triggerRect, view.dom, getAxis());
  view.dispatch(setNodeAttrs(view.state.tr, tableResult.pos, { insertionButtonAttrs }));
}

const TriggerArea = ({
  type,
  view,
  findTable,
  getAxis,
}: {
  type: TriggerAreaType;
  view: EditorView;
  findTable: FindTable;
  getAxis: () => CellAxis;
}) => {
  const style: CSSProperties = {
    flex: 1,
    position: 'relative',
    zIndex: 12,

    // Style for debug. Use linear-gradient as background so that we can differentiate two neighbor areas.
    // background: 'linear-gradient(to left top, rgba(0, 255, 100, 0.3), rgba(200, 100, 255, 0.3))',
  };

  if (type === 'add_column_left' || type === 'add_column_right') {
    style.height = '36px';
  } else if (type === 'add_row_up' || type === 'add_row_buttom') {
    style.width = '36px';
  }

  const trigger = h('div', {
    style,
    onMouseEnter: () => {
      showButton(trigger, findTable, type, getAxis, view);
    },
  });

  return trigger;
};

const TableInsertionButtonTrigger = ({
  controllerType,
  view,
  findTable,
  getAxis,
}: {
  controllerType: ControllerType;
  view: EditorView;
  findTable: FindTable;
  getAxis: () => CellAxis;
}): HTMLElement[] => {
  if (controllerType === ControllerType.COLUMN_CONTROLLER) {
    return [
      TriggerArea({ type: 'add_column_left', view, findTable, getAxis }),
      TriggerArea({ type: 'add_column_right', view, findTable, getAxis }),
    ];
  } else if (controllerType === ControllerType.ROW_CONTROLLER) {
    return [
      TriggerArea({ type: 'add_row_up', view, findTable, getAxis }),
      TriggerArea({ type: 'add_row_buttom', view, findTable, getAxis }),
    ];
  }

  return [];
};

export default TableInsertionButtonTrigger;
