type Command = {
  execute: () => void;
  undo: () => void;
};

class History {
  private commands: Command[] = [];
  private currentIndex: number = -1;

  execute(command: Command) {
    this.commands = this.commands.slice(0, this.currentIndex + 1);
    this.commands.push(command);
    this.currentIndex++;
    command.execute();
  }

  undo() {
    if (this.currentIndex >= 0) {
      const command = this.commands[this.currentIndex];
      command.undo();
      this.currentIndex--;
    }
  }

  redo() {
    if (this.currentIndex < this.commands.length - 1) {
      this.currentIndex++;
      const command = this.commands[this.currentIndex];
      command.execute();
    }
  }
}

export const history = new History();