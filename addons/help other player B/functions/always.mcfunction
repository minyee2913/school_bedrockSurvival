#bridge-file-version: #92
scoreboard objectives add reset dummy
scoreboard objectives add heal dummy
scoreboard objectives add sta-t-e dummy "§f"
scoreboard objectives add twod dummy
scoreboard objectives add det dummy
effect @s[tag=ek] weakness 1 255 true
effect @s[tag=ek] saturation 1 255 true
execute @s[tag=ek] ~ ~ ~ time set midnight
execute @s[tag=ek] ~ ~ ~ tp ~ ~ ~ 0 -90
title @s[tag=ek] actionbar §l§c기절하였습니다!
kill @s[tag=twod,scores={twod=3}]
tag @s[tag=twod,scores={twod=10}] add reset
tag @s[tag=twod,scores={twod=11..}] remove twod
scoreboard players add @s[tag=twod] twod 1
scoreboard players reset @s[tag=!twod] twod
gamerule doimmediaterespawn true
gamerule sendcommandfeedback false
scoreboard players add @s[tag=reset] reset 0
scoreboard players add @s[tag=reset,scores={reset=..4}] reset 1
tag @s[scores={reset=3}] remove reset
tag @s[scores={reset=2}] remove twod
execute @s[scores={twod=1}] ~ ~ ~ tellraw @a {"rawtext":[{"text":"§l§4누군가 완전히 사망했습니다!"}]}
execute @s[tag=ek] ~ ~ ~ detect ~ ~ ~ water 0 tp @p[tag=!ek]
execute @s[tag=ek] ~ ~ ~ detect ~ ~ ~ lava 0 tp @p[tag=!ek]
execute @s[tag=ek] ~ -40 ~ tp @s[r=1] @p[tag=!ek]
execute @s[scores={reset=2}] ~ ~ ~ time set day
execute @s[tag=!twod,scores={reset=1}] ~ ~ ~ tellraw @a {"rawtext":[{"text":"§l§a누군가 살아났습니다!"}]}
execute @s[scores={reset=2}] ~ ~ ~ playsound random.totem @a ~ ~ ~
tag @s[tag=reset] remove ek
execute @s[tag=ek,tag=!heal] ~ ~ ~ particle minecraft:soul_particle ~ ~1 ~
scoreboard players reset @s[tag=!reset] reset
scoreboard players add @s[tag=heal] heal 0
scoreboard players add @s[tag=heal,scores={heal=..120}] heal 1
execute @s[tag=ek,scores={heal=..20}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^1 ^
execute @s[tag=ek,scores={heal=..20}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^0.5 ^
execute @s[tag=ek,scores={heal=..20}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^ ^
execute @s[tag=ek,scores={heal=..20}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^-0.5 ^
execute @s[tag=ek,scores={heal=..20}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^-1 ^
execute @s[tag=ek,scores={heal=21..40}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^1 ^
execute @s[tag=ek,scores={heal=21..40}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^0.5 ^
execute @s[tag=ek,scores={heal=21..40}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^ ^
execute @s[tag=ek,scores={heal=21..40}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^-0.5 ^
execute @s[tag=ek,scores={heal=41..60}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^1 ^
execute @s[tag=ek,scores={heal=41..60}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^0.5 ^
execute @s[tag=ek,scores={heal=41..60}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^ ^
execute @s[tag=ek,scores={heal=61..80}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^1 ^
execute @s[tag=ek,scores={heal=61..80}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^0.5 ^
execute @s[tag=ek,scores={heal=81..100}] ~ ~1 ~ particle minecraft:balloon_gas_particle ^ ^1 ^
execute @s[scores={heal=118..}] ~ ~ ~ tag @p[r=6,tag=healing] remove healing
execute @s[scores={heal=118..}] ~ ~ ~ particle minecraft:totem_particle ~ ~0.7 ~
tag @s[scores={heal=118..}] add reset
tag @s[scores={heal=118..}] remove heal
scoreboard players reset @s[tag=!heal] heal
execute @s[tag=healing] ~ ~ ~ tp ~ ~ ~ ~ 40
scoreboard players set player sta-t-e 0
execute @a[tag=!ek] ~ ~ ~ scoreboard players add player sta-t-e 1
scoreboard players operation @s det = player sta-t-e
effect @s[scores={det=0},tag=ek,tag=!twod,tag=!reset] wither 1 255 true
 