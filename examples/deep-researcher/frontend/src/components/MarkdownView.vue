<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '../utils/markdown'
import 'highlight.js/styles/github.css'

const props = defineProps<{ content: string }>()

const rendered = computed(() => renderMarkdown(props.content))
</script>

<template>
  <div
    class="markdown-view prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-a:text-teal-900 prose-code:text-amber-700 prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl"
    v-html="rendered"
  ></div>
</template>

<style scoped>
.markdown-view {
  font-size: 1rem;
  line-height: 1.8;
}
</style>
