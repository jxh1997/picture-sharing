// miniprogram/pages/details/index.js
const app = getApp()
const db = wx.cloud.database();
const util = require('../../utils/util');

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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      worksId: options.id
    })
    db.collection('works').doc(that.data.worksId)
    .get({
      success: res => {
        that.setData({
          works: res.data
        })
      }
    })
    that.getComment()
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
      console.log(that.data.commentList);
    })
  }
})