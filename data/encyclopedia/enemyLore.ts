
export interface SkillInfo {
    name: string;
    type: 'passive' | 'active' | 'ultimate' | 'mechanism';
    description: string;
    icon: string;
}

export interface EnemyLoreConfig {
    id: string;
    skills: SkillInfo[];
    devNote?: string; // 开发者备注 (用于废案展示)
}

export const ENEMY_LORE: Record<string, EnemyLoreConfig> = {
    // --- 普通怪 (Common) ---
    'keyboard_man': {
        id: 'keyboard_man',
        skills: [
            { name: "祖安连招", type: 'active', description: "向玩家连续发射 3-5 个字符弹幕（'急'、'典'、'孝'），造成多段精神打击。", icon: "⌨️" },
            { name: "道德高地", type: 'passive', description: "站立不动攻击时，攻击速度提升。", icon: "⛰️" }
        ]
    },
    'tian_gou': {
        id: 'tian_gou',
        skills: [
            { name: "自我感动", type: 'passive', description: "发现目标（女神）时移动速度大幅提升。", icon: "😭" },
            { name: "无脑冲锋", type: 'active', description: "不顾一切地向目标发起直线冲撞。", icon: "🚀" }
        ]
    },
    'tian_gou_frenzy': {
        id: 'tian_gou_frenzy',
        skills: [
            { name: "红温", type: 'passive', description: "处于极度愤怒状态，移动速度和碰撞伤害极高。", icon: "😡" },
            { name: "献祭", type: 'mechanism', description: "接触目标后立即自爆，造成范围伤害。", icon: "💥" }
        ]
    },
    'spoiler_dog': {
        id: 'spoiler_dog',
        skills: [
            { name: "剧透警告", type: 'active', description: "以极快的速度接近玩家，试图强行剧透结局。", icon: "🎬" },
            { name: "快人一步", type: 'passive', description: "基础移动速度极快。", icon: "⚡" }
        ]
    },
    'balloon': {
        id: 'balloon',
        skills: [
            { name: "易爆品", type: 'passive', description: "极其脆弱，触碰或被击毁时产生强烈冲击波。", icon: "🎈" },
            { name: "击退波", type: 'mechanism', description: "爆炸不造成伤害，但会将周围所有单位强力推开。", icon: "💨" }
        ]
    },
    'minion': {
        id: 'minion',
        skills: [
            { name: "人海战术", type: 'passive', description: "依靠数量取胜，单个威胁较低。", icon: "👥" },
            { name: "随机游走", type: 'active', description: "没有明确目的地的移动。", icon: "👣" }
        ]
    },
    'boss_ai_clone': {
        id: 'boss_ai_clone',
        devNote: "⚠️ [已废弃] \nAI终结者的附属单位。原计划具有复杂的群体智能，能够协同攻击。因主进程被删，现已成为无主的僵尸进程。",
        skills: [
            { name: "多线程", type: 'passive', description: "AI 终结者的分身进程，数量众多。", icon: "🧬" }
        ]
    },
    'boss_ai_node': {
        id: 'boss_ai_node',
        devNote: "⚠️ [已废弃] \n战术节点。原设计为可构建高压电网的动态掩体。随着 Boss AI 的移除，这些节点失去了控制信号，仅保留了基础移动逻辑。",
        skills: [
            { name: "边缘计算", type: 'passive', description: "沿地图边缘移动，无法攻击。", icon: "📐" },
            { name: "电流网络", type: 'active', description: "与主机（BOSS）连接，形成高伤电流屏障。", icon: "⚡" }
        ]
    },

    // --- 稀有怪 (Rare) ---
    'lemon_head': {
        id: 'lemon_head',
        skills: [
            { name: "酸性体质", type: 'passive', description: "移动路径上会留下持续性的酸液区域，踩上去会大幅减速。", icon: "🍋" },
            { name: "阴阳怪气", type: 'active', description: "近距离接触时造成腐蚀伤害。", icon: "💬" }
        ]
    },
    'gai_liu_zi': {
        id: 'gai_liu_zi',
        skills: [
            { name: "鬼火漂移", type: 'active', description: "围绕玩家进行不规则的高速环绕运动。", icon: "🏍️" },
            { name: "街头智慧", type: 'passive', description: "不会直线接近，难以预判其轨迹。", icon: "👟" }
        ]
    },
    'chi_gua': {
        id: 'chi_gua',
        skills: [
            { name: "前排围观", type: 'passive', description: "移动速度极慢，生命值较高。", icon: "🛡️" },
            { name: "吐瓜子", type: 'active', description: "远程发射瓜子（子弹）进行骚扰。", icon: "🍉" }
        ]
    },
    'marketing_account': {
        id: 'marketing_account',
        skills: [
            { name: "震惊部", type: 'active', description: "发射散射的“谣言”弹幕，覆盖面广。", icon: "📢" },
            { name: "带节奏", type: 'passive', description: "试图通过数量压制玩家。", icon: "🥁" }
        ]
    },
    'tao_wa_med': {
        id: 'tao_wa_med',
        skills: [
            { name: "套娃", type: 'mechanism', description: "死亡时分裂出 2 个小型套娃。", icon: "🎁" }
        ]
    },
    'tao_wa_small': {
        id: 'tao_wa_small',
        skills: [
            { name: "最小单元", type: 'passive', description: "套娃的最后一层，不再分裂。", icon: "🍬" }
        ]
    },
    'river_crab': {
        id: 'river_crab',
        skills: [
            { name: "404护盾", type: 'passive', description: "侧面和背面的伤害大幅降低，只有正面（或者弱点）能造成有效伤害。", icon: "🛡️" },
            { name: "横行霸道", type: 'active', description: "无视碰撞体积，强行推开沿途的单位。", icon: "🦀" }
        ]
    },
    'hr_specialist': {
        id: 'hr_specialist',
        skills: [
            { name: "人文关怀", type: 'active', description: "连接周围血量最低的友方单位，持续回复生命值。", icon: "💚" },
            { name: "避险", type: 'passive', description: "遇到危险时会优先保持距离。", icon: "🏃" }
        ]
    },
    'micro_manager': {
        id: 'micro_manager',
        skills: [
            { name: "紧迫盯人", type: 'active', description: "用黄色连线连接一个下属，大幅提升其移动速度和攻击欲望。", icon: "👁️" }
        ]
    },
    'pie_painter': {
        id: 'pie_painter',
        skills: [
            { name: "画大饼", type: 'active', description: "在玩家脚下生成延迟爆炸的陷阱区域（大饼）。", icon: "🎨" },
            { name: "未来可期", type: 'passive', description: "不会直接进行普攻。", icon: "📅" }
        ]
    },

    // --- 精英怪 (Epic) ---
    'da_ye': {
        id: 'da_ye',
        skills: [
            { name: "气功波", type: 'active', description: "打出一道金色的掌印，击退并伤害路径上的敌人。", icon: "✋" },
            { name: "以和为贵", type: 'passive', description: "极其坚硬的身板，难以被击退。", icon: "☯️" }
        ]
    },
    'clown': {
        id: 'clown',
        skills: [
            { name: "惊喜气球", type: 'active', description: "召唤缓慢移动的爆炸气球，限制玩家走位。", icon: "🎈" },
            { name: "滑稽步伐", type: 'passive', description: "移动路径飘忽不定，难以预测。", icon: "🤡" }
        ]
    },
    'tao_wa_big': {
        id: 'tao_wa_big',
        skills: [
            { name: "无限嵌套", type: 'mechanism', description: "死亡时分裂出 2 个中型套娃。", icon: "📦" }
        ]
    },
    'product_manager': {
        id: 'product_manager',
        skills: [
            { name: "提需求", type: 'active', description: "周期性召唤“工具人”进场。", icon: "📋" }
        ]
    },
    'leech': {
        id: 'leech',
        skills: [
            { name: "吸血冲刺", type: 'active', description: "发现目标后发动带有幻影拖尾的急速冲刺。", icon: "🧛" },
            { name: "寄生吸血", type: 'mechanism', description: "咬住玩家后挂在身上，持续造成伤害并治疗自己和周围的怪物。", icon: "🩸" }
        ]
    },
    'bonus_chest': {
        id: 'bonus_chest',
        skills: [
            { name: "年终奖", type: 'mechanism', description: "击杀后掉落巨额金币。", icon: "💰" },
            { name: "逃跑", type: 'passive', description: "不会攻击，只会快速逃离玩家。", icon: "🏃" }
        ]
    },
    'delivery_guy': {
        id: 'delivery_guy',
        skills: [
            { name: "准时达", type: 'passive', description: "拥有极高的移动速度。", icon: "🛵" },
            { name: "补给包", type: 'mechanism', description: "击杀后掉落大号医疗包。", icon: "🍱" }
        ]
    },
    'elite_manager': {
        id: 'elite_manager',
        skills: [
            { name: "资源优化", type: 'active', description: "抓取周围的友方单位（下属）作为弹药投掷向玩家。被投掷的单位会造成范围爆炸。", icon: "🤌" },
            { name: "微操光束", type: 'ultimate', description: "经过精密的预判，发射一道高能聚焦激光，且具有追踪修正能力。", icon: "👁️" }
        ]
    },
    'elite_hr': {
        id: 'elite_hr',
        skills: [
            { name: "人才评估", type: 'active', description: "发射三道红色的“拒信”（三角），具有极高的飞行速度和穿透力。", icon: "📄" },
            { name: "裁员广进", type: 'ultimate', description: "锁定玩家当前位置，短暂蓄力后发起极速直线冲撞，对路径上的所有单位造成击飞和巨额伤害。并在终点引发爆炸。", icon: "🔻" },
            { name: "压力测试", type: 'passive', description: "周围存在的单位越多，自身的攻击欲望越强。", icon: "📉" }
        ]
    },
    'cyber_goddess': {
        id: 'cyber_goddess',
        skills: [
            { name: "致命飞吻", type: 'active', description: "发射爱心魅惑玩家，使其无法攻击并强制走向女神。", icon: "💋" },
            { name: "提纯结晶", type: 'active', description: "召唤处于“红温”状态的狂热舔狗。", icon: "💎" },
            { name: "星链防御", type: 'passive', description: "周围的舔狗会形成人墙保护女神。", icon: "🛰️" }
        ]
    },
    'capital_crocodile': {
        id: 'capital_crocodile',
        skills: [
            { name: "大鱼吃小鱼", type: 'mechanism', description: "优先吞噬周围的小怪来回复生命值并增加体型。", icon: "🐟" },
            { name: "泡沫破裂", type: 'active', description: "死亡时将吞噬的价值连本带利吐出（爆金币和金币雨）。", icon: "📉" }
        ]
    },

    // --- BOSS ---
    'boss_kpi': {
        id: 'boss_kpi',
        skills: [
            { name: "甩锅大法", type: 'active', description: "向空中抛掷巨大的“黑锅”，落地后产生范围爆炸并留下持续伤害的警示区域。", icon: "🍳" },
            { name: "乱序激光", type: 'active', description: "召唤覆盖半个屏幕的激光网，进行地毯式清理。", icon: "⚡" },
            { name: "内卷风暴", type: 'active', description: "发射螺旋扩散的弹幕，随着时间推移弹幕密度越来越大。", icon: "🌀" },
            { name: "末位淘汰", type: 'ultimate', description: "狂暴阶段：全屏变红，只有处于随机生成的“安全区”内才能幸免于难。", icon: "☠️" }
        ]
    },
    'boss_glitch': {
        id: 'boss_glitch',
        skills: [
            { name: "Lag Spike (卡顿)", type: 'active', description: "强制玩家发生位置回溯（Lag），将其传送回几秒前的位置。", icon: "⏳" },
            { name: "Z-Fighting", type: 'active', description: "模型闪烁，发射带有“虚假”判定的弹幕，干扰视觉。", icon: "👾" },
            { name: "Stack Overflow", type: 'ultimate', description: "召唤巨大的引力漩涡，将玩家吸入中心并造成持续伤害。", icon: "🕳️" },
            { name: "BSOD Wall", type: 'mechanism', description: "生成蓝屏死机墙体，阻挡玩家移动并造成触碰伤害。", icon: "🟦" }
        ]
    },
    'boss_ai': {
        id: 'boss_ai',
        devNote: "⚠️ 警告：该档案数据已损坏 ⚠️\n该单位原定为最终 BOSS，拥有完美的 AI 逻辑。但在编译阶段因底层架构冲突（屎山代码）导致崩溃，数据已被 Bug 集合体同化。目前仅展示设定草稿。\n\n状态：[已废弃 / DEPRECATED]",
        skills: [
            { name: "Defrag Storm", type: 'active', description: "（未实装）对全图进行碎片整理，生成随机的高伤区域。", icon: "🌩️" },
            { name: "Data Stream", type: 'active', description: "（未实装）发射高密度的黄色数据流弹幕，模拟 DDOS 攻击。", icon: "🌊" },
            { name: "Fatal Exception", type: 'ultimate', description: "（未实装）致命错误冲撞，速度极快且无法被打断。", icon: "🚫" },
            { name: "Chaos Morph", type: 'passive', description: "（未实装）能够模拟其他角色的攻击模式。", icon: "🎭" }
        ]
    }
};
