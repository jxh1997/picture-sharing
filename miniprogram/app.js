//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'lxy-1gdai8lnee53da21',
        traceUser: true,
      })
      
      let that = this;
      const db = wx.cloud.database();
      
      // 查看是否授权
      wx.cloud.callFunction({
        name: 'getopenid',
        complete: res => {
          that.globalData.openid = res.result.openid;
          db.collection('user').where({
            _openid: res.result.openid
          })
          .get()
          .then(res => {
            if (res.data == "") {
              console.log('用户未授权，前往授权登录!');
              that.globalData.isLogin = false;
            } else {
              console.log("已经登录过不用授权，直接登录")
              that.globalData.isLogin = true;
              db.collection('user').where({
                _openid: that.globalData.openid,
              }).get({
                success(res) {
                  that.globalData.userInfo = res.data[0];
                }
              })
            }
          })
        }
      })
    }
    this.globalData = {
      openid: '',
      userInfo: '',
      works: [],
      fabulous: [],
      recommend: [],
      firstLogin: true,   // 判断用户是不是第一次登录
      isLogin: false,  // 是否登录
    }
  },
})
