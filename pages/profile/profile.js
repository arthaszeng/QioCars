const AV = require('../../libs/av-weapp-min.js');
var app = getApp();

Page({
    data: {
        src: '',
        nickName: ''
    },
    onLoad: function () {
      this.setBasicUserInfo(app.globalData.userInfo);  
    },
    setBasicUserInfo(userInfo) {
        this.setData({
            nickName:userInfo.nickName,
            src: userInfo.avatarUrl
        });
    }
});
