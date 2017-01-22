const AV = require('../../utils/leancloud-storage');
const Application = require('../../model/application');
const leancloudApis = require('../../utils/leancloud-apis');
const redux = require('../../utils/redux');


const requestApplications = () => {
    return {
        type: 'GET_APPLICATIONS',
        payload:{}
    }
};

const getApplicationsSuccess = (applications)=> {
  return {
      type:'ADD_APPLICATIONS_SUCCESS',
      payload: applications
  }
};

const getApplications = ()=>{
    return (dispatch) => {
        dispatch(requestApplications());

        console.log('fetching');
       return leancloudApis.getApplications().then(applications => {
           console.log('success');

           dispatch(getApplicationsSuccess(applications));
        });
    }
};


const reducer = (state=[],action) =>{
    switch(action.type){
        case 'ADD_APPLICATIONS_SUCCESS':
            return {applications: state.concat(action.payload)};
        default:
            return state;
    }
};

const store = redux.createStore(reducer);
console.log(store,'store');

Page({

    data: {
        applications: []
    },

    onPullDownRefresh: function () {
        this.fetchApplications().then(() => {
            wx.stopPullDownRefresh()
        });
    },

    onShow() {
        leancloudApis.getApplications().then(applications => {

            this.setData({
                applications: applications
            });
        });

        store.dispatch(getApplications()).then(()=>{
            console.log(store.getState(),'store.state');
        });
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
            url: `../application/application?applicationId=${e.target.dataset.id}`
        });
    },

    transitionToApplication(){
        wx.navigateTo({
            url: '../application/application'
        });
    },

    deleteJobs(e){
        AV.Query.doCloudQuery(`delete from Application where objectId="${e.target.dataset.id}"`).then(()=> {
            wx.showToast({
                title: "删除成功",
                mask: true,
                duration: 1000
            });
            this.fetchApplications();
        }).catch(()=> {
            wx.showToast({
                title: '失败',
                mask: true,
                duration: 1000
            })
        })
    }
});
