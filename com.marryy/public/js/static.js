var data_marries = {
	纸婚: 1,
	布婚: 2,
	皮婚: 3,
	丝婚: 4,
	木婚: 5,
	铁婚: 6,
	铜婚: 7,
	电婚: 8,
	陶婚: 9,
	锡婚: 10,
	钢婚: 11,
	亚麻婚: 12,
	花边婚: 13,
	象牙婚: 14,
	水晶婚: 15,
	瓷婚: 20,
	银婚: 25,
	珍珠婚: 30,
	玉婚: 35,
	红宝石婚: 40,
	蓝宝石婚: 45,
	金婚: 50,
	钻石婚: 60
}

var data_marry_reverts = {};
for (var m in data_marries) {
	data_marry_reverts[data_marries[m]] = m;
}