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
    that.isDz()
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
  isDz(){
    let that = this;
    console.log(app.globalData.userInfo.dzList);
    let dzList = app.globalData.userInfo.dzList;
    dzList.map(dz => {
      if(dz === that.data.worksId) {
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
    if(that.data.isLike) {
      let dzList = app.globalData.userInfo.dzList;
      let newDzList = [];
      dzList.map(item => {
        if(item === that.data.worksId) {
          console.log(item);
        } else {
          newDzList.push(item);
        }
      })

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

    }
  },

    // 对点赞操作进行加减
    setDzNum(type) {
      let that = this;
      // 点赞+1
      if (type === 'add') {
        db.collection('works').doc(id).update({
          data: {
            dianzanNum: _.inc(1)
          },
          success: res => {
            that.getWorks();
            that.getUserDianzan();
          }
        })
      } else {
        db.collection('works').doc(that.data.worksId).update({
          data: {
            dianzanNum: _.inc(-1)
          },
          success: res => {
            that.isDz()
          }
        })
      }
  
    },


}) 