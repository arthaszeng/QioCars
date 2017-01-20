const AV = require('../../utils/leancloud-storage');
const Application = require('../../model/application');


Page({

    data: {
        applications: []
    },

    fetchApplications: function () {
        new AV.Query('Application')
            .descending('createdAt')
            .find()
            .then(this.setApplications)
            .catch(console.error);
    },

    onPullDownRefresh: function () {
        this.fetchApplications().then(wx.stopPullDownRefresh);
    },

    setApplications: function (applications) {
        this.setData({
            applications,
        });
    },

    onShow() {
        this.fetchApplications();
    },

    onLoad() {
        const role = wx.getStorageSync('role');
        this.setData({
            role
        })
    },

    transitionToUpdate(e){
        wx.navigateTo({
            url: `../application/application?applicationId=${e.target.dataset.id}`
        });
    },

    transitionToApplication(){
        wx.navigateTo({
            url: '../application/application'
        });
    },

    deleteJobs(e){
        AV.Query.doCloudQuery(`delete from Application where objectId="${e.target.dataset.id}"`).then(()=> {
            wx.showToast({
                title: "删除成功",
                mask: true,
                duration: 1000
            });
            this.fetchApplications();
        }).catch(()=> {
            wx.showToast({
                title: '失败',
                mask: true,
                duration: 1000
            })
        })
    }
});
