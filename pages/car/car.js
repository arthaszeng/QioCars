const AV = require('../../libs/av-weapp-min.js');
const Car = require('../../model/car');

Page({
    data: {
        model: '',
        brand: '',
        price: '',
        url: [],
        files: [],

        oldModel: '',
        oldBrand: '',
        oldPrice: '',

        carId: ''
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
        console.log(this.data.url);

        this.data.files.map(tempFilePath => () => new AV.File('filename', {
            blob: {
                uri: tempFilePath,
            },
        }).save()).reduce(
            (m, p) => m.then(v => AV.Promise.all([...v, p()])),
            AV.Promise.resolve([])
        ).then(files => {
            this.setData({
                url: files.map(file => file.url())
            });
            new Car({
                model: this.data.model,
                brand: this.data.brand,
                price: this.data.price,
                url: this.data.url
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
                uri: tempFilePath,
            },
        }).save()).reduce(
            (m, p) => m.then(v => AV.Promise.all([...v, p()])),
            AV.Promise.resolve([])
        ).then(files => {
            this.setData({
                url: files.map(file => file.url())
            });
        }).catch(console.error);
    },

    chooseImage: function (e) {
        var that = this;
        wx.chooseImage({
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                that.setData({
                    files: that.data.files.concat(res.tempFilePaths)
                });
            }
        })
    },

    previewImage: function (e) {
        wx.previewImage({
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: this.data.files // 需要预览的图片http链接列表
        })
    },

    updateModel: function (e) {
        this.setData({
            model: e.detail.value
        });
    },
    updateBrand: function (e) {
        this.setData({
            brand: e.detail.value
        })
    },
    updatePrice: function (e) {
        this.setData({
            price: e.detail.value
        })
    },

    onLoad(query){
        const id = query.id;

        const role = wx.getStorageSync('role');
        this.setData({role});

        var car = AV.Object.createWithoutData('Car', id);
        car.fetch()
            .then(
                car => this.setData({
                    brand: car.get('brand'),
                    model: car.get('model'),
                    price: car.get('price'),
                    url: car.get('url'),
                    oldBrand: car.get('brand'),
                    oldModel: car.get('model'),
                    oldPrice: car.get('price'),
                    carId: car.get('objectId')
                }))
            .catch(console.error);
    },

    isNoFieldChanged: function () {
        return this.data.price === this.data.oldPrice &&
            this.data.model === this.data.oldModel &&
            this.data.brand === this.data.oldBrand
    },

    isNoFieldBlank: function () {
        return this.data.price && this.data.model && this.data.brand
    },

    transitionToPositions(){
        wx.navigateBack();
    },

    queryBrand: function () {
        wx.request({
            url: "https://api.jisuapi.com/car/brand?appkey=15815ae2798d78fa",
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                console.log(res.data)
            }
        })
    }
});