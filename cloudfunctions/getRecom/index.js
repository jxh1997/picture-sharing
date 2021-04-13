// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const wxContext = cloud.getWXContext()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const data = await db.collection('recom').where().get()
    return data;

  } catch (err) {
    return err
  }
}