import { ActorRuntimeID } from "bdsx/bds/actor";
import { CommandPermissionLevel } from "bdsx/bds/command";
import { AnimateEntityPacket } from "bdsx/bds/packets";
import { ServerPlayer } from "bdsx/bds/player";
import { command } from "bdsx/command";
import { CxxVector } from "bdsx/cxxvector";
import { CxxString, float32_t, int16_t, void_t } from "bdsx/nativetype";
import { procHacker } from "bdsx/prochacker";

const runtimeVector = CxxVector.make(ActorRuntimeID);

export function playAnimation(player: ServerPlayer, runtimeID: ActorRuntimeID, animation: string, next_state = "default", blend_out_time = 0, stop_expression = "query.any_animation_finished", controller = "__runtime_controller"): void {
    const pkt = AnimateEntityPacket.allocate();

    const ids = runtimeVector.construct();
    ids.push(runtimeID);

    AnimateEntityPacket$$AnimateEntityPacket(pkt, ids, animation, next_state, blend_out_time, stop_expression, 1, controller);

    pkt.sendTo(player.getNetworkIdentifier());
    pkt.dispose();
}

setTimeout(()=>{
    command.register("selfanimation", "플레이어에게 자신만 보이는 애니메이션을 실행합니다.", CommandPermissionLevel.Operator).overload((p, o, out)=>{
        const entity = o.getEntity();
        if (!entity?.isPlayer()) return;

        playAnimation(entity, entity.getRuntimeID(), p.animation, p.next_state, p.blend_out_time, p.stop_expression, p.controller);
    }, {
        animation: CxxString,
        next_state: [CxxString, true],
        blend_out_time: [float32_t, true],
        stop_expression: [CxxString, true],
        controller: [CxxString, true],
    });
}, 1145);

const AnimateEntityPacket$$AnimateEntityPacket = procHacker.js("??0AnimateEntityPacket@@QEAA@AEBV?$vector@VActorRuntimeID@@V?$allocator@VActorRuntimeID@@@std@@@std@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@2@1M1W4MolangVersion@@1@Z", void_t, null, AnimateEntityPacket, CxxVector.make(ActorRuntimeID.ref()), CxxString, CxxString, float32_t, CxxString, int16_t, CxxString);
