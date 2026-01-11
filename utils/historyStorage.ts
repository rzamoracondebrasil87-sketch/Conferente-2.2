import { WeighingRecord } from '../types';

const HISTORY_KEY = 'conferente_history';

/**
 * Save a weighing record to local storage history
 */
export const saveRecord = (record: WeighingRecord): void => {
  try {
    const existing = getHistory();
    const updated = [record, ...existing];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving history:', error);
  }
};

/**
 * Retrieve all weighing records from local storage
 */
export const getHistory = (): WeighingRecord[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
};

/**
 * Clear all weighing records
 */
export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
};

/**
 * Get records from the last N days
 */
export const getRecentRecords = (days: number): WeighingRecord[] => {
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
  return getHistory().filter(record => record.timestamp >= cutoffTime);
};