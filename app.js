const AV = require('./utils/leancloud-storage');

AV.init({
    appId: 'pULF0bTlab2WCP9u9uIkPPyh-gzGzoHsz',
    appKey: '1KOCNbRo4wenO5Vdwci38uS3',
});


App({
    onLaunch: function () {

        var logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now());
        wx.setStorageSync('logs', logs);
        wx.setStorageSync('role', 'HR');
        // wx.setStorageSync('role', 'USER')

        AV.Promise.resolve(AV.User.current()).then(user =>
            user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
        ).then(user =>
            user ? user : AV.User.loginWithWeapp()
        ).then((user) => {
            this.globalData.user = user
        }).catch(error => console.error(error.message));

    },

    getUserInfo: function (cb) {
        var that = this;
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            wx.login({
                success: function () {
                    wx.getUserInfo({
                        success: function (res) {
                            that.globalData.userInfo = res.userInfo;
                            typeof cb == "function" && cb(that.globalData.userInfo)
                        }
                    })
                }
            })
        }
    },
    globalData: {
        userInfo: null
    }
});