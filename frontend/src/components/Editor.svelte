<script>
	import { onMount } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState } from '@codemirror/state';
	import { javascript } from '@codemirror/lang-javascript';
	import { marked } from 'marked';
	import { setupLiveBlocks } from '$lib/liveblocks.js';
	import { yCollab } from 'y-codemirror.next';

	let parent;
	let markdown;

	onMount(() => {
		const { yText, yProvider, undoManager, leave } = setupLiveBlocks();

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
</script>

<div class="flex h-screen">
	<div class="w-1/2 p-4" bind:this={parent}></div>
	<div class="markdown w-1/2 p-4 overflow-y-auto" bind:this={markdown}></div>
</div>

<style>
	:global(.markdown) {
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	:global(.markdown h1) {
		@apply text-4xl font-bold mb-4;
	}

	:global(.markdown h2) {
		@apply text-3xl font-semibold mb-3;
	}

	:global(.markdown h3) {
		@apply text-2xl font-medium mb-2;
	}

	:global(.markdown p) {
		@apply mb-2;
	}

	:global(.markdown ul) {
		@apply list-disc ml-6 mb-2;
	}

	:global(.markdown ol) {
		@apply list-decimal ml-6 mb-2;
	}
</style>
