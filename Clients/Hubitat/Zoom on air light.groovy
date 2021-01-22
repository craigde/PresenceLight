/***********************************************************************************************************************
*  Copyright 2020 craigde
*
*  Source -https://github.com/craigde/PresenceLight
*
*  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License. You may obtain a copy of the License at:
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
*  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
*  for the specific language governing permissions and limitations under the License.
*
*  Zoom On Air Light
*
*  Author: craigde
*  Date: 2020-8-17
*
* This is an application that allows you to create an automatic "On Air" light driven by Zoom presence with a home automation systm.
* Requires a Server (node.js/express web application) that enables poll based Zoom presence. It needs to be accessbile on the internet somewhere where Zoom can send it events via WebHook for change of presence events. Further details in the Server folder in link above.
*
* for use with HUBITAT
*
*
***********************************************************************************************************************/

public static String version()      {  return "v1.01"  }


/***********************************************************************************************************************
*
* Version 1
*   6/31/2020: 1.0 - initial version
*   8/17/2020: 1.01 - fixed issue where app did not autostart correctly after a reboot
*   1/20/2021: 1.02 - fixed issue with incorrect status when screensharing
*/

definition(
    name: "Zoom On Air Light",
    namespace: "zoomlight",
    author: "Craig Dewar",
    description: "App to turn on light based on Zoom Presence",
    category: "My Apps",
    iconUrl: "",
    iconX2Url: "",
    iconX3Url: "")

preferences {
    section("Zoom Presence API address (do not include http://):") {
        input "APIurl", "string", required: true, title: "Where?"
    }
    section("Polling interval (minutes):") {
        input "minutes", "number", required: true, title: "How often?"
    }
    section("Zoom User Email") {
        input "UserEmail", "string", required: true
    }
    section("Turn on this light") {
        input "theswitch", "capability.switch", required: true
    }    
       section("Collect Additional Debug information") {
           input "isDebug", "bool", title:"Debug mode", required:true, defaultValue:false
    }    
}

def installed() {
    initialize()
}

def updated() {
    unsubscribe()
    initialize()
}

def initialize() {
    //subscribe to hub restart so app continues to run after a reboot
    subscribe(location, "systemStart", hubRestartHandler) 
    checkPresence()
}

def checkPresence() {
    if (isDebug) {log.debug "In checkPresence scheduled method"}

    def params = [ uri: "https://$APIurl/status?user=$UserEmail" ]
    def ZoomPresence = [:]
    
    if (isDebug) {log.debug "HTTP REQUEST"}
    if (isDebug) { log.debug "$params" }
    
    try {
        httpGet(params)		{ resp ->
            if (resp?.data)     ZoomPresence << resp.data;
            else                log.error "http call for Zoom status did not return data: $resp";
        }
    } catch (e) { log.error "http call failed for api: $e" }
    if (isDebug) { log.debug "$ZoomPresence" }
    
    if (ZoomPresence.Status != "Available") {
        if (isDebug) {log.debug "User is busy:  turning switch on"}
        theswitch.on()
    }
    else {
        theswitch.off()
        if (isDebug) {log.debug "User is available: turning switch off"}
    }
    runIn(60 * minutes, checkPresence)
}

def hubRestartHandler(evt) {
    //Hub rebooted so set initial poll time
    checkPresence()
}
