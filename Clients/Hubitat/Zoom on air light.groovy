public static String version()      {  return "v1.0"  }

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
            else                log.error "http call for Weatherstack weather api did not return data: $resp";
        }
    } catch (e) { log.error "http call failed for api: $e" }
    if (isDebug) { log.debug "$ZoomPresence" }
    
    if (ZoomPresence.Status == "Do_Not_Disturb") {
        if (isDebug) {log.debug "User is busy:  turning switch on"}
        theswitch.on()
    }
    else {
        theswitch.off()
        if (isDebug) {log.debug "User is available: turning switch off"}
    }
    runIn(60 * minutes, checkPresence)
}
