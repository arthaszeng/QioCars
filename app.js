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
        // wx.setStorageSync('role', 'HR');
        // wx.setStorageSync('role', 'USER')

        AV.Promise.resolve(AV.User.current()).then(user =>
            user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
        ).then(user =>
            user ? user : AV.User.loginWithWeapp()
        ).then((user) => {
            this.judgeRole();
            this.globalData.user = user
        }).catch(error => console.error(error.message));

    },

    judgeRole: function (user) {
        var roleQuery = new AV.Query(AV.Role);
        roleQuery.equalTo('name', 'hr');
        roleQuery.equalTo('users', AV.User.current());
        roleQuery.find().then(function (results) {
            if (results.length > 0) {
                // 当前用户已经具备了 Administrator 角色，因此不需要做任何操作
                wx.setStorageSync('role', 'HR');
            } else {
                // 当前用户不具备 Administrator，因此你需要把当前用户添加到 Role 的 Users 中
                wx.setStorageSync('role', 'USER');

                var refereeRole = new AV.Role('referee');
                var relation = refereeRole.getUsers();
                relation.add(AV.User.current());
                return refereeRole.save();
            }
        }).then(function () {
            //此时 administratorRole 已经包含了当前用户
        }).catch(function (error) {
            // 输出错误
            console.log(error);
        });
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
        userInfo: null,
        user: null
    }
});