<script>
	import { onMount, onDestroy } from 'svelte';
	import { javascript } from '@codemirror/lang-javascript';
	import { marked } from 'marked';

	import { createClient } from '@liveblocks/client';
	import { LiveblocksYjsProvider } from '@liveblocks/yjs';
	import * as Y from 'yjs';
	import { yCollab } from 'y-codemirror.next';
	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState } from '@codemirror/state';

	let parent;
	let markdown;

	// Set up Liveblocks client
	const client = createClient({
		publicApiKey: 'pk_dev_bn8NpGvcK-JOGCA2v8PC-VYEcysRWkmw0XixX241MJwv-oIGOuo3bxw7OnEEP5dZ'
	});

	onMount(() => {
		// Enter a multiplayer room
		const { room, leave } = client.enterRoom('my-room');

		// Set up Yjs document, shared text, undo manager, and Liveblocks Yjs provider
		const yDoc = new Y.Doc();
		const yText = yDoc.getText('codemirror');
		const undoManager = new Y.UndoManager(yText);
		const yProvider = new LiveblocksYjsProvider(room, yDoc);

		// Set up CodeMirror and extensions
		const state = EditorState.create({
			doc: yText.toString(),
			extensions: [
				basicSetup,
				javascript(),
				yCollab(yText, yProvider.awareness, { undoManager }),
				EditorView.lineWrapping
			]
		});

		// Attach CodeMirror to element
		const view = new EditorView({
			state,
			parent
		});

		// Update content when Yjs document changes
		yText.observe(() => {
			markdown.innerHTML = marked(yText.toString());
		});

		return () => {
			view.destroy();
			leave();
		};
	});

	// TODO: fix this
	function handleTabKey(event) {
		if (event.key === 'Tab') {
			event.preventDefault();
			const textarea = event.target;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;

			// Set textarea value to: text before caret + tab + text after caret
			textarea.value = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);

			// Put caret at right position again
			textarea.selectionStart = textarea.selectionEnd = start + 1;

			// Update the content store
			content.set(textarea.value);
		}
	}
</script>

<div class="flex h-screen">
	<div class="w-1/2 p-4" bind:this={parent} on:keydown={handleTabKey}></div>
	<div class="markdown w-1/2 p-4 overflow-y-auto" bind:this={markdown}></div>
</div>

<style>
	:global(.markdown) {
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	:global(.markdown h1) {
		@apply text-4xl font-bold;
	}

	:global(.markdown h2) {
		@apply text-3xl font-semibold;
	}

	:global(.markdown h3) {
		@apply text-2xl font-medium;
	}

	:global(.markdown ul) {
		@apply list-disc ml-6;
	}

	:global(.markdown ol) {
		@apply list-decimal ml-6;
	}
</style>
