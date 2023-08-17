import { Actor, ActorDefinitionIdentifier, ActorType, ActorUniqueID, Mob } from "bdsx/bds/actor";
import { Vec3 } from "bdsx/bds/blockpos";
import { HitResult, ProjectileComponent } from "bdsx/bds/components";
import { VectorXYZ } from "bdsx/common";
import { Event } from "bdsx/eventtarget";
import { bedrockServer } from "bdsx/launcher";
import { void_t } from "bdsx/nativetype";
import { procHacker } from "bdsx/prochacker";
import { setDestroyOnErr } from "./destroy_err_entity";
import { calcFacingPos } from "./facing";

export class projectileHitEntity {
    constructor(public component: ProjectileComponent, public shooter: Mob | null, public projectile: Actor, public hitResult: HitResult) {}
}

const projectileEvent = Symbol("projectileEvent");

declare module "bdsx/bds/actor" {
    interface Actor {
        [projectileEvent]?: (ev: projectileHitEntity) => void;
    }
}

export namespace Projectile {
    export function shoot(
        shooter: Actor,
        projectileIdentifier: string,
        offsets: VectorXYZ | null = null,
        spawnEv: string | null = null,
        onHit?: (ev: projectileHitEntity) => void,
        despawn = true,
    ): Actor | null {
        const offset = offsets ?? { x: 0, y: 1, z: 0 };

        const pos = calcFacingPos(shooter, 1.5, Vec3.create(offset));

        return shootAt(shooter, projectileIdentifier, pos, spawnEv, onHit, despawn);
    }

    export function shootAt(
        shooter: Actor,
        projectileIdentifier: string,
        pos: Vec3,
        spawnEv: string | null = null,
        onHit?: (ev: projectileHitEntity) => void,
        despawn = true,
    ): Actor | null {
        const spawnEvent = spawnEv ?? "minecraft:entity_created";

        const defId = ActorDefinitionIdentifier.constructWith(ActorType.Mob);
        defId.canonicalName.set(projectileIdentifier);
        defId.fullName = projectileIdentifier;
        defId.initEvent = spawnEvent;
        defId.namespace = projectileIdentifier.split(":")[0];
        defId.identifier = projectileIdentifier;

        const projectile = Actor.summonAt(shooter.getRegion(), pos, defId, bedrockServer.level.getNewUniqueID(), shooter);
        defId.destruct();

        if (!projectile) return null;

        if (onHit) projectile[projectileEvent] = onHit;

        const shoot = shootActor(shooter, projectile, despawn);

        if (!shoot) return null;

        return projectile;
    }

    export function shootActor(shooter: Actor, projectile: Actor, despawn = true): ProjectileComponent | null {
        const component = getProjectileComponent(projectile);

        if (!component) return null;

        if (despawn) projectile.addTag("projectile_despawn");
        setOwner(projectile, shooter.getUniqueIdBin());
        setDestroyOnErr(projectile);
        setOwnerId(component, shooter.getUniqueIdBin());

        projectileShoot(component, projectile, shooter);

        return component;
    }

    export const onHit = new Event<(ev: projectileHitEntity) => void>();
}

function projectileHit(component: ProjectileComponent, projectile: Actor, hitResult: HitResult): void {
    const shooter = projectile.getOwner();

    const event = new projectileHitEntity(component, shooter, projectile, hitResult);

    if (projectile[projectileEvent]) projectile[projectileEvent](event);
    Projectile.onHit.fire(event);

    if (event.projectile.hasTag("projectile_despawn") && event.projectile.ctxbase.isValid()) event.projectile.despawn();

    return _projectileHit(event.component, event.projectile, event.hitResult);
}

const _projectileHit = procHacker.hooking(
    "?onHit@ProjectileComponent@@QEAAXAEAVActor@@AEBVHitResult@@@Z",
    void_t,
    null,
    ProjectileComponent,
    Actor,
    HitResult,
)(projectileHit);

const getProjectileComponent = procHacker.js("??$tryGetComponent@VProjectileComponent@@@Actor@@QEAAPEAVProjectileComponent@@XZ", ProjectileComponent, null, Actor);
const projectileShoot = procHacker.js("?shoot@ProjectileComponent@@QEAAXAEAVActor@@0@Z", void_t, null, ProjectileComponent, Actor, Actor);
const setOwnerId = procHacker.js("?setOwnerId@ProjectileComponent@@QEAAXUActorUniqueID@@@Z", void_t, null, ProjectileComponent, ActorUniqueID);

const setOwner = procHacker.js("?setOwner@Actor@@UEAAXUActorUniqueID@@@Z", void_t, null, Actor, ActorUniqueID);
/**
 * @deprecated use actor.getOwner instead
 */
export const getOwner = procHacker.js("?getOwner@Actor@@QEBAPEAVMob@@XZ", Mob, null, Actor);

// const isHit = procHacker.js("?isHit@HitResult@@QEBA_NXZ", bool_t, null, HitResult);
