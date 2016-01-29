window.fbAsyncInit = function() {
    FB.init({
        appId: '556661567836062',
        xfbml: true,
        version: 'v2.5'
    });
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

var facebook = {
    login: function(callback) {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                if (callback) {
                    callback.call(facebook, response);
                }
            }
            else {
                FB.login(function(result) {
                    if (result.status === 'connected') {
                        // Logged into your app and Facebook.
                        if (callback) {
                            callback.call(facebook, result);
                        }
                    }
                    else if (result.status === 'not_authorized') {
                        // The person is logged into Facebook, but not your app.
                    }
                    else {
                        // The person is not logged into Facebook, so we're not sure if
                        // they are logged into this app or not.
                    }
                }, {
                    scope: 'public_profile,email,user_friends'
                });
            }
        });
    },
    getPictureUrl: function() {
        var p = new Promise(function(resolve, reject) {
            facebook.login(function() {
                FB.api("/me?fields=name,id,picture", function(payload) {
                    resolve(payload.picture.data.url);
                });
            });
        });
        return p;
    },
    getName: function(){
        var p = new Promise(function(resolve, reject) {
            facebook.login(function() {
                FB.api("/me?fields=name,id,picture", function(payload) {
                    resolve(payload.name);
                });
            });
        });
        return p;
    }
};