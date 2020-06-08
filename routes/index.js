'use strict';
var express = require('express');
const request = require('request')

var router = express.Router();

// This handles the installation of the ZoomPresence app from Zoom and granting authorization to user data with Oauth2. It is only needed for intial install of the app. 
// adapted from https://github.com/zoom/zoom-oauth-sample-app

router.get('/', function (req, res) {

    // Step 1: 
    // Check if the code parameter is in the url 
    // if an authorization code is available, the user has most likely been redirected from Zoom OAuth
    // if not, the user needs to be redirected to Zoom OAuth to authorize

    console.log(`req: ${req}`);

    if (req.query.code) {

        // Step 3: 
        // Request an access token using the auth code

        let url = 'https://zoom.us/oauth/token?grant_type=authorization_code&code=' + req.query.code + '&redirect_uri=' + process.env.redirectURL;
        console.log(`url: ${url}`);

        request.post(url, (error, response, body) => {

            // Parse response to JSON
            body = JSON.parse(body);
            console.log(`body: ${body}`);

            // Logs your access and refresh tokens in the browser
            console.log(`access_token: ${body.access_token}`);
            console.log(`refresh_token: ${body.refresh_token}`);

            if (body.access_token) {

                // Step 4:
                // We can now use the access token to authenticate API calls

                // Send a request to get your user information using the /me context
                // The `/me` context restricts an API call to the user the token belongs to
                // This helps make calls to user-specific endpoints instead of storing the userID

                request.get('https://api.zoom.us/v2/users/me', (error, response, body) => {
                    if (error) {
                        console.log('API Response Error: ', error)
                    } else {
                        body = JSON.parse(body);
                        // Display response in console
                        console.log('API call ', body);
                        // Display response in browser
                        var JSONResponse = '<pre><code>' + JSON.stringify(body, null, 2) + '</code></pre>'
                        res.send(`
                            <div class="container">
                                <div class="info">
                                    <div>
                                        <span>Success</span>
                                        <h2>Welcome</h2>
                                        <p>${body.first_name} ${body.last_name}</p>
                                    </div>
                                </div>
                                <div class="response">
                                    <h4>See here for further details</h4>
                                </div>
                            </div>
                        `);
                    }
                }).auth(null, null, true, body.access_token);

            } else {
                // Handle errors, something's gone wrong!
            }

        }).auth(process.env.clientID, process.env.clientSecret);

        return;

    }

    // Step 2: 
    // If no authorization code is available, redirect to Zoom OAuth to authorize
    res.redirect('https://zoom.us/oauth/authorize?response_type=code&client_id=' + process.env.clientID + '&redirect_uri=' + process.env.redirectURL)
});

module.exports = router;
