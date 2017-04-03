const AV = require('../../libs/av-weapp-min.js');
var wxSortPickerView = require('../../wxSortPickerView/wxSortPickerView.js');

Page({
    data: {
        cars: [],
        charIndex: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'],
        toggle_option: false,
        lastSearch: '',
        openSidebarToggle: true,
        mark: 0,
        newMark: 0,
        isMarkRight: true,
        brands: [],
        brand: 0,
        series: 0,
        subSeries: 0,
        car: 0,
        logo: ''
    },

    refreshBrands: function () {
        this.fetchBrands();
    },

    fetchBrands: function () {
        var that = this;
        try {
            console.log("Fetching Brands Info From Local Storage");
            var value = wx.getStorageSync('brands');
            if (value) {
                wxSortPickerView.initFromLocal(value, that);
            } else {
                that.fetchBrandsViaAV;
            }
        } catch (e) {
            console.log("Fetching Brands Info");
            that.fetchBrandsViaAV;
        }
    },

    fetchBrandsViaAV: function () {
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
        try {
            console.log("Set Local Storage: Brands");
            console.log(that.data.brands);
            wx.setStorageSync('brands', that.data.brands);
        } catch (e) {
            console.log(e)
        }
        wxSortPickerView.init(this.data.brands, that);
    },

    onLoad() {
        const role = wx.getStorageSync('role');
        this.setData({
            role
        });
        this.setData({
            openSidebarToggle: true
        });
        this.fetchBrands();
    },

    tap_start: function (e) {
        this.data.mark = this.data.newMark = e.touches[0].pageX;

    },
    tap_drag: function (e) {
        this.data.newMark = e.touches[0].pageX;
        this.isMarkRight = this.data.mark <= this.data.newMark - 2;

        this.data.mark = this.data.newMark;

    },
    tap_end: function () {
        this.setData({
            openSidebarToggle: this.isMarkRight
        });
    },

    closeSidebar: function () {
        this.setData({
            openSidebarToggle: false
        })
    },
    openSidebar: function () {
        this.setData({
            openSidebarToggle: true
        })
    },
    querySeries: function () {
        var that = this;
        try {
            var value = wx.getStorageSync("brandId" + that.data.brandId);
            if (value) {
                that.setData({
                    seriesData: value
                });
            } else {
                that.querySeriesViaApi();
            }
        } catch (e) {
            console.log("Error when fetching series info form local storage" + e);
            that.querySeriesViaApi();
        }
    },

    querySeriesViaApi: function () {
        var that = this;
        wx.request({
            url: "https://api.jisuapi.com/car/carlist?appkey=15815ae2798d78fa&parentid=" + that.data.brandId,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                console.log("Fetch Brand Info For: " + that.data.brandId);
                console.log(res.data);

                that.setData({
                    seriesData: res.data.result
                });

                try {
                    wx.setStorageSync("brandId" + that.data.brandId, res.data.result)
                } catch (e) {
                    console.log("Error when setting series data" + e)
                }
            }
        })
    },

    solveColors: function () {
        var colorString = this.data.selectedCar.body.color;
        var subString = colorString.split('|');
        var colors = [];

        for (var i = 0; i < subString.length; i++) {
            var color = subString[i].split(',')[1];
            if (color !== undefined) {
                colors.push(color)
            }
        }

        this.setData({
            colors
        });
        console.log(this.data.colors)
    },

    bindChange: function (e) {
        var value = e.detail.value;
        this.setData({
            series: value[0],
            subSeries: value[1],
            car: value[2]
        })
    },

    selectCar: function () {
        var that = this
        this.setData({
            carId: this.data.seriesData[this.data.series]
                .carlist[this.data.subSeries]
                .list[this.data.car].id
        });
        wx.request({
            url: "https://api.jisuapi.com/car/detail?appkey=15815ae2798d78fa&carid=" + this.data.carId,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                console.log(res.data);

                that.setData({
                    selectedCar: res.data.result,
                    logo: that.data.seriesData[that.data.series]
                        .carlist[that.data.subSeries].logo
                });

                that.solveColors();
                that.closeSidebar();
            }
        })
    },

    selectBrand: function (e) {
        var brandId = e.currentTarget.dataset.id;
        this.setData({
            brandId: brandId
        });
        this.querySeries();
    }
});
