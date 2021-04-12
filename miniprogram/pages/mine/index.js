// pages/mine/index.js
const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isLogin: false,
    currentId: '1',
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
    works: app.globalData.works,
    fabulous: app.globalData.fabulous
  },

  //点击每个导航的点击事件
  handleTap: function(e) {
    let curred_id = e.currentTarget.id;
    if(curred_id){
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
    wx.getSetting({
      success (res){
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              console.log("用户授权了: " , res.userInfo)
              that.setData({
                isLogin: true
              })
            }
          })
        } else {
          //用户没有授权
          console.log("用户没有授权");
          that.setData({
            isLogin: false
          })
        }
      }
    })
  },

  // 点击授权
  getUserProfile (e) {
    let that = this;
    wx.getUserProfile({
      desc: '用于获取个人基本信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: res => {
        console.log(res);
        app.globalData.userInfo = res.userInfo;
        that.setData({
          isLogin: true
        })
        // 获取openid
        wx.cloud.callFunction({
          name: 'getopenid',
          complete: res => {
            const openid = res.result.openid
            // 查询数据库是否有该用户信息
            db.collection('user').where({
              _openid: openid
            })
            .get()
            .then(res => {
              console.log(res);
              if(res.data == "") {
                console.log('授权登录成功!');
                that.setData({
                  isLogin: true
                })
                // 将用户信息添加进数据库
                db.collection('user').add({
                  data: {
                    // nickName: res.userInfo.
                  }
                })
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
    wx.navigateTo({
      url: '../release/index',
    })
  },

  // 跳转首页浏览作品
  gotoIndexPage() {
    wx.switchTab({
      url: '../index/index',
    })
  }
})