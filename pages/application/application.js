const AV = require('../../utils/leancloud-storage');
const Application = require('../../model/application');

Page({
    data: {
        name: '',
        githubAccount: '',
        phoneNumber: '',
        email: '',
        details: '',

        oldName: '',
        oldGithubAccount: '',
        oldPhoneNumber: '',
        oldEmail: '',
        oldDetails: '',

        positionId: '',
        applicationId: ''
    },

    onLoad(query){
        const role = wx.getStorageSync('role')
        this.setData({role})

        const positionId = query.positionId;
        const applicationId = query.applicationId;


        if (positionId == null) {
            var application = AV.Object.createWithoutData('Application', applicationId);
            application.fetch()
                .then(
                    application => this.setData({
                        oldGithubAccount: application.get('github'),
                        githubAccount: application.get('github'),
                        oldDetails: application.get('details'),
                        details: application.get('details'),
                        oldName: application.get('name'),
                        name: application.get('name'),
                        oldEmail: application.get('email'),
                        email: application.get('email'),
                        oldPhoneNumber: application.get('phone'),
                        phoneNumber: application.get('phone'),
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

    addApplication: function () {
        var name = this.data.name && this.data.name.trim();
        var githubAccount = this.data.githubAccount && this.data.githubAccount.trim();
        var details = this.data.details && this.data.details.trim();
        var email = this.data.email && this.data.email.trim();
        var phone = this.data.phoneNumber && this.data.phoneNumber.trim();

        if (!githubAccount || !details || !details || !email || !phone) {
            return;
        }

        if (!this.isFieldChanged()) {
            return;
        }

        new Application({
            name: name,
            github: githubAccount,
            phone: phone,
            email: email,
            details: details,
            positionId: this.data.positionId
        }).save().then(() => {
            wx.showToast({
                title: "提交成功",
                mask: true,
                duration: 1000
            });
            this.sendEmail(() => {
                this.transitionToPosition()
            }).catch((error) => {
                //Todo: parse error
            })
        }).catch(()=> {
            wx.showToast({
                title: '提交失败',
                mask: true,
                duration: 1000
            })
        })
    },

    sendEmail: function () {
        AV.User.requestEmailVerify(`${this.data.email}`).then(function (result) {
            console.log(JSON.stringify(result));
        }, function (error) {
            console.log(JSON.stringify(error));
        });
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
    updateEmail: function ({
        detail: {
            value
        }
    }) {
        if (!value) return;
        this.setData({
            email: value
        });
    },
    updatePhoneNumber: function ({
        detail: {
            value
        }
    }) {
        if (!value) return;
        this.setData({
            phoneNumber: value
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

    isFieldChanged: function () {
        return this.data.oldDetails !== this.data.details ||
            this.data.oldName !== this.data.name ||
            this.data.oldPhoneNumber !== this.data.phoneNumber ||
            this.data.oldGithubAccount !== this.data.githubAccount ||
            this.data.oldEmail !== this.data.email
    },

    transitionToPosition: function () {
        wx.redirectTo({
            url: `../position/position?id=${this.data.positionId}`
        });
    },

    transitionToApplications: function () {
        wx.navigateTo({
            url: `../applications/applications`
        });
    }

})
;


