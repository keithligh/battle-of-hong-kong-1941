/* =====================================================================
 *  data.js: scenario data for the Battle of Hong Kong 1941
 *  ---------------------------------------------------------------------
 *  Pure data, no logic. Consumed via window.BATTLE_DATA (config.js re-exports it as D).
 *  Facts compiled and cross-checked against the sources listed in notes.sources.
 *
 *  Coordinates are REAL WGS84 lng/lat (projected to scale via Web Mercator
 *  in projection.js). Timeline day key `d` = day of December 1941 (8.0 … 26.0).
 * ===================================================================== */
window.BATTLE_DATA = (function () {

  const JP = "jp", UK = "uk";   // faction ids; faction colours are defined in config.js FAC (app.js pushes them into CSS vars at boot)

  /* -- geography (real lng/lat) ------------------------------------ */
  const geography = {
    regions: [
      { name_en: "New Territories",  name_zh: "新界",        type: "region",    lng:114.13,  lat:22.43,  h:0 },
      { name_en: "Kowloon Peninsula",name_zh: "九龍半島",     type: "peninsula", lng:114.175, lat:22.318, h:0 },
      { name_en: "Hong Kong Island", name_zh: "香港島",       type: "region",    lng:114.178, lat:22.250, h:0 },
      { name_en: "Victoria Harbour", name_zh: "維多利亞港",   type: "harbour",   lng:114.168, lat:22.300, h:0 },
      { name_en: "Stanley Peninsula",name_zh: "赤柱半島",     type: "peninsula", lng:114.214, lat:22.200, h:0 },
      { name_en: "Lantau Island",    name_zh: "大嶼山",       type: "island",    lng:113.945, lat:22.262, h:934 },
      { name_en: "Lamma Island",     name_zh: "南丫島",       type: "island",    lng:114.128, lat:22.205, h:353 },
    ],
    points: [
      { name_en: "Tai Mo Shan",        name_zh: "大帽山",     type: "mountain", lng:114.124, lat:22.410, h:957 },
      { name_en: "Shing Mun Redoubt",  name_zh: "城門碉堡",   type: "fort",     lng:114.150, lat:22.385, h:280 },
      { name_en: "Golden Hill",        name_zh: "金山",       type: "hill",     lng:114.138, lat:22.363, h:369 },
      { name_en: "Beacon Hill",        name_zh: "筆架山",     type: "hill",     lng:114.166, lat:22.353, h:457 },
      { name_en: "Lion Rock",          name_zh: "獅子山",     type: "mountain", lng:114.187, lat:22.352, h:495 },
      { name_en: "Devil's Peak",       name_zh: "魔鬼山",     type: "fort",     lng:114.245, lat:22.290, h:222 },
      { name_en: "Kai Tak Airfield",   name_zh: "啟德機場",   type: "town",     lng:114.199, lat:22.328, h:0 },
      { name_en: "Sham Shui Po",       name_zh: "深水埗",     type: "town",     lng:114.162, lat:22.330, h:0 },
      { name_en: "Lei Yue Mun",        name_zh: "鯉魚門",     type: "channel",  lng:114.237, lat:22.288, h:0 },
      { name_en: "North Point",        name_zh: "北角",       type: "town",     lng:114.200, lat:22.291, h:0 },
      { name_en: "Central / Victoria", name_zh: "中環",       type: "town",     lng:114.158, lat:22.282, h:0 },
      { name_en: "Victoria Peak",      name_zh: "太平山",     type: "mountain", lng:114.145, lat:22.276, h:552 },
      { name_en: "Jardine's Lookout",  name_zh: "渣甸山",     type: "hill",     lng:114.192, lat:22.268, h:433 },
      { name_en: "Mount Butler",       name_zh: "畢拿山",     type: "hill",     lng:114.205, lat:22.267, h:436 },
      { name_en: "Mount Parker",       name_zh: "柏架山",     type: "mountain", lng:114.217, lat:22.268, h:532 },
      { name_en: "Wong Nai Chung Gap", name_zh: "黃泥涌峽",   type: "gap",      lng:114.187, lat:22.263, h:0 },
      { name_en: "Aberdeen",           name_zh: "香港仔",     type: "town",     lng:114.153, lat:22.247, h:0 },
      { name_en: "Repulse Bay",        name_zh: "淺水灣",     type: "bay",      lng:114.196, lat:22.235, h:0 },
      { name_en: "Stanley",            name_zh: "赤柱",       type: "fort",     lng:114.212, lat:22.218, h:0 },
    ],
    lines: [
      { name_en: "Gin Drinkers Line", name_zh: "醉酒灣防線",
        path: [[114.098,22.362],[114.150,22.385],[114.138,22.363],[114.166,22.353],
               [114.187,22.352],[114.215,22.353],[114.245,22.340],[114.245,22.290]] },
    ],
  };

  /* -- units (track keyframes: {d, lng, lat, s, st}) --------------- *
   *  state: march | hold | attack | retreat | landing | dead
   *  cf = counts toward the aggregate force meter
   * ---------------------------------------------------------------- */
  const units = [
    /* ===================== JAPANESE (red) ===================== */
    { id:"jp_army", faction:JP, kind:"command", flag:"ija", cf:false,
      name_zh:"第二十三軍", name_en:"23rd Army", type:"Field Army HQ",
      commander:{ zh:"酒井隆", en:"Lt-Gen Sakai Takashi", rank:"中将 / Lieutenant General" },
      note:"由廣州統籌全局；25日於半島酒店接受英軍投降。",
      track:[ {d:8,lng:114.10,lat:22.555,s:0,st:"hold"}, {d:26,lng:114.10,lat:22.555,s:0,st:"hold"} ] },

    { id:"jp_38div", faction:JP, kind:"command", flag:"ija", cf:false,
      name_zh:"第三十八師團（沼兵團 · 佐野部隊）", name_en:"38th Division", type:"Infantry Division HQ",
      commander:{ zh:"佐野忠義", en:"Lt-Gen Sano Tadayoshi", rank:"中将 / Lieutenant General" },
      note:"攻港主力。渡深圳河→破醉酒灣防線→奪九龍→夜渡登陸港島。",
      track:[ {d:8,lng:114.120,lat:22.460,s:0,st:"march"}, {d:11,lng:114.150,lat:22.370,s:0,st:"march"},
              {d:13,lng:114.175,lat:22.320,s:0,st:"hold"}, {d:19,lng:114.205,lat:22.295,s:0,st:"attack"},
              {d:22,lng:114.190,lat:22.270,s:0,st:"attack"}, {d:25,lng:114.185,lat:22.262,s:0,st:"hold"} ] },

    { id:"jp_228", faction:JP, kind:"infantry", flag:"ija", cf:true,
      name_zh:"步兵第二二八聯隊（土井部隊）", name_en:"228th Infantry Regiment", type:"Infantry Regiment",
      commander:{ zh:"土井定七", en:"Col. Doi Sadashichi", rank:"大佐 / Colonel" },
      note:"奇襲攻陷城門碉堡，瓦解醉酒灣防線之西翼樞紐。",
      track:[ {d:8,lng:114.120,lat:22.430,s:3800,st:"march"}, {d:9,lng:114.150,lat:22.392,s:3800,st:"attack"},
              {d:10,lng:114.150,lat:22.385,s:3720,st:"attack"}, {d:11,lng:114.138,lat:22.363,s:3650,st:"attack"},
              {d:13,lng:114.165,lat:22.330,s:3650,st:"hold"}, {d:18,lng:114.213,lat:22.288,s:3650,st:"landing"},
              {d:19,lng:114.185,lat:22.266,s:3500,st:"attack"}, {d:22,lng:114.166,lat:22.272,s:3340,st:"attack"},
              {d:25,lng:114.158,lat:22.282,s:3270,st:"hold"} ] },

    { id:"jp_229", faction:JP, kind:"infantry", flag:"ija", cf:true,
      name_zh:"步兵第二二九聯隊（田中部隊）", name_en:"229th Infantry Regiment", type:"Infantry Regiment",
      commander:{ zh:"田中良三郎", en:"Col. Tanaka Ryosaburo", rank:"大佐 / Colonel" },
      note:"左翼。鯉魚門/西灣登陸→奪柏架山→東進迫近大潭、赤柱。",
      track:[ {d:8,lng:114.160,lat:22.450,s:3800,st:"march"}, {d:11,lng:114.190,lat:22.370,s:3800,st:"march"},
              {d:13,lng:114.210,lat:22.330,s:3800,st:"hold"}, {d:18,lng:114.237,lat:22.290,s:3800,st:"landing"},
              {d:19,lng:114.217,lat:22.268,s:3650,st:"attack"}, {d:21,lng:114.207,lat:22.240,s:3500,st:"attack"},
              {d:24,lng:114.214,lat:22.226,s:3340,st:"attack"}, {d:25,lng:114.214,lat:22.220,s:3270,st:"attack"} ] },

    { id:"jp_230", faction:JP, kind:"infantry", flag:"ija", cf:true,
      name_zh:"步兵第二三〇聯隊（東海林部隊）", name_en:"230th Infantry Regiment", type:"Infantry Regiment",
      commander:{ zh:"東海林俊成", en:"Col. Shoji Toshinari", rank:"大佐 / Colonel" },
      note:"中路/右翼。北角登陸→繞渣甸山→奪黃泥涌峽（切斷港島）→南下淺水灣。",
      track:[ {d:8,lng:114.130,lat:22.450,s:3800,st:"march"}, {d:11,lng:114.160,lat:22.360,s:3800,st:"march"},
              {d:13,lng:114.180,lat:22.330,s:3800,st:"hold"}, {d:18,lng:114.200,lat:22.293,s:3800,st:"landing"},
              {d:19,lng:114.187,lat:22.263,s:3570,st:"attack"}, {d:20,lng:114.187,lat:22.258,s:3500,st:"hold"},
              {d:22,lng:114.196,lat:22.235,s:3340,st:"attack"}, {d:25,lng:114.198,lat:22.226,s:3270,st:"attack"} ] },

    { id:"jp_arty", faction:JP, kind:"artillery", flag:"ija", cf:true,
      name_zh:"第一砲兵隊（北島集團）", label_zh:"第一砲兵隊", name_en:"1st Artillery Group", type:"Heavy / Siege Artillery",
      commander:{ zh:"北島驥子雄", en:"Lt-Gen Kitajima Kineo", rank:"中将 / Lieutenant General" },
      note:"九龍高地隔維港砲轟港島，登陸前後火力支援（24cm榴彈砲、150mm砲）。",
      track:[ {d:9,lng:114.140,lat:22.410,s:4000,st:"attack"}, {d:11,lng:114.160,lat:22.360,s:4000,st:"attack"},
              {d:13,lng:114.175,lat:22.330,s:4000,st:"attack"}, {d:18,lng:114.180,lat:22.315,s:4000,st:"attack"},
              {d:25,lng:114.185,lat:22.290,s:4000,st:"attack"} ] },

    { id:"jp_air", faction:JP, kind:"air", flag:"ija", cf:true,
      name_zh:"第二十三軍飛行隊（飛行第四十五戰隊）", name_en:"23rd Army Air Unit", type:"Army Aviation",
      commander:{ zh:"", en:"45th Sentai · Ki-32 / Ki-27", rank:"~50–56 aircraft" },
      note:"開戰首日炸毀啟德RAF機群，全程奪取制空權並轟炸防線。",
      track:[ {d:8,lng:114.199,lat:22.328,s:2000,st:"attack"}, {d:10,lng:114.170,lat:22.350,s:2000,st:"attack"},
              {d:14,lng:114.180,lat:22.310,s:2000,st:"attack"}, {d:18,lng:114.190,lat:22.300,s:2000,st:"attack"},
              {d:24,lng:114.200,lat:22.240,s:2000,st:"attack"} ] },

    { id:"jp_navy", faction:JP, kind:"navy", flag:"ijn", cf:true,
      name_zh:"第二遣支艦隊", name_en:"2nd China Expeditionary Fleet", type:"IJN Bombardment / Blockade",
      commander:{ zh:"新見政一", en:"Vice-Adm Niimi Masaichi", rank:"海軍中将 / Vice Admiral" },
      note:"封鎖海路、砲擊支援（輕巡洋艦五十鈴及驅逐艦）。",
      track:[ {d:13,lng:114.275,lat:22.270,s:2000,st:"attack"}, {d:18,lng:114.255,lat:22.290,s:2000,st:"attack"},
              {d:25,lng:114.245,lat:22.255,s:2000,st:"attack"} ] },

    /* ===================== BRITISH / ALLIED (blue) ===================== */
    { id:"uk_fortress", faction:UK, kind:"command", flag:"union", cf:false,
      name_zh:"香港要塞司令部", name_en:"Fortress HQ", type:"Garrison Command",
      commander:{ zh:"莫德庇", en:"Maj-Gen C.M. Maltby (GOC)", rank:"少將 / Major-General" },
      note:"駐港英軍總指揮；與楊慕琦總督於25日投降。",
      track:[ {d:8,lng:114.158,lat:22.282,s:0,st:"hold"}, {d:25,lng:114.158,lat:22.282,s:0,st:"dead"} ] },

    { id:"uk_royalscots", faction:UK, kind:"infantry", flag:"union", cf:true,
      name_zh:"皇家蘇格蘭兵團 第二營", name_en:"2nd Royal Scots", type:"British Infantry Bn",
      commander:{ zh:"懷特", en:"Lt-Col S.E.H.E. White", rank:"中校 / Lieutenant-Colonel" },
      note:"守醉酒灣防線西段（城門碉堡）；失守後退守港島西。",
      track:[ {d:8,lng:114.148,lat:22.383,s:900,st:"hold"}, {d:10,lng:114.145,lat:22.375,s:760,st:"retreat"},
              {d:11,lng:114.138,lat:22.363,s:700,st:"retreat"}, {d:13,lng:114.158,lat:22.280,s:680,st:"hold"},
              {d:19,lng:114.185,lat:22.265,s:520,st:"attack"}, {d:22,lng:114.165,lat:22.275,s:380,st:"hold"},
              {d:25,lng:114.165,lat:22.277,s:200,st:"dead"} ] },

    { id:"uk_rajput", faction:UK, kind:"infantry", flag:"india", cf:true,
      name_zh:"第7拉吉普兵團 第五營", name_en:"5/7 Rajput Regiment", type:"British Indian Infantry Bn",
      commander:{ zh:"羅林森", en:"Lt-Col J. Cadogan-Rawlinson", rank:"中校 / Lieutenant-Colonel" },
      note:"守防線東段；魔鬼山殿後撤離；港島東北岸首當登陸之衝，損失慘重。",
      track:[ {d:8,lng:114.210,lat:22.350,s:900,st:"hold"}, {d:11,lng:114.243,lat:22.300,s:880,st:"retreat"},
              {d:13,lng:114.205,lat:22.290,s:850,st:"hold"}, {d:18,lng:114.205,lat:22.292,s:400,st:"dead"},
              {d:20,lng:114.190,lat:22.282,s:250,st:"retreat"}, {d:25,lng:114.180,lat:22.272,s:120,st:"dead"} ] },

    { id:"uk_punjab", faction:UK, kind:"infantry", flag:"india", cf:true,
      name_zh:"第14旁遮普兵團 第二營", name_en:"2/14 Punjab Regiment", type:"British Indian Infantry Bn",
      commander:{ zh:"基德", en:"Lt-Col G.R. Kidd", rank:"中校 / Lieutenant-Colonel" },
      note:"大陸掩護/殿後；退守港島西。營長基德21日於蘇雪崗（Shouson Hill）一帶攻擊中陣亡。",
      track:[ {d:8,lng:114.180,lat:22.350,s:900,st:"hold"}, {d:12,lng:114.170,lat:22.320,s:850,st:"retreat"},
              {d:13,lng:114.155,lat:22.280,s:820,st:"hold"}, {d:19,lng:114.185,lat:22.264,s:560,st:"attack"},
              {d:22,lng:114.160,lat:22.275,s:380,st:"hold"}, {d:25,lng:114.162,lat:22.277,s:220,st:"dead"} ] },

    { id:"uk_middlesex", faction:UK, kind:"infantry", flag:"union", cf:true,
      name_zh:"米杜息士兵團 第一營", name_en:"1st Middlesex Regiment", type:"Machine-Gun Bn",
      commander:{ zh:"史超域", en:"Lt-Col H.W.M. Stewart", rank:"中校 / Lieutenant-Colonel" },
      note:"維克斯機槍營，守港島沿岸碉堡線；最後退守赤柱。",
      track:[ {d:8,lng:114.180,lat:22.290,s:900,st:"hold"}, {d:18,lng:114.200,lat:22.292,s:760,st:"hold"},
              {d:20,lng:114.200,lat:22.250,s:640,st:"retreat"}, {d:24,lng:114.212,lat:22.218,s:520,st:"hold"},
              {d:25,lng:114.212,lat:22.216,s:420,st:"hold"} ] },

    { id:"uk_winnipeg", faction:UK, kind:"infantry", flag:"canada", cf:true,
      name_zh:"溫尼伯榴彈兵團", name_en:"Winnipeg Grenadiers", type:"Canadian Infantry Bn (C Force)",
      commander:{ zh:"修克里夫", en:"Lt-Col J.L.R. Sutcliffe", rank:"中校 / Lieutenant-Colonel" },
      note:"西旅。死守黃泥涌峽、尼克遜山；奧斯本準尉於畢拿山捨身獲維多利亞十字勳章。",
      track:[ {d:13,lng:114.182,lat:22.270,s:900,st:"hold"}, {d:19,lng:114.187,lat:22.263,s:600,st:"attack"},
              {d:20,lng:114.183,lat:22.262,s:420,st:"attack"}, {d:22,lng:114.175,lat:22.265,s:300,st:"hold"},
              {d:25,lng:114.178,lat:22.265,s:150,st:"dead"} ] },

    { id:"uk_royalrifles", faction:UK, kind:"infantry", flag:"canada", cf:true,
      name_zh:"皇家加拿大來福槍營", name_en:"Royal Rifles of Canada", type:"Canadian Infantry Bn (C Force)",
      commander:{ zh:"康姆", en:"Lt-Col W.J. Home", rank:"中校 / Lieutenant-Colonel" },
      note:"東旅核心。大潭/赤柱軸線且戰且退，反攻淺水灣，赤柱死守。",
      track:[ {d:13,lng:114.215,lat:22.270,s:900,st:"hold"}, {d:19,lng:114.215,lat:22.255,s:760,st:"retreat"},
              {d:21,lng:114.205,lat:22.235,s:600,st:"attack"}, {d:24,lng:114.213,lat:22.222,s:460,st:"hold"},
              {d:25,lng:114.213,lat:22.218,s:360,st:"hold"} ] },

    { id:"uk_hkvdc", faction:UK, kind:"infantry", flag:"hk", cf:true,
      name_zh:"香港義勇防衛軍", name_en:"Hong Kong Volunteer Defence Corps", type:"Local Volunteer Force",
      commander:{ zh:"羅斯", en:"Col. H.B. Rose", rank:"上校 / Colonel" },
      note:"本地義勇軍，多族裔；渣甸山、黃泥涌峽、赤柱皆有血戰。羅遜陣亡後羅斯接掌西旅。",
      track:[ {d:13,lng:114.190,lat:22.270,s:1700,st:"hold"}, {d:19,lng:114.189,lat:22.266,s:1100,st:"attack"},
              {d:21,lng:114.180,lat:22.260,s:800,st:"hold"}, {d:25,lng:114.182,lat:22.270,s:400,st:"dead"} ] },

    { id:"uk_westbde", faction:UK, kind:"command", flag:"canada", cf:false,
      name_zh:"西旅司令部（羅遜准將）", name_en:"West Brigade HQ", type:"Brigade Command",
      commander:{ zh:"羅遜", en:"Brig. J.K. Lawson", rank:"准將 / Brigadier" },
      note:"19日約10:00日軍圍攻黃泥涌峽旅部，羅遜稱「出去拼了」陣亡——香港戰役中盟軍陣亡之最高階軍官。",
      track:[ {d:13,lng:114.187,lat:22.264,s:0,st:"hold"}, {d:18,lng:114.187,lat:22.264,s:0,st:"hold"},
              {d:19,lng:114.187,lat:22.263,s:0,st:"dead"} ] },

    { id:"uk_eastbde", faction:UK, kind:"command", flag:"union", cf:false,
      name_zh:"東旅司令部（華里士准將）", name_en:"East Brigade HQ", type:"Brigade Command",
      commander:{ zh:"華里士", en:"Brig. C. Wallis", rank:"准將 / Brigadier" },
      note:"港島被切斷後率東旅退守赤柱，死戰至26日凌晨。",
      track:[ {d:13,lng:114.215,lat:22.275,s:0,st:"hold"}, {d:19,lng:114.215,lat:22.255,s:0,st:"retreat"},
              {d:22,lng:114.213,lat:22.225,s:0,st:"hold"}, {d:25,lng:114.213,lat:22.218,s:0,st:"hold"} ] },

    { id:"uk_ra", faction:UK, kind:"artillery", flag:"union", cf:true,
      name_zh:"皇家炮兵 香港要塞部隊", name_en:"Royal Artillery (Fortress)", type:"Coast & AA Artillery",
      commander:{ zh:"麥里奧", en:"Brig. T. MacLeod (CRA)", rank:"准將 / Brigadier" },
      note:"赤柱、摩星嶺、鯉魚門等海防砲台與高射砲；末期轉作平射火力。",
      track:[ {d:8,lng:114.135,lat:22.280,s:2500,st:"hold"}, {d:18,lng:114.135,lat:22.280,s:2300,st:"attack"},
              {d:24,lng:114.213,lat:22.218,s:1500,st:"attack"}, {d:25,lng:114.213,lat:22.216,s:1000,st:"dead"} ] },

    { id:"uk_rn", faction:UK, kind:"navy", flag:"rn", cf:true,
      name_zh:"皇家海軍香港分遣隊", name_en:"Royal Navy (Hong Kong)", type:"Local Defence Flotilla",
      commander:{ zh:"哥連臣", en:"Cdre A.C. Collinson", rank:"准將/海軍准將 / Commodore" },
      note:"驅逐艦色雷斯人號、炮艇蟬號及2nd MTB魚雷艇隊突擊日軍登陸艇。",
      track:[ {d:8,lng:114.165,lat:22.300,s:1400,st:"hold"}, {d:18,lng:114.190,lat:22.295,s:1000,st:"attack"},
              {d:19,lng:114.180,lat:22.300,s:600,st:"attack"}, {d:21,lng:114.160,lat:22.300,s:300,st:"dead"} ] },
  ];

  /* -- movement arrows (visibility window lives in entities.js updateArrows: ~0.6d before to ~1.1d after `d`); [lng,lat] --- */
  const arrows = [
    { d:8,  f:JP, from:[114.100,22.530], to:[114.120,22.440], label:"38D 渡深圳河南下", kind:"march" },
    { d:9,  f:JP, from:[114.140,22.410], to:[114.150,22.385], label:"土井部隊 夜襲城門", kind:"attack" },
    { d:11, f:JP, from:[114.148,22.385], to:[114.155,22.360], label:"奪金山 · 逼九龍", kind:"attack" },
    { d:11, f:UK, from:[114.160,22.370], to:[114.160,22.310], label:"撤往港島", kind:"retreat" },
    { d:13, f:UK, from:[114.243,22.300], to:[114.205,22.290], label:"魔鬼山殿後撤離", kind:"retreat" },
    { d:18, f:JP, from:[114.180,22.310], to:[114.200,22.293], label:"230 北角登陸", kind:"landing" },
    { d:18, f:JP, from:[114.250,22.300], to:[114.237,22.290], label:"229 鯉魚門/西灣登陸", kind:"landing" },
    { d:18, f:JP, from:[114.205,22.312], to:[114.213,22.288], label:"228 渡海", kind:"landing" },
    { d:19, f:JP, from:[114.200,22.290], to:[114.187,22.263], label:"230 直取黃泥涌峽", kind:"attack" },
    { d:19, f:JP, from:[114.235,22.290], to:[114.217,22.268], label:"229 攻柏架山", kind:"attack" },
    { d:19, f:UK, from:[114.160,22.282], to:[114.185,22.264], label:"反攻黃泥涌峽", kind:"attack" },
    { d:21, f:JP, from:[114.187,22.260], to:[114.196,22.235], label:"南下淺水灣", kind:"attack" },
    { d:21, f:UK, from:[114.215,22.255], to:[114.205,22.235], label:"皇家來福槍營反攻", kind:"attack" },
    { d:24, f:JP, from:[114.205,22.235], to:[114.213,22.218], label:"進攻赤柱", kind:"attack" },
  ];

  /* -- front line snapshots (latest with d<=now is drawn); [lng,lat] */
  const fronts = [
    { d:8,  path:[[114.098,22.362],[114.150,22.385],[114.138,22.363],[114.166,22.353],[114.187,22.352],[114.215,22.353],[114.245,22.290]] },
    { d:10, path:[[114.130,22.370],[114.160,22.360],[114.190,22.355],[114.220,22.350],[114.245,22.300]] },
    { d:12, path:[[114.140,22.330],[114.170,22.325],[114.200,22.320],[114.235,22.310]] },
    { d:13, path:[[114.130,22.285],[114.160,22.285],[114.190,22.288],[114.220,22.285],[114.245,22.285]] },
    { d:18, path:[[114.140,22.285],[114.170,22.285],[114.190,22.288],[114.205,22.293],[114.237,22.290]] },
    { d:19, path:[[114.155,22.285],[114.175,22.280],[114.187,22.263],[114.200,22.250],[114.215,22.235]] },
    { d:21, path:[[114.160,22.280],[114.180,22.270],[114.193,22.250],[114.200,22.235],[114.210,22.225]] },
    { d:23, path:[[114.165,22.280],[114.185,22.260],[114.200,22.235],[114.210,22.222],[114.213,22.215]] },
    { d:25, path:[[114.205,22.225],[114.212,22.218],[114.214,22.210]] },
  ];

  /* -- effect hotspots: active while now ∈ [a,b]; [lng,lat] -------- *
   *  kind: air | artillery | firefight | landing | explosion | oilfire
   * ---------------------------------------------------------------- */
  const hotspots = [
    { a:8,   b:8.6,  lng:114.199, lat:22.328, kind:"air",       i:1.0 },  // Kai Tak raid
    { a:9,   b:10.4, lng:114.150, lat:22.385, kind:"firefight", i:1.0 },  // Shing Mun
    { a:10.6,b:11.6, lng:114.138, lat:22.363, kind:"firefight", i:0.8 },  // Golden Hill
    { a:13,  b:18.2, lng:114.175, lat:22.330, kind:"artillery", i:0.9 },  // Kowloon guns fire S
    { a:13,  b:18.4, lng:114.190, lat:22.290, kind:"explosion", i:0.7 },  // shells land N shore
    { a:15,  b:25.5, lng:114.200, lat:22.293, kind:"oilfire",   i:1.0 },  // North Point oil fires; burns past the surrender (aftermath glow, not combat)
    { a:18,  b:19.2, lng:114.200, lat:22.293, kind:"landing",   i:1.0 },  // North Point landing
    { a:18,  b:19.2, lng:114.237, lat:22.289, kind:"landing",   i:0.9 },  // Sai Wan / Lei Yue Mun
    { a:18.2,b:19.4, lng:114.190, lat:22.300, kind:"firefight", i:0.8 },  // harbour MTB fight
    { a:19,  b:20.6, lng:114.187, lat:22.263, kind:"firefight", i:1.0 },  // Wong Nai Chung Gap
    { a:19,  b:20.2, lng:114.205, lat:22.267, kind:"firefight", i:0.8 },  // Mount Butler (Osborn VC)
    { a:19,  b:20.2, lng:114.192, lat:22.268, kind:"firefight", i:0.7 },  // Jardine's Lookout
    { a:21,  b:22.6, lng:114.196, lat:22.235, kind:"firefight", i:0.9 },  // Repulse Bay
    { a:24,  b:24.9, lng:114.213, lat:22.218, kind:"firefight", i:1.0 },  // Stanley last stand; fades out before the 25th "Fall" scene (combat ends; city falls)
    { a:24,  b:24.9, lng:114.213, lat:22.218, kind:"explosion", i:0.6 },  // ditto; Stanley shellfire ceases before the Fall
  ];

  /* -- weather profile per day (interpolated) ---------------------- */
  // night = darkness MULTIPLIER (not a clock): >0.5 → moonlight tint + deep dim (true night);
  // ≤0.5 → day sun-colour, merely dimmed (dawn / dark-stormy day). Each knot is keyed to its
  // event's documented clock time; shots sit on these knots, so a knot IS what its shot renders.
  const weather = [
    { d:8,  night:0.15, fog:0.05, rain:0,    smoke:0,    zh:"涼爽乾燥 · 拂曉",        en:"Cool & dry; clear dawn" },     // dawn crossing of the Shenzhen R.
    { d:9,  night:0.95, fog:0.08, rain:0,    smoke:0,    zh:"寒夜 · 晴 · 城門夜襲",   en:"Cold clear night; assault" },  // Shing Mun night assault ~22:00
    { d:10, night:0.85, fog:0.10, rain:0,    smoke:0.05, zh:"嚴寒 · 黎明前",          en:"Cold; before dawn" },          // redoubt overrun pre-dawn ~02:30
    { d:11, night:0,    fog:0.10, rain:0,    smoke:0.08, zh:"涼 · 晴間多雲",          en:"Cool, fair" },
    { d:12, night:0.10, fog:0.11, rain:0,    smoke:0.10, zh:"清涼 · 晨",              en:"Cool, clear morning" },        // daytime evacuation of Kowloon
    { d:13, night:0.70, fog:0.12, rain:0,    smoke:0.20, zh:"涼 · 拂曉前 · 港面硝煙", en:"Cool; pre-dawn; harbour smoke" }, // Devil's Peak rearguard ~04:00
    { d:15, night:0,    fog:0.15, rain:0,    smoke:0.30, zh:"隔港砲轟 · 硝煙漸濃",    en:"Cross-harbour shelling; smoke building" }, // bombardment haze, not yet the oil pall
    { d:17, night:0,    fog:0.25, rain:0.05, smoke:0.45, zh:"轉壞 · 硝煙瀰漫",        en:"Weather worsening; smoke thickening" },
    { d:18, night:1.0,  fog:0.75, rain:0.65, smoke:0.95, zh:"夜渡 · 雨 · 霧 · 油庫濃煙（能見近零）", en:"Night landings · rain · fog · oil-fire pall" }, // North Point oil tanks ablaze; PEAK
    { d:19, night:0.25, fog:0.55, rain:0.85, smoke:0.70, zh:"傾盆大雨 · 陰",          en:"Pouring rain, overcast" },     // dark stormy DAY (night<0.5 keeps day colour)
    { d:20, night:0.15, fog:0.45, rain:0.70, smoke:0.55, zh:"陰雨 · 能見差",          en:"Dark & rainy" },
    { d:21, night:0,    fog:0.30, rain:0.20, smoke:0.45, zh:"漸轉乾涼 · 殘雲",        en:"Clearing, cool" },
    { d:23, night:0,    fog:0.18, rain:0,    smoke:0.35, zh:"涼爽乾燥",                en:"Cool & dry" },
    { d:25, night:0,    fog:0.15, rain:0,    smoke:0.40, zh:"涼乾 · 全城餘煙（黑色聖誕）", en:"Cool & dry; smoke over city" },
  ];

  /* -- summary / sourcing notes for the in-app panel --------------- */
  const notes = {
    summary:"香港保衛戰（1941年12月8–25日）：酒井隆中將之第二十三軍以佐野第38師團三聯隊（土井228、田中229、東海林230）為主力，北島砲兵集團、約50–56架飛機及海軍支援。莫德庇少將約14,000守軍據守醉酒灣防線，再退守港島，編為西旅（羅遜，後羅斯）與東旅（華里士）。9/10日城門碉堡陷落、11–13日棄守大陸、18–19日夜渡登陸、奪黃泥涌峽切斷港島，25日「黑色聖誕」投降。",
    caveats:[
      "地形為真實資料：高程取自 AWS Terrarium DEM、地表為 EOX Sentinel-2 cloudless 2016（現代衛星影像），以 Web Mercator 投影按真實比例呈現；垂直高度作 2 倍誇張以利判讀（水平比例不變）。",
      "注意：衛星影像與高程均為現代資料——維多利亞港兩岸（中環/灣仔/銅鑼灣/北角/西九龍/觀塘）填海、啟德與赤鱲角機場、青馬大橋等皆為戰後建設，1941年並不存在。1941年的海岸線較今日為窄，故海岸線、登陸灘頭與沿岸部隊位置僅按現代地貌示意，與史實會有偏差。",
      "各部隊軍旗採用1941年12月各軍實際旗幟：日本陸軍「旭日旗」（軍旗，圓心居中）、日本海軍軍艦旗（圓心偏向旗桿）、英國聯合旗、加拿大紅船旗（1922–57年綠楓葉版）、英屬印度「印度之星」紅船旗、香港殖民地藍船旗（1876年市景徽）、皇家海軍白船旗——按時代史料繪製、為地圖辨識而簡化（非現代旗幟）。旭日旗為求史實而採用，惟其作為戰時軍國主義象徵具爭議，特此說明。",
      "兵力：日軍「第23軍麾下」上限約52,000（含後方/廣州梯隊）；通行的接戰兵力約26,928（含空海約30,000+）；步兵聯隊各約3,000–4,000。守軍約14,000（含義勇軍，約三分一為印度兵）。",
      "天氣：除18–20日有確鑿之雨/霧/濃煙記載外，逐日溫度與其餘日子多為東北季候風氣候推算（皇家天文台戰時觀測中斷）。",
      "部隊每日位置為配合敘事的示意化部署（錨定於真實地名經緯度），非逐時精確戰術圖。",
    ],
    sources:"地理：AWS Terrarium 高程瓦片（SRTM／USGS）、EOX Sentinel-2 cloudless 2016（含經修改之 Copernicus Sentinel 資料，CC BY 4.0）。史實：Wikipedia『Battle of Hong Kong』、Tony Banham《Not the Slightest Chance》、CWGC、Juno Beach Centre、Valour Canada、ww2db、香港天文台氣候資料、zh-HK 維基百科（多方來源交叉核對）；海空專題：皇家海軍第二魚雷艇隊／海岸部隊（hongkongescape.org、naval-history.net 傷亡紀錄）、啟德空襲（Pan Am Historical Foundation、Pacific Eagles）。",
  };

  /* -- storyboard: the directed broadcast (SSOT for the TV-special tour) -- *
   *  Each shot: day, hold(s), cam{lng,lat,dist,az°,el°,orbit°/s}, captions,
   *  commanders[], focus[unit ids], side. Narration uses verified facts.
   * ---------------------------------------------------------------------- */
  const storyboard = [
    { day:8,  hold:9,  cam:{lng:114.135,lat:22.460,dist:1500,az:0,el:46,orbit:0.8},
      dateLabel:"1941年12月8日", title_zh:"日軍入侵新界", title_en:"Invasion of the New Territories",
      narration_zh:"珍珠港事變數小時後，佐野第38師團渡深圳河南下；日機同晨炸毀啟德，開戰即奪制空權。",
      narration_en:"Hours after Pearl Harbor, Sano's 38th Division crosses the Shenzhen River; the same morning Japanese aircraft wreck Kai Tak and seize air supremacy at the outset.",
      commanders:[{zh:"酒井隆",en:"Lt-Gen Sakai Takashi"}], focus:["jp_38div","jp_228","jp_air"], side:"jp" },

    { day:8.1, hold:8,  cam:{lng:114.199,lat:22.328,dist:680,az:200,el:46,orbit:0.7},
      dateLabel:"12月8日 晨", title_zh:"啟德空襲 · 痛失制空權", title_en:"Air Raid on Kai Tak",
      narration_zh:"開戰首日清晨，日機空襲啟德機場，守軍僅有的數架舊式軍機、皇家海軍水上飛機，連同停泊的泛美「香港飛剪號」客機悉數被毀。盟軍空中力量第一天便蕩然無存，地勤人員自此轉作步兵。",
      narration_en:"At dawn on the first day, Japanese aircraft raid Kai Tak: the garrison's handful of obsolete aircraft, the Royal Navy's amphibians and the moored Pan Am \"Hong Kong Clipper\" are all destroyed. Allied air power is gone on day one, and the ground crews fight on as infantry.",
      commanders:[{zh:"飛行第四十五戰隊",en:"45th Sentai · Ki-32"}], focus:["jp_air"], side:"jp" },

    { day:9,  hold:9,  cam:{lng:114.150,lat:22.388,dist:620,az:200,el:50,orbit:0.8},
      dateLabel:"12月9日 夜", title_zh:"夜襲城門碉堡", title_en:"Night Assault · Shing Mun Redoubt",
      narration_zh:"土井大佐擅自發動夜襲，滲透僅約30名皇家蘇格蘭兵據守的隧道與機槍堡群。",
      narration_en:"Colonel Doi launches an unsanctioned night assault, infiltrating the tunnels and pillboxes of the Shing Mun Redoubt, held by only about 30 Royal Scots.",
      commanders:[{zh:"土井定七",en:"Col. Doi Sadashichi"},{zh:"懷特",en:"Lt-Col White"}], focus:["jp_228","uk_royalscots"], side:"both" },

    { day:10, hold:8,  cam:{lng:114.150,lat:22.375,dist:1000,az:180,el:48,orbit:0.8},
      dateLabel:"12月10日", title_zh:"城門碉堡陷落 · 防線動搖", title_en:"The Redoubt Falls",
      narration_zh:"402號機槍堡02:30被毀，碉堡失守；開戰首夜即失醉酒灣防線之西翼樞紐。",
      narration_en:"Pillbox 402 is blown at 02:30 and the redoubt falls, and the western linchpin of the Gin Drinkers Line is lost on the very first night.",
      commanders:[{zh:"土井定七",en:"Col. Doi Sadashichi"}], focus:["jp_228","uk_royalscots"], side:"jp" },

    { day:12, hold:8,  cam:{lng:114.175,lat:22.345,dist:1300,az:0,el:42,orbit:0.8},
      dateLabel:"12月11–12日", title_zh:"棄守大陸 · 撤離九龍", title_en:"Withdrawal · Evacuation of Kowloon",
      narration_zh:"金山失守後，莫德庇下令撤回港島；九龍秩序在劫掠與第五縱隊活動中崩潰。",
      narration_en:"With Golden Hill gone, Maltby orders the withdrawal to the Island; order in Kowloon collapses amid looting and fifth-column activity.",
      commanders:[{zh:"莫德庇",en:"Maj-Gen Maltby"}], focus:["uk_royalscots","uk_punjab","uk_rajput"], side:"uk" },

    { day:13, hold:8,  cam:{lng:114.225,lat:22.300,dist:1000,az:-40,el:46,orbit:0.8},
      dateLabel:"12月13日", title_zh:"魔鬼山殿後 · 首次勸降被拒", title_en:"Last off the Mainland · 1st Demand Refused",
      narration_zh:"5/7拉吉普營於魔鬼山殿後撤渡鯉魚門；日方首次勸降，總督楊慕琦斷然拒絕。",
      narration_en:"The 5/7 Rajputs fight the rearguard at Devil's Peak and cross at Lei Yue Mun; the first surrender demand is flatly refused by Governor Young.",
      commanders:[{zh:"羅林森",en:"Lt-Col Cadogan-Rawlinson"}], focus:["uk_rajput","jp_arty"], side:"uk" },

    { day:15, hold:9,  cam:{lng:114.185,lat:22.310,dist:1150,az:0,el:42,orbit:0.8},
      dateLabel:"12月14–17日", title_zh:"隔港砲轟 · 北角油庫起火", title_en:"Cross-Harbour Bombardment",
      narration_zh:"北島砲兵集團自九龍高地隔維港猛轟港島北岸；北角油庫被擊中起火，黑煙蔽港。",
      narration_en:"Kitajima's artillery group shells the Island's north shore across the harbour from the Kowloon heights; the North Point oil depot is hit and burns, blackening the sky.",
      commanders:[{zh:"北島驥子雄",en:"Lt-Gen Kitajima"}], focus:["jp_arty"], side:"jp" },

    { day:17, hold:7,  cam:{lng:114.162,lat:22.292,dist:820,az:0,el:44,orbit:0.8},
      dateLabel:"12月17日", title_zh:"第二次勸降被拒", title_en:"Second Surrender Demand Refused",
      narration_zh:"日方再度持白旗渡海勸降，楊慕琦再拒；當夜偵察隊已試探鰂魚涌一帶岸線。",
      narration_en:"A second flag-of-truce crossing demands surrender; Young refuses again. That night Japanese scouts probe the shoreline around Quarry Bay.",
      commanders:[{zh:"莫德庇",en:"Maj-Gen Maltby"}], focus:["uk_fortress"], side:"uk" },

    { day:18, hold:12, cam:{lng:114.205,lat:22.300,dist:760,az:180,el:40,orbit:0.7},
      dateLabel:"12月18日 夜 21:38", title_zh:"日軍夜渡維港 · 登陸港島", title_en:"Night Landings on the Island",
      narration_zh:"雨、霧與油庫濃煙掩護下，三聯隊乘小艇橫渡維港，於北角至筲箕灣強行登陸。",
      narration_en:"Under rain, fog and oil smoke, three regiments cross the harbour in small boats and storm ashore between North Point and Shau Kei Wan.",
      commanders:[{zh:"田中良三郎",en:"Col. Tanaka"},{zh:"東海林俊成",en:"Col. Shoji"}], focus:["jp_229","jp_230","uk_rajput"], side:"jp" },

    { day:19, hold:9,  cam:{lng:114.180,lat:22.300,dist:720,az:330,el:40,orbit:0.8},
      dateLabel:"12月19日 晨", title_zh:"魚雷艇白晝突擊 · 維港「輕騎兵衝鋒」", title_en:"The MTB Charge · 'Balaclava of the Sea'",
      narration_zh:"十九日晨，皇家海軍第二魚雷艇隊在甘地中校率領下，冒傾盆大雨與滿港硝煙，白晝衝入維港，突擊正在增援的日軍登陸艇隊。艇隊損失約四成（包括12號及26號艇），其孤注一擲被譽為「海上的輕騎兵衝鋒」。",
      narration_en:"On the morning of the 19th the Royal Navy's 2nd MTB Flotilla, led by Lt-Cdr Gandy, charges into the harbour in daylight through pouring rain and smoke, attacking the reinforcing Japanese landing craft. About 40% of the boats are lost (among them MTB 12 and MTB 26), in what is remembered as \"the Balaclava of the Sea\".",
      commanders:[{zh:"甘地中校",en:"Lt-Cdr G.H. Gandy"}], focus:["uk_rn"], side:"uk" },

    { day:19, hold:10, cam:{lng:114.190,lat:22.266,dist:700,az:200,el:50,orbit:0.8},
      dateLabel:"12月19日", title_zh:"黃泥涌峽爭奪戰", title_en:"Battle for Wong Nai Chung Gap",
      narration_zh:"日軍奪柏架山、渣甸山，直撲全島樞紐黃泥涌峽——這是整場戰役最血腥的一天。",
      narration_en:"The Japanese take Mount Parker and Jardine's Lookout and drive for Wong Nai Chung Gap, the hinge of the whole Island, on the bloodiest day of the battle.",
      commanders:[{zh:"東海林俊成",en:"Col. Shoji"}], focus:["jp_230","uk_winnipeg","uk_hkvdc"], side:"both" },

    { day:19, hold:9,  cam:{lng:114.187,lat:22.263,dist:520,az:200,el:48,orbit:0.7},
      dateLabel:"12月19日 ~10:00", title_zh:"羅遜准將陣亡 · 港島被切斷", title_en:"Death of Brigadier Lawson",
      narration_zh:"西旅旅部被圍，羅遜准將電告「出去拼了」於掩體外陣亡；港島就此被切成東西兩半。",
      narration_en:"His brigade HQ surrounded, Brigadier Lawson signals he is 'going outside to fight it out' and is killed outside the shelter; the Island is cut in two.",
      commanders:[{zh:"羅遜",en:"Brig. J.K. Lawson"}], focus:["uk_westbde"], side:"uk" },

    { day:19, hold:8,  cam:{lng:114.205,lat:22.267,dist:600,az:20,el:48,orbit:0.8},
      dateLabel:"12月19日", title_zh:"奧斯本準尉畢拿山捨身（VC）", title_en:"CSM Osborn's Victoria Cross",
      narration_zh:"溫尼伯榴彈兵的奧斯本連隊軍士長以身撲手榴彈救部下，追授維多利亞十字勳章。",
      narration_en:"Osborn, a company sergeant-major of the Winnipeg Grenadiers, smothers a grenade with his body to save his men, and is awarded a posthumous Victoria Cross.",
      commanders:[{zh:"奧斯本",en:"CSM J.R. Osborn"}], focus:["uk_winnipeg"], side:"uk" },

    { day:21, hold:8,  cam:{lng:114.197,lat:22.235,dist:720,az:180,el:42,orbit:0.8},
      dateLabel:"12月21日", title_zh:"淺水灣激戰", title_en:"Fighting at Repulse Bay",
      narration_zh:"日軍南下圍攻淺水灣酒店，東旅局部反攻仍被逐步逼向赤柱半島。",
      narration_en:"The Japanese press south and besiege the Repulse Bay Hotel; East Brigade's local counter-attacks cannot halt the push toward the Stanley peninsula.",
      commanders:[{zh:"康姆",en:"Lt-Col Home"}], focus:["jp_230","uk_royalrifles"], side:"both" },

    { day:24, hold:9,  cam:{lng:114.213,lat:22.216,dist:740,az:180,el:44,orbit:0.8},
      dateLabel:"12月24日", title_zh:"赤柱死守", title_en:"Stanley · The Last Stand",
      narration_zh:"華里士率東旅在赤柱半島死守，日軍以戰車支援突破赤柱外線。",
      narration_en:"Wallis and East Brigade hold the Stanley peninsula to the last; tank-supported Japanese assaults break the outer line.",
      commanders:[{zh:"華里士",en:"Brig. Wallis"}], focus:["uk_eastbde","uk_royalrifles","jp_229"], side:"both" },

    { day:25, hold:11, cam:{lng:114.172,lat:22.292,dist:1200,az:0,el:44,orbit:1.0},
      dateLabel:"1941年12月25日", title_zh:"黑色聖誕 · 香港淪陷", title_en:"Black Christmas · The Fall of Hong Kong",
      narration_zh:"水盡彈絕、全島被切斷，楊慕琦總督與莫德庇少將親赴半島酒店向酒井隆中將投降，結束18天戰事。",
      narration_en:"Out of water and ammunition and cut in two, Governor Young and Major-General Maltby surrender to Lt-Gen Sakai at the Peninsula Hotel, ending eighteen days of fighting.",
      commanders:[{zh:"莫德庇 · 酒井隆",en:"Maltby · Sakai"}], focus:["uk_fortress"], side:"both" },
  ];
  const outro = { title_zh:"香港保衛戰 1941", title_en:"The Battle of Hong Kong",
    narration_zh:"十八日苦戰，黑色聖誕。謹記陣亡的將士與罹難的平民。香港淪陷直至1945年夏。",
    narration_en:"Eighteen days of bitter fighting; a Black Christmas. Remember the soldiers who fell and the civilians who died. Hong Kong remained under occupation until the summer of 1945." };

  return { geography, units, arrows, fronts, hotspots, weather, notes, storyboard, outro };
})();
