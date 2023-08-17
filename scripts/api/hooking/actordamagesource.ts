import { Actor, ActorDamageSource } from "bdsx/bds/actor";
import { nativeClass } from "bdsx/nativeclass";
import { int32_t, void_t } from "bdsx/nativetype";
import { procHacker } from "bdsx/prochacker";

@nativeClass(0x50)
export class ActorDamageByActorSource extends ActorDamageSource {}

export const ActorDamageByActorSourceCtor = procHacker.js(
    "??0ActorDamageByActorSource@@QEAA@AEBVActor@@W4ActorDamageCause@@@Z",
    void_t,
    null,
    ActorDamageByActorSource,
    Actor,
    int32_t,
);
