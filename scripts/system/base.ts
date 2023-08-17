import { CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bedrockServer } from "bdsx/launcher";
import { CxxString } from "bdsx/nativetype";

command.register("console", "콘솔 관련 명령을 실행합니다.", CommandPermissionLevel.Operator).overload((p, o, out)=>{
    const player = o.getEntity();
    if (!player?.isPlayer()) return;

    if (p.enums === "help") {
        player.sendMessage("§7/console help - 이 도움말을 엽니다.\n/console command <arg1> - 콘솔을 주체로 명령어를 실행합니다.\n/console stop - 서버를 닫습니다 (배치 파일에 의해 재시작됨)");
    } else if (p.enums === "command") {
        if (p.arg1) {
            bedrockServer.executeCommandOnConsole(p.arg1);

            player.sendMessage("§6명령을 실행했습니다.");
        } else {
            player.sendMessage("§c명령을 실패하였습니다.");
        }
    } else if (p.enums === "stop") {
        bedrockServer.stop();
    }
}, {
    enums: command.enum("console.enums", "help", "stop", "command"),
    arg1: [CxxString, true],
    arg2: [CxxString, true],
});