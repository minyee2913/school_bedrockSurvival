#bridge-file-version: #11
execute @s[tag=!ek] ~ ~ ~ tellraw @a {"rawtext":[{"text":"§l§c누군가 기절하였습니다!"}]}
execute @s[tag=!ek] ~ ~ ~ execute @a ~ ~ ~ playsound mob.wither.death @s ~ ~ ~
tag @s[tag=ek] add twod
tag @s[tag=!ek] add ek