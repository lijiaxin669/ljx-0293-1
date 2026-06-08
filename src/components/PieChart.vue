<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { useRedPacketStore } from '../stores/redPacket';

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const store = useRedPacketStore();

const colorPalette = [
  '#D72638',
  '#F4D03F',
  '#E84A5F',
  '#27AE60',
  '#3498DB',
  '#9B59B6',
  '#E67E22',
  '#1ABC9C',
  '#E74C3C',
  '#F39C12',
];

const chartData = computed(() => {
  const stats = store.relationStats;
  return stats.slice(0, 10).map((item, index) => ({
    value: item.value,
    name: item.name,
    itemStyle: {
      color: colorPalette[index % colorPalette.length],
    },
  }));
});

const hasData = computed(() => chartData.value.length > 0);

function initChart() {
  if (!chartRef.value) return;
  
  chartInstance = echarts.init(chartRef.value);
  updateChart();
}

function updateChart() {
  if (!chartInstance) return;

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#D72638',
      borderWidth: 1,
      textStyle: {
        color: '#2C3E50',
        fontSize: 13,
      },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: '#2C3E50',
        fontSize: 12,
        fontFamily: 'Noto Sans SC, sans-serif',
      },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 10,
    },
    series: [
      {
        name: '亲友占比',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 3,
        },
        label: {
          show: true,
          position: 'inner',
          formatter: '{d}%',
          fontSize: 12,
          fontWeight: 'bold',
          color: '#fff',
        },
        labelLine: {
          show: false,
        },
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(215, 38, 56, 0.3)',
          },
        },
        data: chartData.value,
      },
    ],
    animationType: 'scale',
    animationEasing: 'elasticOut',
    animationDuration: 1000,
  };

  chartInstance.setOption(option, true);
}

function handleResize() {
  chartInstance?.resize();
}

watch(
  () => store.relationStats,
  () => {
    updateChart();
  },
  { deep: true }
);

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card p-6 h-full">
    <h3 class="text-lg font-bold text-festival-ink mb-4 font-serif flex items-center">
      <span class="w-1 h-5 bg-festival-red rounded-full mr-2"></span>
      亲友收支占比
    </h3>
    <div class="relative">
      <div
        ref="chartRef"
        class="w-full h-80"
      ></div>
      <div
        v-if="!hasData"
        class="absolute inset-0 flex items-center justify-center bg-white/80"
      >
        <p class="text-festival-ink/40 text-sm">暂无数据，快去记录红包吧！</p>
      </div>
    </div>
  </div>
</template>
