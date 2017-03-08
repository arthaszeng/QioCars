const AV = require('../../libs/av-weapp-min.js');



Page({
    data: {
        positions: [],
        imgUrls: [
            'http://asset.ibanquan.com/middle/26633/c/265/571f66a8f294396bf60022af/index_slide_1?design_theme_id=0&v=1461675688',
            'http://asset.ibanquan.com/middle/26633/c/265/571f66a8f294396bf60022b2/index_slide_2?design_theme_id=0&v=1461675688',
            'http://asset.ibanquan.com/middle/26633/c/265/571f66a9f294396bf60022b5/index_slide_3?design_theme_id=0&v=1461675689',
            'http://asset.ibanquan.com/middle/26633/c/265/571f66a9f294396bf60022b8/index_slide_4?design_theme_id=0&v=1461675689'
        ]
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
            positions,
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
