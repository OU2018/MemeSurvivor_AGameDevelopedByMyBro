
import { EnemyConfig } from "../../types";

export const COMMON_ENEMIES: Record<string, EnemyConfig> = {
  'keyboard_man': {
    type: 'keyboard_man',
    name: '键盘侠',
    emoji: '⌨️',
    hp: 24,
    speed: 2,
    damage: 8,
    score: 15,
    description: "野生键盘侠，擅长远程输出观点，一喷就是一串。",
    behavior: 'shooter',
    tier: 'common',
    projectileChar: '急',
    burstPhrases: ["你怎么", "急了急了", "这就破防", "不会吧", "就这？", "笑死我了", "纯路人", "有一说一"],
    attackPattern: 'burst', 
    sizeScale: 1.0,
    projectileSize: 20, 
    projectileColor: '#f87171',
    deathQuotes: ["急了急了", "我键盘坏了", "不至于吧", "典", "我不服"]
  },
  'tian_gou': {
    type: 'tian_gou',
    name: '舔狗',
    emoji: '🐶',
    hp: 20,
    speed: 4.5, 
    damage: 6,
    score: 8,
    description: "忠诚的舔狗，看到女神就会不顾一切冲上来，速度极快。",
    behavior: 'chase',
    tier: 'common',
    sizeScale: 0.8,
    deathQuotes: ["女神...", "在吗", "早安", "我错了", "汪"]
  },
  'tian_gou_frenzy': {
    type: 'tian_gou_frenzy',
    name: '狂热舔狗',
    emoji: '🐶', // Visuals handled by AssetCache override in renderer
    hp: 30, // 1.5x HP
    speed: 7.0, // Very fast
    damage: 15,
    score: 15,
    description: "红温状态的狂热粉丝。为了女神献出心脏（自爆）。",
    behavior: 'rusher', // Just rush directly
    tier: 'common',
    sizeScale: 1.0,
    deathQuotes: ["为你而死!", "女神看我!", "啊啊啊!"],
    attackPattern: 'explode' // Self-destruct on hit
  },
  'spoiler_dog': {
    type: 'spoiler_dog',
    name: '剧透狗',
    emoji: '🎬',
    hp: 18,
    speed: 6,
    damage: 7,
    score: 10,
    description: "剧透狗，跑得比谁都快，只为告诉你凶手是谁。",
    behavior: 'chase',
    tier: 'common',
    sizeScale: 0.7,
    deathQuotes: ["凶手是...", "他死了", "结局是..."]
  },
  'balloon': {
    type: 'balloon',
    name: '爆炸气球',
    emoji: '🎈',
    hp: 10,
    speed: 1.5,
    damage: 0,
    score: 1,
    description: "爆炸气球，小丑的玩具。死亡时会产生强烈冲击波推开周围单位(无伤害)。",
    behavior: 'balloon',
    tier: 'common',
    sizeScale: 0.8,
    deathQuotes: ["砰!"]
  },
  'minion': {
    type: 'minion',
    name: '工具人',
    emoji: '🔨',
    hp: 32,
    speed: 1.5,
    damage: 4,
    score: 5,
    description: "工具人，毫无感情的打工机器，会随机游走。",
    behavior: 'minion', 
    tier: 'common',
    sizeScale: 1.0, 
    deathQuotes: ["我是自愿的", "996福报", "我爱加班", "收到"]
  },
  'tao_wa_small': {
    type: 'tao_wa_small',
    name: '禁止套娃(小)',
    emoji: '🍬',
    hp: 20,
    speed: 3,
    damage: 4,
    score: 5,
    description: "禁止套娃（小），终于到头了。",
    behavior: 'chase',
    tier: 'common',
    sizeScale: 0.7,
    deathQuotes: ["结束了", "没了"]
  },
  'boss_ai_clone': {
    type: 'boss_ai_clone',
    name: 'AI拟态进程',
    emoji: '👽', // Alien as clone
    hp: 300, 
    speed: 3.5,
    damage: 15,
    score: 0, 
    description: "AI终结者的多线程分身。脆弱但危险。",
    behavior: 'minion', 
    tier: 'common',
    projectileChar: '0',
    sizeScale: 2.0, 
    projectileSize: 15,
    projectileColor: '#d8b4fe', // Light Purple
    deathQuotes: ["Process killed", "PID 0"]
  },
  'boss_ai_node': {
    type: 'boss_ai_node',
    name: '代理基站',
    emoji: '🔮', // Crystal
    hp: 600, // Very fragile
    speed: 2.5, // Moving speed along edge
    damage: 10,
    score: 50, // Low score for spammy mobs
    description: "AI终结者的远程节点。沿边缘移动，与主机连接形成高压电网。请优先摧毁！",
    behavior: 'minion', 
    tier: 'common',
    sizeScale: 1.5,
    projectileColor: '#d8b4fe', // Light Purple
    deathQuotes: ["Node Offline", "Signal Lost"]
  }
};
