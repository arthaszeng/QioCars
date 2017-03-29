const AV = require('../../libs/av-weapp-min.js');
const Brand = require('../../model/brand');
var wxSortPickerView = require('../../wxSortPickerView/wxSortPickerView.js');

Page({
    data: {
        brandName: '',
        englishName: '',
        files: [],

        oldBrandName: '',
        oldEnglishName: '',

        brandId: ''
    },

    addBrand: function () {
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
                uri: tempFilePath,
            },
        }).save()).reduce(
            (m, p) => m.then(v => AV.Promise.all([...v, p()])),
            AV.Promise.resolve([])
        ).then(files => {
            this.setData({
                url: files.map(file => file.url())
            });
            new Brand({
                brandName: this.data.brandName,
                englishName: this.data.englishName,
                url: this.data.url
            }).save().then(() => {
                wx.showToast({
                    title: "提交成功",
                    duration: 1000
                });
                this.transitionBack();
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

    updateEnglishName: function (e) {
        this.setData({
            englishName: e.detail.value
        });
    },
    updateBrandName: function (e) {
        this.setData({
            brandName: e.detail.value
        })
    },
    
    onLoad(query){
        const id = query.id;

        const role = wx.getStorageSync('role');
        this.setData({role});

        var brand = AV.Object.createWithoutData('Brand', id);
        brand.fetch()
            .then(
                brand => this.setData({
                    brandName: brand.get('brand_name'),
                    englishName: brand.get('english_name'),
                    url: brand.get('url'),
                    oldBrandName: brand.get('brand_name'),
                    oldEnglishName: brand.get('english_name'),
                    brandId: brand.get('objectId')
                }))
            .catch(console.error);

        var that = this
        wxSortPickerView.init(["宝马  BMW", "奥迪  Audi", "宾利  Bentley", "保时捷  Porsche", "捷豹  Jaguar", "福特  Ford", "凯迪拉克  Cadillac", "大众  Volkswagen", "路虎  Land Rover", "本田  Honda", "现代  Hyundai Motor", "兰博基尼  Lamborghini"],that);
        console.log(this.data.wxSortPickerData)
    },

    isNoFieldChanged: function () {
        return this.data.englishName === this.data.oldEnglishName &&
            this.data.brandName === this.data.oldBrandName
    },

    isNoFieldBlank: function () {
        return this.data.brandName && this.data.englishName
    },

    transitionBack(){
        wx.navigateBack();
    }
});