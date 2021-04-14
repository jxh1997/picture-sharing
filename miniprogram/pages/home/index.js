const app = getApp()
const db = wx.cloud.database();

Page({
  data: {
    recommend: [],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 2000,
    duration: 500,
    circular: true,
    works: [],
    dzList: [],  // 当前用户点赞列表
  },

  // 点赞
  giveLikes(e) {
    let that = this;
    let current_id = e.currentTarget.dataset.id;
    if (app.globalData.openid === '') {
      wx.showToast({
        title: '当前用户未登录，请前往登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.switchTab({
          url: '../mine/index'
        })
      }, 1500)
    } else {
      that.data.dzList.push(current_id);
      wx.cloud.callFunction({
        name: 'giveLikes',
        data: {
          openid: app.globalData.openid,
          dzList: that.data.dzList
        },
        success: res => {
          wx.showToast({
            title: '点赞成功',
          })
          that.getUserDianzan("give");
        },
        fail: res => {
          console.log(res);
        }
      })
    }
  },

  // 取消点赞
  cancelLikes(e) {
    let that = this;
    let current_id = e.currentTarget.dataset.id;
    let dzList = [];

    that.data.dzList.map((item, index) => {
      if (item === current_id) {
        for (let i = 0; i < that.data.works.length; i++) {
          if (that.data.works[i].isDz && that.data.works[i]._id === current_id) {
            const worksDZ = "works[" + i + "].isDz"
            that.setData({
              [worksDZ]: false
            })
          }
        }
      } else {
        dzList.push(item);
      }
    })
    that.setData({
      dzList: dzList
    })
    wx.cloud.callFunction({
      name: 'giveLikes',
      data: {
        openid: app.globalData.openid,
        dzList: that.data.dzList
      },
      success: res => {
        wx.showToast({
          title: '取消点赞',
        })
        that.getUserDianzan("cancel");
      },
      fail: res => {
        console.log(res);
      }
    })
  },

  // 查询当前用户点赞作品列表
  getUserDianzan(type) {
    let that = this;
    if (app.globalData.openid === '') {
      that.getOpenid()
    } else {
      db.collection('user').where({
        _openid: app.globalData.openid
      })
        .get()
        .then(res => {
          that.setData({
            dzList: res.data[0].dzList
          })
          that.data.works.map((worksItem, index) => {
            that.data.dzList.map(dzItem => {
              if (worksItem._id === dzItem) {
                that.setData({
                  dzList: res.data[0].dzList
                })
                const worksDZ = "works[" + index + "].isDz"
                that.setData({
                  [worksDZ]: true
                })
              }
            })
          })
        })
    }
  },

  // 获取主页图片推荐
  getRecom() {
    let that = this;
    let recommend = [];
    db.collection('recom').get({
      success(res) {
        // console.log(res);
        let imgUrl = res.data;
        imgUrl.map(item => {
          recommend.push(item.img_url);
        })
        that.setData({
          recommend: recommend
        })
      }
    })
  },

  // 获取所有作品
  getWorks() {
    let that = this;
    db.collection('works').get({
      success(res) {
        // console.log("works: " , res);
        that.setData({
          works: res.data
        })
      }
    })
  },

  // 获取用户openid
  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
      name: 'getopenid',
      complete: res => {
        app.globalData.openid = res.result.openid;
        that.getUserDianzan()
      }
    })
  },

  // 获取作品发布者信息
  // getWorkUser(openid) {
  //   console.log("---------" , openid);
  // },

  onLoad() {
    this.getRecom();
  },

  onShow() {
    this.getWorks();
    this.getUserDianzan()
  }
})