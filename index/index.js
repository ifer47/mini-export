const app = getApp()
Page({
  onLoad: function () {
    wx.createSelectorQuery()
      .select('#canvas')
      .fields({
        node: true,
        size: true,
      })
      .exec(this.init.bind(this))
  },
  async init(res) {
    const canvas = res[0].node;
    const ctx = canvas.getContext('2d');
    const width = res[0].width;
    const height = res[0].height;
    const wrapSize = 275
    const photoSize = 80
    const codeSize = 150
    // 设置一下，否则是默认的 width
    const dpr = wx.getWindowInfo().pixelRatio
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    this.canvas = canvas
    // canvas, ctx, x, y, width, height, radius, bgColor, path, isClip
    // 绿色的画布
    await this.drawRect(canvas, ctx, 0, 0, width, height, 0, '#54ae6d', '', false)
    // 中间白色的
    await this.drawRect(canvas, ctx, (width - wrapSize) / 2, 80, wrapSize, wrapSize, 20, '#fff', '', false)
    // 头像
    await this.drawRect(canvas, ctx, (width - photoSize) / 2, 40, photoSize, photoSize, 40, '#fff', './copy.jpg', true)
    // 二维码
    await this.drawRect(canvas, ctx, (width - codeSize) / 2, 150, codeSize, codeSize, 0, '#fff', './code.png', true)
    // 昵称
    this.drawText(width, ctx, '千年等一回', 140, 16)
    // 文案
    this.drawText(width, ctx, '请分享朋友圈', 330, 18)
  },
  drawText(width, ctx, text, top, size, color = "#000") {
    const font = `${size}px Arial`;
    ctx.font = font;
    const textWidth = ctx.measureText(text).width;
    ctx.fillStyle = color
    ctx.fillText(text, width / 2 - textWidth / 2, top);
  },
  drawRect(canvas, ctx, x, y, width, height, radius, bgColor, path, isClip) {
    return new Promise((resolve) => {
      ctx.save()
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.fillStyle = bgColor
      ctx.fill()
      ctx.closePath()
      isClip && ctx.clip()
      if (path) {
        const img = canvas.createImage()
        img.onload = () => {
          ctx.drawImage(img, x, y, width, height, )
          resolve()
          ctx.restore()
        }
        img.src = path
      } else {
        resolve()
      }
    })
  },
  async exportData() {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      canvas: this.canvas,
      async success(res) {
        await wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success() {
            wx.showToast({
              title: '导出成功',
              icon: 'none',
              mask: true
            })
          },
        })
      },
      fail(err) {
        console.log(err)
      }
    })
  }
})