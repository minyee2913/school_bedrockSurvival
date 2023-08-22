import { CommandPermissionLevel } from "bdsx/bds/command";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { BossEventPacket, ContainerClosePacket } from "bdsx/bds/packets";
import { ServerPlayer } from "bdsx/bds/player";
import { command } from "bdsx/command";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { CxxString, bool_t, int32_t } from "bdsx/nativetype";
import { Sleep } from "../api/camera";
import { Disconnect } from "../api/disconnect";
import _ = require("lodash");
//import * as scheduler from "node-schedule";

// import { activeDungeons, outDungeon } from "../dungeon";

const DEFAULT_STOP_COUNT = 10;
const DEFAULT_STOP_MESSAGE = "§a재부팅...";

let closeReserved = false;

export function CloseReserved(): boolean {
    return closeReserved;
}
const REBOOT_SCHEDULE_RESERVED = "서버 재부팅 예약됨";
const REBOOT_SCHEDULE_CANCELED = "서버 재부팅 예약 취소됨";
//const reservedSchedules = new Set<scheduler.Job>();
command.register("reservestop", "던전 입장을 막고, 모든 던전이 닫히면 10초 뒤 재부팅 됩니다. true - 예약 | false - 취소", CommandPermissionLevel.Operator).overload(
    (p) => {
        p.reserved = p.reserved ?? true;
        if (p.reserved) {
            /* const f = activeDungeons.find((v) => v.dun.identi === "tester_dun"); //훈련장은 플레이어가 없을 때까지 절대로 끝나지 않으므로 수동으로 끝냄
            if (f)
                f.getJoinedPlayers().forEach((v) => {
                    const actor = IdByName(v.name)?.getActor();
                    if (actor) outDungeon(actor);
                });
 */

            _.forEach(bedrockServer.serverInstance.getPlayers(), (player) => {
                player.playSound("random.orb");
                player.sendMessage(`§a${REBOOT_SCHEDULE_RESERVED}`);
            });

            console.log(REBOOT_SCHEDULE_RESERVED.green);
            // if (!closeReserved) {
            //     const rebootSchedule = scheduler.scheduleJob("*/10 * * * * *", () => {
            //         if (activeDungeons.length === 0) {
            //             reboot();
            //             rebootSchedule.cancel();
            //         }
            //     });
            //     reservedSchedules.add(rebootSchedule);
            // }
            closeReserved = true;
        } else {
            _.forEach(bedrockServer.serverInstance.getPlayers(), (player) => {
                player.playSound("random.orb");
                player.sendMessage(`§c${REBOOT_SCHEDULE_CANCELED}`);
            });
            console.log(REBOOT_SCHEDULE_CANCELED.red);
            closeReserved = false;
            // for (const e of reservedSchedules.values()) {
            //     e.cancel();
            // }
        }
    },
    { reserved: [bool_t, true] },
);

setTimeout(() => {
    command.register("stopstack", "서버종료 카운트다운", CommandPermissionLevel.Operator).overload(
        (p) => {
            p.count = p.count ?? DEFAULT_STOP_COUNT;
            p.message = p.message ?? DEFAULT_STOP_MESSAGE;
            reboot(p.message, p.count);
            if (p.count === 61) bedrockServer.executeCommand('tellraw @a {"rawtext":[{"text":"§a§l1분 후 서버가 재부팅됩니다"}]}');
        },
        {
            count: [int32_t, true],
            message: [CxxString, true],
        },
    );
    command.register("재부팅", "재부팅 여부를 투표합니다.").overload(
        (p, o) => {
            const entity = o.getEntity();
            if (!entity?.isPlayer()) return;

            if (p.enum === "개시") {
                startVote(entity);
            } else {
                rebootVote(entity, (p.enum === "찬성"));
            }
        },
        {
            enum: command.enum("reboot.what", "개시", "찬성", "반대"),
        },
    );
}, 1236);
let rebooting = false;
function reboot(message: string = DEFAULT_STOP_MESSAGE, count: number = DEFAULT_STOP_COUNT): void {
    console.log(`-------------------------\n${count}초 후에 재부팅됩니다\n-------------------------`.bgRed);
    if (rebooting) console.log("이미 재부팅이 진행중입니다!");
    else {
        rebooting = true;
        let time = count;
        const a = setInterval(() => {
            time -= 1;

            if (time <= 10) {
                bedrockServer.executeCommand("execute as @a at @s run playsound note.harp @s");
                bedrockServer.executeCommand(`title @a subtitle §c§l서버가 ${time}초 후에 재부팅됩니다`);
                bedrockServer.executeCommand("title @a title §c");
            }
            _.forEach(bedrockServer.serverInstance.getPlayers(), (player) => {
                if (time <= 3) {
                    const pk = ContainerClosePacket.allocate();
                    pk.server = true;
                    pk.sendTo(player.getNetworkIdentifier());
                    pk.dispose();
                }
                if (time > 1) {
                    player.removeBossBar();
                    player.setBossBar(`§e§l재부팅까지 남은시간 ${time}s`, 1.0, BossEventPacket.Colors.Red);
                }
            });
            if (time <= 0) {
                clearTimeout(a);
                bedrockServer.serverInstance.disconnectAllClients(message);
                setTimeout(() => {
                    bedrockServer.stop();
                }, 60);
            }
        }, 1000);

        events.serverLeave.on(() => {
            clearInterval(a);
        });
    }
}

let isVoting = false;
const voted = new Set<NetworkIdentifier>();
const noVoted = new Set<NetworkIdentifier>();
let votedCool = 0;

async function startVote(player: ServerPlayer): Promise<void> {
    if (rebooting) {
        player.sendMessage("§c이미 재부팅이 진행중입니다.");

        return;
    }

    if (isVoting) {
        player.sendMessage("§c이미 투표가 진행중입니다.");

        return;
    }
    const now = _.now();

    if (votedCool > now) {
        player.sendMessage(`§c재투표까지 ${Math.floor((votedCool - now)/1000)}s 남았습니다.`);

        return;
    }

    isVoting = true;
    voted.clear();
    noVoted.clear();

    voted.add(player.getNetworkIdentifier());

    const playerCount = bedrockServer.level.getActivePlayerCount();
    if (playerCount <= 1) {
        reboot("§6§l투표에 의해 재부팅중...", 5);
        player.sendMessage("§a서버 내 인원이 한명이기에 즉시 재부팅을 시작합니다.");
    }

    const need = Math.floor(playerCount / 2 + 1);

    console.log("재부팅 투표 개시됨".bgBlue);

    _(bedrockServer.level.getPlayers()).forEach((v)=>{
        v.sendMessage(`§l§6${player.getName()}님이 재부팅 투표를 개시하였습니다. 5분 후까지 투표가 진행됩니다.\n§a찬성 (${voted.size})  §c반대 (${noVoted.size}) §e필요 찬성 인원 (${need})\n§f'/재부팅 <찬성 / 반대>' 명령어로 투표하세요!`);
        v.sendToastRequest("§7luminous", "§6재부팅 투표 개시됨!");
    });

    votedCool = now + 35 * 60000;

    await Sleep(5 * 60 * 1000);
    if (!isVoting) return;

    _(bedrockServer.level.getPlayers()).forEach((v)=>{
        v.sendMessage(`§l§9재부팅 투표가 끝났습니다.\n§f재투표까지 ${Math.floor((votedCool - _.now()) / 1000)}s 남음.`);
        v.sendToastRequest("§7luminous", "§f재부팅 투표가 종료됨!");
    });
}

function rebootVote(player: ServerPlayer, agree: boolean): void {
    if (!isVoting) {
        player.sendMessage("§c진행중인 투표가 없습니다.");

        return;
    }

    const need = Math.floor(bedrockServer.level.getActivePlayerCount() / 2 + 1);

    const target = player.getNetworkIdentifier();

    if (voted.has(target) || noVoted.has(target)) {
        player.sendMessage("§c이미 투표하였습니다.");

        return;
    }

    if (agree) {
        voted.add(target);

        _(bedrockServer.level.getPlayers()).forEach((v)=>{
            v.sendMessage(`§a${player.getName()}님이 재부팅 투표에 찬성하였습니다!\n§a(${voted.size}) §c(${noVoted.size}) §e(${need})`);
        });
    } else {
        noVoted.add(target);

        _(bedrockServer.level.getPlayers()).forEach((v)=>{
            v.sendMessage(`§c${player.getName()}님이 재부팅 투표에 반대하였습니다!\n§a(${voted.size}) §c(${noVoted.size}) §e(${need})`);
        });
    }

    if (voted.size >= need) {
        isVoting = false;

        _(bedrockServer.level.getPlayers()).forEach((v)=>{
            v.sendMessage("§l§6재부팅 투표가 가결되었습니다!");
            v.sendToastRequest("§7luminous", "§f재부팅 투표가 종료됨!");
        });

        reboot("§6§l투표에 의해 재부팅중...", 5);
    }
}

events.networkDisconnected.on((target)=>{
    if (isVoting) {
        if (voted.has(target)) voted.delete(target);
        else if (noVoted.has(target)) noVoted.delete(target);
    }
});

events.command.on((cmd, name, ctx)=>{
  if (cmd !== "/stop") return;
  if (ctx.origin.isServerCommandOrigin()) {
    bedrockServer.level.getPlayers().forEach((v)=>{
      Disconnect(v.getNetworkIdentifier(), "§7Server Disconnected");
    });
    console.log("saving data...");
    setTimeout(()=>{bedrockServer.stop();}, 60);
    return 0;
  }

});

events.serverClose.on(() => {
    setTimeout(() => {
        process.exit();
    }, 500);
});
