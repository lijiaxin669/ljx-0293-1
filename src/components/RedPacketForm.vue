<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Plus, Minus, Send, Users } from 'lucide-vue-next';
import { useRedPacketStore } from '../stores/redPacket';
import { getCurrentDate, getCurrentTime } from '../utils/date';
import {
  RELATION_OPTIONS,
  CHANNEL_OPTIONS,
  TYPE_OPTIONS,
  OCCASION_OPTIONS,
  RECIPROCITY_OPTIONS,
  type FormData,
  type RedPacketType,
  type ChannelType,
  type OccasionType,
  type ReciprocityStatus,
} from '../types';

const store = useRedPacketStore();
const showQuickAdd = ref(false);
const isSubmitting = ref(false);

const formData = reactive<FormData>({
  relation: '',
  amount: 0,
  type: 'receive',
  channel: 'wechat',
  date: getCurrentDate(),
  time: getCurrentTime(),
  quickAddCount: 1,
  occasion: 'newyear',
  remark: '',
  reciprocityStatus: 'none',
});

const quickAddRelations = ref<string[]>(['']);

function addQuickAddRelation() {
  if (quickAddRelations.value.length < 10) {
    quickAddRelations.value.push('');
  }
}

function removeQuickAddRelation(index: number) {
  if (quickAddRelations.value.length > 1) {
    quickAddRelations.value.splice(index, 1);
  }
}

function resetForm() {
  formData.relation = '';
  formData.amount = 0;
  formData.type = 'receive';
  formData.channel = 'wechat';
  formData.date = getCurrentDate();
  formData.time = getCurrentTime();
  formData.quickAddCount = 1;
  formData.occasion = 'newyear';
  formData.remark = '';
  formData.reciprocityStatus = 'none';
  showQuickAdd.value = false;
  quickAddRelations.value = [''];
}

function isFormValid(): boolean {
  if (showQuickAdd.value) {
    return (
      formData.amount > 0 &&
      quickAddRelations.value.filter(r => r.trim() !== '').length > 0
    );
  }
  return formData.relation !== '' && formData.amount > 0;
}

async function handleSubmit() {
  if (!isFormValid() || isSubmitting.value) return;
  
  isSubmitting.value = true;
  
  try {
    if (showQuickAdd.value) {
      const validRelations = quickAddRelations.value.filter(r => r.trim() !== '');
      const records = validRelations.map(relation => ({
        relation,
        amount: formData.amount,
        type: formData.type,
        channel: formData.channel,
        date: formData.date,
        time: formData.time,
        occasion: formData.occasion,
        remark: formData.remark,
        reciprocityStatus: formData.reciprocityStatus,
      }));
      await store.addRecords(records);
    } else {
      await store.addRecord({
        relation: formData.relation,
        amount: formData.amount,
        type: formData.type,
        channel: formData.channel,
        date: formData.date,
        time: formData.time,
        occasion: formData.occasion,
        remark: formData.remark,
        reciprocityStatus: formData.reciprocityStatus,
      });
    }
    resetForm();
  } finally {
    isSubmitting.value = false;
  }
}

function selectRelation(relation: string) {
  formData.relation = relation;
}

function selectQuickRelation(index: number, relation: string) {
  quickAddRelations.value[index] = relation;
}

function setType(type: RedPacketType) {
  formData.type = type;
}

function setChannel(channel: ChannelType) {
  formData.channel = channel;
}

function setOccasion(occasion: OccasionType) {
  formData.occasion = occasion;
}

function setReciprocityStatus(status: ReciprocityStatus) {
  formData.reciprocityStatus = status;
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card p-6">
    <h3 class="text-lg font-bold text-festival-ink mb-6 font-serif flex items-center">
      <span class="w-1 h-5 bg-festival-red rounded-full mr-2"></span>
      记录红包
      <button
        v-if="!showQuickAdd"
        @click="showQuickAdd = true"
        class="ml-auto flex items-center gap-1 text-sm text-festival-red hover:text-festival-red-dark transition-colors"
      >
        <Users class="w-4 h-4" />
        批量添加
      </button>
      <button
        v-else
        @click="showQuickAdd = false; quickAddRelations = ['']"
        class="ml-auto flex items-center gap-1 text-sm text-festival-ink/60 hover:text-festival-ink transition-colors"
      >
        单笔添加
      </button>
    </h3>

    <div class="space-y-5">
      <div class="flex gap-3">
        <button
          v-for="opt in TYPE_OPTIONS"
          :key="opt.value"
          @click="setType(opt.value)"
          :class="[
            'flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300',
            formData.type === opt.value
              ? opt.value === 'receive'
                ? 'bg-festival-receive text-white shadow-lg shadow-festival-receive/30'
                : 'bg-festival-send text-white shadow-lg shadow-festival-send/30'
              : 'bg-festival-paper text-festival-ink/60 hover:bg-festival-paper-dark'
          ]"
        >
          {{ opt.label }}
        </button>
      </div>

      <div v-if="!showQuickAdd">
        <label class="block text-sm font-medium text-festival-ink mb-2">亲友关系</label>
        <div class="relative">
          <select
            v-model="formData.relation"
            class="w-full px-4 py-3 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors bg-white text-festival-ink appearance-none pr-10"
          >
            <option value="" disabled>请选择亲友关系</option>
            <option v-for="rel in RELATION_OPTIONS" :key="rel" :value="rel">{{ rel }}</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg class="w-5 h-5 text-festival-ink/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div v-else>
        <label class="block text-sm font-medium text-festival-ink mb-2">
          批量添加亲友
          <span class="text-festival-ink/40 font-normal ml-2">（相同金额发给多人）</span>
        </label>
        <div class="space-y-3">
          <div
            v-for="(relation, index) in quickAddRelations"
            :key="index"
            class="flex gap-2 items-center"
          >
            <div class="relative flex-1">
              <select
                :value="relation"
                @change="selectQuickRelation(index, ($event.target as HTMLSelectElement).value)"
                class="w-full px-4 py-3 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors bg-white text-festival-ink appearance-none pr-10"
              >
                <option value="" disabled>请选择亲友关系</option>
                <option v-for="rel in RELATION_OPTIONS" :key="rel" :value="rel">{{ rel }}</option>
              </select>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg class="w-5 h-5 text-festival-ink/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button
              v-if="quickAddRelations.length > 1"
              @click="removeQuickAddRelation(index)"
              class="p-3 rounded-xl text-festival-send hover:bg-festival-send/10 transition-colors"
            >
              <Minus class="w-5 h-5" />
            </button>
          </div>
          <button
            v-if="quickAddRelations.length < 10"
            @click="addQuickAddRelation"
            class="w-full py-3 border-2 border-dashed border-festival-paper rounded-xl text-festival-ink/50 hover:border-festival-red/50 hover:text-festival-red/70 transition-colors flex items-center justify-center gap-2"
          >
            <Plus class="w-5 h-5" />
            添加更多亲友
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-festival-ink mb-2">金额（元）</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-festival-ink/40 text-lg">¥</span>
            <input
              v-model.number="formData.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors text-festival-ink text-lg font-medium"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-festival-ink mb-2">渠道</label>
          <div class="flex gap-2">
            <button
              v-for="opt in CHANNEL_OPTIONS"
              :key="opt.value"
              @click="setChannel(opt.value)"
              :class="[
                'flex-1 py-3 px-2 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-1',
                formData.channel === opt.value
                  ? 'border-festival-red bg-festival-red/5 text-festival-red'
                  : 'border-festival-paper text-festival-ink/60 hover:border-festival-paper-dark'
              ]"
            >
              <span>{{ opt.icon }}</span>
              <span class="text-sm">{{ opt.label }}</span>
            </button>
          </div>
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
            @click="setOccasion(opt.value)"
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
            @click="setReciprocityStatus(opt.value)"
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
          rows="2"
          placeholder="添加备注信息（可选）"
          class="w-full px-4 py-3 rounded-xl border-2 border-festival-paper focus:border-festival-red focus:outline-none transition-colors text-festival-ink resize-none"
        ></textarea>
      </div>

      <button
        @click="handleSubmit"
        :disabled="!isFormValid() || isSubmitting"
        :class="[
          'w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2',
          isFormValid() && !isSubmitting
            ? 'bg-gradient-to-r from-festival-red to-festival-red-light hover:shadow-lg hover:shadow-festival-red/30 hover:-translate-y-0.5 active:translate-y-0'
            : 'bg-gray-300 cursor-not-allowed'
        ]"
      >
        <Send class="w-5 h-5" />
        {{ isSubmitting ? '保存中...' : showQuickAdd ? `批量添加 ${quickAddRelations.filter(r => r).length} 笔` : '添加记录' }}
      </button>
    </div>
  </div>
</template>
