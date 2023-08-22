{
	"file_path": "C:\\Users\\leegm\\AppData\\Local\\Packages\\Microsoft.MinecraftUWP_8wekyb3d8bbwe\\LocalState\\games\\com.mojang\\development_behavior_packs\\minyee's test pack\\functions\\ek.mcfunction",
	"file_type": "function",
	"format_version": 0,
	"file_uuid": "27fa854e_ddff_42c6_9583_743bebf10ae7",
	"file_version": 11,
	"cache_content": "execute @s[tag=!ek] ~ ~ ~ tellraw @a {\"rawtext\":[{\"text\":\"§l§c누군가 기절하였습니다!\"}]}\r\nexecute @s[tag=!ek] ~ ~ ~ execute @a ~ ~ ~ playsound mob.wither.death @s ~ ~ ~\r\ntag @s[tag=ek] add twod\r\ntag @s[tag=!ek] add ek"
}