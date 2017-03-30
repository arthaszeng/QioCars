const AV = require('../../libs/av-weapp-min.js');

Page({
    data: {
        positions: []
    },

    fetchPositions: function () {
        return new AV.Query('Position')
            .descending('createdAt')
            .find()
            .then(this.setPositions)
            .catch(console.error);
    },

    onPullDownRefresh: function () {
        this.fetchPositions().then(wx.stopPullDownRefresh);
    },

    setPositions: function (positions) {
        this.setData({
            positions
        });
    },

    onShow() {
        this.fetchPositions();
    },

    onLoad() {
        const role = wx.getStorageSync('role');
        this.setData({
            role
        })
    },

    transitionToUpdate(e){
        wx.navigateTo({
            redirect: "true",
            url: `../position/position?id=${e.target.dataset.id}`
        });
    },

    transitionToPosition(){
        wx.navigateTo({
            redirect: "true",
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
            this.fetchPositions();
        }).catch(()=> {
            wx.showToast({
                title: '失败',
                mask: true,
                duration: 1000
            })
        })
    }
});
