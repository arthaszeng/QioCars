const AV = require('../../libs/av-weapp-min.js');
const Car = require('../../model/car');

Page({
    data: {
        url: [],
        files: [],
        parameters: {},

        oldTitel: '',
        oldSalePrice: '',
        oldTravelledDistance: '',
        oldDate: '',

        titel: '',
        salePrice: '',
        travelledDistance: '',
        date: '',

        objectId: '',
        queryId: ''
    },

    selectCar2: function () {
        var that = this;
        this.data.queryId = '3531';
        wx.request({
            url: "https://api.jisuapi.com/car/detail?appkey=15815ae2798d78fa&carid=" + this.data.queryId,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                console.log(res.data);

                that.setData({
                    parameters: res.data.result
                });

                that.solveColors(res.data.result.body.color);
            }
        })
    },

    transitionToQuery: function () {
        wx.switchTab({
            url: '../query/query'
        })
    },

    selectCar: function () {
        var that = this;
        wx.request({
            url: "https://api.jisuapi.com/car/detail?appkey=15815ae2798d78fa&carid=" + this.data.queryId,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                console.log(res.data);

                that.setData({
                    parameters: res.data.result
                });

                that.solveColors(res.data.result.body.color);
            }
        })
    },

    solveColors: function (e) {
        var subString = e.split('|');
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


    addCar: function () {
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

        this.data.files.map(tempFilePath => () => new AV.File('filename', {
            blob: {
                uri: tempFilePath
            }
        }).save()).reduce(
            (m, p) => m.then(v => AV.Promise.all([...v, p()])),
            AV.Promise.resolve([])
        ).then(files => {
            this.setData({
                url: files.map(file => file.url())
            });

            console.log(this.data.parameters)

            new Car({
                titel: this.data.titel,
                travelledDistance: this.data.travelledDistance,
                salePrice: this.data.salePrice,
                date: this.data.date,
                url: this.data.url,
                queryId: this.data.queryId,
                parameters: this.data.parameters
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
        }).catch(console.error);
    },

    addImage: function () {
        this.data.files.map(tempFilePath => () => new AV.File('filename', {
            blob: {
                uri: tempFilePath
            }
        }).save()).reduce(
            (m, p) => m.then(v => AV.Promise.all([...v, p()])),
            AV.Promise.resolve([])
        ).then(files => {
            this.setData({
                url: files.map(file => file.url())
            });
        }).catch(console.error);
    },

    chooseImage: function () {
        var that = this;
        wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                that.setData({
                    files: that.data.files.concat(res.tempFilePaths)
                });
            }
        })
    },

    previewImage: function (e) {
        wx.previewImage({
            current: e.currentTarget.id,
            urls: this.data.files
        })
    },

    updateTitel: function (e) {
        this.setData({
            titel: e.detail.value
        });
    },
    updateTravelledDistance: function (e) {
        this.setData({
            travelledDistance: e.detail.value
        })
    },
    updateSalePrice: function (e) {
        this.setData({
            salePrice: e.detail.value
        })
    },
    bindDateChange: function (e) {
        this.setData({
            date: e.detail.value
        });
    },

    onLoad(query){
        const role = wx.getStorageSync('role');
        this.setData({role});

        console.log(query);
        if ('queryid' in query) {
            this.setData({
                queryId: query.queryid
            });
            this.selectCar();
        }

        if ('id' in query) {
            var car = AV.Object.createWithoutData('Car', query.id);
            car.fetch()
                .then(
                    car => this.setData({
                        travelledDistance: car.get('travelledDistance'),
                        titel: car.get('titel'),
                        salePrice: car.get('salePrice'),
                        date: car.get('date'),

                        oldTravelledDistance: car.get('travelledDistance'),
                        oldTitel: car.get('titel'),
                        oldSalePrice: car.get('salePrice'),
                        oldDate: car.get('date'),

                        url: car.get('url'),
                        parameters: car.get('parameters'),
                        queryId: car.get('queryId'),
                        objectId: car.get('objectId')
                    }))
                .catch(console.error);
        }
    },

    isNoFieldChanged: function () {
        return this.data.salePrice === this.data.oldSalePrice &&
            this.data.titel === this.data.oldTitel &&
            this.data.travelledDistance === this.data.oldTravelledDistance &&
            this.data.date === this.data.oldDate;
    },

    isNoFieldBlank: function () {
        return this.data.salePrice && this.data.titel && this.data.travelledDistance && this.data.date;
    },

    transitionToPositions(){
        wx.navigateBack();
    }

});