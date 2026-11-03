import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadTestHistory, saveHistoryEntry, deleteHistoryEntry, clearTestHistory, getHistoryEntry } from './testHistory';

// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('testHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty array when no history exists', () => {
    const history = loadTestHistory();
    expect(history).toEqual([]);
  });

  it('should save and load a history entry', () => {
    const entry = {
      url: '/results?est=65&rep=32.5&pod=70&eco=60&fed=50&sec=40&civ=30&soc=20&rel=10&pro=5&mil=15&nat=25&religion=catholic',
      matchName: 'Social Democracy',
      matchType: 'ideology' as const,
      matchSlug: 'social-democracy',
      religion: 'catholic',
      scores: {
        est: 65,
        rep: 32.5,
        pod: 70,
        eco: 60,
        fed: 50,
        sec: 40,
        civ: 30,
        soc: 20,
        rel: 10,
        pro: 5,
        mil: 15,
        nat: 25,
      },
      answersRecord: { q1: 'AGREE', q2: 'STRONGLY_AGREE' },
    };

    saveHistoryEntry(entry);
    const history = loadTestHistory();

    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject(entry);
    expect(history[0].id).toBeDefined();
    expect(history[0].timestamp).toBeDefined();
    expect(history[0].date).toBeDefined();
  });

  it('should store multiple entries sorted by timestamp descending', () => {
    const baseEntry = {
      url: '/results?est=65&rep=32.5&pod=70&eco=60&fed=50&sec=40&civ=30&soc=20&rel=10&pro=5&mil=15&nat=25&religion=catholic',
      matchName: 'Test',
      matchType: 'ideology' as const,
      matchSlug: 'test',
      religion: 'catholic',
      scores: {
        est: 65,
        rep: 32.5,
        pod: 70,
        eco: 60,
        fed: 50,
        sec: 40,
        civ: 30,
        soc: 20,
        rel: 10,
        pro: 5,
        mil: 15,
        nat: 25,
      },
      answersRecord: {},
    };

    saveHistoryEntry({ ...baseEntry, matchName: 'First' });
    saveHistoryEntry({ ...baseEntry, matchName: 'Second' });
    saveHistoryEntry({ ...baseEntry, matchName: 'Third' });

    const history = loadTestHistory();
    expect(history).toHaveLength(3);
    expect(history[0].matchName).toBe('Third'); // Most recent first
    expect(history[1].matchName).toBe('Second');
    expect(history[2].matchName).toBe('First');
  });

  it('should limit history to MAX_HISTORY entries', () => {
    const baseEntry = {
      url: '/results',
      matchName: 'Test',
      matchType: 'ideology' as const,
      matchSlug: 'test',
      religion: 'catholic',
      scores: {
        est: 65,
        rep: 32.5,
        pod: 70,
        eco: 60,
        fed: 50,
        sec: 40,
        civ: 30,
        soc: 20,
        rel: 10,
        pro: 5,
        mil: 15,
        nat: 25,
      },
      answersRecord: {},
    };

    // Save 55 entries (MAX_HISTORY is 50)
    for (let i = 0; i < 55; i++) {
      saveHistoryEntry({ ...baseEntry, matchName: `Test ${i}` });
    }

    const history = loadTestHistory();
    expect(history).toHaveLength(50); // Should only keep 50
    expect(history[0].matchName).toBe('Test 54'); // Most recent
    expect(history[49].matchName).toBe('Test 5'); // Oldest kept
  });

  it('should delete a specific entry by id', () => {
    const baseEntry = {
      url: '/results',
      matchName: 'Test',
      matchType: 'ideology' as const,
      matchSlug: 'test',
      religion: 'catholic',
      scores: {
        est: 65,
        rep: 32.5,
        pod: 70,
        eco: 60,
        fed: 50,
        sec: 40,
        civ: 30,
        soc: 20,
        rel: 10,
        pro: 5,
        mil: 15,
        nat: 25,
      },
      answersRecord: {},
    };

    saveHistoryEntry({ ...baseEntry, matchName: 'First' });
    saveHistoryEntry({ ...baseEntry, matchName: 'Second' });
    saveHistoryEntry({ ...baseEntry, matchName: 'Third' });

    let history = loadTestHistory();
    const idToDelete = history[1].id;

    deleteHistoryEntry(idToDelete);
    history = loadTestHistory();

    expect(history).toHaveLength(2);
    expect(history.find((e) => e.id === idToDelete)).toBeUndefined();
  });

  it('should clear all history', () => {
    const baseEntry = {
      url: '/results',
      matchName: 'Test',
      matchType: 'ideology' as const,
      matchSlug: 'test',
      religion: 'catholic',
      scores: {
        est: 65,
        rep: 32.5,
        pod: 70,
        eco: 60,
        fed: 50,
        sec: 40,
        civ: 30,
        soc: 20,
        rel: 10,
        pro: 5,
        mil: 15,
        nat: 25,
      },
      answersRecord: {},
    };

    saveHistoryEntry(baseEntry);
    saveHistoryEntry(baseEntry);
    saveHistoryEntry(baseEntry);

    expect(loadTestHistory()).toHaveLength(3);

    clearTestHistory();
    expect(loadTestHistory()).toEqual([]);
  });

  it('should get a single entry by id', () => {
    const entry = {
      url: '/results',
      matchName: 'Test Entry',
      matchType: 'personality' as const,
      matchSlug: 'test-entry',
      religion: 'none',
      scores: {
        est: 50,
        rep: 50,
        pod: 50,
        eco: 50,
        fed: 50,
        sec: 50,
        civ: 50,
        soc: 50,
        rel: 50,
        pro: 50,
        mil: 50,
        nat: 50,
      },
      answersRecord: { q1: 'AGREE', q2: 'NEUTRAL' },
    };

    saveHistoryEntry(entry);
    const history = loadTestHistory();
    const savedEntry = getHistoryEntry(history[0].id);

    expect(savedEntry).not.toBeNull();
    expect(savedEntry?.matchName).toBe('Test Entry');
    expect(savedEntry?.matchType).toBe('personality');
  });

  it('should return null for non-existent id', () => {
    const entry = getHistoryEntry('non-existent-id');
    expect(entry).toBeNull();
  });

  it('should handle corrupt localStorage data gracefully', () => {
    localStorage.setItem('12axes-test-history', 'invalid json');
    const history = loadTestHistory();
    expect(history).toEqual([]);
  });

  it('should filter out invalid entries', () => {
    const validEntry = {
      id: 'valid',
      timestamp: Date.now(),
      date: new Date().toISOString(),
      url: '/results',
      matchName: 'Valid',
      matchType: 'ideology' as const,
      matchSlug: 'valid',
      religion: 'catholic',
      scores: {
        est: 50,
        rep: 50,
        pod: 50,
        eco: 50,
        fed: 50,
        sec: 50,
        civ: 50,
        soc: 50,
        rel: 50,
        pro: 50,
        mil: 50,
        nat: 50,
      },
      answersRecord: {},
    };

    const invalidEntry = {
      id: 'invalid',
      timestamp: Date.now(),
      // Missing required fields
    };

    localStorage.setItem('12axes-test-history', JSON.stringify([validEntry, invalidEntry]));

    const history = loadTestHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe('valid');
  });
});
