const AV = require('../../libs/av-weapp-min.js');
var app = getApp();

Page({
    onLoad: function () {
        console.log("username + " + app.globalData.userInfo.nickName);
    }
});
