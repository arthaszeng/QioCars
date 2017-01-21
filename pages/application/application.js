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

        isRecommended: true
    },

    onLoad(query){
        const role = wx.getStorageSync('role');
        this.setData({role});

        const positionId = query.positionId;
        const applicationId = query.applicationId;

        if (positionId == null) {
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
                positionId: positionId
            })
        }
    },

    addApplication: function () {
        if (this.isNoFieldChanged() || this.isAnyFieldBlank()) {
            return;
        }

        this.checkIsRecommended();

        if (this.data.isRecommended) {
            wx.showModal({
                title: "啊喔!",
                confirmText: "我再想想",
                content: `${this.data.name}已经被推荐了喔,请再确认一下!`,
                confirmColor: "#e33f0f",
                showCancel: false,
                success: function (res) {
                }
            })
        } else {
            wx.showToast({
                title: "抢滩成功",
                icon: "success",
                mask: true,
                duration: 1000
            })
        }

        if (this.data.isRecommended) {
            return;
        }

        new Application({
            name: this.data.name,
            github: this.data.githubAccount,
            phone: this.data.phoneNumber,
            email: this.data.email,
            details: this.data.details,
            positionId: this.data.positionId
        }).save().then(() => {
            wx.showToast({
                title: "提交成功",
                mask: true,
                duration: 1000
            });
            this.setupEvent();
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
        var applicant = this.checkExistence();

        applicant.setUsername(`${this.data.name}`);
        applicant.setPassword('applicant');
        applicant.setEmail(`${this.data.email}`);
        applicant.setMobilePhoneNumber(`${this.data.phoneNumber}`);
        applicant.set('correlationId', AV.User.current().getObjectId());
        applicant.signUp().then(function () {
        }, function (error) {
        });
    },

    checkIsRecommended: function () {
        var userQuery = new AV.Query(AV.User);
        userQuery.equalTo('email', `${this.data.email}`);
        userQuery.find().then((results)=> {
            if (results.length > 0) {
                return true
            } else {
                userQuery.equalTo('phone', `${this.data.phoneNumber}`);
                userQuery.find().then((results)=> {
                    if (results.length > 0) {
                        return true
                    } else {
                        userQuery.equalTo('name', `${this.data.name}`);
                        userQuery.find.then((results)=> {
                            if (results.length > 0) {
                                return true
                            } else {
                                this.setData({
                                    isRecommended: false
                                });
                                return false
                            }
                        })
                    }
                })
            }
        });
    },

    checkExistence: function () {
        var userQuery = new AV.Query(AV.User);
        userQuery.equalTo('email', `${this.data.email}`);
        userQuery.find().then((results)=> {
            if (results.length == 1) {
                return results[0]
            } else {
                userQuery.equalTo('phone', `${this.data.phoneNumber}`);
                userQuery.find().then((results)=> {
                    if (results.length == 1) {
                        return results[0]
                    } else {
                        userQuery.equalTo('name', `${this.data.name}`);
                        userQuery.find.then((results)=> {
                            if (results.length == 1) {
                                return results[0]
                            }
                        })
                    }
                })
            }
        });
        return new AV.User
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


    updateName: function ({
        detail: {
            value
        }
    }) {
        if (!value) return;
        this.setData({
            name: value
        });
    }
    ,
    updateGithub: function ({
        detail: {
            value
        }
    }) {
        if (!value) return;
        this.setData({
            githubAccount: value
        });
    }
    ,
    updateEmail: function ({
        detail: {
            value
        }
    }) {
        if (!value) return;
        this.setData({
            email: value
        });
    }
    ,
    updatePhoneNumber: function ({
        detail: {
            value
        }
    }) {
        if (!value) return;
        this.setData({
            phoneNumber: value
        });
    }
    ,
    updateDetails: function ({
        detail: {
            value
        }
    }) {
        if (!value) return;
        this.setData({
            details: value
        });
    }
    ,

    isNoFieldChanged: function () {
        return this.data.oldDetails === this.data.details &&
            this.data.oldName === this.data.name &&
            this.data.oldPhoneNumber === this.data.phoneNumber &&
            this.data.oldGithubAccount === this.data.githubAccount &&
            this.data.oldEmail === this.data.email
    }
    ,

    isAnyFieldBlank: function () {
        return !this.data.githubAccount || !this.data.details || !this.data.name || !this.data.email || !this.data.phoneNumber
    }
    ,

    transitionToPosition: function () {
        wx.redirectTo({
            url: `../position/position?id=${this.data.positionId}`
        });
    }
    ,

    transitionToApplications: function () {
        wx.navigateTo({
            url: `../applications/applications`
        });
    }

})
;


