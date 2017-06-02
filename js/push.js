/*
 * push消息推送js
 * 监听 事件 并且消息按钮处理 by zhengyinhua 2016-6-1
 *  clientid: 267bc6f48d831b8b69f7316b148efb4b MS1
 * 
 * {title:"Hello H5+ Test",content:"test content",payload:{id:"1234567890"}}
 */
mui.plusReady(function() {
	/*// 监听点击消息事件
	plus.push.addEventListener("click", function(msg) {
		//消息按钮样式变化
		//document.getElementById("info").className+=" myinfo-active";
		//var msgt = JSON.parse(msg.payload);
       // alert("传过来的数据为:"+ msgt.id);
		
		// 提示点击的内容
		plus.nativeUI.alert(msg.content);
	}, false);*/

	// 监听在线消息事件
	/*plus.push.addEventListener( "receive", function( msg ) {
		if ( msg.aps ) {  // Apple APNS message
		} else {
			//消息按钮样式变化
			//var msgt = JSON.parse(msg);
           	alert("pushjs在线监听事件触发")
           	document.getElementById("info").className+=" myinfo-active";
		}
	}, false );*/
	//getPushInfo();
	/**
	 * 获取本地推送标识信息
	 */
	function getPushInfo() {
		var info = plus.push.getClientInfo();
		alert("token: " + info.token);
		alert("clientid: " + info.clientid);
		alert("appid: " + info.appid);
		alert("appkey: " + info.appkey);
	}
});