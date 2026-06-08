<script setup lang="ts">
import { computed } from 'vue';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-vue-next';
import { useRedPacketStore } from '../stores/redPacket';

const store = useRedPacketStore();

const formattedSummary = computed(() => ({
  totalReceive: formatAmount(store.summary.totalReceive),
  totalSend: formatAmount(store.summary.totalSend),
  netAmount: formatAmount(store.summary.netAmount),
  netSign: store.summary.netAmount >= 0 ? '+' : '',
}));

function formatAmount(amount: number): string {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border-l-4 border-festival-receive">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-festival-ink/60 text-sm font-sans mb-1">总收入</p>
          <p class="text-3xl font-bold text-festival-receive font-serif">
            ¥{{ formattedSummary.totalReceive }}
          </p>
        </div>
        <div class="w-14 h-14 bg-festival-receive/10 rounded-full flex items-center justify-center">
          <TrendingUp class="w-7 h-7 text-festival-receive" />
        </div>
      </div>
      <div class="mt-4 flex items-center text-xs text-festival-ink/40">
        <span class="inline-block w-2 h-2 bg-festival-receive rounded-full mr-2"></span>
        收红包累计
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border-l-4 border-festival-send">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-festival-ink/60 text-sm font-sans mb-1">总支出</p>
          <p class="text-3xl font-bold text-festival-send font-serif">
            ¥{{ formattedSummary.totalSend }}
          </p>
        </div>
        <div class="w-14 h-14 bg-festival-send/10 rounded-full flex items-center justify-center">
          <TrendingDown class="w-7 h-7 text-festival-send" />
        </div>
      </div>
      <div class="mt-4 flex items-center text-xs text-festival-ink/40">
        <span class="inline-block w-2 h-2 bg-festival-send rounded-full mr-2"></span>
        发红包累计
      </div>
    </div>

    <div class="bg-gradient-to-br from-festival-gold to-festival-gold-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border-l-4 border-festival-gold-dark">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-festival-ink/70 text-sm font-sans mb-1">净收益</p>
          <p class="text-3xl font-bold text-festival-ink font-serif">
            {{ formattedSummary.netSign }}¥{{ formattedSummary.netAmount }}
          </p>
        </div>
        <div class="w-14 h-14 bg-white/30 rounded-full flex items-center justify-center">
          <Wallet class="w-7 h-7 text-festival-ink" />
        </div>
      </div>
      <div class="mt-4 flex items-center text-xs text-festival-ink/60">
        <span class="inline-block w-2 h-2 bg-festival-ink/60 rounded-full mr-2"></span>
        收支净额
      </div>
    </div>
  </div>
</template>
