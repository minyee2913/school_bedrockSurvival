import { bedrockServer } from "bdsx/launcher";
import * as _ from "lodash";
import { events } from "bdsx/event";

interface timeData {
    time: number;
    minute: number;
    display: string;
}

const timeset:timeData[] = [];

timeset.push(
    {
        time: 8,
        minute: 30,
        display: "아침 조회가 시작되었습니다."
    },
    {
        time: 8,
        minute: 39,
        display: "아침 조회가 곧 끝납니다."
    }
);

for (let i = 0; i < 4; i++) {
    timeset.push(
        {
            time: 8 + i,
            minute: 40,
            display: `${i}교시가 시작되었습니다.`
        },
        {
            time: 9 + i,
            minute: 30,
            display: `${i}교시가 끝났습니다.`
        }
    );
}

timeset.push(
    {
        time: 12,
        minute: 30,
        display: "점심 시간이 시작되었습니다."
    },
    {
        time: 13,
        minute: 29,
        display: "점심 시간이 곧 끝납니다."
    }
);

for (let i = 0; i < 2; i++) {
    timeset.push(
        {
            time: 13 + i,
            minute: 30,
            display: `${5 + i}교시가 시작되었습니다.`
        },
        {
            time: 14 + i,
            minute: 20,
            display: `${5 + i}교시가 끝났습니다.`
        }
    );
}

let tick = 0;
let current = 0;
events.levelTick.on(ev=>{
    tick++;

    if (tick >= 2) {
        tick = 0;

        const date = new Date();
        const hour = date.getHours();
        const min = date.getMinutes();

        bedrockServer.executeCommand(`say ${hour}`);

        _(timeset).forEach((v, i)=>{
            console.log(v);
            if (current === i) return;
            if (v.time !== hour || v.minute !== min) return;

            _(bedrockServer.level.getPlayers()).forEach((p)=>{
                p.sendToastRequest("§7시간표 알림", `§f${v.display}`);
            });

            current = i;
        });
    }
});
