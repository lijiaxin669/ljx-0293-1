<script setup lang="ts">
import { ref, computed } from 'vue';
import { Trash2, ArrowDownCircle, ArrowUpCircle, Upload } from 'lucide-vue-next';
import { useRedPacketStore } from '../stores/redPacket';
import type { RedPacket } from '../types';
import { CHANNEL_OPTIONS, MAX_RECORDS } from '../types';

const store = useRedPacketStore();
const deleteConfirmId = ref<string | null>(null);

const sortedRecords = computed(() => store.sortedRecords);

function getChannelLabel(channel: string): string {
  const opt = CHANNEL_OPTIONS.find(o => o.value === channel);
  return opt ? `${opt.icon} ${opt.label}` : channel;
}

function formatAmount(record: RedPacket): string {
  const sign = record.type === 'receive' ? '+' : '-';
  return `${sign}¥${record.amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function confirmDelete(id: string) {
  deleteConfirmId.value = id;
}

function cancelDelete() {
  deleteConfirmId.value = null;
}

async function handleDelete(id: string) {
  await store.deleteRecord(id);
  deleteConfirmId.value = null;
}

async function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text) as RedPacket[];
      if (Array.isArray(data)) {
        await store.importData(data);
        alert(`成功导入 ${data.length} 条记录！`);
      } else {
        alert('文件格式错误，请导入有效的 JSON 数组');
      }
    } catch (err) {
      alert('导入失败，请检查文件格式');
    }
  };
  input.click();
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-festival-ink font-serif flex items-center">
        <span class="w-1 h-5 bg-festival-red rounded-full mr-2"></span>
        最近记录
        <span class="ml-2 text-sm font-normal text-festival-ink/40">
          ({{ sortedRecords.length }}/{{ MAX_RECORDS }})
        </span>
      </h3>
      <button
        @click="handleImport"
        class="flex items-center gap-1 px-3 py-1.5 text-sm text-festival-red hover:bg-festival-red/5 rounded-lg transition-colors"
      >
        <Upload class="w-4 h-4" />
        导入 JSON
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="text-left text-sm text-festival-ink/50 border-b border-festival-paper">
            <th class="pb-3 font-medium">亲友</th>
            <th class="pb-3 font-medium">类型</th>
            <th class="pb-3 font-medium">金额</th>
            <th class="pb-3 font-medium hidden md:table-cell">渠道</th>
            <th class="pb-3 font-medium hidden lg:table-cell">时间</th>
            <th class="pb-3 font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-festival-paper/50">
          <tr
            v-for="record in sortedRecords"
            :key="record.id"
            class="group hover:bg-festival-paper/30 transition-colors"
          >
            <td class="py-4">
              <span class="font-medium text-festival-ink">{{ record.relation }}</span>
            </td>
            <td class="py-4">
              <span
                :class="[
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                  record.type === 'receive'
                    ? 'bg-festival-receive/10 text-festival-receive'
                    : 'bg-festival-send/10 text-festival-send'
                ]"
              >
                <ArrowDownCircle v-if="record.type === 'receive'" class="w-3.5 h-3.5" />
                <ArrowUpCircle v-else class="w-3.5 h-3.5" />
                {{ record.type === 'receive' ? '收' : '发' }}
              </span>
            </td>
            <td class="py-4">
              <span
                :class="[
                  'font-bold',
                  record.type === 'receive' ? 'text-festival-receive' : 'text-festival-send'
                ]"
              >
                {{ formatAmount(record) }}
              </span>
            </td>
            <td class="py-4 hidden md:table-cell">
              <span class="text-festival-ink/70 text-sm">{{ getChannelLabel(record.channel) }}</span>
            </td>
            <td class="py-4 hidden lg:table-cell">
              <span class="text-festival-ink/50 text-sm">{{ record.date }} {{ record.time }}</span>
            </td>
            <td class="py-4 text-right">
              <template v-if="deleteConfirmId !== record.id">
                <button
                  @click="confirmDelete(record.id)"
                  class="p-2 text-festival-ink/30 hover:text-festival-send hover:bg-festival-send/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </template>
              <template v-else>
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="handleDelete(record.id)"
                    class="px-3 py-1 text-xs bg-festival-send text-white rounded-lg hover:bg-festival-send/90 transition-colors"
                  >
                    确认
                  </button>
                  <button
                    @click="cancelDelete"
                    class="px-3 py-1 text-xs bg-festival-paper text-festival-ink rounded-lg hover:bg-festival-paper-dark transition-colors"
                  >
                    取消
                  </button>
                </div>
              </template>
            </td>
          </tr>
          <tr v-if="sortedRecords.length === 0">
            <td colspan="6" class="py-12 text-center">
              <div class="text-4xl mb-3">🧧</div>
              <p class="text-festival-ink/40">还没有记录，快去添加第一笔红包吧！</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
