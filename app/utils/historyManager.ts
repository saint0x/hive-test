type Action = {
    do: () => Promise<void>;
    undo: () => Promise<void>;
  };
  
  class HistoryManager {
    private actions: Action[] = [];
    private currentIndex: number = -1;
  
    async execute(action: Action) {
      this.actions = this.actions.slice(0, this.currentIndex + 1);
      this.actions.push(action);
      this.currentIndex++;
      await action.do();
    }
  
    async undo() {
      if (this.currentIndex >= 0) {
        await this.actions[this.currentIndex].undo();
        this.currentIndex--;
      }
    }
  
    async redo() {
      if (this.currentIndex < this.actions.length - 1) {
        this.currentIndex++;
        await this.actions[this.currentIndex].do();
      }
    }
  
    canUndo() {
      return this.currentIndex >= 0;
    }
  
    canRedo() {
      return this.currentIndex < this.actions.length - 1;
    }
  }
  
  export const historyManager = new HistoryManager();