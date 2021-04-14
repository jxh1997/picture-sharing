const app = getApp()
const db = wx.cloud.database();

Page({
  // onShareAppMessage() {
  //   return {
  //     title: 'swiper',
  //     path: 'page/component/pages/swiper/swiper'
  //   }
  // },

  data: {
    recommend: [],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 2000,
    duration: 500,
    circular: true,
    works: []
  },

  // 点赞
  giveLikes(e) {
    let that = this;
    let current_id = e.currentTarget.dataset.id;
    let current_index = e.currentTarget.dataset.dex;

    let _imgList = [...that.data.imgListL];
    // _imgList.map((ele) => {
      // if( ele.id === current_id ) {
      //   console.log(that.data.imgListL);
      //   ele.fabulousState = !ele.fabulousState;
      //   console.log(ele.fabulousState);
      //   that.data.talks[current_index].is_like = 1
      // }
    // })
    
    for(let i in _imgList) {
      if(i == current_index) {
        if( _imgList[i].fabulousState ) {
          // 已点赞，取消点赞
          that.data.imgListL[current_index].fabulousState = false;
          _imgList[i].collection --;
          console.log("取消点赞");
        } else {
          // 未点赞，进行点赞
          that.data.imgListL[current_index].fabulousState = true;
          _imgList[i].collection ++;
          console.log("点赞");
        }
      }
    }
    that.setData({
      imgList: _imgList
    })
    console.log(that.data.imgList);
    console.log("点赞成功");
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

  // 获取作品发布者信息
  // getWorkUser(openid) {
  //   console.log("---------" , openid);
  // },

  onLoad() {
    this.getRecom();
  },

  onShow() {
    this.getWorks()
  }
})