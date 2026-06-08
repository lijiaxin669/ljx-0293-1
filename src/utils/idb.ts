import { openDB, type IDBPDatabase } from 'idb';
import type { RedPacket } from '../types';
import { MAX_RECORDS } from '../types';

const DB_NAME = 'redPacketDB';
const DB_VERSION = 1;
const STORE_NAME = 'records';

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });
        store.createIndex('date', 'date');
        store.createIndex('createdAt', 'createdAt');
      }
    },
  });

  return dbInstance;
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
  return records.reverse();
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
