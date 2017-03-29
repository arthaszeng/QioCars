const AV = require('../../libs/av-weapp-min.js');
var wxSortPickerView = require('../../wxSortPickerView/wxSortPickerView.js');

Page({
    data: {
        cars: [],
        toggle_option: false,
        lastSearch: '',
        openSidebarToggle : false,
        mark: 0,
        newMark: 0,
        isMarkRight:true,
        brands: []
    },

    fetchCars: function () {
        return new AV.Query('Car')
            .descending('createdAt')
            .find()
            .then(this.setCars)
            .catch(console.error);
    },

    refreshBrands: function () {
        this.fetchBrands();
    },

    fetchBrands: function () {
        return new AV.Query('Brand')
            .descending('createdAt')
            .find()
            .then(this.setBrands)
            .catch(console.error);
    },

    setBrands: function (brands) {
        var that = this;

        this.setData({
            brands
        });

        wxSortPickerView.init(this.data.brands, that);
    },

    onPullDownRefresh: function () {
        this.fetchCars().then(wx.stopPullDownRefresh);
    },

    setCars: function (cars) {
        this.setData({
            cars
        });
    },

    onShow() {
        this.setData({
            openSidebarToggle: false
        });
        this.fetchCars();
        this.fetchBrands();
    },

    onLoad() {
        const role = wx.getStorageSync('role');
        this.setData({
            role
        });
    },

    transitionToEdit(e){
        wx.navigateTo({
            redirect: "true",
            url: `../car/car?id=${e.target.dataset.id}`
        });
    },

    transitionToDetail(e){
        wx.navigateTo({
            redirect: "true",
            url: `../detail/detail?id=${e.target.dataset.id}`
        });
    },

    deleteCar(e){
        console.log(e.currentTarget.dataset.id);
        AV.Query.doCloudQuery(`delete from Car where objectId="${e.currentTarget.dataset.id}"`).then(()=> {
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

    updateOptionToggle() {
        var oldOptionToggle = this.data.toggle_option;
        var that = this;
        wx.getStorage({
            key: 'role',
            success: function(res) {
                console.log(res);
                if (res.data === 'ADMIN') {
                    that.setData({
                        toggle_option: !oldOptionToggle
                    })
                }
            }
        });
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
    },

    tap_start:function(e){
        this.data.mark = this.data.newMark = e.touches[0].pageX;

    },
    tap_drag: function(e){
        this.data.newMark = e.touches[0].pageX;
        this.isMarkRight = this.data.mark <= this.data.newMark - 2;

        this.data.mark = this.data.newMark;

    },
    tap_end: function(){
        this.setData({
            openSidebarToggle : this.isMarkRight
        });
    },

    closeSidebar: function () {
        this.setData({
            openSidebarToggle : false
        })
    },

    transitionToBrand: function () {
        wx.navigateTo({
            redirect: "true",
            url: `../brand/brand`
        });
    }
});
