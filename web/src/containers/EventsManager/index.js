const isFrontEnd = () => {
    if(typeof window == 'undefined');
}

let app_events;
if(typeof window === 'undefined') {
    if(typeof global.__APP_EVENTS__  == 'undefined')
        global.__APP_EVENTS__ = {};
    app_events = global.__APP_EVENTS__;
}
else {
    if(typeof window.__APP_EVENTS__  == 'undefined')    
        window.__APP_EVENTS__ = {};
    app_events = window.__APP_EVENTS__;            
}

export default {    
    registerEvent: (eventName, eventAction) => {
        if(typeof app_events[eventName] == 'undefined') {
            app_events[eventName] = eventAction;
            return true;
        }
        return false;
    },

    callEvent: (eventName) => {
        //debugger;
        //return app_events;
        //return app_events[eventName];
        return app_events[eventName];
        //return app_events;
    }
}