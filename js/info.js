mui.plusReady(function() {
	//如果消息存在 则第一次加载页面 显示出来
	var info=plus.storage.getItem('info');
	if(info){
		document.getElementsByClassName("plan-badge")[0].style.display = "block";
		document.getElementsByClassName("plan-badge")[0].innerHTML=info;
	} 
	 
	//绑定li事件
	document.getElementById('info-plan-li').addEventListener('tap', function() {
		//清空所有日程消息
		plus.storage.removeItem('info');
		document.getElementsByClassName("plan-badge")[0].innerHTML = "";
		document.getElementsByClassName("plan-badge")[0].style.display = "none";
		mui.openWindow({
			id:"infoDetai",
			url:"infoDetail.html",
			show:{
				aniShow:"pop-in"
			}
		});
	});
	
});
//添加自定义事件监听 消息盒子+1
window.addEventListener('info', function(event) {
	//获得事件参数
	document.getElementsByClassName("plan-badge")[0].style.display = "block";
	var old = document.getElementsByClassName("plan-badge")[0].innerHTML;
	if (!old) {
		document.getElementsByClassName("plan-badge")[0].innerHTML = "1";
	} else {
		document.getElementsByClassName("plan-badge")[0].innerHTML = parseInt(old) + 1;
	}
});
//添加自定义事件监听 清除消息标示 
window.addEventListener('deleteInfo', function(event) {
	plus.storage.removeItem('info');
	document.getElementsByClassName("plan-badge")[0].innerHTML = "";
	document.getElementsByClassName("plan-badge")[0].style.display = "none";
});