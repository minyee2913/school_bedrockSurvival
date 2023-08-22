import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { applyDash } from "./dash";
import { applyMenu } from "./menu";

events.playerJoin.on((ev)=>{
    bedrockServer.executeCommand("gamerule sendcommandfeedback false");
    bedrockServer.executeCommand("gamerule showtags true");
    bedrockServer.executeCommand("gamerule dodaylightcycle false");
    bedrockServer.executeCommand("gamerule keepinventory true");

    applyDash(ev.player);
    applyMenu(ev.player);
});

events.playerRespawn.on((ev)=>{
    ev.player.runCommand("replaceitem entity @s slot.hotbar 0 iron_axe");
    applyDash(ev.player);
    applyMenu(ev.player);
});
