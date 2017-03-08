const AV = require('../../libs/av-weapp-min.js');


Page({
    data: {
        positionName: '',
        positionLocation: '',
        positionDescription: '',

        oldPositionName: '',
        oldPositionLocation: '',
        oldPositionDescription: '',

        positionId: ''
    },

    addPosition: function () {
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
        
        new Position({
            name: this.data.positionName,
            location: this.data.positionLocation,
            description: this.data.positionDescription,
        }).save().then(() => {
            wx.showToast({
                title: "提交成功",
                duration: 1000
            });
            this.transitionToPositions();
        }).catch(()=> {
            wx.showToast({
                title: '提交失败',
                mask: true,
                duration: 1000
            })
        })
    },

    updateName: function (e) {
        this.setData({
            positionName: e.detail.value
        });
    },
    updateLocation: function (e) {
        this.setData({
            positionLocation: e.detail.value
        })
    },
    updateDescription: function (e) {
        this.setData({
            positionDescription: e.detail.value
        })
    },

    onLoad(query){
        const id = query.id;

        const role = wx.getStorageSync('role');
        this.setData({role});

        var position = AV.Object.createWithoutData('Position', id);
        position.fetch()
            .then(
                position => this.setData({
                    positionLocation: position.get('location'),
                    positionDescription: position.get('description'),
                    positionName: position.get('name'),
                    oldPositionLocation: position.get('location'),
                    oldPositionDescription: position.get('description'),
                    oldPositionName: position.get('name'),
                    positionId: position.get('objectId')
                }))
            .catch(console.error);
    },

    isNoFieldChanged: function () {
        return this.data.positionDescription === this.data.oldPositionDescription &&
            this.data.positionName === this.data.oldPositionName &&
            this.data.positionLocation === this.data.oldPositionLocation
    },

    isNoFieldBlank: function () {
        return this.data.positionDescription && this.data.positionName && this.data.positionLocation
    },

    transitionToPositions(){
        wx.navigateBack();
    },

    transitionToApply() {
        wx.navigateTo({
            redirect: "true",
            url: `../application/application?positionId=${this.data.positionId}`
        })
    },
});