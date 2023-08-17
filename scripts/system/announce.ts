import { bedrockServer } from "bdsx/launcher";
import { command } from "../../bdsx/command";
import * as _ from "lodash";

command.register("announce", "fortest").overload((p, o, out)=>{
    _(bedrockServer.level.getPlayers()).forEach((player)=>{
        player.sendToastRequest("");
    });
}, {});