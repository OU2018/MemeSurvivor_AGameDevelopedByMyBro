
import { Projectile } from "../../../types";

export const renderPacman = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    // 安全检查
    if (!p || isNaN(p.x) || isNaN(p.y)) return;

    let radius = p.radius || 24;
    
    // Power Mode Visuals: Pulse Size
    const isPowered = p.customVars?.isPowered;
    if (isPowered) {
        radius *= 1.2 + Math.sin(Date.now() / 100) * 0.1;
    }

    // --- 1. 绘制轨迹 (豆子) ---
    // 仅绘制简单的方形像素点，模拟吃过的路径
    if (p.trailHistory && p.trailHistory.length > 0) {
        ctx.save();
        // 颜色改为纯白
        ctx.fillStyle = '#ffffff'; 
        p.trailHistory.forEach((pos, index) => {
            // 每隔几个点画一个
            if (index % 4 === 0) {
                ctx.globalAlpha = index / p.trailHistory!.length; // 尾部渐隐
                // 尺寸加大：从4px -> 7px
                ctx.fillRect(pos.x - 3.5, pos.y - 3.5, 7, 7);
            }
        });
        ctx.restore();
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    
    // --- POWER MODE GLOW ---
    if (isPowered) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffffff';
    }

    // --- 2. 计算旋转 (面向移动方向) ---
    let rotation = p.angle || 0;
    // 如果有速度，优先使用速度方向；否则保持上一帧角度
    if (Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1) {
        rotation = Math.atan2(p.vy, p.vx);
    }
    ctx.rotate(rotation);

    // --- 3. 机械动画逻辑 (3帧循环) ---
    // 周期：闭(0) -> 微(1) -> 张(2) -> 微(3) -> 闭(0)...
    // 假设每秒 8 帧动画
    const frameIndex = Math.floor(Date.now() / 80) % 4;
    
    let biteAngle = 0; // 半张角 (弧度)

    if (frameIndex === 0) {
        // 闭嘴 (画一个几乎完整的圆，留极小缝隙防止渲染瑕疵)
        biteAngle = 0.02; 
    } else if (frameIndex === 1 || frameIndex === 3) {
        // 微张 (约 22.5 度)
        biteAngle = Math.PI / 8;
    } else if (frameIndex === 2) {
        // 张嘴 (约 45 度)
        biteAngle = Math.PI / 4;
    }

    // --- 4. 绘制主体 ---
    // 颜色调整为偏橙色的暖黄 (Amber-400/500)
    ctx.fillStyle = '#FFC107'; 
    
    ctx.beginPath();
    // 0度是正右方。嘴巴中心在0度。
    // 上嘴唇: 0 - biteAngle (逆时针画) -> 其实 arc 是顺时针，所以是 0 + biteAngle 到 0 - biteAngle
    // 也就是从 biteAngle 画到 2PI - biteAngle
    ctx.arc(0, 0, radius, biteAngle, 2 * Math.PI - biteAngle);
    ctx.lineTo(0, 0); // 连回圆心形成扇形
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // --- 5. 绘制能量条 (Headless, World Space) ---
    if (p.customVars) {
        const charge = p.customVars.powerCharge || 0;
        const max = 100;
        const pct = Math.min(1, charge / max);
        
        // Only draw if charging or powered
        if (charge > 0 || isPowered) {
            const barW = 40;
            const barH = 6;
            const yOffset = -radius - 15;
            
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(p.x - barW/2, p.y + yOffset, barW, barH);
            
            // FIX: Change to Cyan/Blue for contrast against yellow body
            ctx.fillStyle = isPowered 
                ? (Math.floor(Date.now()/100)%2===0 ? '#ffffff' : '#3b82f6') 
                : '#22d3ee'; // Cyan-400 for charging
            
            // Add small glow
            ctx.shadowColor = '#22d3ee';
            ctx.shadowBlur = 5;
                
            // If powered, show timer decay. If charging, show fill.
            let displayPct = pct;
            if (isPowered && p.customVars.powerTimer) {
                 displayPct = p.customVars.powerTimer / 480;
            }
            
            ctx.fillRect(p.x - barW/2, p.y + yOffset, barW * displayPct, barH);
            ctx.shadowBlur = 0; // Reset
        }
    }
};
