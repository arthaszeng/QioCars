const AV = require('../../utils/leancloud-storage');
const Position = require('../../model/position');


Page({
    data: {
        positionName: '',
        positionLocation: '',
        positionDescription: '',
        positionId: ''
    },

    addPosition: function () {
        var positionName = this.data.positionName && this.data.positionName.trim();
        var positionLocation = this.data.positionLocation && this.data.positionLocation.trim();
        var positionDescription = this.data.positionDescription && this.data.positionDescription.trim();

        if (!positionLocation || !positionDescription || !positionDescription) {
            return;
        }

        //TODO: after confirming it's changed then save
        new Position({
            name: positionName,
            location: positionLocation,
            description: positionDescription,
        }).save().then(() => {
            wx.showToast({
                title: "提交成功",
                duration: 1000
            });
            this.transitionToPositions();
        }).catch(()=> {
            wx.showToast({
                title: '请勿重复提交',
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

        const role = wx.getStorageSync('role')
        this.setData({ role })

        var position = AV.Object.createWithoutData('Position', id);
        position.fetch()
            .then(
                position => this.setData({
                    positionLocation: position.get('location'),
                    positionDescription: position.get('description'),
                    positionName: position.get('name'),
                    positionId: position.get('objectId')
                }))
            .catch(console.error);
    },

    transitionToPositions(){
        wx.navigateBack();
    },

    transitionToApply() {
        console.log(this.data.positionId)
        wx.navigateTo({
            url: `../application/application?positionId=${this.data.positionId}`
        })
    },
});