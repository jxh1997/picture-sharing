// components/Tips/tips.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    right: 270,
    tipContent: '一键下载图片',
    isShow: true,
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },

  created: function() {
    setTimeout(() => {
      this.setData({
        right: 200,
        tipContent: '图片分享'
      })
    }, 3000);
    setTimeout(() => {
      this.setData({
        isShow: false
      })
    }, 6000);
  },

})
