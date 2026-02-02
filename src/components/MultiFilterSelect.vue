<template>
  <div ref="root" class="filter-select w-full flex flex-col items-start">
    <label
      class="block mb-2 text-base font-semibold tracking-wide cursor-default"
      :class="isDark ? 'text-white' : 'text-gray-800'"
      >
      {{ label }}
      <span v-if="required" :class="isDark ? 'text-red-400 ml-1' : 'text-red-500 ml-1'" aria-hidden="true">*</span>
    </label>
    <div class="relative w-full">
      <button
        :id="id"
        type="button"
        class="appearance-none w-full rounded-lg px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-colors duration-200 flex justify-between items-center cursor-pointer"
          :aria-required="required"
          :class="[
          isDark
            ? 'bg-gray-800 text-white border-gray-700'
            : 'bg-white text-gray-800 border-gray-300',
          hasError ? 'border-red-500 ring-1 ring-red-300' : '',
        ]"
        @click="toggleDropdown"
        :aria-expanded="open"
        :aria-controls="id + '-dropdown'"
      >
        <span class="min-w-0 truncate">
          {{ selectedLabel }}
        </span>
        <span :class="isDark ? 'ml-2 text-gray-300' : 'ml-2 text-gray-400'">
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>
      <ul
        v-if="open"
        :id="id + '-dropdown'"
        class="absolute left-0 mt-2 w-full rounded-lg shadow-lg z-50 max-h-60 overflow-auto border"
        :class="
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        "
      >
        <li
          v-for="option in options"
          :key="option"
          class="px-4 py-2 cursor-pointer transition-colors"
          :class="[
            isDark
              ? 'text-white hover:bg-gray-700'
              : 'text-gray-800 hover:bg-gray-100',
            { 'font-semibold': selectedValues.includes(option) },
          ]"
          @click.stop="toggleOption(option)"
        >
          <div class="flex items-center justify-between">
            <div>
              {{ option }}<span v-if="suffix">{{ suffix }}</span>
            </div>
            <input
              type="checkbox"
              :checked="selectedValues.includes(option)"
              readonly
            />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref, computed, onMounted } from "vue";
import { useOutsideClick } from "../composables/useOutsideClick";
const props = defineProps({
  id: String,
  label: String,
  allLabel: {
    type: String,
    default: "All",
  },
  noneLabel: {
    type: String,
    default: "Select",
  },
  options: {
    type: Array as () => string[],
    required: true,
  },
  modelValue: {
    type: Array as () => string[],
    default: () => [],
  },
  // When true, selects all options on mount if modelValue is empty. Set to false for forms where nothing should be selected by default.
  selectAllOnMount: {
    type: Boolean,
    default: true,
  },
  isDark: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  suffix: {
    type: String,
    default: "",
  },
  hasError: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:modelValue"]);
const {
  options,
  modelValue,
  isDark,
  id,
  label,
  allLabel,
  suffix,
  noneLabel,
  selectAllOnMount,
  hasError,
} = toRefs(props);

const open = ref(false);
const root = ref<HTMLElement | null>(null);

useOutsideClick(root, id ?? null, () => {
  open.value = false;
});

const selectedValues = computed(() =>
  Array.isArray(modelValue.value) ? modelValue.value : [],
);

function extractLastTwoDigits(s: string) {
  const digits = s.replace(/\D/g, "");
  if (digits.length >= 2) return digits.slice(-2);
  return s.slice(-2);
}

const selectedLabel = computed(() => {
  const vals = selectedValues.value || [];
  if (vals.length === 0) return noneLabel.value;
  if (vals.length === options.value.length) return allLabel.value;
  const mapped = vals.map((v) => extractLastTwoDigits(v));
  if (vals.length > 2)
    return `${mapped.slice(0, 2).join(", ")} +${vals.length - 2}`;
  return mapped.join(", ") + (suffix.value || "");
});

function toggleDropdown() {
  open.value = !open.value;
}
function toggleOption(val: string) {
  const current = Array.isArray(modelValue.value) ? [...modelValue.value] : [];
  const idx = current.indexOf(val);
  if (idx === -1) {
    current.push(val);
  } else {
    current.splice(idx, 1);
  }
  emit("update:modelValue", current);
}
// If no modelValue provided, default to all options selected
onMounted(() => {
  if (
    selectAllOnMount.value &&
    (!Array.isArray(modelValue.value) || modelValue.value.length === 0)
  ) {
    emit("update:modelValue", options.value.slice());
  }
});

</script>

<style scoped>
.filter-select label {
  font-weight: 600;
  letter-spacing: 0.01em;
}
.filter-select ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.filter-select li {
  user-select: none;
}
</style>
