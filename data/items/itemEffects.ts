
import { GameState } from "../../types";

export const ITEM_EFFECTS: Record<string, (state: GameState) => void> = {
    'membrane_keyboard': (state) => { state.player.attackSpeed = Math.max(5, state.player.attackSpeed - 2); },
    'keyboard_cleaner': (state) => { state.player.attackDamage += 2; },
    '5g_speed': (state) => { state.player.speed += 0.5; },
    'coffee': (state) => {
        state.player.projectileSpeed += 1;
        state.player.attackSpeed = Math.max(5, state.player.attackSpeed - 1);
    },
    'screen_protector': (state) => {
        state.player.maxShield += 30;
        state.player.items.push('钢化膜');
    },
    'wifi_booster': (state) => {
        state.player.projectileSpeed += 1;
        state.player.items.push('WiFi');
    },
    'energy_drink': (state) => {
        state.player.speed += 0.8;
        state.player.items.push('红牛');
    },
    'quantum_reading': (state) => {
        state.player.attackSpeed = Math.max(5, state.player.attackSpeed - 3);
        state.player.projectileSpeed *= 0.9;
        state.player.items.push('量子速读');
    },
    'mechanical_keyboard': (state) => { state.player.attackSpeed = Math.max(5, state.player.attackSpeed - 4); },
    'thick_face': (state) => { state.player.maxHp += 30; },
    'big_lung': (state) => { state.player.attackDamage += 5; },
    'black_pot': (state) => {
        state.player.damageReflection += 0.5;
        state.player.items.push('黑锅');
    },
    'fishing_guide': (state) => {
        state.player.dodgeChance += 0.15;
        state.player.items.push('摸鱼指南');
    },
    'e_wooden_fish': (state) => { state.player.items.push('木鱼'); },
    'red_envelope': (state) => { state.player.items.push('红包'); },
    'koi_fish': (state) => {
        state.player.dropRate += 0.03;
        state.player.items.push('欧皇附体');
    },
    'cyber_amulet': (state) => {
        state.player.items.push('护身符');
    },
    'n_plus_one': (state) => { state.player.items.push('N+1'); },
    'team_building': (state) => {
        state.player.hpRegen += 1;
    },
    'lottery_ticket': (state) => {
        const rand = Math.random();
        let win = 0;
        if (rand < 0.0001) win = 150000;
        else if (rand < 0.01) win = 1500;
        else if (rand < 0.05) win = 500;
        else if (rand < 0.15) win = 200;
        else if (rand < 0.40) win = 150;
        else if (rand < 0.70) win = 100;
        else win = 0;
        
        state.player.gold += win;
        state.score += win;
        state.waveStats.goldEarned += win;
        state.waveStats.bonusGold += win;

        if (win >= 150000) {
            state.modalMessage = { title: "中头奖啦!!!", text: `你获得了 ${win} 资金! 财富自由!`, type: 'win' };
        } else if (win > 0) {
            state.modalMessage = { title: "恭喜中奖!", text: `你获得了 ${win} 资金!`, type: 'win' };
        } else {
            state.modalMessage = { title: "谢谢惠顾", text: "下次一定中...", type: 'info' };
        }
    },
    'hot_search': (state) => {
        state.player.projectilePierce += 1;
        state.player.attackDamage *= 0.9;
    },
    'fan_group': (state) => {
        state.player.projectileCount += 1;
        state.player.attackDamage *= 0.9;
    },
    'goji_berry': (state) => {
        state.player.items.push('养生枸杞');
    },
    'rgb_keyboard': (state) => { state.player.attackSpeed = Math.max(5, state.player.attackSpeed * 0.75); },
    'coupon': (state) => {
        state.player.shopDiscount *= 0.8;
        state.player.items.push('优惠券');
    },
    'insurance': (state) => { state.player.items.push('高额意外险'); },
    'ppt_master': (state) => { state.player.items.push('PPT'); },
    'algorithm_push': (state) => { 
        state.player.projectilePierce += 1;
        state.player.projectileSpeed *= 1.15;
    },
    'fishing_license': (state) => { state.player.items.push('摸鱼执照'); },
    'wolf_culture': (state) => { state.player.items.push('狼性文化'); },
    'ipo': (state) => { 
        state.player.attackDamage *= 1.3;
    },
    'work_fat': (state) => {
        state.player.radius *= 1.2;
        state.player.maxHp = Math.ceil(state.player.maxHp * 1.2);
        state.player.hp += 20; 
        state.player.speed *= 0.95;
        state.player.items.push('工伤肥');
    },
    'health_for_damage': (state) => {
        state.player.maxHp = Math.max(1, Math.floor(state.player.maxHp * 0.7));
        if (state.player.hp > state.player.maxHp) state.player.hp = state.player.maxHp;
        state.player.attackDamage *= 1.5;
        state.player.items.push('透支未来');
    },
    'street_lamp': (state) => {
        state.player.lifeSteal += 0.02;
        state.player.items.push('路灯');
    },
    'quirky_gun': (state) => {
        state.player.backwardShots += 1;
        state.player.items.push('古灵精怪枪');
    },
    'involution_king': (state) => {
        state.player.attackDamage *= 1.5;
        state.player.attackSpeed *= 0.8;
        state.player.speed *= 1.2;
        state.player.maxHp = Math.max(1, state.player.maxHp - 10);
        if (state.player.hp > state.player.maxHp) state.player.hp = state.player.maxHp;
        state.player.items.push('卷王');
    },
    'soft_landing': (state) => {
        state.inflationRate = 0;
        state.player.items.push('软着陆');
    },
    'ddl': (state) => {
        state.player.attackDamage *= 2.0;
        state.player.maxHp = Math.floor(state.player.maxHp * 0.5);
        if (state.player.hp > state.player.maxHp) state.player.hp = state.player.maxHp;
        state.player.items.push('死线');
    },
    'layoff_letter': (state) => {
        state.player.items.push('裁员信');
    },
    'capital_power': (state) => { state.player.items.push('钞能力'); },
    'brain_drain': (state) => { state.player.items.push('降智光环'); },
    'revive_coin': (state) => { state.player.items.push('买命钱'); }
};
