const db = wx.cloud.database();

Page({
  onShareAppMessage() {
    return {
      title: 'swiper',
      path: 'page/component/pages/swiper/swiper'
    }
  },

  data: {
    recommend: [],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 2000,
    duration: 500,
    circular: true,
    imgListL: [{
      id: 1,
      pic: '../../static/image/1.jpg',
      title: '液态丙撒旦撒手房贷首付',
      avatar: '../../static/image/1.jpg',
      name: 'DT路易斯',
      collection: 520,
      fabulousState: true,  // 点赞状态
    },{
      id: 2,
      pic: '../../static/image/2.jpg',
      title: '但是公司的',
      avatar: '../../static/image/2.jpg',
      name: 'DT路易斯',
      collection: 500,
      fabulousState: false,  // 点赞状态
    },{
      id: 3,
      pic: '../../static/image/3.jpg',
      title: '委屈恶趣味去',
      avatar: '../../static/image/3.jpg',
      name: 'DT路易斯',
      collection: 500,
      fabulousState: false,  // 点赞状态
    },{
      id: 4,
      pic: '../../static/image/4.jpg',
      title: '飞得更高',
      avatar: '../../static/image/4.jpg',
      name: 'DT路易斯',
      collection: 500,
      fabulousState: false,  // 点赞状态
    },{
      id: 5,
      pic: '../../static/image/5.jpg',
      title: '突然液体委任为',
      avatar: '../../static/image/5.jpg',
      name: 'DT路易斯',
      collection: 500,
      fabulousState: false,  // 点赞状态
    },{
      id: 6,
      pic: '../../static/image/6.jpg',
      title: '额外人情味请问',
      avatar: '../../static/image/6.jpg',
      name: 'DT路易斯',
      collection: 500,
      fabulousState: false,  // 点赞状态
    },{
      id: 7,
      pic: '../../static/image/7.jpg',
      title: '的高发士大夫的',
      avatar: '../../static/image/7.jpg',
      name: 'DT路易斯',
      collection: 500,
      fabulousState: false,  // 点赞状态
    },{
      id: 8,
      pic: '../../static/image/8.jpg',
      title: '第第三方第三方第三方第三方三方第三方三方',
      avatar: '../../static/image/8.jpg',
      name: 'DT路易斯DT路易',
      collection: 500,
      fabulousState: false,  // 点赞状态
    },{
      id: 9,
      pic: '../../static/image/9.jpg',
      title: '豆腐干大概',
      avatar: '../../static/image/9.jpg',
      name: 'DT路易斯',
      collection: 500,
      fabulousState: false,  // 点赞状态
    }],
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

  onLoad() {
    wx.cloud.callFunction({
      name: 'getRecom',
      success: res => {
        console.log("123: ", res);
      },
      fail: err => {
        console.log(err);
      }
    })
      
  },
})