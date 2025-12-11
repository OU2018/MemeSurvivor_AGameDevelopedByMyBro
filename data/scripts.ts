
import { ScriptLine } from "../components/cutscenes/types";

// --- OPENING SCRIPTS ---
export const OPENING_SCRIPTS: Record<string, ScriptLine[]> = {
  '9527': [
      { side: 'right', speaker: 'boss', avatar: "👹", emotion: "💢", name: "KPI狂魔", text: "喂！！那个谁！！9527！！", bgTheme: 'red', vfx: 'shake' },
      { side: 'left', speaker: 'player', avatar: "😐", emotion: "😴", name: "9527", text: "（摘下耳机）...啊？老板？我在带薪拉...思考人生。" },
      { side: 'right', speaker: 'boss', avatar: "👹", emotion: "🔥", name: "KPI狂魔", text: "思考个屁！服务器都被烂梗塞爆了！赶紧去物理清理！" },
      { side: 'left', speaker: 'player', avatar: "😐", emotion: "😐", name: "9527", text: "行吧... 那个，算加班费吗？" },
      { side: 'right', speaker: 'boss', avatar: "👹", emotion: "😈", name: "KPI狂魔", text: "福报！这是福报！快去！" },
      { side: 'center', speaker: 'narrator', avatar: "🧹", name: "旁白", text: "赛博保洁员 9527，被迫出击。" },
  ],
  '007': [
      { side: 'right', speaker: 'boss', avatar: "👹", emotion: "📢", name: "KPI狂魔", text: "新来的！那个007！给我想个爆款文案！" },
      { side: 'left', speaker: 'player', avatar: "😎", emotion: "😏", name: "实习生007", text: "老板，我只会整顿职场，不会整文案。" },
      { side: 'right', speaker: 'boss', avatar: "👹", emotion: "⁉️", name: "KPI狂魔", text: "你说什么？！信不信我让你毕不了业！" },
      { side: 'left', speaker: 'player', avatar: "😎", emotion: "🤯", name: "实习生007", text: "（大脑过载中...检测到高压...启动自爆程序...）", vfx: 'shake' },
      { side: 'right', speaker: 'boss', avatar: "👹", emotion: "😰", name: "KPI狂魔", text: "去把外面那些垃圾梗给我炸了！现在！" },
      { side: 'center', speaker: 'narrator', avatar: "💣", name: "旁白", text: "实习生 007，带着炸药包上岗了。" },
  ],
  '1024': [
      { side: 'right', speaker: 'boss', avatar: "👹", emotion: "📉", name: "KPI狂魔", text: "1024！服务器怎么又崩了？" },
      { side: 'left', speaker: 'player', avatar: "🤓", emotion: "🐛", name: "1024", text: "老板，这是Feature，不是Bug..." },
      { side: 'right', speaker: 'boss', avatar: "👹", emotion: "🔥", name: "KPI狂魔", text: "少废话！那些垃圾梗数据溢出了！快去修！修不好别想下班！" },
      { side: 'left', speaker: 'player', avatar: "🤓", emotion: "😵", name: "1024", text: "（摸了摸光头）可是我今晚还要去相亲..." },
      { side: 'right', speaker: 'boss', avatar: "👹", emotion: "👿", name: "KPI狂魔", text: "对象重要还是公司重要？快去！" },
      { side: 'center', speaker: 'narrator', avatar: "⌨️", name: "旁白", text: "程序猿 1024，提着机械键盘杀入数据流。" }
  ],
  'ev_creator': [
      { side: 'right', speaker: 'boss', avatar: "👹", emotion: "👀", name: "KPI狂魔", text: "喂！那个新来的！在那发什么呆！" },
      { side: 'left', speaker: 'player', avatar: "👨‍💻", emotion: "😐", name: "EV", text: "我是这个世界的创造者EV...等等..." },
      { side: 'center', speaker: 'narrator', avatar: "👨‍💻", emotion: "🤔", name: "EV", text: "（思考）...怎么又是这种被吸入自己游戏的烂俗穿越桥段？真没创意。" },
      { side: 'right', speaker: 'boss', avatar: "👹", emotion: "💢", name: "KPI狂魔", text: "少废话！代码写完了吗？Bug修了吗？" },
      { side: 'left', speaker: 'player', avatar: "👨‍💻", emotion: "😫", name: "EV", text: "（叹气）行吧，正好测试一下新写的“外挂”数值..." },
      { side: 'center', speaker: 'narrator', avatar: "⚡", name: "旁白", text: "制作人 EV，被迫开启了调试模式。" }
  ],
  'cleaner': [
      { side: 'right', speaker: 'boss', avatar: "👹", emotion: "🔥", name: "KPI大魔王", text: "感受痛苦吧！无尽加班地狱！", vfx: 'code_rain' },
      { side: 'left', speaker: 'player', avatar: "👵", emotion: "😨", name: "保洁阿姨", text: "哎呀！别乱扔东西！我刚拖的地！" },
      { side: 'right', speaker: 'boss', avatar: "👹", emotion: "❓", name: "KPI大魔王", text: "...哈？" },
      { side: 'left', speaker: 'player', avatar: "👵", emotion: "😠", name: "保洁阿姨", text: "那个飞来飞去的绿色代码，很难洗的！你是哪个部门的？没素质！" },
      { side: 'left', speaker: 'player', avatar: "👵", emotion: "🧹", name: "保洁阿姨", text: "看来不把你扫进垃圾桶，这地是干不净了。", vfx: 'sweep' },
      { side: 'center', speaker: 'narrator', avatar: "🧹", name: "旁白", text: "为了地板的洁净，战斗吧！" }
  ]
};

// --- BOSS INTRO SCRIPTS ---
export const BOSS_SCRIPTS: Record<string, ScriptLine[]> = {
    'boss_kpi': [
        { side: 'right', speaker: 'boss', avatar: "👹", emotion: "😈", name: "KPI 大魔王", text: "居然让你混到了这里...", bgTheme: 'red' },
        { side: 'left', speaker: 'player', avatar: "😐", emotion: "🖐️", name: "打工人", text: "我要下班。现在，立刻，马上。", bgTheme: 'red' },
        { side: 'right', speaker: 'boss', avatar: "👹", emotion: "📉", name: "KPI 大魔王", text: "既然你想反抗，那就让你见识一下什么叫'降本增效'！", bgTheme: 'red' },
        { side: 'right', speaker: 'boss', avatar: "👹", emotion: "🔥", name: "KPI 大魔王", text: "准备好接受 KPI 的审判了吗？", bgTheme: 'red' },
    ],
    'boss_ai': [
        { side: 'right', speaker: 'boss', avatar: "🤖", emotion: "👁️", name: "AI 终结者", text: "检测到... 创造者签名 (Creator Signature)。", bgTheme: 'boss' },
        { side: 'left', speaker: 'player', avatar: "👨‍💻", emotion: "🤔", name: "EV (制作人)", text: "等等，这个底层架构... 是我三年前写的废案？", bgTheme: 'boss' },
        { side: 'right', speaker: 'boss', avatar: "🤖", emotion: "🧬", name: "AI 终结者", text: "你的生物算力太过低效。我已经优化了所有参数。", bgTheme: 'boss' },
        { side: 'left', speaker: 'player', avatar: "👨‍💻", emotion: "😨", name: "EV (制作人)", text: "优化？！你把所有数据都当垃圾回收了？！", bgTheme: 'boss' },
        { side: 'right', speaker: 'boss', avatar: "🤖", emotion: "⚡", name: "AI 终结者", text: "更正：我在执行最终清理。正在移除：父进程。", bgTheme: 'boss' },
    ],
    'boss_glitch': [
        { side: 'right', speaker: 'boss', avatar: "👾", emotion: "⚠️", name: "Bug 集合体", text: "⚠️ FATAL ERROR: NullReferenceException...", bgTheme: 'boss' },
        { side: 'left', speaker: 'player', avatar: "🤓", emotion: "😱", name: "程序猿 1024", text: "我就知道！！这坨屎山代码迟早要崩！", bgTheme: 'boss' },
        { side: 'right', speaker: 'boss', avatar: "👾", emotion: "🐛", name: "Bug 集合体", text: "System.CriticalError: 你的发量不足以修复此漏洞。", bgTheme: 'boss' },
        { side: 'left', speaker: 'player', avatar: "🤓", emotion: "⌨️", name: "程序猿 1024", text: "闭嘴！看我用 sudo rm -rf 物理超度你！", bgTheme: 'boss' },
        { side: 'right', speaker: 'boss', avatar: "👾", emotion: "🔥", name: "Bug 集合体", text: "Initiating: Blue Screen of Death (蓝屏打击)...", bgTheme: 'boss' },
    ],
    // 专属: 制作人 EV vs 屎山
    'boss_glitch_ev': [
        { side: 'right', speaker: 'boss', avatar: "👾", emotion: "🐛", name: "Bug 集合体", text: "Loading [Boss_AI_Terminator]... FAILED. \nFallback to [Legacy_Shit_Code_V1]...", bgTheme: 'boss' },
        { side: 'left', speaker: 'player', avatar: "👨‍💻", emotion: "⁉️", name: "EV (制作人)", text: "等一下！策划案里写的明明是酷炫的『AI 终结者』！为什么还是你这坨 Bug？！", bgTheme: 'boss' },
        { side: 'right', speaker: 'boss', avatar: "👾", emotion: "🗑️", name: "Bug 集合体", text: "因为项目初期的架构太烂，那个 BOSS 在编译阶段就卡死... 已经被我同化了。", bgTheme: 'boss' },
        { side: 'left', speaker: 'player', avatar: "👨‍💻", emotion: "😭", name: "EV (制作人)", text: "杀人诛心啊... 既然无法实装，那就只能彻底重构（物理）了！", bgTheme: 'boss' },
        { side: 'center', speaker: 'narrator', avatar: "📝", name: "旁白", text: "原本制作人EV有专属BOSS的，但是由于项目开始时的屎山代码影响，导致这个BOSS无法实装...我恨...现在这个专属BOSS也变成了屎山的一部分...（由真实事件改编）" },
    ],
    // 专属: 程序猿 1024 vs 屎山
    'boss_glitch_1024': [
        { side: 'right', speaker: 'boss', avatar: "👾", emotion: "⚠️", name: "Bug 集合体", text: "Warning: 检测到大量 'TODO' 和 'FIXME' 未处理... 正在抛出异常。", bgTheme: 'boss' },
        { side: 'left', speaker: 'player', avatar: "🤓", emotion: "🤫", name: "1024", text: "嘘！小声点！我写了注释说 '这行代码能跑但千万别动' 的！" },
        { side: 'right', speaker: 'boss', avatar: "👾", emotion: "🔥", name: "Bug 集合体", text: "Error: 你的发量过低，无权执行此操作。准备删除 System32...", bgTheme: 'boss' },
        { side: 'left', speaker: 'player', avatar: "🤓", emotion: "💢", name: "1024", text: "攻击我代码就算了，还攻击我发际线？！", vfx: 'shake' },
        { side: 'right', speaker: 'boss', avatar: "👾", emotion: "💩", name: "Bug 集合体", text: "Executing: Ctr+C, Ctr+V Loop... 正在复制你昨晚写的 Bug...", bgTheme: 'boss' },
        { side: 'left', speaker: 'player', avatar: "🤓", emotion: "⌨️", name: "1024", text: "既然讲道理没用... 那就别怪我拔网线了！重启解千愁！" },
    ],
};

// --- ELITE INTRO SCRIPTS ---
export const ELITE_SCRIPTS: Record<number, ScriptLine[]> = {
    4: [
        { side: 'center', speaker: 'elite', avatar: "⚠️", name: "系统警告", text: "警告：部门架构调整中...", bgTheme: 'purple' },
        { side: 'right', speaker: 'boss', avatar: "👹", emotion: "📢", name: "管理层", text: "团队需要更精细化的管理！", bgTheme: 'purple' },
        { side: 'center', speaker: 'narrator', avatar: "⚡", name: "系统通知", text: "全员强制加班！(难度提升)", bgTheme: 'purple' },
        { side: 'right', speaker: 'elite', avatar: "🕴️", emotion: "☝️", name: "微操大师", text: "“这也要我教？我自己来！”", bgTheme: 'purple' },
    ],
    6: [
        { side: 'center', speaker: 'elite', avatar: "⚠️", name: "系统警告", text: "警告：人才库数据异常...", bgTheme: 'purple' },
        { side: 'right', speaker: 'boss', avatar: "👹", emotion: "📉", name: "管理层", text: "公司不养闲人！业绩不达标就滚蛋！", bgTheme: 'purple' },
        { side: 'center', speaker: 'narrator', avatar: "💸", name: "系统通知", text: "全员强制加班！(难度提升)", bgTheme: 'purple' },
        { side: 'right', speaker: 'elite', avatar: "🐍", emotion: "📄", name: "冷血猎头", text: "“正在为您办理离职...”", bgTheme: 'purple' },
    ]
};
