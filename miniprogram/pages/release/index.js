const app = getApp()
const db = wx.cloud.database();
const util = require('../../utils/util');

Page({
  data: {
    files: [],
    filesSuccess: [],  // 成功上传的图片
    title: '',  // 文章标题
    content: '', // 正文内容
    userInfo: [],  // 用户信息
  },
  onLoad() {
    this.setData({
      selectFile: this.selectFile.bind(this),
      uplaodFile: this.uplaodFile.bind(this)
    })
  },

  onShow() {
  },

  // 选择图片
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res);
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
    // 返回false可以阻止某次文件上传
    console.log('files', files)
  },

  // 上传图片时执行的函数
  uplaodFile(files) {
    let that = this;
    console.log('upload files', files)
    // 文件上传的函数，返回一个promise    
    return new Promise((resolve, reject) => {
      const tempFilePaths = files.tempFilePaths;
      let tempFiles = files.tempFiles;
      tempFiles.forEach((ele) => {
        // 限制图片大小格式
        if (ele && ele.size > 1024 * 1024) {
          wx.showToast({
            title: '图片不能大于1M,请重新上传!',
            icon: 'none'
          })
          reject(err);
        }
        // 图片转化buffer后，调用云函数
        wx.getFileSystemManager().readFile({
          filePath: ele.path,
          success: res => {
            wx.showLoading({
              title: '内容审查中...',
            })
            let check_img = that.checkImg(res.data);
            check_img.then(res => {
              // 图片是否违规
              if (res.result.errCode && res.result.errCode == 87014) {
                wx.showToast({
                  title: '图片含有违法违规内容!',
                  icon: 'none'
                })
              } else {
                wx.showToast({
                  title: '审查通过',
                })
                wx.hideLoading();
                wx.hideToast();
                // 上传图片
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
                        let pathLength = tempFilePaths.length;    // 上传图片的数量

                        if (fileLength === pathLength) {
                          filesObj.urls = that.data.files;
                          resolve(filesObj)  // 这就是判断是不是最后一张已经上传了，用来返回
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
              }
            })
              .catch(err => {
                console.log(err);
              })
          },
          fail: err => {
            reject(err);
          }
        })
      })
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
    console.log('upload success', e.detail)
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
        title: '标题不能为空',
        icon: 'none'
      })
    } else if (that.data.content === '') {
      wx.showToast({
        title: '正文不能为空',
        icon: 'none'
      })
    } else if (that.data.filesSuccess.length === 0) {
      wx.showToast({
        title: '请上传图片',
        icon: 'none'
      })
    } else if (app.globalData.userInfo == '') {
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
      let check_msg = that.checkMsg(that.data.content);
      check_msg.then(res => {
        // 文章内容是否违规
        if (res.result.errCode && res.result.errCode == 87014) {
          wx.showToast({
            title: '文章内容含有违法违规内容!',
            icon: 'none'
          })
        } else {
          console.log("文章内容没有违规");
          // 上传文章内容
          db.collection('works').add({
            data: {
              avatar_url: app.globalData.userInfo.avatarUrl,
              name: app.globalData.userInfo.nickName,
              title: that.data.title,
              content: that.data.content,
              pic_url: that.data.filesSuccess,
              time: util.formatTime(new Date()),
              dianzanNum: 0,
              pinglunNum: 0,
            },
            success: res => {
              console.log(res);
              // 提交成功，清空表单内容
              that.setData({
                files: [],
                filesSuccess: [],  // 成功上传的图片
                title: '',  // 文章标题
                content: '', // 正文内容
              })
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
      })
        .catch(err => {
          console.log(err);
        })
    }
  },

  // 图片内容审查
  checkImg(img) {
    return wx.cloud.callFunction({
      name: 'imgSecCheck',
      data: {
        img: img
      }
    })
  },

  // 文字内容审查
  checkMsg(msg) {
    return wx.cloud.callFunction({
      name: 'msgSecCheck',
      data: {
        content: msg
      }
    })
  },
});