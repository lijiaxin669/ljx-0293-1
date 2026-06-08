<script setup lang="ts">
import { computed } from 'vue';
import { TrendingUp, TrendingDown, Wallet, Users } from 'lucide-vue-next';
import { useRedPacketStore } from '../stores/redPacket';
import type { ReconciliationStat } from '../types';

const store = useRedPacketStore();

const stats = computed(() => store.reconciliationStats);

const hasData = computed(() => stats.value.length > 0);

const summary = computed(() => {
  const total = stats.value.reduce((acc, s) => ({
    receive: acc.receive + s.totalReceive,
    send: acc.send + s.totalSend,
    net: acc.net + s.netAmount,
  }), { receive: 0, send: 0, net: 0 });
  return total;
});

function formatAmount(amount: number): string {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card p-6">
    <h3 class="text-lg font-bold text-festival-ink mb-4 font-serif flex items-center">
      <span class="w-1 h-5 bg-festival-gold rounded-full mr-2"></span>
      亲友对账中心
    </h3>

    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <TrendingUp class="w-5 h-5 text-green-600" />
          <span class="text-sm text-green-700 font-medium">总收入</span>
        </div>
        <p class="text-xl font-bold text-green-600">¥{{ formatAmount(summary.receive) }}</p>
      </div>
      <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <TrendingDown class="w-5 h-5 text-red-600" />
          <span class="text-sm text-red-700 font-medium">总支出</span>
        </div>
        <p class="text-xl font-bold text-red-600">¥{{ formatAmount(summary.send) }}</p>
      </div>
      <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <Wallet class="w-5 h-5 text-yellow-600" />
          <span class="text-sm text-yellow-700 font-medium">净收益</span>
        </div>
        <p class="text-xl font-bold" :class="summary.net >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ summary.net >= 0 ? '+' : '' }}¥{{ formatAmount(summary.net) }}
        </p>
      </div>
    </div>

    <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
      <div
        v-if="!hasData"
        class="text-center py-8 text-festival-ink/40"
      >
        <Users class="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p class="text-sm">暂无对账数据</p>
      </div>

      <div
        v-for="stat in stats"
        :key="stat.relation"
        class="rounded-xl p-4 transition-all duration-300 hover:shadow-md"
        :class="{
          'bg-red-50 border border-red-100': stat.isUpsideDown,
          'bg-gray-50 border border-gray-100': !stat.isUpsideDown,
        }"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-base font-bold text-festival-ink">{{ stat.relation }}</span>
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="{
                'bg-red-100 text-red-600': stat.isUpsideDown,
                'bg-gray-200 text-gray-600': !stat.isUpsideDown,
              }"
            >
              {{ stat.recordCount }} 笔
            </span>
            <span
              v-if="stat.isUpsideDown"
              class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white animate-pulse"
            >
              ⚠️ 倒挂
            </span>
          </div>
          <div class="text-right">
            <p
              class="text-lg font-bold"
              :class="stat.netAmount >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ stat.netAmount >= 0 ? '+' : '' }}¥{{ formatAmount(stat.netAmount) }}
            </p>
            <p class="text-xs text-festival-ink/60">净值</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
            <span class="text-festival-ink/60">收红包</span>
            <span class="font-semibold text-green-600">¥{{ formatAmount(stat.totalReceive) }}</span>
          </div>
          <div class="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
            <span class="text-festival-ink/60">发红包</span>
            <span class="font-semibold text-red-600">¥{{ formatAmount(stat.totalSend) }}</span>
          </div>
        </div>

        <div class="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-500"
            :class="stat.netAmount >= 0 ? 'bg-green-500' : 'bg-red-500'"
            :style="{
              width: `${Math.min(100, (Math.abs(stat.netAmount) / Math.max(summary.receive, summary.send, 1)) * 100)}%`,
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
