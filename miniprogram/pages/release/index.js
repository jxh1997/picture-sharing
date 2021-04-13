// pages/release/index.js
const app = getApp()
const db = wx.cloud.database();
const util = require('../../utils/util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: [],
    filesSuccess: [],  // 成功上传的图片
    title: '',  // 文章标题
    content: '', // 正文内容
    userInfo: [],  // 用户信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.setData({
      selectFile: this.selectFile.bind(this),
      uplaodFile: this.uplaodFile.bind(this)
    })
  },

  // 选择图片
  chooseImage: function (e) {
    var that = this;
    console.log(e);
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
      }
    })
  },

  // 预览图片
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },

  // 选择图片时的过滤函数
  selectFile(files) {
    console.log('files', files)
    // 返回false可以阻止某次文件上传
  },
  // 上传图片
  uplaodFile(files) {
    let that = this;
    console.log('upload files', files)
    // 文件上传的函数，返回一个promise
    return new Promise((resolve, reject) => {
      const tempFilePaths = files.tempFilePaths;
      // 上传返回值
      const filesObj = {};
      const filesObj2 = {};
      for (let i = 0; i < tempFilePaths.length; i++) {
        let filePath = '';
        let cloudPath = '';
        filePath = tempFilePaths[i];
        // 上传图片
        // cloudPath 最好按时间 遍历的index来排序，避免文件名重复
        cloudPath = 'works-pic-' + new Date().getTime() + '-' + i + filePath.match(/\.[^.]+?$/)[0];
        wx.cloud.uploadFile({
          filePath,
          cloudPath,
          success: res => {
            // 可能会有好几个200+的返回码，表示成功
            if (res.statusCode === 200 || res.statusCode === 204 || res.statusCode === 205) {
              const urls = res.fileID;
              that.data.files.push(urls);
              let fileLength = that.data.files.length;  // 已经上传完成的数量
              let pathLength = tempFilePaths.length;    // 

              if (fileLength === pathLength) {
                filesObj.urls = that.data.files;
                resolve(filesObj)  // 这就是判断是不是最后一张已经上传了，用来返回，
              }
              else if (fileLength > pathLength) {
                let files2 = [];
                files2.push(that.data.files[fileLength - 1])
                filesObj2.urls = files2;
                resolve(filesObj2)
              }
            } else {
              reject('error')
            }
          },
          fail: function (err) {
            console.log(err)
          }
        })
      }
    })
  },

  // 上传失败
  uploadError(e) {
    console.log('upload error', e.detail)
  },

  // 上传成功
  uploadSuccess(e) {
    e.detail.urls.map(item => {
      this.data.filesSuccess.push(item)
    })
    console.log('upload success: filesSuccess: ', this.data.filesSuccess)
  },

  // 文章标题内容
  titleInput(e) {
    let title = e.detail.value;
    this.setData({
      title: title
    })
  },

  // 正文内容
  contentInput(e) {
    let content = e.detail.value;
    this.setData({
      content: content
    })
  },

  // 发布作品
  fabu() {
    let that = this;
    if (that.data.title === '') {
      wx.showToast({
        title: '标题不能为空'
      })
    } else if (that.data.content === '') {
      wx.showToast({
        title: '正文不能为空'
      })
    } else if (that.data.filesSuccess.length === 0) {
      wx.showToast({
        title: '请上传图片'
      })
    } else if (that.data.userInfo === []) {
      wx.showToast({
        title: '当前用户未登录，请前往登录'
      })
    } else {
      db.collection('works').add({
        data: {
          avatar_url: that.data.userInfo.avatarUrl,
          name: that.data.userInfo.nickName,
          title: that.data.title,
          content: that.data.content,
          pic_url: that.data.filesSuccess,
          time: util.formatTime(new Date()),
          dianzanNum: 0,
          pinglunNum: 0,
        },
        success: res => {
          console.log(res);
          wx.showToast({
            title: '发布成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.switchTab({
              url: '../home/index'
            })
          }, 1500)
        }
      })
    }
  },

  // 获取当前用户的openid
  getOpenId() {
    let that = this;
    wx.cloud.callFunction({
      name: 'getopenid',
      complete: res => {
        const openid = res.result.openid;
        db.collection('user').where({
          _openid: openid
        })
          .get()
          .then(res => {
            // 用户未授权登录
            if (res.data == "") {
              wx.showToast({
                title: '当前用户未登录，请前往登录！',
                icon: 'none'
              })
              setTimeout(() => {
                wx.switchTab({
                  url: '../mine/index',
                })
              }, 1500)
            } else {
              that.setData({
                userInfo: res.data[0]
              })
            }
          })
      }
    })
  },

  onLoad() {
    this.getOpenId()
  }



})