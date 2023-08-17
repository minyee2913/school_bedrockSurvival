import { Actor, ActorDamageCause } from "bdsx/bds/actor";
import { Player } from "bdsx/bds/player";
import { bool_t, int32_t } from "bdsx/nativetype";
import { Wrapper } from "bdsx/pointer";
import { procHacker } from "bdsx/prochacker";

const sourceWrapper = Wrapper.make(int32_t);
const playerAttack_ = procHacker.js("?attack@Player@@UEAA_NAEAVActor@@AEBW4ActorDamageCause@@@Z", bool_t, null, Player, Actor, sourceWrapper);

export function playerAttack(player: Player, entity: Actor): boolean {
    const wrapper = new sourceWrapper(true);
    wrapper.value = ActorDamageCause.EntityAttack;

    const result = playerAttack_(player, entity, wrapper);
    wrapper.destruct();

    return result;
}
