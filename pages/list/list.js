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
        isMarkRight:true
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
        this.setData({
            openSidebarToggle: false
        });
        this.fetchCars();
    },

    onLoad(query) {
        const role = wx.getStorageSync('role');
        console.log("brand: " + query.brand)
        this.setData({
            role,
        });

        var that = this
        wxSortPickerView.init(["宝马  BMW", "奥迪  Audi", "宾利  Bentley", "保时捷  Porsche", "捷豹  Jaguar", "福特  Ford", "凯迪拉克  Cadillac", "大众  Volkswagen", "路虎  Land Rover", "本田  Honda", "现代  Hyundai Motor", "兰博基尼  Lamborghini"],that);
        console.log(this.data.wxSortPickerData)
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

    updateOptionToggle(e) {
        var oldOptionToggle = this.data.toggle_option;
        var that = this
        wx.getStorage({
            key: 'role',
            success: function(res) {
                console.log(res)
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

    tap_ch: function(e){
        if(this.data.openSidebarToggle){
            this.setData({
                openSidebarToggle : false
            });
        }else{
            this.setData({
                openSidebarToggle : true
            });
        }
    },
    tap_start:function(e){
        this.data.mark = this.data.newMark = e.touches[0].pageX;
    },
    tap_drag: function(e){
        this.data.newMark = e.touches[0].pageX;
        if(this.data.mark < this.data.newMark){
            this.isMarkRight = true;
        }

        if(this.data.mark > this.data.newMark){
            this.isMarkRight = false;

        }
        this.data.mark = this.data.newMark;

    },
    tap_end: function(e){
        this.data.mark = 0;
        this.data.newMark = 0;
        if(this.isMarkRight){
            this.setData({
                openSidebarToggle : true
            });
        }else{
            this.setData({
                openSidebarToggle : false
            });
        }
    },
    closeSidebar: function () {
        this.setData({
            openSidebarToggle : false
        })
    }
});
