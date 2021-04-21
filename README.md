# 基于微信小程序的图片分享系统的设计与实现

## 使用说明
1. 拿到系统代码后，查看代码结构
	- cloudfunctions：云函数文件夹
	- miniprogram：项目代码文件夹
	- image：测试图片
	- database_export：数据库导出
2. 项目代码可直接运行
3. 本项目使用云开发进行项目开发，对部分内容需要进行配置
4. 云开发配置：
	- 首先需要开通云开发，导入项目时使用自己小程序的APPID即可。
	- 打开云开发控制台，在右上角的设置中打开环境设置 -> 点击环境名称 -> 创建新环境（创建免费环境即可）
	- 环境创建成功后，会有一个环境ID，复制该ID，在 `app.js` 中设置 `wx.cloud.init` 的 `env`。
	```javascript
	wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'lxy-1gdai8lnee53da21', // 设置成你的环境ID
        traceUser: true,
    })
   ```
   
5. 将`database_export`文件夹下的数据库集合导入到云开发的数据库中，按照文件名进行数据集合的创建（共需4个集合），集合创建完成在右侧选择导入，导入对应的集合即可。
6. 上传到服务器上的图片可能会显示不出来，是因为当前数据库中图片的地址为我当前账户云存储的文件地址，你删除后重新上传即可，首页图片推荐的图片也是通过云存储手动上传的。
7. 如果在数据读取时没有数据显示，请查看数据库对应集合下的数据权限，修改为“所有用户可读，仅创建者可读写”即可。
8. cloudfunctions 云函数上传
	- 将所有的云函数文件夹进行npm install 下载：右击云函数文件夹，选择“在外部终端窗口打开”，输入`npm install`下载依赖。
	- 下载完成之后，右击云函数，选择“上传并部署：云端安装依赖”。
	- 上传成功后便可使用。
	- 如果有问题，检查一下云函数的 `env`，替换成自己的环境ID就可以了。

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)