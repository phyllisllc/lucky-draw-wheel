// 抽奖转盘核心逻辑

// 全局变量
let isRotating = false; // 是否正在旋转
let remainingChances = 3; // 剩余抽奖次数
const maxChances = 3; // 最大抽奖次数
let currentAngle = 0; // 当前旋转角度

// 奖项数据
const prizes = [
    { name: '一等奖', value: 'iPhone 15', color: '#FFD700', probability: 1 },
    { name: '二等奖', value: '100元红包', color: '#C0C0C0', probability: 3 },
    { name: '三等奖', value: '20元话费', color: '#CD7F32', probability: 6 },
    { name: '四等奖', value: '5元红包', color: '#FF6B6B', probability: 10 },
    { name: '五等奖', value: '1元红包', color: '#4ECDC4', probability: 20 },
    { name: '谢谢参与', value: '再接再厉', color: '#E9ECEF', probability: 60 }
];

// DOM元素
const turntable = document.getElementById('turntable');
const canvas = document.getElementById('turntableCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const chancesTip = document.getElementById('chancesTip');
const resultModal = document.getElementById('resultModal');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
const closeBtn = document.getElementById('closeBtn');

// 页面加载完成后初始化
window.onload = function() {
    init();
};

// 初始化函数
function init() {
    // 从本地存储加载抽奖次数
    loadChances();
    
    // 绘制转盘
    drawTurntable();
    
    // 添加事件监听
    startBtn.addEventListener('click', startRotate);
    closeBtn.addEventListener('click', closeResult);
    
    // 窗口大小改变时重新绘制转盘
    window.addEventListener('resize', function() {
        // 重置canvas上下文的缩放
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        // 重新绘制转盘
        drawTurntable();
    });
    
    // 初始化微信分享
    initWechatShare();
}

// 从本地存储加载抽奖次数
function loadChances() {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('lotteryDate');
    const savedChances = localStorage.getItem('lotteryChances');
    
    // 如果是同一天，加载保存的次数；否则重置次数
    if (savedDate === today && savedChances !== null) {
        remainingChances = parseInt(savedChances);
    } else {
        remainingChances = maxChances;
        saveChances();
    }
    
    // 更新提示信息
    updateChancesTip();
}

// 保存抽奖次数到本地存储
function saveChances() {
    const today = new Date().toDateString();
    localStorage.setItem('lotteryDate', today);
    localStorage.setItem('lotteryChances', remainingChances.toString());
}

// 更新抽奖次数提示
function updateChancesTip() {
    if (remainingChances > 0) {
        chancesTip.textContent = '剩余抽奖次数：' + remainingChances;
    } else {
        chancesTip.textContent = '抽奖次数已用完';
        startBtn.classList.add('disabled');
        startBtn.disabled = true;
    }
}

// 绘制转盘
function drawTurntable() {
    // 确保canvas分辨率与显示尺寸一致，防止变形
    const updateCanvasSize = () => {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // 设置canvas的内部分辨率
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        // 调整绘图上下文比例
        ctx.scale(dpr, dpr);
        
        // 设置canvas的CSS尺寸
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    };
    
    // 更新canvas尺寸
    updateCanvasSize();
    
    // 重新计算转盘参数
    const width = (canvas.width / window.devicePixelRatio) / 2; // 转盘半径
    const centerX = width; // 中心点X坐标
    const centerY = width; // 中心点Y坐标
    const angle = 2 * Math.PI / prizes.length; // 每个扇形的角度
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制每个奖项区域
    for (let i = 0; i < prizes.length; i++) {
        const prize = prizes[i];
        const startAngle = i * angle;
        const endAngle = (i + 1) * angle;
        
        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, width, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = prize.color;
        ctx.fill();
        
        // 绘制分割线
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + width * Math.cos(startAngle), centerY + width * Math.sin(startAngle));
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制奖项名称
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + angle / 2);
        // 根据canvas大小调整字体大小
        const fontSize = Math.max(12, width * 0.08);
        ctx.font = fontSize + 'px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(prize.name, width * 0.6, fontSize * 0.35);
        ctx.restore();
    }
    
    // 绘制内圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
}

// 开始抽奖
function startRotate() {
    // 检查是否还有抽奖次数
    if (remainingChances <= 0) {
        alert('抽奖次数已用完');
        return;
    }
    
    // 防止重复点击
    if (isRotating) {
        return;
    }
    
    // 设置旋转中状态
    isRotating = true;
    startBtn.textContent = '抽奖中...';
    startBtn.classList.add('disabled');
    startBtn.disabled = true;
    
    // 随机选择一个奖项
    const prizeIndex = selectPrize();
    const prize = prizes[prizeIndex];
    
    // 计算旋转角度和动画时间
    const angle = 360 / prizes.length;
    const additionalSpins = 5; // 额外旋转的圈数
    const targetPosition = (prizes.length - 1 - prizeIndex) * angle + (angle / 2);
    const targetDeg = currentAngle + (additionalSpins * 360) + targetPosition;
    const duration = 5000; // 旋转动画持续时间（毫秒）
    
    // 确保turntable元素存在
    if (!turntable) {
        console.error('Turntable element not found!');
        return;
    }
    
    // 重置过渡效果
    turntable.style.transition = 'none';
    turntable.style.transform = `rotate(${currentAngle}deg)`;
    
    // 强制重排以确保重置生效
    void turntable.offsetWidth;
    
    // 应用动画效果
    turntable.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
    turntable.style.transform = `rotate(${targetDeg}deg)`;
    
    // 更新当前角度（取模360以避免数值过大）
    currentAngle = targetDeg % 360;
    
    // 减少抽奖次数并保存
    remainingChances--;
    saveChances();
    updateChancesTip();
    
    // 动画结束后显示结果
    setTimeout(() => {
        showResult(prize);
    }, duration);
}

// 随机选择奖项
function selectPrize() {
    // 计算总概率
    let totalProbability = 0;
    for (const prize of prizes) {
        totalProbability += prize.probability;
    }
    
    // 生成随机数
    const random = Math.random() * totalProbability;
    
    // 根据概率选择奖项
    let cumulativeProbability = 0;
    for (let i = 0; i < prizes.length; i++) {
        cumulativeProbability += prizes[i].probability;
        if (random < cumulativeProbability) {
            return i;
        }
    }
    
    // 默认返回最后一个奖项
    return prizes.length - 1;
}

// 显示抽奖结果
function showResult(prize) {
    // 重置旋转状态
    isRotating = false;
    
    // 恢复按钮状态
    if (remainingChances > 0) {
        startBtn.textContent = '开始抽奖';
        startBtn.classList.remove('disabled');
        startBtn.disabled = false;
    } else {
        startBtn.textContent = '抽奖次数已用完';
    }
    
    // 设置结果信息
    if (prize.name === '谢谢参与') {
        resultIcon.className = 'result-icon fail';
        resultIcon.textContent = '✗';
        resultTitle.textContent = '再接再厉！';
        resultMessage.textContent = prize.value;
    } else {
        resultIcon.className = 'result-icon success';
        resultIcon.textContent = '✓';
        resultTitle.textContent = '恭喜中奖！';
        resultMessage.textContent = '恭喜获得 ' + prize.value;
    }
    
    // 显示结果弹窗
    resultModal.style.display = 'flex';
}

// 关闭结果弹窗
function closeResult() {
    resultModal.style.display = 'none';
}

// 初始化微信分享（可选功能，保留但简化）
function initWechatShare() {
    // 检测是否在微信环境中
    const isWechat = /MicroMessenger/i.test(navigator.userAgent);
    
    // 微信分享功能需要后端配合，这里仅保留基础结构
    if (isWechat) {
        console.log('WeChat environment detected. Share functionality would require backend integration.');
    }
}