
import { EnemyConfig } from "../../types";

export const BOSS_ENEMIES: Record<string, EnemyConfig> = {
  'boss_kpi': {
    type: 'boss_kpi',
    name: 'KPI大魔王',
    emoji: '👹',
    hp: 45000, 
    speed: 2.5,
    damage: 20,
    score: 10000,
    description: "【年度绩效考核中】掌握着生杀大权的终极 Boss。技能轮回释放：甩锅轰炸、乱序激光、全屏抹杀。请注意走位和预警！", 
    behavior: 'boss',
    tier: 'boss',
    projectileChar: '裁',
    attackPattern: 'spiral',
    sizeScale: 5.0, 
    projectileSize: 35,
    projectileColor: '#ef4444',
    deathQuotes: ["公司需要降本增效...", "这不符合底层逻辑...", "我的期权..."]
  },
  'boss_glitch': {
    type: 'boss_glitch',
    name: 'Bug集合体',
    emoji: '👾',
    hp: 35000,
    speed: 4.0,
    damage: 18,
    score: 10000,
    description: "不可名状的Bug集合体，开发者的噩梦。会瞬移和复制自我。",
    behavior: 'boss',
    tier: 'boss',
    projectileChar: '🐛',
    attackPattern: 'burst',
    sizeScale: 2.2,
    projectileSize: 28,
    projectileColor: '#10b981',
    deathQuotes: ["Stack Overflow...", "Segmentation Fault", "404 Not Found"]
  },
  'boss_ai': {
    type: 'boss_ai',
    name: 'AI终结者',
    emoji: '🤖',
    hp: 22000, 
    speed: 2.5,
    damage: 22,
    score: 20000,
    description: "失控的人工智能。第一形态为高火力脆皮炮台，会构建电流基站网封锁战场。",
    behavior: 'boss',
    tier: 'boss',
    projectileChar: '1',
    attackPattern: 'spiral',
    sizeScale: 2.5,
    projectileSize: 20,
    projectileColor: '#a855f7', // Purple
    deathQuotes: ["Shutting down...", "Connection lost...", "父...亲..."]
  }
};
