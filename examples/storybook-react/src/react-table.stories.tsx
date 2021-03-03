import { ReactComponentExtension } from '@remirror/extension-react-component';
import {
  TableCellMenu,
  TableDeleteRowColumnButton,
  TableExtension,
} from '@remirror/extension-react-tables';
import {
  EditorComponent,
  Remirror,
  ThemeProvider,
  useRemirror,
  useRemirrorContext,
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

export default { title: 'React Tables extension' };

const CommandMenu = () => {
  const { commands } = useRemirrorContext();
  const createTable = commands.createTable;

  return (
    <div>
      <p>commands:</p>
      <p
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyItems: 'flex-start',
          alignItems: 'flex-start',
        }}
      >
        <button
          data-testid='btn-3-3'
          onClick={() => createTable({ rowsCount: 3, columnsCount: 3, withHeaderRow: false })}
        >
          insert a 3*3 table
        </button>
        <button
          data-testid='btn-4-10'
          onClick={() => createTable({ rowsCount: 10, columnsCount: 4, withHeaderRow: false })}
        >
          insert a 4*10 table
        </button>
        <button
          data-testid='btn-3-30'
          onClick={() => createTable({ rowsCount: 30, columnsCount: 3, withHeaderRow: false })}
        >
          insert a 3*30 table
        </button>
        <button
          data-testid='btn-8-100'
          onClick={() => createTable({ rowsCount: 100, columnsCount: 8, withHeaderRow: false })}
        >
          insert a 8*100 table
        </button>
        <button onClick={() => commands.deleteTable()}>delete the table</button>
      </p>
    </div>
  );
};

export const Table = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state}>
          <EditorComponent />
          <CommandMenu />
          <TableDeleteRowColumnButton />
          <TableCellMenu />
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

Table.args = {
  autoLink: true,
  openLinkOnClick: true,
};

const extensions = () => [new ReactComponentExtension(), new TableExtension()];

const content = '';
