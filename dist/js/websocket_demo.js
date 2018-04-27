// 连接 websocket
var connectWebSocket = function connectWebSocket() {
    var websocket;
    if('WebSocket' in window) {
        websocket = new WebSocket("ws://172.16.31.231:8040/lift/websocket.do");
    } else if('MozWebSocket' in window) {
        websocket = new MozWebSocket("ws://172.16.31.231:8040/lift/websocket.do");
    } else {
        websocket = new SockJS("http://172.16.31.231:8040/lift/sockjs/websocket.do");
    }
    // 打开时
    websocket.onopen = function(evnt) {
        console.log("websocket.onopen  ");
    };
    // 处理消息时
    websocket.onmessage = function(evnt) {
        $("#msg").append("<p>" + evnt.data +"</p>");
        console.log("  websocket.onmessage   ");
    };
    websocket.onerror = function(evnt) {
        console.log("  websocket.onerror  ");
       // connectWebSocket();
    };
    websocket.onclose = function(evnt) {
        console.log("  websocket.onclose  ");
        //connectWebSocket();
    };
    // 发送消息
    //websocket.send(JSON.stringify(msg));
};
$(function() {
    connectWebSocket();
});