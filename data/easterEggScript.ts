
// 彩蛋交互剧本配置

export const FIRST_REWARD = {
    title: "高情商认证！",
    textPart1: "既然你这么诚实，这个成就就送你了！",
    textPart2: "(⁄ ⁄•⁄ω⁄•⁄ ⁄)"
};

// 线性剧本：从第 2 次点击开始，到第 14 次点击
// 索引 0 对应 点击次数 2
export const CLICK_SCRIPT = [
    "哎呀，别点啦 (⁄ ⁄•⁄ω⁄•⁄ ⁄)",           // 2
    "知道啦知道啦，不用一直强调~",          // 3
    "再点我要脸红了...",                    // 4
    "那个... 手不酸吗？",                   // 5
    "并没有隐藏功能哦，真的！",             // 6
    "好啦，快去玩游戏吧，乖~",              // 7
    "......",                              // 8
    "你是个执着的人，但我真的没词了。",      // 9
    "别点了！再点要坏掉了！",               // 10
    "⚠️ 系统警告：检测到异常操作频率",      // 11
    "⚠️ 警告：帅气值即将溢出缓冲区",        // 12
    "⛔ 错误：CPU 温度过高",                // 13
    "⛔ 严重错误：逻辑核心即将崩溃！！"       // 14
];

export const GLITCH_CONTENT = {
    title: "系统崩溃",
    text: "FATAL ERROR: 帅气值溢出导致堆栈崩塌。\nStackOverflow Exception: Too_Handsome_To_Handle",
    buttonText: "重启系统 (System Reboot)"
};
