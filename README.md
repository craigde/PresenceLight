# Zoom Presence Light

This is an application that allows you to create an automatic "On Air" light driven by Zoom presence with a home automation systm.

It has two components

## Server
This is a node.js/express web application that enables poll based Zoom presence. It needs to be accessbile on the internet somewhere where Zoom can send it events via WebHook for change of presence events. Further details in the Server folder.

## Client
There are two clients included

Hubitat - Application written in Groovy that will call the server and turn a configured light on and off
UiPath Automation - UiPath Studio based file to call server and then communicate with a home automation system to turn configured light on and off. It is setup to call the hubitat maker API but ould eassily be changed to work with other automation systems.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)

