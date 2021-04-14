// pages/mine/index.js
const db = wx.cloud.database();
const app = getApp();
const util = require('../../utils/util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isLogin: false,
    currentId: 1,
    tabNav: [{
      name: '我的作品',
      typeId: '1',
      icon: '../../static/icon1.png',
      icon_HL: '../../static/icon1_HL.png'
    }, {
      name: '我的点赞',
      typeId: '2',
      icon: '../../static/icon2.png',
      icon_HL: '../../static/icon2_HL.png',
    }],
    works: [],
    fabulous: [],
  },

  //点击每个导航的点击事件
  handleTap: function (e) {
    let curred_id = e.currentTarget.id;
    if (curred_id) {
      this.setData({
        currentId: curred_id
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // 查看是否授权
    wx.cloud.callFunction({
      name: 'getopenid',
      complete: res => {
        app.globalData.openid = res.result.openid
        // 查询数据库是否有该用户信息
        db.collection('user').where({
          _openid: app.globalData.openid
        })
          .get()
          .then(res => {
            if (res.data == "") {
              console.log('用户未授权，前往授权登录!');
              that.setData({
                isLogin: false
              })
            } else {
              console.log("已经登录过不用授权，直接登录")
              that.setData({
                isLogin: true
              })
              db.collection('user').where({
                _openid: app.globalData.openid,
              }).get({
                success(res) {
                  app.globalData.userInfo = res.data[0];
                }
              })
              that.getUserWorks();
            }
          })
      }
    })
  },

  // 点击授权
  getUserProfile(e) {
    let that = this;
    wx.getUserProfile({
      desc: '用于获取个人基本信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: res => {
        app.globalData.userInfo = res.userInfo;
        that.setData({
          isLogin: true
        })
        wx.cloud.callFunction({
          name: 'getopenid',
          complete: res => {
            // 将用户信息添加进数据库
            db.collection('user').add({
              data: {
                nickName: app.globalData.userInfo.nickName,
                avatarUrl: app.globalData.userInfo.avatarUrl,
                time: util.formatTime(new Date()),
              }
            })
          }
        })
      }
    })
  },

  // 跳转作品发布
  gotoReleaseWorks() {
    wx.switchTab({
      url: '../release/index',
    })
  },

  // 跳转首页浏览作品
  gotoIndexPage() {
    wx.switchTab({
      url: '../home/index',
    })
  },

  // 获取当前用户发布的作品
  getUserWorks() {
    let that = this;
    db.collection('works').where({
      _openid: app.globalData.openid
    })
    .get()
    .then(res => {
      that.setData({
        works: res.data
      })
    })
  },
})