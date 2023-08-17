import { bedrockServer } from "bdsx/launcher";
import { command } from "../../bdsx/command";
import * as _ from "lodash";

command.register("announce", "fortest").overload((p, o, out)=>{
    _(bedrockServer.level.getPlayers()).forEach((player)=>{
        player.sendToastRequest("§l§7시간표 알림", "§l1교시가 시작되었습니다.");
    });
}, {});