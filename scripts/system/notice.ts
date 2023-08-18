import { Form } from "bdsx/bds/form";
import { events } from "bdsx/event";
import { Disconnect } from "../api/disconnect";

events.playerJoin.on((ev)=>{
    setTimeout(async ()=>{
        if (!ev.player.ctxbase.isValid()) return;

        if (ev.player.hasTag("alreadyJoin")) {
            const result = await Form.sendTo(ev.player.getNetworkIdentifier(), {
                type: "form",
                title: "§l학교 공지",
                content: "<unknown>",
                buttons: [],
            });

        } else {
            ev.player.addTag("alreadyJoin");

            ev.player.runCommand("give @s iron_axe");

            const result = await Form.sendTo(ev.player.getNetworkIdentifier(), {
                type: "modal",
                title: "§l환영",
                content: "§l선린 서바이벌에 오신 것을 환영합니다!\n\n이곳에서는 무엇을 해도 상관없습니다! 분쟁! 싸움! 전부 알아서 해결하세요!\n치트 사용이 꺼져있으며 게임 플레이에 재미를 위한 특수한 기능이 몇가지 존재합니다!\n\n그럼 즐겁게 플레이하세요!\n\n§7made by minyee2913",
                button1: "확인",
                button2: "취소"
            });

            if (result === false) Disconnect(ev.player.getNetworkIdentifier(), "§c그럼 나가야죠 뭐");
        }
    }, 500);
});
