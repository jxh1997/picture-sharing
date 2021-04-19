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
    dzList: [],
    dzListWorks: [],
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
    that.setData({
      isLogin: app.globalData.isLogin
    })
  },

  onShow() {
    this.getUserWorks();
    this.getUserDzList();
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

  // 跳转详情
  gotoDetails(e) {
    let that = this;
    let current_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../details/index?id=' + current_id,
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

  // 获取当前用户点赞的作品
  getUserDzList() {
    let that = this;

    db.collection('user').where({
      _openid: app.globalData.openid
    })
      .get()
      .then(res => {
        that.setData({
          dzList: res.data[0].dzList
        })
        let works = [];

        that.data.dzList.map(item => {
          console.log(item);
          db.collection('works').where({
            _id: item
          })
            .get()
            .then(res => {
              works.push(res.data[0]);
              that.setData({
                dzListWorks: works
              })
            })
        })
      })
  },
}) 