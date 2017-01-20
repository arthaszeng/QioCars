const AV = require('../../utils/leancloud-storage');
const Position = require('../../model/position');


Page({
//g671o88g0fyvk27igbdocgtt6
    data: {
        positions: []
    },
    
    loginAndFetchPositions: function () {
        return AV.Promise.resolve(AV.User.current()).then(user =>
            user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
        ).then(user =>
            user ? user : AV.User.loginWithWeapp()
        ).then((user) => {
            return new AV.Query('Position')
                .descending('createdAt')
                .find()
                .then(this.setPositions)
                .catch(console.error);
        }).catch(error => console.error(error.message));
    },

    onPullDownRefresh: function () {
        this.loginAndFetchPositions().then(wx.stopPullDownRefresh);
    },
    
    setPositions: function (positions) {
        this.setData({
            positions,
        });
    },

    onShow() {
        this.loginAndFetchPositions();
    },

    onLoad() {
        const role = wx.getStorageSync('role');
        this.setData({
            role
        })
    },

    transitionToUpdate(e){
        wx.navigateTo({
            url: `../position/position?id=${e.target.dataset.id}`
        });
    },

    transitionToPosition(){
        wx.navigateTo({
            url: '../position/position'
        });
    },

    deleteJobs(e){
        AV.Query.doCloudQuery(`delete from Position where objectId="${e.target.dataset.id}"`).then(()=> {
            wx.showToast({
                title: "删除成功",
                mask: true,
                duration: 1000  
            });
            this.loginAndFetchPositions();
        }).catch(()=> {
            wx.showToast({
                title: '失败',
                mask: true,
                duration: 1000
            })
        })
    }
});
