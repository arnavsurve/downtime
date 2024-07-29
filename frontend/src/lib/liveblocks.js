import { PUBLIC_LIVEBLOCKS_SECRET_KEY } from '$env/static/public';
import { createClient } from '@liveblocks/client';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import * as Y from 'yjs';


// Set up Liveblocks client
const client = createClient({
  publicApiKey: PUBLIC_LIVEBLOCKS_SECRET_KEY
});

export function setupLiveBlocks() {
  // Enter a multiplayer room
  const { room, leave } = client.enterRoom('my-room');

  // Set up Yjs document, shared text, undo manager, and Liveblocks Yjs provider
  const yDoc = new Y.Doc();
  const yText = yDoc.getText('codemirror');
  const undoManager = new Y.UndoManager(yText);
  const yProvider = new LiveblocksYjsProvider(room, yDoc);

  return { yText, yProvider, undoManager, leave };
}
