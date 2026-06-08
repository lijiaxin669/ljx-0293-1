<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { Undo2, X, Trash2 } from 'lucide-vue-next';
import { useRedPacketStore } from '../stores/redPacket';
import { UNDO_DELETE_WINDOW } from '../types';

const store = useRedPacketStore();
const countdownMap = ref<Map<string, number>>(new Map());
let animationFrameId: number | null = null;

const visibleDeletedRecords = computed(() => {
  return store.deletedRecords.filter(d => {
    const elapsed = Date.now() - d.deletedAt;
    return elapsed < UNDO_DELETE_WINDOW;
  });
});

function getCountdown(id: string): number {
  return countdownMap.value.get(id) || 0;
}

function updateCountdowns() {
  const now = Date.now();
  store.deletedRecords.forEach(d => {
    const remaining = Math.max(0, UNDO_DELETE_WINDOW - (now - d.deletedAt));
    countdownMap.value.set(d.record.id, remaining);
  });
  
  store.deletedRecords = store.deletedRecords.filter(d => {
    const remaining = UNDO_DELETE_WINDOW - (now - d.deletedAt);
    return remaining > 0;
  });

  animationFrameId = requestAnimationFrame(updateCountdowns);
}

animationFrameId = requestAnimationFrame(updateCountdowns);

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});

async function handleUndo(id: string) {
  await store.undoDelete(id);
  countdownMap.value.delete(id);
}

function dismiss(id: string) {
  const item = store.deletedRecords.find(d => d.record.id === id);
  if (item) {
    clearTimeout(item.timerId);
  }
  store.deletedRecords = store.deletedRecords.filter(d => d.record.id !== id);
  countdownMap.value.delete(id);
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      <TransitionGroup name="toast">
        <div
          v-for="item in visibleDeletedRecords"
          :key="item.record.id"
          class="bg-festival-ink text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 animate-slide-in"
        >
          <div class="w-10 h-10 bg-festival-send/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Trash2 class="w-5 h-5 text-festival-send" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate">
              已删除「{{ item.record.relation }}」¥{{ item.record.amount.toFixed(2) }}
            </p>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  class="h-full bg-festival-gold transition-all duration-100 ease-linear"
                  :style="{ width: `${(getCountdown(item.record.id) / UNDO_DELETE_WINDOW) * 100}%` }"
                ></div>
              </div>
              <span class="text-xs text-white/60 flex-shrink-0">
                {{ Math.ceil(getCountdown(item.record.id) / 1000) }}s
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              @click="handleUndo(item.record.id)"
              class="flex items-center gap-1 px-3 py-1.5 bg-festival-gold hover:bg-festival-gold-dark text-festival-ink rounded-lg text-sm font-medium transition-colors"
            >
              <Undo2 class="w-4 h-4" />
              撤销
            </button>
            <button
              @click="dismiss(item.record.id)"
              class="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
