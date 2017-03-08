const AV = require('../../libs/av-weapp-min.js');



Page({
    data: {
        cars: []
    },

    fetchCars: function () {
        return new AV.Query('Car')
            .descending('createdAt')
            .find()
            .then(this.setCars)
            .catch(console.error);
    },

    onPullDownRefresh: function () {
        this.fetchCars().then(wx.stopPullDownRefresh);
    },

    setCars: function (cars) {
        this.setData({
            cars,
        });
    },

    onShow() {
        this.fetchCars();
    },

    onLoad() {
        const role = wx.getStorageSync('role');
        this.setData({
            role
        })
    },

    transitionToUpdate(e){
        wx.navigateTo({
            redirect: "true",
            url: `../car/car?id=${e.target.dataset.id}`
        });
    },

    transitionToCar(){
        wx.navigateTo({
            redirect: "true",
            url: '../car/car'
        });
    },

    deleteCar(e){
        AV.Query.doCloudQuery(`delete from Car where objectId="${e.target.dataset.id}"`).then(()=> {
            wx.showToast({
                title: "删除成功",
                mask: true,
                duration: 1000
            });
            this.fetchCars();
        }).catch(()=> {
            wx.showToast({
                title: '失败',
                mask: true,
                duration: 1000
            })
        })
    }
});
