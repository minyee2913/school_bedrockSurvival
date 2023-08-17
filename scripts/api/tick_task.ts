import { events } from "bdsx/event";
import _ = require("lodash");

const queue = new Map<number, Function[]>();
let currentTick = 0;

export function tickTask(delay: number, task: Function): void {
    if (delay === 0) {
        task();
    }

    const tick = currentTick + delay;

    let taskList = queue.get(tick);
    if (!taskList) {
        taskList = [];
    }

    taskList[taskList.length] = task;
    queue.set(tick, taskList);
}

events.levelTick.on((_ev) => {
    currentTick++;

    const taskList = queue.get(currentTick);
    if (taskList instanceof Array) {
        _(taskList).forEach((task) => {
            if (task instanceof Function) task();
        });
    }
});
