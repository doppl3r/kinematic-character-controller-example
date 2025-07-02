/*
  A command contains an "execute" and an "undo" function
*/

class Command {
  constructor(execute, undo) {
    this.execute = execute;
    this.undo = undo;
  }
}

/*
  History contains an array of commands that can
  be iterated by the current index
*/

class History {
  constructor() {
    this.commands = [];
    this.current = -1;
  }

  add(execute, undo) {
    const command = new Command(execute, undo);
    this.commands.splice(this.current + 1); // Clear redo history
    this.commands.push(command);
    this.current++;
    return command;
  }

  undo() {
    if (this.canUndo()) {
      this.commands[this.current].undo();
      this.current--;
    }
  }

  redo() {
    if (this.canRedo()) {
      this.current++;
      this.commands[this.current].execute();
    }
  }

  canUndo() {
    return this.current >= 0;
  }

  canRedo() {
    return this.current < this.commands.length - 1;
  }
}

export { Command, History };