//set as ready
window.requireHub.main_ready = true;
//get notification event name
var evName = window.requireHub.main_ready_event_name;

// notify others
if (document.createEventObject){ // dispatch for IE
    var evt = document.createEventObject();               
    document.fireEvent('on'+evName,evt)
}else{// dispatch for firefox + others
    var evt = document.createEvent("HTMLEvents");               
    evt.initEvent(evName, true, true ); // event type,bubbling,cancelable
    document.dispatchEvent(evt);
}
