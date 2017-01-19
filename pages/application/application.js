const AV = require('../../utils/leancloud-storage');
const Application = require('../../model/application');

Page({
    data: {
        name: '',
        githubAccount: '',
        details: '',
        positionId: '',
        applicationId: ''
    },

    addApplication: function () {
        var name = this.data.name && this.data.name.trim();
        var githubAccount = this.data.githubAccount && this.data.githubAccount.trim();
        var details = this.data.details && this.data.details.trim();

        if (!githubAccount || !details || !details) {
            return;
        }

        //TODO: after confirming it's changed then save
        new Application({
            name: name,
            github: githubAccount,
            details: details,
            positionId: this.data.positionId
        }).save().then(() => {
            wx.showToast({
                title: "提交成功",
                mask: true,
                duration: 1000
            });

            this.transitionToPosition();
        }).catch(()=> {
            wx.showToast({
                title: '提交失败',
                mask: true,
                duration: 1000
            })
        })
    },


    updateName: function ({
        detail: {
            value
        }
    }) {
        if (!value) return;
        this.setData({
            name: value
        });
    },
    updateGithub: function ({
        detail: {
            value
        }
    }) {
        if (!value) return;
        this.setData({
            githubAccount: value
        });
    },
    updateDetails: function ({
        detail: {
            value
        }
    }) {
        if (!value) return;
        this.setData({
            details: value
        });
    },

    onLoad(query){
        const role = wx.getStorageSync('role')
        this.setData({ role })

        const positionId = query.positionId;
        const applicationId = query.applicationId;


        if (positionId == null) {
            var application = AV.Object.createWithoutData('Application', applicationId);
            application.fetch()
                .then(
                    application => this.setData({
                        githubAccount: application.get('github'),
                        details: application.get('details'),
                        name: application.get('name'),
                        applicationId: application.get('objectId'),
                        positionId: application.get('positionId')
                    }))
                .catch(console.error);
        } else {
            this.setData({
                positionId: positionId
            })
        }
    },

    transitionToPosition(){
        wx.redirectTo({
            url: `../position/position?id=${this.data.positionId}`
        });
    },

    transitionToApplications(){
        wx.navigateTo({
            url: `../applications/applications`
        });
    }
    
});


