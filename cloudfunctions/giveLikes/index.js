const cloud = require('wx-server-sdk')

cloud.init({
  env: 'lxy-1gdai8lnee53da21'
})

const db = cloud.database()
const _ = db.command


exports.main = async (event, context) => {
  console.log(event);
  try {
    return await db.collection('user').where({
      _openid: event.openid,
    })
    .update({
      data: {
        dzList: event.dzList
      }      
    })
  } catch(e) {
    console.error(e)
  }
}