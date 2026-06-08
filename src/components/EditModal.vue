<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { X, Save } from 'lucide-vue-next';
import { useRedPacketStore } from '../stores/redPacket';
import {
  TYPE_OPTIONS,
  CHANNEL_OPTIONS,
  OCCASION_OPTIONS,
  RECIPROCITY_OPTIONS,
  RELATION_OPTIONS,
} from '../types';
import type { RedPacket, EditFormData } from '../types';

const props = defineProps<{
  visible: boolean;
  record: RedPacket | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const store = useRedPacketStore();
const isSubmitting = ref(false);

const formData = ref<EditFormData>({
  relation: '',
  amount: 0,
  type: 'receive',
  channel: 'wechat',
  date: '',
  time: '',
  occasion: 'newyear',
  remark: '',
  reciprocityStatus: 'none',
});

const isValid = computed(() => {
  return formData.value.relation !== '' && formData.value.amount > 0;
});

watch(
  () => props.record,
  (newRecord) => {
    if (newRecord) {
      formData.value = {
        relation: newRecord.relation,
        amount: newRecord.amount,
        type: newRecord.type,
        channel: newRecord.channel,
        date: newRecord.date,
        time: newRecord.time,
        occasion: newRecord.occasion,
        remark: newRecord.remark,
        reciprocityStatus: newRecord.reciprocityStatus,
      };
    }
  },
  { immediate: true }
);

function handleClose() {
  emit('close');
}

async function handleSave() {
  if (!props.record || !isValid.value || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    await store.updateRecord(props.record.id, { ...formData.value });
    emit('saved');
    emit('close');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible && record"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="handleClose"
      ></div>

      <div
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in"
      >
        <div class="flex items-center justify-between p-6 border-b border-festival-paper">
          <h3 class="text-xl font-bold text-festival-ink font-serif flex items-center gap-2">
            <span class="w-1 h-5 bg-festival-red rounded-full"></span>
            编辑红包记录
          </h3>
          <button
            @click="handleClose"
            class="p-2 text-festival-ink/40 hover:text-festival-ink hover:bg-festival-paper/50 rounded-lg transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-festival-ink mb-2">亲友关系</label>
              <input
                v-model="formData.relation"
                type="text"
                placeholder="如：爸爸、妈妈、爷爷、奶奶"
                list="edit-relation-datalist"
                class="w-full px-4 py-3 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors text-festival-ink"
              />
              <datalist id="edit-relation-datalist">
                <option v-for="rel in RELATION_OPTIONS" :key="rel" :value="rel" />
              </datalist>
            </div>

            <div>
              <label class="block text-sm font-medium text-festival-ink mb-2">金额（元）</label>
              <input
                v-model.number="formData.amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="w-full px-4 py-3 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors text-festival-ink text-2xl font-bold"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-festival-ink mb-2">类型</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="opt in TYPE_OPTIONS"
                  :key="opt.value"
                  @click="formData.type = opt.value"
                  :class="[
                    'py-3 rounded-xl border-2 font-medium transition-all duration-200',
                    formData.type === opt.value
                      ? opt.value === 'receive'
                        ? 'border-festival-receive bg-festival-receive/10 text-festival-receive'
                        : 'border-festival-send bg-festival-send/10 text-festival-send'
                      : 'border-festival-paper text-festival-ink/60 hover:border-festival-paper-dark'
                  ]"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-festival-ink mb-2">渠道</label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="opt in CHANNEL_OPTIONS"
                  :key="opt.value"
                  @click="formData.channel = opt.value"
                  :class="[
                    'py-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2',
                    formData.channel === opt.value
                      ? 'border-festival-red bg-festival-red/5 text-festival-red'
                      : 'border-festival-paper text-festival-ink/60 hover:border-festival-paper-dark'
                  ]"
                >
                  <span class="text-lg">{{ opt.icon }}</span>
                  <span class="text-sm">{{ opt.label }}</span>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-festival-ink mb-2">日期</label>
                <input
                  v-model="formData.date"
                  type="date"
                  class="w-full px-4 py-3 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors text-festival-ink"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-festival-ink mb-2">时间</label>
                <input
                  v-model="formData.time"
                  type="time"
                  class="w-full px-4 py-3 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors text-festival-ink"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-festival-ink mb-2">场合</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="opt in OCCASION_OPTIONS"
                  :key="opt.value"
                  @click="formData.occasion = opt.value"
                  :class="[
                    'px-4 py-2 rounded-xl border-2 transition-all duration-200 flex items-center gap-2',
                    formData.occasion === opt.value
                      ? 'border-festival-red bg-festival-red/5 text-festival-red'
                      : 'border-festival-paper text-festival-ink/60 hover:border-festival-paper-dark'
                  ]"
                >
                  <span>{{ opt.icon }}</span>
                  <span class="text-sm">{{ opt.label }}</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-festival-ink mb-2">回礼状态</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="opt in RECIPROCITY_OPTIONS"
                  :key="opt.value"
                  @click="formData.reciprocityStatus = opt.value"
                  :class="[
                    'px-4 py-2 rounded-xl border-2 transition-all duration-200',
                    formData.reciprocityStatus === opt.value
                      ? 'border-current text-white'
                      : 'border-festival-paper text-festival-ink/60 hover:border-festival-paper-dark'
                  ]"
                  :style="formData.reciprocityStatus === opt.value ? `background-color: ${opt.color}; border-color: ${opt.color};` : {}"
                >
                  <span class="text-sm">{{ opt.label }}</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-festival-ink mb-2">备注</label>
              <textarea
                v-model="formData.remark"
                rows="3"
                placeholder="添加备注信息（可选）"
                class="w-full px-4 py-3 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors text-festival-ink resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 p-6 border-t border-festival-paper bg-festival-paper/30">
          <button
            @click="handleClose"
            class="px-6 py-2.5 text-festival-ink/60 hover:text-festival-ink hover:bg-white rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            @click="handleSave"
            :disabled="!isValid || isSubmitting"
            :class="[
              'flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white transition-all duration-200',
              isValid && !isSubmitting
                ? 'bg-festival-red hover:bg-festival-red-dark'
                : 'bg-festival-ink/20 cursor-not-allowed'
            ]"
          >
            <Save class="w-4 h-4" />
            {{ isSubmitting ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
