const AV = require('./libs/av-weapp-min.js');

AV.init({
    appId: '7MQo5KknwNfx0fOOjN8OIewg-gzGzoHsz',
    appKey: '7JbMwtaL1I4ErgEvIIKiOHaU'
});

App({
    globalData: {
        userInfo: null,
        user: null
    },

    onLaunch: function () {
        this.loginWithLCAndWeapp()
    },

    loginWithLCAndWeapp: function () {
        AV.Promise.resolve(AV.User.current()).then(user =>
            user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
        ).then(user =>
            user ? user : AV.User.loginWithWeapp()
        ).then((user) => {
            wx.setStorage({
                key: 'user',
                data: user.toJSON()
            });
            this.judgeRole();
            this.globalData.user = user.toJSON();
            this.getUserInfo()
        }).catch(error => console.error(error.message));
    },

    judgeRole: function () {
        var that = this;
        var roleQuery = new AV.Query(AV.Role);
        roleQuery.equalTo('name', 'ADMIN');
        roleQuery.equalTo('users', AV.User.current());
        roleQuery.find().then(function (results) {
            if (results.length > 0) {
                wx.setStorageSync('role', 'ADMIN');
                that.setData({
                    role: 'ADMIN'
                })
            } else {
                wx.setStorageSync('role', 'USER');
                that.setData({
                    role: 'USER'
                })
            }
        }).then().catch(function (error) {
        });
    },
//TODO: Understand Why It Uses Callback func here
    getUserInfo: function (cb) {
        var that = this;
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
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
    }
});