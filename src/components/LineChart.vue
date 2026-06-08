<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { useRedPacketStore } from '../stores/redPacket';

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const store = useRedPacketStore();

const chartData = computed(() => {
  const stats = store.dailyStats;
  return {
    labels: stats.map(s => s.dateLabel),
    receiveData: stats.map(s => s.receive),
    sendData: stats.map(s => s.send),
  };
});

const hasData = computed(() => {
  const { receiveData, sendData } = chartData.value;
  return receiveData.some(v => v > 0) || sendData.some(v => v > 0);
});

function initChart() {
  if (!chartRef.value) return;
  
  chartInstance = echarts.init(chartRef.value);
  updateChart();
}

function updateChart() {
  if (!chartInstance) return;

  const { labels, receiveData, sendData } = chartData.value;

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
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
      formatter: (params: any) => {
        let result = `<div class="font-bold mb-1">${params[0].axisValue}</div>`;
        params.forEach((param: any) => {
          result += `<div class="flex items-center gap-2">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${param.color}"></span>
            ${param.seriesName}: ¥${param.value.toLocaleString()}
          </div>`;
        });
        return result;
      },
    },
    legend: {
      data: ['收红包', '发红包'],
      top: 0,
      right: 0,
      textStyle: {
        color: '#2C3E50',
        fontSize: 12,
        fontFamily: 'Noto Sans SC, sans-serif',
      },
      itemWidth: 20,
      itemHeight: 10,
      itemGap: 20,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLine: {
        lineStyle: {
          color: '#D5DBDB',
        },
      },
      axisLabel: {
        color: '#2C3E50',
        fontSize: 12,
        fontFamily: 'Noto Serif SC, serif',
        fontWeight: 500,
      },
    },
    yAxis: {
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
    series: [
      {
        name: '收红包',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#27AE60',
        },
        itemStyle: {
          color: '#27AE60',
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(39, 174, 96, 0.3)' },
            { offset: 1, color: 'rgba(39, 174, 96, 0.05)' },
          ]),
        },
        emphasis: {
          scale: true,
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(39, 174, 96, 0.5)',
          },
        },
        data: receiveData,
      },
      {
        name: '发红包',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#E74C3C',
        },
        itemStyle: {
          color: '#E74C3C',
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(231, 76, 60, 0.3)' },
            { offset: 1, color: 'rgba(231, 76, 60, 0.05)' },
          ]),
        },
        emphasis: {
          scale: true,
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(231, 76, 60, 0.5)',
          },
        },
        data: sendData,
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
  () => store.dailyStats,
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
      除夕至初七收支趋势
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
