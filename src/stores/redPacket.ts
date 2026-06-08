import { defineStore } from 'pinia';
import type { RedPacket, Summary, RelationStat, DailyStat, RedPacketType } from '../types';
import { addRecord, addRecords, deleteRecord, getAllRecords, importRecords } from '../utils/idb';
import { generateId, getSmartDateRange } from '../utils/date';

interface RedPacketState {
  records: RedPacket[];
  isLoading: boolean;
}

export const useRedPacketStore = defineStore('redPacket', {
  state: (): RedPacketState => ({
    records: [],
    isLoading: false,
  }),

  getters: {
    summary: (state): Summary => {
      const totalReceive = state.records
        .filter(r => r.type === 'receive')
        .reduce((sum, r) => sum + r.amount, 0);
      const totalSend = state.records
        .filter(r => r.type === 'send')
        .reduce((sum, r) => sum + r.amount, 0);
      return {
        totalReceive,
        totalSend,
        netAmount: totalReceive - totalSend,
      };
    },

    relationStats: (state): RelationStat[] => {
      const map = new Map<string, number>();
      state.records.forEach(record => {
        const current = map.get(record.relation) || 0;
        const amount = record.type === 'receive' ? record.amount : -record.amount;
        map.set(record.relation, current + amount);
      });
      return Array.from(map.entries())
        .map(([name, value]) => ({ name, value: Math.abs(value) }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);
    },

    dailyStats: (state): DailyStat[] => {
      const currentYear = new Date().getFullYear();
      const dateRange = getSmartDateRange(state.records, currentYear);
      
      const result: DailyStat[] = dateRange.map(({ date, label }) => ({
        date,
        dateLabel: label,
        receive: 0,
        send: 0,
      }));

      state.records.forEach(record => {
        const dayStat = result.find(d => d.date === record.date);
        if (dayStat) {
          if (record.type === 'receive') {
            dayStat.receive += record.amount;
          } else {
            dayStat.send += record.amount;
          }
        }
      });

      return result;
    },

    sortedRecords: (state): RedPacket[] => {
      return [...state.records].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  },

  actions: {
    async fetchRecords() {
      this.isLoading = true;
      try {
        this.records = await getAllRecords();
      } finally {
        this.isLoading = false;
      }
    },

    async addRecord(record: Omit<RedPacket, 'id' | 'createdAt'>) {
      const newRecord: RedPacket = {
        ...record,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      await addRecord(newRecord);
      this.records.push(newRecord);
    },

    async addRecords(records: Omit<RedPacket, 'id' | 'createdAt'>[]) {
      const newRecords: RedPacket[] = records.map(record => ({
        ...record,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }));
      await addRecords(newRecords);
      this.records.push(...newRecords);
    },

    async deleteRecord(id: string) {
      await deleteRecord(id);
      this.records = this.records.filter(r => r.id !== id);
    },

    async importData(records: RedPacket[]) {
      await importRecords(records);
      this.records = [...records];
    },

    getTotalByRelation(relation: string, type: RedPacketType): number {
      return this.records
        .filter(r => r.relation === relation && r.type === type)
        .reduce((sum, r) => sum + r.amount, 0);
    },
  },
});
