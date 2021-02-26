import React from 'react';
import ReactDom from 'react-dom';
import { browser, Runtime } from 'webextension-polyfill-ts';

import { POPUP_SOURCE, PORT_NAME } from '../constants';
import { Message } from '../types';
import styles from './popup.css';

let BackgroundPort: Runtime.Port;
let TabID: number | undefined;
// Set up message connections
const query = { active: true, currentWindow: true };
browser.tabs.query(query).then((tabs: any) => {
  TabID = tabs[0].id;
  BackgroundPort = browser.runtime.connect(undefined, { name: PORT_NAME });

  if (TabID) {
    const connectMessage: Message = {
      type: 'connect',
      tabId: TabID,
      source: POPUP_SOURCE,
    };
    BackgroundPort.postMessage(connectMessage);
  }
});

/** Our React Popup Application */
export const App = () => {
  const [value, setValue] = React.useState('Hello, Popup');

  const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
  };

  const buttonClick = () => {
    if (TabID) {
      const message: Message = {
        type: 'alert',
        tabId: TabID,
        source: POPUP_SOURCE,
        value,
      };
      BackgroundPort.postMessage(message);
    }
  };
  return (
    <div className={styles.content}>
      <a href='https://github.com/intuit/devtools-ds'>
        <img
          alt='devtools ds logo'
          width='150'
          src='https://raw.githubusercontent.com/intuit/devtools-ds/master/.storybook/devtools-ds-logo-dark.svg?token=ABL6QJPRBIWO43PERO3HAS3ADSFOO'
        />
      </a>

      <p>This is the &quot;popup&quot; page.</p>
      <p>You can send messages to the current tab below.</p>
      <div>
        <input aria-label='Message to send' type='text' value={value} onChange={inputChange} />
        <button type='button' onClick={buttonClick}>
          Send
        </button>
      </div>
    </div>
  );
};

const ele = document.createElement('div');
document.body.append(ele);

ReactDom.render(<App />, ele);
