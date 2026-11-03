/**
 * Test History — stores every completed quiz result with timestamp and match info
 */

const STORAGE_KEY = '12axes-test-history';
const MAX_HISTORY = 50; // Keep last 50 results

export interface HistoryEntry {
  id: string;
  timestamp: number; // Unix timestamp in milliseconds
  date: string; // ISO 8601 formatted date for display
  url: string; // Full result URL
  matchName: string; // Top match ideology/personality name
  matchType: 'ideology' | 'personality' | 'country' | 'party';
  matchSlug: string; // For building profile links
  religion: string;
  scores: {
    est: number;
    rep: number;
    pod: number;
    eco: number;
    fed: number;
    sec: number;
    civ: number;
    soc: number;
    rel: number;
    pro: number;
    mil: number;
    nat: number;
  };
  // Store answers as Record to match SavedAnswers structure
  answersRecord: Record<string, string>;
  // Store the actual image/flag/logo path for display
  imagePath?: string;
}

/**
 * Load all history entries, sorted newest first
 */
export function loadTestHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Validate and sort by timestamp descending
    const valid = parsed.filter(isValidHistoryEntry);
    return valid.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.warn('[testHistory] Failed to load history:', err);
    return [];
  }
}

/**
 * Add a new history entry (called after completing quiz)
 */
export function saveHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp' | 'date'>): void {
  try {
    const history = loadTestHistory();
    
    const newEntry: HistoryEntry = {
      ...entry,
      id: generateEntryId(),
      timestamp: Date.now(),
      date: new Date().toISOString(),
    };
    
    // Add to front, trim to MAX_HISTORY
    const updated = [newEntry, ...history].slice(0, MAX_HISTORY);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[testHistory] Failed to save entry:', err);
  }
}

/**
 * Delete a specific history entry by ID
 */
export function deleteHistoryEntry(id: string): void {
  try {
    const history = loadTestHistory();
    const filtered = history.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('[testHistory] Failed to delete entry:', err);
  }
}

/**
 * Clear all history
 */
export function clearTestHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[testHistory] Failed to clear history:', err);
  }
}

/**
 * Get a single entry by ID
 */
export function getHistoryEntry(id: string): HistoryEntry | null {
  const history = loadTestHistory();
  return history.find(e => e.id === id) || null;
}

// --- Internal helpers ---

function isValidHistoryEntry(obj: unknown): obj is HistoryEntry {
  if (!obj || typeof obj !== 'object') return false;
  const e = obj as Partial<HistoryEntry>;
  
  return !!(
    typeof e.id === 'string' &&
    typeof e.timestamp === 'number' &&
    typeof e.date === 'string' &&
    typeof e.url === 'string' &&
    typeof e.matchName === 'string' &&
    (e.matchType === 'ideology' || e.matchType === 'personality' || e.matchType === 'country' || e.matchType === 'party') &&
    typeof e.matchSlug === 'string' &&
    typeof e.religion === 'string' &&
    e.scores &&
    typeof e.scores === 'object' &&
    e.answersRecord &&
    typeof e.answersRecord === 'object'
  );
}

function generateEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
