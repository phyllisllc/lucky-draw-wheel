# 微信抽奖转盘

这是一个可以在微信环境中使用的抽奖转盘H5页面，具有精美的UI设计和完整的抽奖功能。

## 功能特点

- 🎯 美观的转盘界面和流畅的动画效果
- 📱 完全适配微信H5环境
- 🎲 可配置的奖项和中奖概率
- 📝 抽奖记录功能
- 🎮 简单易用的操作体验
- 🎨 现代化的UI设计和响应式布局

## 使用说明

### 本地测试

1. 在本地使用任何静态文件服务器托管`client`目录
2. 例如，可以使用Python的内置服务器：
   ```bash
   cd client
   python -m http.server 8000
   ```
3. 然后在浏览器中访问 `http://localhost:8000` 进行测试

### 在微信中使用

要在微信中使用此抽奖转盘，您需要：

1. 将`client`目录部署到一个支持HTTPS的服务器上
2. 在微信公众号或小程序中通过链接访问该页面
3. 如需调用微信分享等高级功能，需要配置微信JS-SDK（详见下方说明）

## 配置说明

### 奖项配置

在`zhuanpan.html`文件中的JavaScript部分，您可以自定义奖项内容和中奖概率：

```javascript
// 奖品配置
const prizes = [
    { name: '一等奖', icon: 'fa-trophy', color: '#FFD700' },
    { name: '二等奖', icon: 'fa-gift', color: '#C0C0C0' },
    { name: '三等奖', icon: 'fa-medal', color: '#CD7F32' },
    { name: '谢谢参与', icon: 'fa-meh-o', color: '#CCCCCC' },
    { name: '谢谢参与', icon: 'fa-meh-o', color: '#CCCCCC' },
    { name: '三等奖', icon: 'fa-medal', color: '#CD7F32' },
    { name: '二等奖', icon: 'fa-gift', color: '#C0C0C0' },
    { name: '谢谢参与', icon: 'fa-meh-o', color: '#CCCCCC' }
];

// 权重配置 - 控制中奖概率
const weights = [5, 10, 20, 65]; // 一等奖、二等奖、三等奖、谢谢参与的权重
```

### 微信JS-SDK配置

如需使用微信分享等功能，您需要在页面中配置微信JS-SDK。在`zhuanpan.html`文件底部已有相关提示位置：

```javascript
// 微信环境检测
const isWechat = /micromessenger/i.test(navigator.userAgent);
if (isWechat) {
    console.log('当前在微信环境中');
    // 这里可以添加微信JS-SDK的初始化代码
}
```

您需要根据微信官方文档，添加完整的JS-SDK初始化代码，包括签名验证等步骤。

## 技术栈

- HTML5
- Tailwind CSS v3
- Font Awesome
- 原生JavaScript

## 注意事项

- 页面已设置为禁止缩放，以提供更好的移动端体验
- 为了确保在微信中正常运行，请确保部署到支持HTTPS的服务器
- 如需连接后端服务记录抽奖数据，需要自行开发后端API并修改前端代码

## 版权信息

本项目仅供学习和参考使用，可根据需要自由修改和扩展。