// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'lxy-1gdai8lnee53da21'
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    var result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/jpg',
        value: Buffer.from(event.img) 
      }
    })
    return result
  } catch (err) {
    return err
  }
}