
import { UpgradeOption } from "../../types";

export const PIERCE_ITEMS: UpgradeOption[] = [
  {
    id: 'hot_search',
    title: '买热搜',
    description: '子弹穿透 +1。',
    rarity: 'rare',
    category: 'upgrade',
    price: 140,
    icon: '🔥',
    tags: ['market'], 
    statTags: ['穿透+'],
    quote: '“没有什么是一条热搜解决不了的。如果有，就再买一条。”',
    effect: (state) => {
        state.player.projectilePierce += 1;
        // Damage penalty removed
    }
  },
  {
      id: 'algorithm_push',
      title: '算法推荐',
      description: '穿透 +1，弹速 +15%。',
      rarity: 'epic',
      category: 'upgrade',
      price: 300,
      icon: '📡', 
      tags: ['tech', 'market'], 
      statTags: ['穿透+', '弹速+'],
      quote: '“精准推送。哪怕你不想看，也要塞到你眼前。”',
      effect: (state) => { 
        state.player.projectilePierce += 1;
        state.player.projectileSpeed *= 1.15;
      }
  }
];
