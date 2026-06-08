<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, Printer, FileText, FileSpreadsheet } from 'lucide-vue-next';
import { useRedPacketStore } from '../stores/redPacket';
import { generatePrintHTML, printHTML } from '../utils/csv';
import { exportToCSV } from '../utils/csv';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useRedPacketStore();
const previewHtml = ref('');

const hasRecords = computed(() => store.filteredRecords.length > 0);

watch(
  () => [props.visible, store.filteredRecords],
  () => {
    if (props.visible && hasRecords.value) {
      previewHtml.value = generatePrintHTML(store.filteredRecords, '红包对账单');
    }
  },
  { immediate: true }
);

function handleClose() {
  emit('close');
}

function handlePrint() {
  printHTML(previewHtml.value);
}

function handleExportCSV() {
  exportToCSV(store.filteredRecords);
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="handleClose"
      ></div>

      <div
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-fade-in"
      >
        <div class="flex items-center justify-between p-6 border-b border-festival-paper bg-white">
          <div>
            <h3 class="text-xl font-bold text-festival-ink font-serif flex items-center gap-2">
              <span class="w-1 h-5 bg-festival-red rounded-full"></span>
              对账单预览
            </h3>
            <p class="text-sm text-festival-ink/50 mt-1">
              共 {{ store.filteredRecords.length }} 条记录
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="hasRecords"
              @click="handleExportCSV"
              class="flex items-center gap-2 px-4 py-2 text-sm bg-festival-paper hover:bg-festival-paper-dark text-festival-ink rounded-lg transition-colors"
            >
              <FileSpreadsheet class="w-4 h-4" />
              导出 CSV
            </button>
            <button
              v-if="hasRecords"
              @click="handlePrint"
              class="flex items-center gap-2 px-4 py-2 text-sm bg-festival-red hover:bg-festival-red-dark text-white rounded-lg transition-colors"
            >
              <Printer class="w-4 h-4" />
              打印
            </button>
            <button
              @click="handleClose"
              class="p-2 text-festival-ink/40 hover:text-festival-ink hover:bg-festival-paper/50 rounded-lg transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="overflow-y-auto max-h-[calc(95vh-100px)] bg-festival-paper/20 p-4">
          <div v-if="!hasRecords" class="flex flex-col items-center justify-center py-20">
            <FileText class="w-16 h-16 text-festival-ink/20 mb-4" />
            <p class="text-festival-ink/40">暂无记录可预览</p>
          </div>
          <iframe
            v-else
            :srcdoc="previewHtml"
            class="w-full bg-white rounded-lg shadow-inner"
            style="height: 70vh; border: none;"
          ></iframe>
        </div>
      </div>
    </div>
  </Teleport>
</template>
