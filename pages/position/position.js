const AV = require('../../utils/leancloud-storage');
const Position = require('../../model/position');


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
        if (this.isNoFieldChanged() || this.isNoFieldBlank()) {
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


    updateName: function ({
        detail: {
            value
        }
    }) {
        if (!value) return;
        this.setData({
            positionName: value
        });
    },
    updateLocation: function ({
        detail: {
            value
        }
    }) {
        if (!value) return;
        this.setData({
            positionLocation: value
        });
    },
    updateDescription: function ({
        detail: {
            value
        }
    }) {
        if (!value) return;
        this.setData({
            positionDescription: value
        });
    },

    onLoad(query){
        const id = query.id;

        const role = wx.getStorageSync('role');
        this.setData({ role });

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
        return !this.data.positionDescription || !this.data.positionName || !this.data.positionLocation
    },

    transitionToPositions(){
        wx.navigateBack();
    },

    transitionToApply() {
        console.log(this.data.positionId);
        wx.navigateTo({
            url: `../application/application?positionId=${this.data.positionId}`
        })
    },
});