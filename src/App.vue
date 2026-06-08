<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Sparkles } from 'lucide-vue-next';
import SummaryCards from './components/SummaryCards.vue';
import PieChart from './components/PieChart.vue';
import LineChart from './components/LineChart.vue';
import RedPacketForm from './components/RedPacketForm.vue';
import RecordList from './components/RecordList.vue';
import { useRedPacketStore } from './stores/redPacket';

const store = useRedPacketStore();
const isLoading = ref(true);

const currentYear = new Date().getFullYear();

onMounted(async () => {
  await store.fetchRecords();
  isLoading.value = false;
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-festival-paper via-white to-festival-gold/10">
    <header class="bg-gradient-to-r from-festival-red to-festival-red-dark text-white py-6 px-4 shadow-lg">
      <div class="container mx-auto">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-float">
              <span class="text-2xl">🧧</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold font-serif">压岁钱收支看板</h1>
              <p class="text-white/80 text-sm">{{ currentYear }} 春节 · 记录每一份心意</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-white/80 text-sm">
            <Sparkles class="w-4 h-4" />
            <span>本地存储 · 数据安全</span>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="w-16 h-16 border-4 border-festival-red/30 border-t-festival-red rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-festival-ink/60">加载中...</p>
        </div>
      </div>

      <div v-else class="space-y-8 animate-fade-in">
        <SummaryCards />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChart />
          <LineChart />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1">
            <RedPacketForm />
          </div>
          <div class="lg:col-span-2">
            <RecordList />
          </div>
        </div>
      </div>
    </main>

    <footer class="bg-festival-ink text-white/60 py-6 mt-12">
      <div class="container mx-auto px-4 text-center text-sm">
        <p>🎊 压岁钱收支看板 · 数据本地存储 · 刷新不丢失 🎊</p>
        <p class="mt-1 text-white/40">最多保存最近 50 条记录</p>
      </div>
    </footer>
  </div>
</template>