const AV = require('../../utils/leancloud-storage');
const Application = require('../../model/application');


Page({

  data: {
    applications: []
  },

  loginAndFetchApplications: function () {
    return AV.Promise.resolve(AV.User.current()).then(user =>
        user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
    ).then(user =>
        user ? user : AV.User.loginWithWeapp()
    ).then((user) => {
      return new AV.Query('Application')
          .descending('createdAt')
          .find()
          .then(this.setApplications)
          .catch(console.error);
    }).catch(error => console.error(error.message));
  },

  onPullDownRefresh: function () {
    this.loginAndFetchApplications().then(wx.stopPullDownRefresh);
  },

  setApplications: function (applications) {
    this.setData({
      applications,
    });
  },

  onShow() {
    this.loginAndFetchApplications();
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
      this.loginAndFetchApplications();
    }).catch(()=> {
      wx.showToast({
        title: '失败',
        mask: true,
        duration: 1000
      })
    })
  }
});
