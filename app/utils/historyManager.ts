type Action = {
  do: () => Promise<void>;
  undo: () => Promise<void>;
};

class HistoryManager {
  // ... rest of the HistoryManager class code ...
}

export const historyManager = new HistoryManager();