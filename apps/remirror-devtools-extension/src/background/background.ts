import { PortController } from '@devtools-ds/port-controller';
import { browser, Runtime } from 'webextension-polyfill-ts';

import { BACKGROUND_SOURCE, PANEL_SOURCE, PORT_NAME, RUNTIME_SOURCE } from '../constants';
import { createLogger } from '../logger';
import { DisconnectMessage, Message } from '../types';

const controller = new PortController<Message>();
const logger = createLogger(BACKGROUND_SOURCE);
browser.runtime.onConnect.addListener((port) => {
  if (port.name === PORT_NAME) {
    // Connection from DevTools Panel
    const panelListener = function (message: Message) {
      if (message.type === 'connect' && message.tabId) {
        controller.connect(message.tabId, port);
      }

      // Pass message to content script
      controller.toContent(message.tabId, message);
    };

    // Attach listener to the Panel
    port.onMessage.addListener(panelListener);

    // Handle Panel disconnect
    port.onDisconnect.addListener((p) => {
      const message: DisconnectMessage = {
        type: 'disconnect',
        source: PANEL_SOURCE,
        tabId: 0,
      };
      controller.disconnect(p, message);
    });
  }
});

// Attach listener to content
browser.runtime.onMessage.addListener((message: Message, sender: Runtime.MessageSender) => {
  // Messages from content scripts should have sender.tab set
  if (sender.tab && message.source === RUNTIME_SOURCE) {
    const tabId = sender.tab.id;

    if (tabId) {
      controller.toPanel(tabId, message);
    }
  } else {
    logger.log('Could not pass message, sender.tab not defined.', message);
  }
});
