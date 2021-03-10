import { css, cx } from '@emotion/css';
import { h } from 'jsx-dom';
import { EditorView, Transaction } from '@remirror/core';
import { TableRect } from '@remirror/pm/tables';

import { addFill } from '../../../remirror__core/node_modules/@remirror/icons/src/all-icons';
import { addColumn, addRow } from '../react-table-commands';
import { controllerAutoHide } from '../utils/style';

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

let addFillIconCache: SVGSVGElement | null = null;

// TODO: this part is so ugly.
function AddFillIcon(): SVGSVGElement {
  if (addFillIconCache) {
    return addFillIconCache;
  }

  const xmlns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(xmlns, 'svg');
  svg.setAttribute('xmlns', xmlns);
  svg.setAttribute('viewBox', '0 0 24 24');
  const g = document.createElementNS(xmlns, 'g');

  for (const tree of addFill) {
    const path = document.createElementNS(xmlns, tree.tag);

    for (const [key, value] of Object.entries(tree.attr)) {
      path.setAttribute(key, value);
    }

    g.append(path);
  }

  svg.append(g);
  addFillIconCache = svg;
  return svg;
}

function InnerTableInsertionButton(attrs: InsertionButtonAttrs): HTMLElement {
  const size = 24;

  const className = css`
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    top: ${attrs.y - size / 2 - 4}px;
    left: ${attrs.x - size / 2}px;
    z-index: 1300;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 150ms ease;

    background-color: #dcdcdc;
    & svg {
      fill: #545454;
    }

    &:hover {
      background-color: #136bda;
      & svg {
        fill: #ffffff;
      }
    }
  `;

  return h(
    'div',
    {
      className: cx(className, controllerAutoHide),
    },
    AddFillIcon(),
  );
}

export interface TableInsertionButtonProps {
  view: EditorView;
  tableRect: TableRect;
  attrs: InsertionButtonAttrs;
  removeInsertionButton: (tr: Transaction) => Transaction;
}

function TableInsertionButton({
  view,
  tableRect,
  attrs,
  removeInsertionButton,
}: TableInsertionButtonProps): HTMLElement {
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

    view.dispatch(removeInsertionButton(tr));
  };

  button.addEventListener('click', () => {
    insertRolOrColumn();
  });

  return button;
}

export default TableInsertionButton;
