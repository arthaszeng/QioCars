const AV = require('../../utils/leancloud-storage');
const Application = require('../../model/application');
var app = getApp();

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
        applicationId: '',

        isRecommended: true,
        emailExistence: false,
        nameExistence: false,
        phoneNumberExistence: false
    },

    onLoad(query){
        const role = wx.getStorageSync('role');
        this.setData({role});

        const positionId = query.positionId;
        const applicationId = query.applicationId;

        //If posintionId is equal to null, then it's from old application request
        if (positionId == null && applicationId !== null) {
            var application = AV.Object.createWithoutData('Application', applicationId);
            application.fetch()
                .then(
                    application => this.setData({
                        oldGithubAccount: application.get('github'),
                        oldDetails: application.get('details'),
                        oldName: application.get('name'),
                        oldEmail: application.get('email'),
                        oldPhoneNumber: application.get('phone'),

                        githubAccount: application.get('github'),
                        details: application.get('details'),
                        name: application.get('name'),
                        email: application.get('email'),
                        phoneNumber: application.get('phone'),

                        applicationId: application.get('objectId'),
                        positionId: application.get('positionId')
                    }))
                .catch(console.error);
        } else {
            this.setData({
                positionId: positionId,
            })
        }
    },

    addApplication: function () {
        if (!this.isNoFieldBlank()) {
            wx.showToast({
                title: "请填写完毕喔",
                icon: "loading",
                mask: true,
                duration: 1000
            });
            return;
        }

        if (this.isNoFieldChanged()) {
            wx.showToast({
                title: "请勿重复申请",
                icon: "loading",
                mask: true,
                duration: 1000
            });
            return;
        }

        if (!this.checkExistence()) {
            this.setData({
                isRecommended: false
            })
        }

        if (this.data.isRecommended) {
            wx.showModal({
                title: "啊喔!",
                confirmText: "我再想想",
                content: `${this.data.name}已经被推荐了喔,请再确认一下!`,
                confirmColor: "#e33f0f",
                showCancel: false,
            });
            return;
        } else {
            wx.showToast({
                title: "抢滩成功",
                icon: "success",
                mask: true,
                duration: 1000
            })
        }


        new Application({
            name: this.data.name,
            github: this.data.githubAccount,
            phone: this.data.phoneNumber,
            email: this.data.email,
            details: this.data.details,
            positionId: this.data.positionId
        }).save().then(application => {
            wx.showToast({
                title: "提交成功",
                mask: true,
                duration: 1000
            });
            this.setupEvent();
            this.setData({
                applicationId: application.get('objectId')
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

    setupEvent: function () {
        var applicant = new AV.User;

        applicant.setUsername(`${this.data.name}`);
        applicant.setPassword('applicant');
        applicant.setEmail(`${this.data.email}`);
        applicant.setMobilePhoneNumber(`${this.data.phoneNumber}`);
        applicant.set('correlationId', AV.User.current().getObjectId());
        applicant.set('applicationId', this.data.applicationId);

        applicant.signUp().then(function () {
            //TODO: confirming of
        }, function (error) {
        });
    },

    checkExistence: function () {
        return this.checkEmailExistence() || this.checkNameExistence() || this.checkPhoneNumberExistence()
    },

    checkEmailExistence: function () {
        var userQuery = new AV.Query(AV.User);
        userQuery.equalTo('email', `${this.data.email}`);
        userQuery.find().then((results) => {
            this.setData({
                emailExistence: results.length > 0
            })
        });
        return this.data.emailExistence
    },
    checkNameExistence: function () {
        var userQuery = new AV.Query(AV.User);
        userQuery.equalTo('name', `${this.data.name}`);
        userQuery.find().then((results) => {
            this.setData({
                nameExistence: results.length > 0
            })
        });
        return this.data.nameExistence
    },
    checkPhoneNumberExistence: function () {
        var userQuery = new AV.Query(AV.User);
        userQuery.equalTo('phone', `${this.data.phoneNumber}`);
        userQuery.find().then((results) => {
            this.setData({
                phoneNumberExistence: results.length > 0
            })
        });
        return this.data.phoneNumberExistence
    },

    resendEmail: function () {
        AV.User.requestEmailVerify(`${this.data.email}`).then(function (result) {
            console.log(JSON.stringify(result));
        }, function (error) {
            console.log(JSON.stringify(error));
        });
    },

    callPhone: function () {
        if (this.isValidPhoneNumber()) {
            wx.makePhoneCall({
                phoneNumber: `${this.data.phoneNumber}`
            })
        }
    },

    isValidPhoneNumber: function () {
        return true
    },


    updateName: function (e) {
        this.setData({
            name: e.detail.value
        })
    },
    updateGithub: function (e) {
        this.setData({
            githubAccount: e.detail.value
        })
    },
    updateEmail: function (e) {
        this.setData({
            email: e.detail.value
        })
    },
    updatePhoneNumber: function (e) {
        this.setData({
            phoneNumber: e.detail.value
        })
    },
    updateDetails: function (e) {
        this.setData({
            details: e.detail.value
        })
    },


    isNoFieldChanged: function () {
        return this.data.oldDetails === this.data.details &&
            this.data.oldName === this.data.name &&
            this.data.oldPhoneNumber === this.data.phoneNumber &&
            this.data.oldGithubAccount === this.data.githubAccount &&
            this.data.oldEmail === this.data.email
    },

    isNoFieldBlank: function () {
        return this.data.githubAccount && this.data.details && this.data.name && this.data.email && this.data.phoneNumber
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


