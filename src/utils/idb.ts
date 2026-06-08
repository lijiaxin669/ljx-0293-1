import { openDB, type IDBPDatabase } from 'idb';
import type { RedPacket, ReciprocityStatus } from '../types';
import { MAX_RECORDS } from '../types';

const DB_NAME = 'redPacketDB';
const DB_VERSION = 2;
const STORE_NAME = 'records';

let dbInstance: IDBPDatabase | null = null;

function migrateRecord(record: any): RedPacket {
  return {
    ...record,
    occasion: record.occasion || 'newyear',
    remark: record.remark || '',
    reciprocityStatus: record.reciprocityStatus || 'none',
  };
}

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });
        store.createIndex('date', 'date');
        store.createIndex('createdAt', 'createdAt');
      }
      
      if (oldVersion < 2) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.store;
        store.openCursor().then(function cursorIterate(cursor) {
          if (!cursor) return;
          const record = cursor.value;
          const migrated = migrateRecord(record);
          cursor.update(migrated);
          return cursor.continue().then(cursorIterate);
        });
        return tx.done;
      }
    },
  });

  return dbInstance;
}

export async function updateRecord(id: string, updates: Partial<RedPacket>): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const record = await tx.store.get(id);
  if (record) {
    const updated = { ...record, ...updates };
    await tx.store.put(updated);
  }
  await tx.done;
}

export async function updateReciprocityStatus(id: string, status: ReciprocityStatus): Promise<void> {
  await updateRecord(id, { reciprocityStatus: status });
}

export async function addRecord(record: RedPacket): Promise<void> {
  const db = await getDB();
  await db.add(STORE_NAME, record);
  await trimOldRecords();
}

export async function addRecords(records: RedPacket[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await Promise.all([
    ...records.map(record => tx.store.add(record)),
    tx.done,
  ]);
  await trimOldRecords();
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function getAllRecords(): Promise<RedPacket[]> {
  const db = await getDB();
  const records = await db.getAllFromIndex(STORE_NAME, 'createdAt');
  return records.reverse().map(migrateRecord);
}

export async function clearAllRecords(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

async function trimOldRecords(): Promise<void> {
  const db = await getDB();
  const records = await db.getAllFromIndex(STORE_NAME, 'createdAt');
  
  if (records.length > MAX_RECORDS) {
    const excess = records.length - MAX_RECORDS;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (let i = 0; i < excess; i++) {
      await tx.store.delete(records[i].id);
    }
    await tx.done;
  }
}

export async function importRecords(records: RedPacket[]): Promise<void> {
  await clearAllRecords();
  await addRecords(records);
}
