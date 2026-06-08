import { defineStore } from 'pinia';
import type { RedPacket, Summary, RelationStat, DailyStat, RedPacketType, ReconciliationStat, ReciprocityStatus, FilterCriteria, DeletedRecord } from '../types';
import { UNDO_DELETE_WINDOW } from '../types';
import { addRecord, addRecords, deleteRecord, getAllRecords, importRecords, updateRecord, updateReciprocityStatus, bulkDeleteRecords } from '../utils/idb';
import { generateId, getSmartDateRange } from '../utils/date';

interface RedPacketState {
  records: RedPacket[];
  isLoading: boolean;
  filterCriteria: FilterCriteria;
  deletedRecords: DeletedRecord[];
  selectedRecordIds: string[];
}

function getDefaultFilterCriteria(): FilterCriteria {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    type: 'all',
    channel: 'all',
    dateStart: formatDate(oneMonthAgo),
    dateEnd: formatDate(today),
    relation: '',
    remarkKeyword: '',
  };
}

export const useRedPacketStore = defineStore('redPacket', {
  state: (): RedPacketState => ({
    records: [],
    isLoading: false,
    filterCriteria: getDefaultFilterCriteria(),
    deletedRecords: [],
    selectedRecordIds: [],
  }),

  getters: {
    filteredRecords: (state): RedPacket[] => {
      return state.records.filter(record => {
        if (state.filterCriteria.type !== 'all' && record.type !== state.filterCriteria.type) {
          return false;
        }
        if (state.filterCriteria.channel !== 'all' && record.channel !== state.filterCriteria.channel) {
          return false;
        }
        if (state.filterCriteria.dateStart && record.date < state.filterCriteria.dateStart) {
          return false;
        }
        if (state.filterCriteria.dateEnd && record.date > state.filterCriteria.dateEnd) {
          return false;
        }
        if (state.filterCriteria.relation && !record.relation.includes(state.filterCriteria.relation)) {
          return false;
        }
        if (state.filterCriteria.remarkKeyword && !record.remark.toLowerCase().includes(state.filterCriteria.remarkKeyword.toLowerCase())) {
          return false;
        }
        return true;
      }).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },

    hasActiveFilters: (state): boolean => {
      return state.filterCriteria.type !== 'all' ||
        state.filterCriteria.channel !== 'all' ||
        state.filterCriteria.dateStart !== '' ||
        state.filterCriteria.dateEnd !== '' ||
        state.filterCriteria.relation !== '' ||
        state.filterCriteria.remarkKeyword !== '';
    },

    selectedRecords: (state): RedPacket[] => {
      return state.records.filter(r => state.selectedRecordIds.includes(r.id));
    },

    filteredSummary: (state): Summary => {
      const filtered = state.records.filter(record => {
        if (state.filterCriteria.type !== 'all' && record.type !== state.filterCriteria.type) return false;
        if (state.filterCriteria.channel !== 'all' && record.channel !== state.filterCriteria.channel) return false;
        if (state.filterCriteria.dateStart && record.date < state.filterCriteria.dateStart) return false;
        if (state.filterCriteria.dateEnd && record.date > state.filterCriteria.dateEnd) return false;
        if (state.filterCriteria.relation && !record.relation.includes(state.filterCriteria.relation)) return false;
        if (state.filterCriteria.remarkKeyword && !record.remark.toLowerCase().includes(state.filterCriteria.remarkKeyword.toLowerCase())) return false;
        return true;
      });
      const totalReceive = filtered.filter(r => r.type === 'receive').reduce((sum, r) => sum + r.amount, 0);
      const totalSend = filtered.filter(r => r.type === 'send').reduce((sum, r) => sum + r.amount, 0);
      return {
        totalReceive,
        totalSend,
        netAmount: totalReceive - totalSend,
      };
    },
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

    reconciliationStats: (state): ReconciliationStat[] => {
      const map = new Map<string, { totalReceive: number; totalSend: number; count: number }>();
      
      state.records.forEach(record => {
        const current = map.get(record.relation) || { totalReceive: 0, totalSend: 0, count: 0 };
        if (record.type === 'receive') {
          current.totalReceive += record.amount;
        } else {
          current.totalSend += record.amount;
        }
        current.count += 1;
        map.set(record.relation, current);
      });
      
      return Array.from(map.entries())
        .map(([relation, stats]) => {
          const netAmount = stats.totalReceive - stats.totalSend;
          return {
            relation,
            totalReceive: stats.totalReceive,
            totalSend: stats.totalSend,
            netAmount,
            isUpsideDown: netAmount < 0,
            recordCount: stats.count,
          };
        })
        .sort((a, b) => b.netAmount - a.netAmount);
    },

    top10NetStats: (state): { name: string; value: number; isPositive: boolean }[] => {
      const map = new Map<string, number>();
      
      state.records.forEach(record => {
        const current = map.get(record.relation) || 0;
        const amount = record.type === 'receive' ? record.amount : -record.amount;
        map.set(record.relation, current + amount);
      });
      
      return Array.from(map.entries())
        .map(([name, value]) => ({
          name,
          value: Math.abs(value),
          isPositive: value >= 0,
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
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

    async deleteRecord(id: string, enableUndo: boolean = true) {
      const record = this.records.find(r => r.id === id);
      if (!record) return;

      await deleteRecord(id);
      this.records = this.records.filter(r => r.id !== id);
      this.selectedRecordIds = this.selectedRecordIds.filter(rId => rId !== id);

      if (enableUndo) {
        const timerId = window.setTimeout(() => {
          this.deletedRecords = this.deletedRecords.filter(d => d.record.id !== id);
        }, UNDO_DELETE_WINDOW);

        this.deletedRecords.push({
          record: { ...record },
          deletedAt: Date.now(),
          timerId,
        });
      }
    },

    async undoDelete(id: string) {
      const deletedItem = this.deletedRecords.find(d => d.record.id === id);
      if (!deletedItem) return;

      clearTimeout(deletedItem.timerId);
      this.deletedRecords = this.deletedRecords.filter(d => d.record.id !== id);

      await addRecord(deletedItem.record);
      this.records.push(deletedItem.record);
    },

    async bulkDelete(ids: string[], enableUndo: boolean = true) {
      const recordsToDelete = this.records.filter(r => ids.includes(r.id));
      if (recordsToDelete.length === 0) return;

      await bulkDeleteRecords(ids);
      this.records = this.records.filter(r => !ids.includes(r.id));
      this.selectedRecordIds = this.selectedRecordIds.filter(rId => !ids.includes(rId));

      if (enableUndo) {
        const timerId = window.setTimeout(() => {
          this.deletedRecords = this.deletedRecords.filter(d => !ids.includes(d.record.id));
        }, UNDO_DELETE_WINDOW);

        recordsToDelete.forEach(record => {
          this.deletedRecords.push({
            record: { ...record },
            deletedAt: Date.now(),
            timerId,
          });
        });
      }
    },

    setFilterCriteria(criteria: Partial<FilterCriteria>) {
      this.filterCriteria = { ...this.filterCriteria, ...criteria };
    },

    resetFilterCriteria() {
      this.filterCriteria = getDefaultFilterCriteria();
    },

    toggleRecordSelection(id: string) {
      const index = this.selectedRecordIds.indexOf(id);
      if (index === -1) {
        this.selectedRecordIds.push(id);
      } else {
        this.selectedRecordIds.splice(index, 1);
      }
    },

    selectAllFilteredRecords() {
      this.selectedRecordIds = this.filteredRecords.map(r => r.id);
    },

    clearSelection() {
      this.selectedRecordIds = [];
    },

    removeExpiredDeletedRecords() {
      const now = Date.now();
      this.deletedRecords = this.deletedRecords.filter(d => {
        if (now - d.deletedAt >= UNDO_DELETE_WINDOW) {
          clearTimeout(d.timerId);
          return false;
        }
        return true;
      });
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

    async updateRecord(id: string, updates: Partial<RedPacket>) {
      await updateRecord(id, updates);
      const index = this.records.findIndex(r => r.id === id);
      if (index !== -1) {
        this.records[index] = { ...this.records[index], ...updates };
      }
    },

    async updateReciprocityStatus(id: string, status: ReciprocityStatus) {
      await updateReciprocityStatus(id, status);
      const index = this.records.findIndex(r => r.id === id);
      if (index !== -1) {
        this.records[index].reciprocityStatus = status;
      }
    },
  },
});
