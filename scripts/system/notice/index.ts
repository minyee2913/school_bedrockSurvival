import { Form } from "bdsx/bds/form";
import { events } from "bdsx/event";
import { Disconnect } from "../../api/disconnect";
import { ServerPlayer } from "bdsx/bds/player";
import { readFileSync, readdir, readdirSync } from "fs";
import * as path from "path";

interface Notice {
    title: string,
    context: string,
    month: number,
    day: number,
}

const localfile = path.dirname(__filename) + "\\files";

function iireadFiles(): void {
    readdir(localfile, (err, file) => {
        notices.clear();
        file.forEach((v) => {
            const fls = readdirSync(localfile + "/" + v);
            fls.forEach((x) => {
                const js = JSON.parse(readFileSync(localfile + "/" + v + "/" + x, "utf8"));
                if (x.endsWith(".json")) {
                    notices.set(x.replace(".json", ""), js);
                }
            });
        });
    });
}

const notices = new Map<string, Notice>();

iireadFiles();

events.playerJoin.on((ev)=>{
    setTimeout(async ()=>{
        if (!ev.player.ctxbase.isValid()) return;

        if (ev.player.hasTag("alreadyJoin")) {
            Notice(ev.player);

        } else {
            ev.player.addTag("alreadyJoin");

            ev.player.runCommand("give @s iron_axe");
            ev.player.runCommand("give @s bread 8");

            const result = await Form.sendTo(ev.player.getNetworkIdentifier(), {
                type: "modal",
                title: "§l환영",
                content: "선린 서바이벌에 오신 것을 환영합니다!\n\n이곳에서는 무엇을 해도 상관없습니다! 분쟁! 싸움! 전부 알아서 해결하세요!\n치트 사용이 꺼져있으며 게임 플레이에 재미를 위한 특수한 기능이 몇가지 존재합니다!\n\n그럼 즐겁게 플레이하세요!\n\n§7made by minyee2913",
                button1: "확인",
                button2: "취소"
            });

            if (result === false) Disconnect(ev.player.getNetworkIdentifier(), "§c그럼 나가야죠 뭐");
        }
    }, 500);
});

export async function Notice(player: ServerPlayer) {
    const buttons: {text: string, id: string,}[] = [];

    notices.forEach((v, k)=>{
        buttons.push({
            text: `§l${v.title} (${v.month}/${v.day})`,
            id: k,
        });
    });
    const result = await Form.sendTo(player.getNetworkIdentifier(), {
        type: "form",
        title: "§l학교 공지",
        content: "",
        buttons: buttons,
    });

    if (result === null) return;
    const select = buttons[result];
    if (!select) return;

    NoticeInfo(player, select.id);
}

export async function NoticeInfo(player: ServerPlayer, id: string) {
    const notice = notices.get(id);
    if (!notice) return;

    const result = await Form.sendTo(player.getNetworkIdentifier(), {
        type: "form",
        title: `§l${notice.title} (${notice.month}/${notice.day})`,
        content: notice.context + "\n\n§l",
        buttons: [
            {
                text: "§l돌아가기"
            }
        ],
    });

    Notice(player);
}