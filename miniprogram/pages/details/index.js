// miniprogram/pages/details/index.js
const app = getApp()
const db = wx.cloud.database();
const util = require('../../utils/util');
const _ = db.command;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    worksId: '',
    works: {},
    commentList: [],
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    postParams: '',
    isLike: false,
    dianzanNum: 0,
    dzList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      worksId: options.id,
      dzList: app.globalData.userInfo.dzList
    })

    db.collection('works').doc(that.data.worksId)
      .get({
        success: res => {
          that.setData({
            works: res.data,
            dianzanNum: res.data.dianzanNum
          })
        }
      })
    that.getComment()
  },

  onShow() {
    this.isDz()
  },

  // 写评论
  setCommentInput(e) {
    this.setData({
      postParams: e.detail.value
    })
  },

  // 评论发布
  setComment() {
    let that = this;
    console.log(app.globalData.userInfo);
    db.collection('comment').add({
      data: {
        worksId: that.data.worksId,
        commentText: that.data.postParams,
        fabuTime: util.formatTime(new Date()),
        nickName: app.globalData.userInfo.nickName,
        avatarUrl: app.globalData.userInfo.avatarUrl,
      },
      success: res => {
        that.setData({
          postParams: ''
        })
        wx.showToast({
          title: '评论成功',
          duration: 1000,
        })
        that.getComment()
      },
      fail: err => {
        console.log(err);
      }
    })
  },

  // 获取评论
  getComment() {
    let that = this;
    db.collection('comment').where({
      worksId: that.data.worksId
    })
      .get()
      .then(res => {
        that.setData({
          commentList: res.data
        })
      })
  },

  // 获取用户是否点赞
  isDz() {
    let that = this;
    that.data.dzList.map(dz => {
      if (dz === that.data.worksId) {
        that.setData({
          isLike: true
        })
      }
    })
  },

  // 点赞/取消点赞
  setLike() {
    let that = this;
    // 已点赞 => 取消点赞
    if (that.data.isLike) {
      let newDzList = [];
      that.data.dzList.map(item => {
        if (!(item === that.data.worksId)) {
          newDzList.push(item);
        }
      })
      app.globalData.userInfo.dzList = newDzList;
      wx.cloud.callFunction({
        name: 'giveLikes',
        data: {
          openid: app.globalData.openid,
          dzList: newDzList
        },
        success: res => {
          console.log(res);
          wx.showToast({
            title: '取消点赞',
          })
          that.setDzNum('sub');
        }
      })
    } else {
      let dzList = that.data.dzList;
      dzList.push(that.data.worksId);
      app.globalData.userInfo.dzList = dzList;
      wx.cloud.callFunction({
        name: 'giveLikes',
        data: {
          openid: app.globalData.openid,
          dzList: dzList
        },
        success: res => {
          wx.showToast({
            title: '点赞成功',
          })
          that.setDzNum('add');
        }
      })
    }
  },

  // 对点赞操作进行加减
  setDzNum(type) {
    let that = this;
    let dzNum = that.data.works.dianzanNum;
    // 点赞+1
    if (type === 'add') {
      wx.cloud.callFunction({
        name: 'setWorks',
        data: {
          dzNum: ++dzNum,
          worksId: that.data.worksId,
        },
        success: res => {
          wx.showToast({
            title: '点赞成功',
            duration: 1000,
          })
          that.setData({
            dianzanNum: dzNum,
            isLike: true
          })
        },
        fail: res => {
          console.log(res);
        }
      })
    } else {
      wx.cloud.callFunction({
        name: 'setWorks',
        data: {
          dzNum: --dzNum,
          worksId: that.data.worksId,
        },
        success: res => {
          wx.showToast({
            title: '取消点赞',
            duration: 1000,
          })
          that.setData({
            dianzanNum: dzNum,
            isLike: false
          })
        },
        fail: res => {
          console.log(res);
        }
      })
    }
  },

  // 预览和保持图片
  aloneDow(e) {
    let src = e.currentTarget.dataset.src; // 获取data-src
    let imgList = [];
    imgList.push(src);
    // 预览图片
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    });
  },

  // 一键下载当前作品所有图片
  DownloadImgList() {
    let that = this;
    if(that.data.works.pic_url.length === 0) {
      // 判断数组是否有图片
      wx.showToast({
        title: '暂无图片下载',
        icon: 'none',
        duration: 2000
      })
      return false;
    } else {
      // 遍历所有图片进行下载
      for( let i = 0 ; i < that.data.works.pic_url.length ; i ++) {
        wx.cloud.downloadFile({
          fileID: that.data.works.pic_url[i], // 需下载的每一张图片路径
          success: res => {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function (res) {
                if (res.errMsg == "saveImageToPhotosAlbum:ok") {
                  wx.showToast({
                    title: '图片下载成功',
                    icon: 'success',
                    duration: 2000
                  })
                }
              }
            })
          },
          fail: function (err) {
            console.log(err);
            wx.showToast({
              title: '图片下载失败',
              icon: 'none',
              duration: 2000
            })
          }
        })
      }
    }
  },

  // 分享
  onShareAppMessage() {
    let that = this;
    const promise = new Promise(resolve => {
      resolve({
        title: that.data.works.title,
      })
    })
    return {
      title: that.data.works.title,
      path: '/miniprogram/pages/details?id=' + that.data.worksId,
      promise 
    }
  }
}) 