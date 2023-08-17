import { CommandMessage, CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bedrockServer } from "bdsx/launcher";
import { CxxString } from "bdsx/nativetype";
import { exec } from "child_process";

command.register("console", "콘솔 관련 명령을 실행합니다.", CommandPermissionLevel.Operator).overload((p, o, out)=>{
    const player = o.getEntity();
    if (!player?.isPlayer()) return;

    let arg = p.arg1?.getMessage(o);

    if (p.enums_ === "help") {
        player.sendMessage("§7/console help - 이 도움말을 엽니다.\n/console command <string> - 콘솔을 주체로 명령어를 실행합니다.\n/console stop - 서버를 닫습니다 (배치 파일에 의해 재시작됨)\n/console bash <string> - 배치파일 명령을 실행합니다.");
    } else if (p.enums_ === "command") {
        if (arg) {
            bedrockServer.executeCommandOnConsole(arg);

            player.sendMessage("§6명령을 실행했습니다.");
        } else {
            player.sendMessage("§c명령을 실패하였습니다.");
        }
    } else if (p.enums_ === "stop") {
        bedrockServer.stop();
    } else if (p.enums_ === "bash") {
        if (arg) exec(arg);
    }
}, {
    enums_: command.enum("console.enum_", "help", "stop", "command", "bash"),
    arg1: [CommandMessage, true],
});