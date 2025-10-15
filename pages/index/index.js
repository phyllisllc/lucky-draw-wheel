// index.js
Page({
  data: {
    deg: 0, // 转盘旋转角度
    duration: 0, // 旋转动画持续时间
    isRotating: false, // 是否正在旋转
    showResult: false, // 是否显示结果弹窗
    prizeType: '', // 奖品类型（success/fail）
    prizeMessage: '', // 奖品消息
    remainingChances: 3, // 剩余抽奖次数
    maxChances: 3 // 最大抽奖次数
  },

  // 页面加载
  onLoad: function() {
    this.initTurntable();
  },

  // 初始化转盘
  initTurntable: function() {
    // 定义奖项数据
    this.prizes = [
      { name: '一等奖', value: 'iPhone 15', color: '#FFD700', probability: 1 },
      { name: '二等奖', value: '100元红包', color: '#C0C0C0', probability: 3 },
      { name: '三等奖', value: '20元话费', color: '#CD7F32', probability: 6 },
      { name: '四等奖', value: '5元红包', color: '#FF6B6B', probability: 10 },
      { name: '五等奖', value: '1元红包', color: '#4ECDC4', probability: 20 },
      { name: '谢谢参与', value: '再接再厉', color: '#E9ECEF', probability: 60 }
    ];
    
    // 绘制转盘
    this.drawTurntable();
  },

  // 绘制转盘
  drawTurntable: function() {
    const ctx = wx.createCanvasContext('turntableCanvas');
    const width = 300; // 转盘半径
    const centerX = width; // 中心点X坐标
    const centerY = width; // 中心点Y坐标
    const angle = 2 * Math.PI / this.prizes.length; // 每个扇形的角度
    
    // 绘制每个奖项区域
    for (let i = 0; i < this.prizes.length; i++) {
      const prize = this.prizes[i];
      const startAngle = i * angle;
      const endAngle = (i + 1) * angle;
      
      // 绘制扇形
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, width, startAngle, endAngle);
      ctx.closePath();
      ctx.setFillStyle(prize.color);
      ctx.fill();
      
      // 绘制分割线
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + width * Math.cos(startAngle), centerY + width * Math.sin(startAngle));
      ctx.setStrokeStyle('#fff');
      ctx.setLineWidth(2);
      ctx.stroke();
      
      // 绘制奖项名称
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + angle / 2);
      ctx.setFontSize(16);
      ctx.setFillStyle('#fff');
      ctx.setTextAlign('center');
      ctx.fillText(prize.name, width * 0.6, 8);
      ctx.restore();
    }
    
    // 绘制内圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.setFillStyle('#fff');
    ctx.fill();
    
    // 绘制完成，绘制到canvas上
    ctx.draw();
  },

  // 开始抽奖
  startRotate: function() {
    // 检查是否还有抽奖次数
    if (this.data.remainingChances <= 0) {
      wx.showToast({
        title: '抽奖次数已用完',
        icon: 'none'
      });
      return;
    }
    
    // 防止重复点击
    if (this.data.isRotating) {
      return;
    }
    
    // 设置旋转中状态
    this.setData({
      isRotating: true
    });
    
    // 随机选择一个奖项
    const prizeIndex = this.selectPrize();
    const prize = this.prizes[prizeIndex];
    
    // 计算旋转角度和动画时间
    const angle = 360 / this.prizes.length;
    const targetDeg = 360 * 5 + (this.prizes.length - 1 - prizeIndex) * angle + (angle / 2);
    const duration = 5000; // 旋转动画持续时间（毫秒）
    
    // 更新数据，触发旋转动画
    this.setData({
      deg: targetDeg,
      duration: duration,
      remainingChances: this.data.remainingChances - 1
    });
    
    // 动画结束后显示结果
    setTimeout(() => {
      this.showResult(prize);
    }, duration);
  },

  // 随机选择奖项
  selectPrize: function() {
    // 计算总概率
    let totalProbability = 0;
    for (const prize of this.prizes) {
      totalProbability += prize.probability;
    }
    
    // 生成随机数
    const random = Math.random() * totalProbability;
    
    // 根据概率选择奖项
    let cumulativeProbability = 0;
    for (let i = 0; i < this.prizes.length; i++) {
      cumulativeProbability += this.prizes[i].probability;
      if (random < cumulativeProbability) {
        return i;
      }
    }
    
    // 默认返回最后一个奖项
    return this.prizes.length - 1;
  },

  // 显示抽奖结果
  showResult: function(prize) {
    // 重置旋转状态
    this.setData({
      isRotating: false
    });
    
    // 设置结果信息
    if (prize.name === '谢谢参与') {
      this.setData({
        showResult: true,
        prizeType: 'fail',
        prizeMessage: prize.value
      });
    } else {
      this.setData({
        showResult: true,
        prizeType: 'success',
        prizeMessage: '恭喜获得 ' + prize.value
      });
    }
  },

  // 关闭结果弹窗
  closeResult: function() {
    this.setData({
      showResult: false
    });
  },

  // 页面分享
  onShareAppMessage: function() {
    return {
      title: '快来试试手气，抽大奖！',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share.svg'
    };
  }
});