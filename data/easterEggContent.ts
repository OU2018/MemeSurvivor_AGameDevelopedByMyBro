
// 彩蛋文案配置中心

export interface PraiseStage {
    min: number;
    max: number;
    messages: string[];
    title: string;
}

// 第一次点击的奖励文案
export const FIRST_REWARD = {
    title: "高情商认证！",
    textPart1: "既然你这么诚实，这个成就就送你了！",
    textPart2: "(⁄ ⁄•⁄ω⁄•⁄ ⁄)" // 颜文字单独放
};

// 后续点击的阶段性反馈
export const PRAISE_STAGES: PraiseStage[] = [
    {
        min: 2,
        max: 5,
        title: "低调低调",
        messages: [
            "哎呀，别点啦",
            "知道啦知道啦，不用一直强调~",
            "再点我要脸红了...",
            "你是个诚实的人，我喜欢！",
            "虽然你说的对，但是..."
        ]
    },
    {
        min: 6,
        max: 10,
        title: "别点啦",
        messages: [
            "手不酸吗？",
            "真的没有隐藏功能哦~",
            "按钮要坏掉了...",
            "差不多得了吧喂！",
            "老板在看呢，严肃点！"
        ]
    },
    {
        min: 11,
        max: 15,
        title: "⚠️ 警告",
        messages: [
            "系统检测到异常操作...",
            "再点就要报错了！",
            "危险！帅气值即将溢出！",
            "Don't do it...",
            "Stop right now!"
        ]
    }
];

// 最终崩溃文案
export const GLITCH_CONTENT = {
    title: "系统过载",
    text: "错误：帅气值溢出导致堆栈崩塌。\nStackOverflow Exception: Too_Handsome_To_Handle",
    buttonText: "重启系统 (System Reboot)"
};
