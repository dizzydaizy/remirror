import { css, cx } from '@emotion/css';
import { h } from 'jsx-dom/min';
import { EditorView } from '@remirror/core';
import { TableRect } from '@remirror/pm/tables';

import { TableNodeAttrs } from '../table-extension';
import { setNodeAttrs } from '../utils/prosemirror';
import { controllerAutoHide } from '../utils/style';
import { addColumn, addRow } from '../utils/table-commands';

export interface InsertionButtonAttrs {
  // The center axis (in px) of the TableInsertionButton relative to the editor
  x: number;
  y: number;

  // The TableInsertionButtonTrigger's boundingClientRect
  triggerRect: DOMRect;

  // If `row` is not `-1`, this button will add a row at this index.
  row: number;
  // If `col` is not `-1`, this button will add a col at this index.
  col: number;
}

export interface TableInsertionButtonProps {
  view: EditorView;
  tableRect: TableRect;
  attrs: InsertionButtonAttrs;
}

export function shouldHideInsertionButton(attrs: InsertionButtonAttrs, e: MouseEvent): boolean {
  if (attrs.col !== -1) {
    return (
      e.clientX < attrs.triggerRect.left - 400 ||
      e.clientX > attrs.triggerRect.right + 400 ||
      e.clientY < attrs.triggerRect.top - 60 ||
      e.clientY > attrs.triggerRect.bottom
    );
  } else if (attrs.row !== -1) {
    return (
      e.clientX < attrs.triggerRect.left - 40 ||
      e.clientX > attrs.triggerRect.right ||
      e.clientY < attrs.triggerRect.top - 100 ||
      e.clientY > attrs.triggerRect.bottom + 100
    );
  }

  return true;
}

function InnerTableInsertionButton(attrs: InsertionButtonAttrs): HTMLElement {
  const size = 24;

  const className = css`
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    top: ${attrs.y - size / 2}px;
    left: ${attrs.x - size / 2}px;
    z-index: 105;
    border: 3px solid red;
  `;

  return h(
    'button',
    {
      className: cx(className, controllerAutoHide),
    },
    '+',
  );
}

function TableInsertionButton({ view, tableRect, attrs }: TableInsertionButtonProps): HTMLElement {
  const button = InnerTableInsertionButton(attrs);

  const insertRolOrColumn = () => {
    let tr = view.state.tr;

    if (attrs.col !== -1) {
      tr = addColumn(tr, tableRect, attrs.col);
    } else if (attrs.row !== -1) {
      tr = addRow(tr, tableRect, attrs.row);
    } else {
      return;
    }

    // Remove insertionButtonAttrs from tableNode so that the TableInsertionButton won't keep at the origin position.
    const attrsPatch: Partial<TableNodeAttrs> = { insertionButtonAttrs: null };
    tr = setNodeAttrs(tr, tableRect.tableStart - 1, attrsPatch);

    view.dispatch(tr);
  };

  button.addEventListener('click', () => {
    insertRolOrColumn();
  });

  return button;
}

export default TableInsertionButton;
