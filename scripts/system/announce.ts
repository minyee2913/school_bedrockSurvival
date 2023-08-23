import { bedrockServer } from "bdsx/launcher";
import * as _ from "lodash";
import { events } from "bdsx/event";
import { Sidebar } from "../api/sidebar";

interface timeData {
    time: number;
    minute: number;
    display: string;
    sign: string;
}

const timeset:timeData[] = [];

timeset.push(
    {
        time: 8,
        minute: 30,
        display: "아침 조회가 시작되었습니다.",
        sign: "조회 시간",
    },
    {
        time: 8,
        minute: 39,
        display: "아침 조회가 곧 끝납니다.",
        sign: "조회 시간",
    }
);

for (let i = 0; i < 4; i++) {
    timeset.push(
        {
            time: 8 + i,
            minute: 40,
            display: `${i + 1}교시가 시작되었습니다.`,
            sign: `${i + 1}교시`,
        },
        {
            time: 9 + i,
            minute: 30,
            display: `${i + 1}교시가 끝났습니다.`,
            sign: "쉬는 시간"
        }
    );
}

timeset.push(
    {
        time: 12,
        minute: 31,
        display: "점심 시간이 시작되었습니다.",
        sign: "점심 시간"
    },
    {
        time: 13,
        minute: 29,
        display: "점심 시간이 곧 끝납니다.",
        sign: "점심 시간"
    }
);

for (let i = 0; i < 2; i++) {
    timeset.push(
        {
            time: 13 + i,
            minute: 30,
            display: `${5 + i}교시가 시작되었습니다.`,
            sign: `${5 + i}교시`
        },
        {
            time: 14 + i,
            minute: 20,
            display: `${5 + i}교시가 끝났습니다.`,
            sign: "쉬는 시간"
        }
    );
}

events.playerJoin.on((ev)=>{
    Sidebar.get(ev.player)
    .setElement(1, 1, `§7`)
    .display();
});

let tick = 0;
let current = -1;
events.levelTick.on(ev=>{
    tick++;

    if (tick >= 2) {
        tick = 0;

        const date = new Date();

        const utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
        const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
        const kr_date = new Date(utc + (KR_TIME_DIFF));

        const hour = kr_date.getHours();
        const min = kr_date.getMinutes();

        const minecraftTime = (kr_date.getHours() * 60 + kr_date.getMinutes()) / 60 * 1000 - 6000;
        bedrockServer.executeCommand("/time add -24000");
        bedrockServer.executeCommand("/time set " + minecraftTime);

        _(bedrockServer.level.getPlayers()).forEach((p)=>{
            const sidebar = Sidebar.get(p);

            sidebar.removeElement(1);
            sidebar.setElement(1, 1, `§f현재 시간: §7${hour}시 ${min}분`);
            sidebar.setElement(2, 2, `§a`);
            sidebar.setElement(3, 3, `§a(${bedrockServer.level.getActivePlayerCount()} / 20) online`);

            sidebar.removeElement(0);
            if (hour < 17 && hour >= 8)
                if (current >= 0) sidebar.setElement(0, 0, timeset[current].sign);
        });

        _(timeset).forEach((v, i)=>{
            if (current === i) return;
            if (v.time !== hour || v.minute !== min) return;

            _(bedrockServer.level.getPlayers()).forEach((p)=>{
                p.sendToastRequest("§7시간표 알림", `§f${v.display}`);
            });

            current = i;
        });
    }
});
