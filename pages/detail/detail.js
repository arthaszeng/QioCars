const AV = require('../../libs/av-weapp-min.js');
const Car = require('../../model/car');

Page({
    data: {
        url: [],
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

    onLoad(query){
        const id = query.id;

        const role = wx.getStorageSync('role');
        this.setData({role});

        var car = AV.Object.createWithoutData('Car', id);
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

        console.log(this.data.parameters);
    },

    transitionBack(){
        wx.navigateBack();
    }
});