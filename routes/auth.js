/*
There are two different cases in our applications for handling JWT's which we'll create separate 
middleware for optional authentication and required authentication. Authentication will be required
for routes that require a logged-in user, such as feed (since we can't have a personalized feed for
someone who can't be identified). When a JWT isn't provided to a route that requires authentication,
the route will fail with a 401 status code. Authentication will be optional for some routes that are
exposed to the public, such as fetching the global list of articles. The route will still respond if
it's optionally authenticated, otherwise,if a JWT is provided, the user's data will be used to 
enhance the data being returned (such as if they've favorited an article or not). We'll be using
the express-jwt package to validate JWT's.
*/

var jwt = require('express-jwt');
var secret = require('../config').secret;

/*
Since our JWT's were generated with the secret in config/index.js (the generateJWT() method we made 
on the user model uses it), we'll need to use the same secret to validate the JWT tokens from the front-end.
To handle the two different authentication cases (optional and required), we'll need to export two separately
configured express-jwt middlewares. You can view the configuration options for express-jwt here.
*/

function getTokenFromHeader(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
        return req.headers.authorization.split(' ')[1];
    }

    return null;
}

/*
The getTokenFromHeader() function is a helper function that both middlewares use to extract the JWT 
from the Authorization header. The only difference between the required and optional middlewares is 
that the optional middleware is configured with credentialsRequired: false so that requests without 
a token will still succeed. userProperty is the property where the JWT payloads will be attached to 
each request, so we can access the data using req.payload.
*/

var auth = {
    required: jwt({
        secret: secret,
        userProperty: 'payload',
        getToken: getTokenFromHeader
    }),
    optional: jwt({
        secret: secret,
        userProperty: 'payload',
        credentialsRequired: false,
        getToken: getTokenFromHeader
    })
};

// Finally, we'll have to export our middlewares in order for the rest of our application to use them.
module.exports = auth;
