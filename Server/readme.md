# ZoomHook

This is a node.js/express web application that enables poll based Zoom presence. I created it to build
an on-air light that wold turn on and off automatically based on actual Zoom status.

## Installation

Clone and install the app and it's dependencies. There are a number of them
We'll be using [Express](https://www.npmjs.com/package/express) for a basic Node.js server, 
[dotenv](https://www.npmjs.com/package/dotenv) for our credentials,
[request](https://www.npmjs.com/package/request) to make HTTP requests
[nodemon](https://www.npmjs.com/package/nodemon) for easier development refreshing. Also [morgan](https://www.npmjs.com/package/morgan) for debugging
 and [body-parser](https://www.npmjs.com/package/body-parser) as our parsing middleware. 

```bash
npm install express
npm install dotenv
npm install request
npm install nodemon
npm install body-parser
```

### Setup dotenv
Create a .env file in which to store your access credentials, and Redirect URL.

```bash
touch .env
```

Copy the following into this file, which we'll add your own values to:

```bash
clientID= The ClientID of your Zoom application
clientSecret= The Client Secret of your Zoom application
redirectURL= The address where this website is running. Myst be externally accessable to Zoom. If you don't have a public website you can use NGOK to test. See NGOK section.
PORT= The port you want to listen on. If missing or blank it will default to 80
```
Run server:
```bash
npm run start
```

### Install ngrok
If you are not running your website that is externally accessable Zoom will be unable to complete the oauth flow
required to successfully authenticated and installed the app on their account.

For this we'll use ngrok, which creates a public link to a localhost development server.

Download and install ngrok, then follow the steps to connect your account.

Run ngrok on the same localhost PORT you configured above:

```bash
ngrok http PORT
```

This will generate a forwarding link. Copy this and add it into your .env file as the redirectURL. Keep ngrok running! If the linkage disconnects, we'll need to readd a new redirectURL.

Example: redirectURL=https://12345678.ngrok.io



## Usage

The application have three main functions

/ - This will install the Zoom application to register for a presence web hook and ask for authorization. This is only required once.

/hook - This listens for a POST from Zoom with presence changes and saves the current state for each user

/status - This is an API you can poll for presence with a GET at any time. It expects ?user=email and retursn the current state


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)

