import {
  ApplySchemaAttributes,
  CreateExtensionPlugin,
  Decoration,
  EditorView,
  NodeExtension,
  NodeSpecOverride,
  NodeViewMethod,
  ProsemirrorNode,
  ProsemirrorPlugin,
} from '@remirror/core';
import type { TableSchemaSpec } from '@remirror/extension-tables';
import {
  TableCellExtension as RemirrorTableCellExtension,
  TableExtension as RemirrorTableExtension,
  TableHeaderCellExtension as RemirrorTableHeaderCellExtension,
  TableRowExtension as RemirrorTableRowExtension,
} from '@remirror/extension-tables';
import { tableEditing } from '@remirror/pm/tables';

import { InsertionButtonAttrs } from './components/table-insertion-button';
import { columnResizing } from './table-column-resizing';
import { newTableDecorationPlugin } from './table-plugin';
import { TableControllerCellView } from './views/table-controller-cell-view';
import { TableView } from './views/table-view';

export type TableNodeAttrs<T extends Record<string, any> = Record<never, never>> = T & {
  isControllersInjected: boolean;
  previewSelectionTable: boolean;
  previewSelectionColumn: number;
  previewSelectionRow: number;

  // if and only if `insertionButtonAttrs` exists, InsertionButton will show.
  insertionButtonAttrs: InsertionButtonAttrs | null;
};

export class TableExtension extends RemirrorTableExtension {
  get name() {
    return 'table' as const;
  }

  createNodeViews(): NodeViewMethod {
    return (
      node: ProsemirrorNode,
      view: EditorView,
      getPos: boolean | (() => number),
      decorations: Decoration[],
    ) => {
      return new TableView(node, 10, decorations, view, getPos as () => number);
    };
  }

  createPlugin(): CreateExtensionPlugin {
    return newTableDecorationPlugin();
  }

  /**
   * Add the table plugins to the editor.
   */
  createExternalPlugins(): ProsemirrorPlugin[] {
    const plugins = [tableEditing()];

    if (this.options.resizable) {
      plugins.push(columnResizing({ firstResizableColumn: 1 }));
    }

    return plugins;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    const spec: TableSchemaSpec = {
      isolating: true,
      attrs: {
        ...extra.defaults(),
        isControllersInjected: { default: false },
        previewSelectionTable: { default: false },
        previewSelectionColumn: { default: -1 },
        previewSelectionRow: { default: -1 },
        insertionButtonAttrs: { default: null },
        deleteButtonAttrs: { default: null },
      },
      content: 'tableRow+',
      tableRole: 'table',
      parseDOM: [{ tag: 'table', getAttrs: extra.parse }],
      toDOM(node) {
        return ['table', ['tbody', extra.dom(node), 0]];
      },
      allowGapCursor: false,
    };
    return spec;
  }

  createExtensions() {
    return [];
  }

  onView(): void {
    // We have multiple node types which share a eom table_row in this
    // extentison. In order to make the function `tableNodeTypes` from
    // `prosemirror-extension-tables` return the correct node type, we
    // need to overwrite `schema.cached.tableNodeTypes`.
    const schema = this.store.schema;
    schema.cached.tableNodeTypes = {
      cell: schema.nodes.tableCell,
      row: schema.nodes.tableRow,
      table: schema.nodes.table,
      header_cell: schema.nodes.tableHeaderCell,
    };
  }
}

export class TableRowExtension extends RemirrorTableRowExtension {
  get name() {
    return 'tableRow' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): TableSchemaSpec {
    const spec = super.createNodeSpec(extra, override);
    spec.content = '(tableCell | tableHeaderCell | tableControllerCell)*';
    spec.toDOM = (node) => {
      return ['tr', extra.dom(node), 0];
    };
    spec.allowGapCursor = false;
    return spec;
  }

  createExtensions() {
    return [];
  }
}

export class TableHeaderCellExtension extends RemirrorTableHeaderCellExtension {
  get name() {
    return 'tableHeaderCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): TableSchemaSpec {
    const spec = super.createNodeSpec(extra, override);
    spec.attrs = {
      ...spec.attrs,
    };
    spec.allowGapCursor = false;

    return spec;
  }

  createExtensions() {
    return [];
  }
}

export class TableCellExtension extends RemirrorTableCellExtension {
  get name() {
    return 'tableCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): TableSchemaSpec {
    const spec = super.createNodeSpec(extra, override);
    spec.allowGapCursor = false;
    return spec;
  }
}

export interface TableControllerCellAttrs {
  colspan: number;
  rowspan: number;
  colwidth: null | number;
  background: null | string;
}

export class TableControllerCellExtension extends NodeExtension {
  get name() {
    return 'tableControllerCell' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): TableSchemaSpec {
    const cellAttrs = {
      ...extra.defaults(),

      colspan: { default: 1 },
      rowspan: { default: 1 },
      colwidth: { default: null },
      background: { default: null },
    };

    return {
      atom: true,
      isolating: true,
      content: 'block*',
      attrs: cellAttrs,
      tableRole: 'header_cell',
      toDOM() {
        return ['th', 0];
      },
      allowGapCursor: false,
    };
  }

  createNodeViews(): NodeViewMethod {
    return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number)) => {
      return new TableControllerCellView(node, view, getPos as () => number);
    };
  }

  createExtensions() {
    return [];
  }
}
