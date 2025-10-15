// 抽奖转盘核心逻辑

// 全局变量
let isRotating = false; // 是否正在旋转
let remainingChances = 3; // 剩余抽奖次数
const maxChances = 3; // 最大抽奖次数

// 奖项数据
const prizes = [
    { name: '800元-50元优惠券', value: '800元-50元优惠券', color: '#FF6B6B', probability: 5 },
    { name: '1500元-100元优惠券', value: '1500元-100元优惠券', color: '#CD7F32', probability: 5 },
    { name: '3000元-200元优惠券', value: '3000元-200元优惠券', color: '#C0C0C0', probability: 5 },
    { name: '5000元-300元优惠券', value: '5000元-300元优惠券', color: '#FFD700', probability: 5 },
    { name: '10000元-500元优惠券', value: '10000元-500元优惠券', color: '#4ECDC4', probability: 79 },
    { name: '德玛仕3500W电磁炉', value: '德玛仕3500W电磁炉IH-QT-3500H1(价值599元)', color: '#FF9800', probability: 1 },
    { name: '华为平板', value: '华为平板HUWEIMatePad(价值1899元)', color: '#9C27B0', probability: 0 },
    { name: '华为Mate XT手机', value: '华为Mate XT 非凡大师 三折叠屏手机(价值19999元)', color: '#E91E63', probability: 0 }
];

// DOM元素
const turntable = document.getElementById('turntable');
const canvas = document.getElementById('turntableCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const testBtn = document.getElementById('testBtn');
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
    testBtn.addEventListener('click', testRotate);
    closeBtn.addEventListener('click', closeResult);
    
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
    const width = canvas.width / 2; // 转盘半径
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
        ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(prize.name, width * 0.6, 8);
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
    const targetDeg = 360 * 5 + (prizes.length - 1 - prizeIndex) * angle + (angle / 2);
    const duration = 5000; // 旋转动画持续时间（毫秒）
    
    // 更新样式，触发旋转动画
    turntable.style.transition = `transform ${duration}ms ease-out`;
    turntable.style.transform = `rotate(${targetDeg}deg)`;
    
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

// 初始化微信分享
function initWechatShare() {
    // 检测是否在微信环境中
    const isWechat = /MicroMessenger/i.test(navigator.userAgent);
    
    if (isWechat) {
        // 这里需要后端提供签名等信息，下面是示例代码
        // 实际使用时需要替换为真实的接口调用
        /*
        wx.config({
            debug: false,
            appId: '', // 必填，公众号的唯一标识
            timestamp: '', // 必填，生成签名的时间戳
            nonceStr: '', // 必填，生成签名的随机串
            signature: '',// 必填，签名
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage']
        });
        
        wx.ready(function() {
            // 分享给朋友
            wx.onMenuShareAppMessage({
                title: '幸运抽奖转盘', // 分享标题
                desc: '快来试试手气，抽大奖！', // 分享描述
                link: window.location.href, // 分享链接
                imgUrl: 'assets/images/share.svg', // 分享图标
                type: '', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function() {
                    // 用户确认分享后执行的回调函数
                },
                cancel: function() {
                    // 用户取消分享后执行的回调函数
                }
            });
            
            // 分享到朋友圈
            wx.onMenuShareTimeline({
                title: '幸运抽奖转盘', // 分享标题
                link: window.location.href, // 分享链接
                imgUrl: 'assets/images/share.svg', // 分享图标
                success: function() {
                    // 用户确认分享后执行的回调函数
                },
                cancel: function() {
                    // 用户取消分享后执行的回调函数
                }
            });
        });
    }


// 测试旋转（不消耗抽奖次数）
function testRotate() {
    // 防止重复点击
    if (isRotating) {
        return;
    }
    
    // 设置旋转中状态
    isRotating = true;
    startBtn.textContent = '抽奖中...';
    startBtn.classList.add('disabled');
    startBtn.disabled = true;
    testBtn.textContent = '测试中...';
    testBtn.classList.add('disabled');
    testBtn.disabled = true;
    
    // 随机选择一个奖项
    const prizeIndex = selectPrize();
    const prize = prizes[prizeIndex];
    
    // 计算旋转角度和动画时间
    const angle = 360 / prizes.length;
    const targetDeg = 360 * 5 + (prizes.length - 1 - prizeIndex) * angle + (angle / 2);
    const duration = 5000; // 旋转动画持续时间（毫秒）
    
    // 更新样式，触发旋转动画
    turntable.style.transition = `transform ${duration}ms ease-out`;
    turntable.style.transform = `rotate(${targetDeg}deg)`;
    
    // 动画结束后显示结果
    setTimeout(() => {
        // 重置旋转状态
        isRotating = false;
        
        // 恢复按钮状态
        startBtn.textContent = '开始抽奖';
        if (remainingChances > 0) {
            startBtn.classList.remove('disabled');
            startBtn.disabled = false;
        }
        testBtn.textContent = '测试转盘';
        testBtn.classList.remove('disabled');
        testBtn.disabled = false;
        
        // 设置结果信息
        resultIcon.className = 'result-icon success';
        resultIcon.textContent = '✓';
        resultTitle.textContent = '测试结果';
        resultMessage.textContent = '模拟获得 ' + prize.value;
        
        // 显示结果弹窗
        resultModal.style.display = 'flex';
    }, duration);
}