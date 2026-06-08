<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { useRedPacketStore } from '../stores/redPacket';

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const store = useRedPacketStore();

const chartData = computed(() => {
  const stats = store.top10NetStats;
  return {
    names: stats.map(s => s.name),
    values: stats.map(s => s.value),
    isPositive: stats.map(s => s.isPositive),
  };
});

const hasData = computed(() => {
  return chartData.value.values.some(v => v > 0);
});

function initChart() {
  if (!chartRef.value) return;
  
  chartInstance = echarts.init(chartRef.value);
  updateChart();
}

function updateChart() {
  if (!chartInstance) return;

  const { names, values, isPositive } = chartData.value;

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#D72638',
      borderWidth: 1,
      textStyle: {
        color: '#2C3E50',
        fontSize: 13,
      },
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const param = params[0];
        const index = param.dataIndex;
        const status = isPositive[index] ? '盈余' : '亏欠';
        const color = isPositive[index] ? '#27AE60' : '#E74C3C';
        return `<div class="font-bold mb-1">${param.name}</div>
          <div class="flex items-center gap-2">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color}"></span>
            ${status}: ¥${param.value.toLocaleString()}
          </div>`;
      },
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '3%',
      top: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: '#ECF0F1',
          type: 'dashed',
        },
      },
      axisLabel: {
        color: '#2C3E50',
        fontSize: 11,
        formatter: '¥{value}',
      },
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLine: {
        lineStyle: {
          color: '#D5DBDB',
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#2C3E50',
        fontSize: 12,
        fontFamily: 'Noto Serif SC, serif',
        fontWeight: 500,
      },
      inverse: true,
    },
    series: [
      {
        type: 'bar',
        data: values.map((value, index) => ({
          value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: isPositive[index] ? 'rgba(39, 174, 96, 0.8)' : 'rgba(231, 76, 60, 0.8)' },
              { offset: 1, color: isPositive[index] ? 'rgba(39, 174, 96, 0.4)' : 'rgba(231, 76, 60, 0.4)' },
            ]),
            borderRadius: [0, 4, 4, 0],
          },
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'right',
          color: '#2C3E50',
          fontSize: 12,
          fontWeight: 600,
          formatter: (params: any) => {
            const index = params.dataIndex;
            const sign = isPositive[index] ? '+' : '-';
            return `${sign}¥${params.value.toLocaleString()}`;
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      },
    ],
    animationDuration: 1500,
    animationEasing: 'cubicOut',
  };

  chartInstance.setOption(option, true);
}

function handleResize() {
  chartInstance?.resize();
}

watch(
  () => store.records,
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
      <span class="w-1 h-5 bg-festival-gold rounded-full mr-2"></span>
      亲友净值 Top 10
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
