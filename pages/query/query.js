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
    
    setCars: function (cars) {
        this.setData({
            cars
        });
    },

    onShow() {
        this.setData({
            openSidebarToggle: true
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

    querySeries: function () {
        var that = this;
        wx.request({
            url: "https://api.jisuapi.com/car/carlist?appkey=15815ae2798d78fa&parentid=" + that.data.brandId,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                console.log(res.data);

                that.setData({
                    queryData: res.data.result
                });

                console.log(that.data.seriesData)
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
            carId: this.data.queryData[this.data.series]
                .carlist[this.data.subSeries]
                .list[this.data.car].id
        });
        wx.request({
            url: "https://api.jisuapi.com/car/detail?appkey=15815ae2798d78fa&carid="+this.data.carId,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                console.log(res.data);

                that.setData({
                    selectedCar: res.data.result,
                    logo: that.data.queryData[that.data.series]
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
