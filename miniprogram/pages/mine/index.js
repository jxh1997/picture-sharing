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
    openid: '',
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
        that.data.openid = res.result.openid
        // 查询数据库是否有该用户信息
        db.collection('user').where({
          _openid: that.data.openid
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
                _openid: that.data.openid,
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

    // let userInfo = e.detail.userInfo;
    // if(userInfo) {
    //   // 用户按了允许授权按钮
    //   console.log("用户的信息如下：" , userInfo);

    //   wx.showToast({
    //     title: '登录成功',
    //     icon: 'success',
    //     duration: 1500
    //   })

    //   // 授权成功后,通过改变 isLogin(是否登录) 的值，让实现页面显示出来，把授权页面隐藏起来
    //   that.setData({
    //     isLogin: true
    //   });
    // } else {
    //   // 用户按了拒绝按钮
    //   wx.showModal({
    //     title: '警告',
    //     content: '您拒绝授权，将无法查看个人中心，请授权之后再进入!',
    //     showCancel: false,
    //     confirmText: '返回授权',
    //     success: function(res) {
    //       // 用户没有授权成功，不需要改变 isLogin 的值 (false)
    //       if(res.confirm) {
    //         console.log('用户点击了“返回授权”按钮');
    //       }
    //     }
    //   })
    // }
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
      _openid: that.data.openid
    })
    .get()
    .then(res => {
      console.log(res.data);
      that.setData({
        works: res.data
      })
    })
  },
})