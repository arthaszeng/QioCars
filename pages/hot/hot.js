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
            cars
        });
    },

    onLoad() {
        const role = wx.getStorageSync('role');
        this.setData({
            role
        });
        this.fetchCars();
    },

    transitionToList(){
        wx.switchTab({
            url: `../list/list`
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
    },

    performSearch() {
        var that = this;
        console.log(this.data.lastSearch);
        var query = new AV.Query('Car');
        query.contains('brand', this.data.lastSearch);
        query.contains('model', this.data.lastSearch);
        query.find().then(function (results) {
            that.setData({
                cars: results
            })
        }, function (error) {
        });
    },

    updateSearch(e) {
        this.setData({
            lastSearch: e.detail.value
        });
    }
});
