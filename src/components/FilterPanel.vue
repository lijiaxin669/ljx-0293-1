<script setup lang="ts">
import { ref } from 'vue';
import { Filter, Search, X, ChevronDown, ChevronUp } from 'lucide-vue-next';
import { useRedPacketStore } from '../stores/redPacket';
import { TYPE_OPTIONS, CHANNEL_OPTIONS, RELATION_OPTIONS } from '../types';
import type { RedPacketType, ChannelType } from '../types';

const store = useRedPacketStore();
const isExpanded = ref(true);

function handleTypeChange(type: string) {
  store.setFilterCriteria({ type: type as RedPacketType | 'all' });
}

function handleChannelChange(channel: string) {
  store.setFilterCriteria({ channel: channel as ChannelType | 'all' });
}

function handleDateStartChange(e: Event) {
  const target = e.target as HTMLInputElement;
  store.setFilterCriteria({ dateStart: target.value });
}

function handleDateEndChange(e: Event) {
  const target = e.target as HTMLInputElement;
  store.setFilterCriteria({ dateEnd: target.value });
}

function handleRelationChange(e: Event) {
  const target = e.target as HTMLInputElement;
  store.setFilterCriteria({ relation: target.value });
}

function handleKeywordChange(e: Event) {
  const target = e.target as HTMLInputElement;
  store.setFilterCriteria({ remarkKeyword: target.value });
}

function resetFilters() {
  store.resetFilterCriteria();
  store.clearSelection();
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card overflow-hidden">
    <div
      class="flex items-center justify-between p-4 cursor-pointer hover:bg-festival-paper/30 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-festival-red/10 rounded-lg flex items-center justify-center">
          <Filter class="w-4 h-4 text-festival-red" />
        </div>
        <h3 class="font-bold text-festival-ink font-serif">多维筛选</h3>
        <span
          v-if="store.hasActiveFilters"
          class="px-2 py-0.5 bg-festival-red text-white text-xs rounded-full"
        >
          已筛选
        </span>
        <span class="text-sm text-festival-ink/50">
          ({{ store.filteredRecords.length }} 条)
        </span>
      </div>
      <ChevronUp v-if="isExpanded" class="w-5 h-5 text-festival-ink/50" />
      <ChevronDown v-else class="w-5 h-5 text-festival-ink/50" />
    </div>

    <div v-show="isExpanded" class="p-4 pt-0 border-t border-festival-paper/50">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-festival-ink/70 mb-2">类型</label>
          <select
            :value="store.filterCriteria.type"
            @change="(e) => handleTypeChange((e.target as HTMLSelectElement).value)"
            class="w-full px-3 py-2.5 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors text-festival-ink bg-white"
          >
            <option value="all">全部</option>
            <option v-for="opt in TYPE_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-festival-ink/70 mb-2">渠道</label>
          <select
            :value="store.filterCriteria.channel"
            @change="(e) => handleChannelChange((e.target as HTMLSelectElement).value)"
            class="w-full px-3 py-2.5 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors text-festival-ink bg-white"
          >
            <option value="all">全部</option>
            <option v-for="opt in CHANNEL_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.icon }} {{ opt.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-festival-ink/70 mb-2">开始日期</label>
          <input
            type="date"
            :value="store.filterCriteria.dateStart"
            @change="handleDateStartChange"
            class="w-full px-3 py-2.5 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors text-festival-ink"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-festival-ink/70 mb-2">结束日期</label>
          <input
            type="date"
            :value="store.filterCriteria.dateEnd"
            @change="handleDateEndChange"
            class="w-full px-3 py-2.5 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors text-festival-ink"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-festival-ink/70 mb-2">亲友</label>
          <input
            type="text"
            :value="store.filterCriteria.relation"
            @input="handleRelationChange"
            placeholder="输入亲友名称"
            list="relation-datalist"
            class="w-full px-3 py-2.5 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors text-festival-ink"
          />
          <datalist id="relation-datalist">
            <option v-for="rel in RELATION_OPTIONS" :key="rel" :value="rel" />
          </datalist>
        </div>

        <div>
          <label class="block text-sm font-medium text-festival-ink/70 mb-2">备注关键词</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-festival-ink/40" />
            <input
              type="text"
              :value="store.filterCriteria.remarkKeyword"
              @input="handleKeywordChange"
              placeholder="搜索备注"
              class="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors text-festival-ink"
            />
          </div>
        </div>
      </div>

      <div v-if="store.hasActiveFilters" class="flex items-center justify-end mt-4">
        <button
          @click="resetFilters"
          class="flex items-center gap-1 px-4 py-2 text-sm text-festival-ink/60 hover:text-festival-red hover:bg-festival-red/5 rounded-lg transition-colors"
        >
          <X class="w-4 h-4" />
          重置筛选
        </button>
      </div>
    </div>
  </div>
</template>
