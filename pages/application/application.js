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

        emailExistence: true,
        nameExistence: true,
        phoneNumberExistence: true,

        modalHidden: true
    },

    onLoad(query){
        const role = wx.getStorageSync('role');
        this.setData({role});

        const positionId = query.positionId;
        const applicationId = query.applicationId;

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

    prepareForApplication: function () {
        var that = this;

        if (!this.isNoFieldBlank()) {
            wx.showToast({
                title: "请填写完毕喔",
                icon: "loading",
                mask: true,
                duration: 1000
            });
            return
        }

        if (this.isNoFieldChanged()) {
            wx.showToast({
                title: "请勿重复申请",
                icon: "loading",
                mask: true,
                duration: 1000
            });
            return
        }

        wx.showModal({
            title: "啊喔!",
            confirmText: "我决定啦",
            cancelText: "我再想想",
            content: `提交后会自动给被推荐人发送邮件喔!\n亲,确定要提交吗?`,
            confirmColor: "#e33f0f",
            showCancel: true,
            success: function (res) {
                if (res.confirm) {
                    if (that.data.nameExistence || that.data.phoneNumberExistence || that.data.emailExistence) {
                        wx.showModal({
                            title: "啊喔!",
                            confirmText: "我再想想",
                            content: `${that.data.name}已经被推荐了喔,请再确认一下!`,
                            confirmColor: "#e33f0f",
                            showCancel: false
                        });
                    } else {
                        that.createAnApplication()
                    }
                }
            }
        });

    },
    //
    // callback: function () {
    //     if (this.data.nameExistence || this.data.phoneNumberExistence || this.data.emailExistence) {
    //         wx.showModal({
    //             title: "啊喔!",
    //             confirmText: "我再想想",
    //             content: `${this.data.name}已经被推荐了喔,请再确认一下!`,
    //             confirmColor: "#e33f0f",
    //             showCancel: false
    //         });
    //     } else {
    //         this.createAnApplication()
    //     }
    // },

    createAnApplication: function () {
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
            this.createAnApplicant();
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

    createAnApplicant: function () {
        var applicant = new AV.User;

        applicant.setUsername(`${this.data.name}`);
        applicant.setPassword('applicant');
        applicant.setEmail(`${this.data.email}`);
        applicant.setMobilePhoneNumber(`${this.data.phoneNumber}`);
        applicant.set('correlationId', AV.User.current().getObjectId());
        applicant.set('applicationId', this.data.applicationId);

        applicant.signUp().then(function () {
            AV.User.logOut().then(function () {
                app.loginWithLCAndWeapp()
            })
        }, function (error) {
        });
    },

    checkEmailExistence: function () {
        var userQuery = new AV.Query(AV.User);
        userQuery.equalTo('email', `${this.data.email}`);
        return userQuery.find().then((results) => {
            this.setData({
                emailExistence: results.length > 0
            });

            console.log(this.data.nameExistence);
            console.log(this.data.emailExistence);
            console.log(this.data.phoneNumberExistence)
        });
    },
    checkNameExistence: function () {
        var userQuery = new AV.Query(AV.User);
        userQuery.equalTo('name', `${this.data.name}`);
        return userQuery.find().then((results) => {
            this.setData({
                nameExistence: results.length > 0
            });
            console.log(this.data.nameExistence);
            console.log(this.data.emailExistence);
            console.log(this.data.phoneNumberExistence)
        });
    },
    checkPhoneNumberExistence: function () {
        var userQuery = new AV.Query(AV.User);
        userQuery.equalTo('phone', `${this.data.phoneNumber}`);
        return userQuery.find().then((results) => {
            this.setData({
                phoneNumberExistence: results.length > 0
            });
            console.log(this.data.nameExistence);
            console.log(this.data.emailExistence);
            console.log(this.data.phoneNumberExistence)
        });
    },

    resendEmail: function () {
        AV.User.requestEmailVerify(`${this.data.email}`).then(function (result) {
            console.log(JSON.stringify(result));
        }, function (error) {
            console.log(JSON.stringify(error));
        });
    },

    callPhone: function () {
        wx.makePhoneCall({
            phoneNumber: `${this.data.phoneNumber}`
        })
    },

    checkPhoneNumberValidation: function () {
        this.checkPhoneNumberExistence()
    },
    checkNameValidation: function () {
        this.checkNameExistence()
    },
    checkEmailValidation: function () {
        this.checkEmailExistence()
    },

    updateName: function (e) {
        this.setData({
            name: e.detail.value
        });
        this.checkNameValidation()
    },
    updateEmail: function (e) {
        this.setData({
            email: e.detail.value
        });
        this.checkEmailValidation()
    },
    updatePhoneNumber: function (e) {
        this.setData({
            phoneNumber: e.detail.value
        });
        this.checkPhoneNumberValidation()
    },
    updateGithub: function (e) {
        this.setData({
            githubAccount: e.detail.value
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
    }
    ,

    isNoFieldBlank: function () {
        return this.data.githubAccount && this.data.details && this.data.name && this.data.email && this.data.phoneNumber
    }
    ,

    transitionToPosition: function () {
        wx.redirectTo({
            redirect: "true",
            url: `../position/position?id=${this.data.positionId}`
        });
    },

    transitionToApplications: function () {
        wx.navigateTo({
            redirect: "true",
            url: `../applications/applications`
        });
    },

})
;


