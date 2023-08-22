import { Actor, ActorDamageCause } from "bdsx/bds/actor";
import { ActorDamageByActorSource, ActorDamageByActorSourceCtor } from "./hooking/actordamagesource";

export function damageEntity(entity: Actor, attacker: Actor, damage: number, cause: ActorDamageCause, knock = false, ignite = false): void {
    const source = new ActorDamageByActorSource(true);
    ActorDamageByActorSourceCtor(source, attacker, cause);
    (entity as any).hurt_(source, damage, knock, ignite);
    source.destruct();
}
