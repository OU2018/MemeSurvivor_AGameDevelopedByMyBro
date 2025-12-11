
import { UpgradeOption } from "../../types";

export const BOARD_ITEMS: UpgradeOption[] = [
  {
    id: 'infinite_black_card',
    title: '无限黑卡',
    description: '允许金币 > -2000 时购买。债务无限叠加。',
    rarity: 'mythic',
    category: 'item',
    price: 999,
    maxCount: 1,
    icon: '💳',
    items: ['无限黑卡'],
    tags: ['board'], 
    statTags: ['特权'],
    quote: '“刷公司的卡，让财务去哭吧。”',
    effect: (state) => {
        state.player.items.push('无限黑卡');
    }
  },
  {
    id: 'private_driver',
    title: '专职司机',
    description: '移速 +5。正面撞击时免疫伤害，高速冲撞可造成巨额伤害与击飞。',
    rarity: 'mythic',
    category: 'item',
    price: 1000,
    maxCount: 1,
    icon: '🚗',
    items: ['专职司机'],
    tags: ['board'],
    statTags: ['特权', '移速+', '冲撞'],
    quote: '“让开！老板赶时间！撞坏了公司赔！”',
    effect: (state) => {
        state.player.speed += 5;
        state.player.items.push('专职司机');
    }
  }
];
