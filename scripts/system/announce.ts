import { bedrockServer } from "bdsx/launcher";
import { command } from "../../bdsx/command";
import * as _ from "lodash";
import * as schedule from "node-schedule";
import { events } from "bdsx/event";

const jobs: schedule.Job[] = [];

jobs[0] = schedule.scheduleJob("* 30 8 * *", ()=>{
    _(bedrockServer.level.getPlayers()).forEach((player)=>{
        player.sendToastRequest("§7시간표 알림", "10분 동안 조회 시간입니다.");
    });
});

let time = 1;
for (let i = 1; i <= 12; i+=2) {
    jobs[i] = schedule.scheduleJob(`* 30 ${7 + time} * *`, ()=>{
        _(bedrockServer.level.getPlayers()).forEach((player)=>{
            player.sendToastRequest("§7시간표 알림", "10분 동안 조회 시간입니다.");
        });
    });

    jobs[i + 1] = schedule.scheduleJob(`* 40 ${7 + time} * *`, ()=>{
        _(bedrockServer.level.getPlayers()).forEach((player)=>{
            player.sendToastRequest("§7시간표 알림", `${time}교시가 시작됩니다.`);
        });
    });

    time++;
}

events.serverLeave.on(()=>{
    jobs.forEach((v)=>{
        v.cancel();
    });
});
