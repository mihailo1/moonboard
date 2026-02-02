<template>
  <div class="fixed inset-0 pointer-events-none z-[2000]">
    <div class="flex flex-col items-center sm:items-end gap-3 p-4 mt-6">
      <transition-group name="toast" tag="div" class="w-full max-w-sm">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="[
            'pointer-events-auto mb-2 rounded-lg px-4 py-3 shadow-lg text-sm flex items-start gap-3',
            t.type === 'success' ? 'bg-white text-gray-900 ring-1 ring-green-200' : '',
            t.type === 'error' ? 'bg-white text-gray-900 ring-1 ring-red-200' : '',
            t.type === 'info' ? 'bg-white text-gray-900 ring-1 ring-gray-200' : '',
          ]"
        >
          <div class="flex-1">
            <div class="font-semibold">{{ t.title }}</div>
            <div class="text-xs mt-0.5 text-gray-600">{{ t.message }}</div>
          </div>
          <button class="opacity-60 hover:opacity-100 ml-2 text-xs" @click="remove(t.id)">Close</button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount } from 'vue'

type Toast = { id: number; title: string; message: string; type: string }

const toasts = reactive<Toast[]>([])
let nextId = 1

function addToast(payload: { message: string; type?: string; duration?: number }) {
  const id = nextId++
  const title = payload.type === 'success' ? 'Success' : payload.type === 'error' ? 'Error' : 'Notice'
  toasts.push({ id, title, message: payload.message, type: payload.type || 'info' })
  const dur = payload.duration ?? 4000
  setTimeout(() => remove(id), dur)
}

function remove(id: number) {
  const idx = toasts.findIndex((t) => t.id === id)
  if (idx >= 0) toasts.splice(idx, 1)
}

function onEvent(e: any) {
  const d = e?.detail || {}
  addToast({ message: d.message || '', type: d.type || 'info', duration: d.duration })
}

onMounted(() => window.addEventListener('mb-toast', onEvent as EventListener))
onBeforeUnmount(() => window.removeEventListener('mb-toast', onEvent as EventListener))
</script>

<style scoped>
.toast-enter-from { transform: translateY(-8px); opacity: 0 }
.toast-enter-active { transition: all .2s ease }
.toast-enter-to { transform: translateY(0); opacity: 1 }
.toast-leave-from { opacity: 1 }
.toast-leave-active { transition: opacity .15s ease }
.toast-leave-to { opacity: 0 }
</style>
