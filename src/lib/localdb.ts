import Dexie, { Table } from "dexie";

export interface SyncRecord {
  id?: number;
  collectionName: string;
  action: "create" | "update" | "delete";
  data: any;
  timestamp: number;
}

export class JazQuranDB extends Dexie {
  syncQueue!: Table<SyncRecord>;

  constructor() {
    super("JazQuranDB");
    this.version(1).stores({
      syncQueue: "++id, collectionName, action, timestamp",
    });
  }
}

export const db = new JazQuranDB();

export async function addToSyncQueue(
  collectionName: string,
  action: "create" | "update" | "delete",
  data: any,
) {
  try {
    await db.syncQueue.add({
      collectionName,
      action,
      data,
      timestamp: Date.now(),
    });
    return true;
  } catch (error) {
    console.error("Failed to add to sync queue:", error);
    return false;
  }
}

export async function getSyncQueue() {
  return await db.syncQueue.orderBy("timestamp").toArray();
}

export async function removeSyncRecords(ids: number[]) {
  return await db.syncQueue.bulkDelete(ids);
}
