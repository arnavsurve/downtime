import { createClient } from '@liveblocks/client';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import { useRoom, useSelf } from "@liveblocks/react/suspense"
import * as Y from 'yjs';

function getRoomFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('room') || 'default-room';
}

// Set up Liveblocks client
const client = createClient({
  authEndpoint: "/api/liveblocks-auth"
});

const room = useRoom()

async function fetchToken(userID) {
  const response = await fetch("/api/liveblocks-auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "user-id": client.userID
    }
  });

  const data = await response.json();
  return data.token;
}

export async function setupLiveBlocks() {
  const token = await fetchToken(userID);

  const client = createClient({
    publicApiKey: token,
  });

  // Enter a multiplayer room
  const { room, leave } = client.enterRoom(roomName, {
    userInfo: {
      id: userID,
      organization: "org-id",
      group: "group-id",
      info: {
        name: "username",
        email: "johndoe@gmail.com"
      }
    }
  });

  // Set up Yjs document, shared text, undo manager, and Liveblocks Yjs provider
  const yDoc = new Y.Doc();
  const yText = yDoc.getText('codemirror');
  const undoManager = new Y.UndoManager(yText);
  const yProvider = new LiveblocksYjsProvider(room, yDoc);

  // listen for changes in the Yjs document
  yText.observe(event => {
    console.log('Yjs event:', event);
  });

  // Handle user leaving the room
  room.on('leave', () => {
    console.log('User left the room');
  });

  // Update presence state
  room.updatePresence({ cursor: { x: 0, y: 0 } });

  // Listen for presence updates
  room.subscribe('presence', (presence, userId) => {
    console.log(`User ${userId} presence updated:`, presence);
  });

  // Example function to update cursor position
  function updateCursorPosition(x, y) {
    room.updatePresence({ cursor: { x, y } });
  }

  return { yText, yProvider, undoManager, leave, updateCursorPosition };
}
