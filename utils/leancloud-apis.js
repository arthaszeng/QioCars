const AV = require('../utils/leancloud-storage');

export function createApplicant({name, email,phoneNumber,applicationId}) {
    var applicant =  new AV.User;
    applicant.setUsername(`${name}`);
    applicant.setPassword('applicant');
    applicant.setEmail(`${email}`);
    applicant.setMobilePhoneNumber(`${phoneNumber}`);
    applicant.set('correlationId', AV.User.current().getObjectId());
    applicant.set('applicationId', applicationId);

    //TODO: find an other impl
    applicant.signUp().then(function () {
        AV.User.logOut().then(function () {
            app.loginWithLCAndWeapp()
        })
    }, function (error) {
        //TODO: Handle error
    });
}
