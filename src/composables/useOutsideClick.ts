import { onMounted, onBeforeUnmount } from "vue";
import type { Ref } from "vue";

export function useOutsideClick(
  rootRef: Ref<HTMLElement | null>,
  idRef: Ref<string | undefined> | null,
  onOutside: () => void,
) {
  function handler(e: Event) {
    const target = e.target as Node | null;
    if (!rootRef.value || !target) return;
    const el = target as Element | null;
    const btnSelector = idRef?.value ? `#${idRef.value}` : null;
    const dropdownSelector = idRef?.value ? `#${idRef.value}-dropdown` : null;
    const labelSelector = idRef?.value ? `label[for="${idRef.value}"]` : null;
    if (
      el &&
      (
        (btnSelector && el.closest(btnSelector)) ||
        (dropdownSelector && el.closest(dropdownSelector)) ||
        (labelSelector && el.closest(labelSelector))
      )
    ) {
      return;
    }
    if (!rootRef.value.contains(target)) {
      onOutside();
      return;
    }
    // Click is inside component but not on toggle button or dropdown -> close
    onOutside();
  }

  onMounted(() => {
    document.addEventListener("pointerdown", handler);
  });
  onBeforeUnmount(() => {
    document.removeEventListener("pointerdown", handler);
  });
}
