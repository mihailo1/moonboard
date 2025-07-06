<template>
  <div
    id="search-bar-zfix"
    class="search-bar-root"
    @keydown.stop
  >
    <div :class="[
      'flex items-center rounded-2xl px-3 py-1.5 gap-2 shadow-lg',
      isDark ? 'bg-gray-800/70 border border-gray-700' : 'bg-white/70 border border-neutral-200'
    ]">
      <span :class="isDark ? 'text-gray-300' : 'text-neutral-400'">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle :stroke="iconColor" stroke-width="2" cx="11" cy="11" r="7"/><path :stroke="iconColor" stroke-width="2" d="M20 20l-3.5-3.5"/></svg>
      </span>
      <div class="relative flex-1">
        <input
          ref="inputRef"
          v-model="query"
          :placeholder="'Search gyms...'"
          :class="[
            'w-full bg-transparent outline-none text-base py-1 pr-7',
            isDark ? 'text-white placeholder:text-gray-400' : 'text-neutral-900 placeholder:text-neutral-400'
          ]"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @input="onInput"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="select(activeIndex)"
          @keydown.esc="clear"
          autocomplete="off"
        />
        <button v-if="query" class="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded transition cursor-pointer"
          :class="isDark ? 'hover:bg-gray-700' : 'hover:bg-neutral-100/70'"
          @mousedown.prevent="clear">
          <svg width="16" height="16" viewBox="0 0 20 20"><line x1="5" y1="5" x2="15" y2="15" :stroke="iconColor" stroke-width="2"/><line x1="15" y1="5" x2="5" y2="15" :stroke="iconColor" stroke-width="2"/></svg>
        </button>
      </div>
    </div>
    <ul v-if="isFocused && suggestions.length" :class="[
      'absolute left-0 right-0 mt-1 rounded-2xl shadow-xl max-h-56 overflow-y-auto border border-t-0 z-50',
      isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-neutral-200'
    ]">
      <li
        v-for="(s, i) in suggestions"
        :key="s.title + '-' + s.coords[0] + '-' + s.coords[1]"
        :class="[
          'px-5 py-2 cursor-pointer transition',
          isDark
            ? [i === activeIndex ? 'bg-gray-700 text-blue-400' : 'text-white hover:bg-gray-700']
            : [i === activeIndex ? 'bg-neutral-100 text-blue-600' : 'text-neutral-900 hover:bg-neutral-50']
        ]"
        @mousedown.prevent="select(i)"
      >
        {{ s.title }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useTheme } from '~/lib/composables/useTheme';
import { markers as allMarkers } from '~/lib/markers';
import '~/assets/leaflet-zfix.css';
import type { Marker } from '~/types';

const emit = defineEmits(['select']);
const { isDark } = useTheme();
const query = ref('');
const isFocused = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const activeIndex = ref(-1);

const iconColor = computed(() => isDark.value ? '#fff' : '#222');

const suggestions = computed(() => {
  if (!query.value) return [];
  const q = query.value.toLowerCase();
  return allMarkers.filter((m: Marker) => m.title.toLowerCase().includes(q)).slice(0, 8);
});

const onInput = () => {
  activeIndex.value = 0;
};
const move = (dir: number) => {
  if (!suggestions.value.length) return;
  activeIndex.value = (activeIndex.value + dir + suggestions.value.length) % suggestions.value.length;
};
const select = (idx: number) => {
  if (suggestions.value[idx]) {
    emit('select', suggestions.value[idx]);
    query.value = '';
    isFocused.value = false;
    // Unfocus the input
    inputRef.value?.blur();
  }
};
const clear = () => {
  query.value = '';
  isFocused.value = false;
};

// Keyboard shortcut: / or Cmd+K
const keyListener = (e: KeyboardEvent) => {
  if ((e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) {
    if (document.activeElement !== inputRef.value) {
      e.preventDefault();
      nextTick(() => inputRef.value?.focus());
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', keyListener);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', keyListener);
});
</script>

<style scoped>
.search-bar-root {
  position: fixed;
  z-index: 1002;
  top: 1.5rem; /* 6 in Tailwind */
  left: 1.5rem;
  width: 20rem; /* 80 in Tailwind */
}
@media (max-width: 640px) {
  .search-bar-root {
    top: 1rem; /* 4 in Tailwind */
    left: 0.5rem; /* 2 in Tailwind */
    right: 0.5rem; /* 2 in Tailwind */
    width: auto;
    max-width: 100%;
  }
}
</style>
