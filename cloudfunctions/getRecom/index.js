// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  // 关于数据库的操作
  // 获取数据库的连接对象
  const db = cloud.database();

  return await db.collection('recom').get({
    success: res => {
      console.log(res);
      return res;
    }
  })
}