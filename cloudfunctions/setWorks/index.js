const cloud = require('wx-server-sdk')

cloud.init({
  env: 'lxy-1gdai8lnee53da21'
})

const db = cloud.database()
const _ = db.command


exports.main = async (event, context) => {
  console.log(event);
  try {
    if(event.type === 'dianzan') {
      // 点赞
      return await db.collection('works').doc(event.worksId)
      .update({
        data: {
          dianzanNum: event.dzNum,
        },
      })
      .then(res => {
        console.log("改变点赞状态成功", res);
        return res
      })
      .catch(err => {
        console.log("改变点赞状态失败", err);
        return err
      })
    } else if(event.type === 'pinglun') {
      // 评论
      return await db.collection('works').doc(event.worksId)
      .update({
        data: {
          pinglunNum: event.plNum,
        },
      })
      .then(res => {
        console.log("评论成功+1", res);
        return res
      })
      .catch(err => {
        console.log("评论失败", err);
        return err
      })
    }
  } catch (e) {
    console.error(e)
  }
}