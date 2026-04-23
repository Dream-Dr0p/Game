// ==================== src/battle/MoveAction.js ====================
import Action from './Action.js';

class MoveAction extends Action {
  constructor(targetPos, previewPath = []) {
    super(20); // cost per grid, but will be multiplied by steps in execute
    this.targetPos = targetPos;
    this.previewPath = previewPath;
  }

  showPreview() {}
  execute() {}
}

export default MoveAction;