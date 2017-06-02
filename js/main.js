mui.plusReady(function() {
	var network = getSys();
	if (network == "未连接网络") {
		mui.toast('未连接网络，请检查网络连接');
	}

	if (document.getElementById('home')) {
		document.getElementById('home').addEventListener('tap', function() {
			mui.openWindow({
				url: "index.html",
				id: "index",
				show: {
					aniShow: 'slide-in-left'
				}
			});
		});
	}
	if (document.getElementById('info')) {
		document.getElementById('info').addEventListener('tap', function() {
			plus.push.clear(); //清空所有消息

			//清空相关页面的按钮样式
			var infoWebviewList = ['index', 'personal', 'rush', 'myUich', 'plan', 'upload'];
			//打开的页面改变消息按钮
			for (var i = 0; i < infoWebviewList.length; i++) {
				var web = plus.webview.getWebviewById(infoWebviewList[i]);
				if (web) { //如果页面已经打开 则执行自定义事件改变【消息】按钮样式
					mui.fire(web, "removeInfo", null);
				}
			}
			mui.openWindow({
				url: "info.html",
				id: "info",
				show: {
					aniShow: 'pop-in'
				}
			});
		});
	}
	if (document.getElementById('btn-rush')) {
		document.getElementById('btn-rush').addEventListener('tap', function() {
			var rush = plus.webview.getWebviewById("rush");
			if (rush) {
				rush.show();
			} else {
				mui.openWindow({
					url: "rush.html",
					id: "rush",
					show: {
						aniShow: 'pop-in'
					}
				});
			}

		});
	}
	if (document.getElementById('btn-mine')) {
		document.getElementById('btn-mine').addEventListener('tap', function() {
			mui.openWindow({
				url: "myUich.html",
				id: "myUich",
				show: {
					aniShow: 'pop-in'
				}
			});
		});
	}
	if (document.getElementById('btn-plan')) {
		document.getElementById('btn-plan').addEventListener('tap', function() {
			mui.openWindow({
				url: "plan.html",
				id: "plan",
				show: {
					aniShow: 'pop-in'
				}
			});
		});
	}
	//新打开页面时候 如果有消息 则改变按钮样式
	var info = plus.storage.getItem('info');
	if (info) {
		if (document.getElementById('info')) {
			document.getElementById("info").className += " myinfo-active";
		}
	}
	/*if(plus.navigator.isImmersedStatusbar()){// 兼容immersed状态栏模式
		var top=plus.navigator.getStatusbarHeight();
		alert(top);
		if(document.getElementsByClassName("head")[0]){
			//alert("index");
			document.getElementsByClassName("head")[0].style.marginTop=top+"px";
		}else{ 
			//alert("other");
			document.getElementsByClassName("mui-bar-nav")[0].style.marginTop=top+"px";
			document.getElementsByClassName("ImmersedTop")[0].style.height=top+"px";
			document.getElementsByClassName("mui-content")[0].style.paddingTop=(44+top)+"px";
		}
	}*/
});

//获取网络类型
function getSys() {
	var types = {};
	types[plus.networkinfo.CONNECTION_UNKNOW] = "未知";
	types[plus.networkinfo.CONNECTION_NONE] = "未连接网络";
	types[plus.networkinfo.CONNECTION_ETHERNET] = "有线网络";
	types[plus.networkinfo.CONNECTION_WIFI] = "WiFi网络";
	types[plus.networkinfo.CONNECTION_CELL2G] = "2G蜂窝网络";
	types[plus.networkinfo.CONNECTION_CELL3G] = "3G蜂窝网络";
	types[plus.networkinfo.CONNECTION_CELL4G] = "4G蜂窝网络";
	var str = types[plus.networkinfo.getCurrentType()];
	return str;
}

function getkey() {
	var nowTime = new Date();
	nowTime = nowTime.getFullYear() + ToTime(nowTime.getMonth() + 1) + ToTime(nowTime.getDate());
	return $.md5("USERNAME" + nowTime + ",uich,");
}

/*
 * 时间转换函数 小于10月的 加0
 * 
 */
function ToTime(time) {
	if (time >= 0 && time < 10) {
		time = "0" + time;
	}
	return time;
}
/*
 * 时间戳 转换为2016/09/05 14:05:30 格式
 * 
 */

function getLocalTime(nS) {
	var d = new Date(parseInt(nS));
	return d.getFullYear() + "/" + ToTime(d.getMonth() + 1) + "/" + ToTime(d.getDate()) + " " + ToTime(d.getHours()) + ":" + ToTime(d.getMinutes()) + ":" + ToTime(d.getSeconds());
}
/*
 * 时间戳 转换为09/05 14:05 格式
 * 
 */
function getLocalPushTime(nS) {
	var d = new Date(parseInt(nS));
	return ToTime(d.getMonth() + 1) + "/" + ToTime(d.getDate()) + " " + ToTime(d.getHours()) + ":" + ToTime(d.getMinutes());
}
//更据经理星数 生成html代码--首页 
function getStartlevalDiv(leval) {
	if (leval == null) leval = 5;
	var temp = (leval * 10) % 10; //判断是否有半颗心
	var lev2 = leval;
	var lev1_html = ''; //保存半颗心的html
	var len_0=null; //保存零星的数量
	if (temp) {
		lev2 = Math.floor(leval);
		lev1_html = "<img src='images/p-xx1.png'/>";
		len_0=5-lev2-1;
	}else{
		len_0=5-lev2;
	}
	var html = '<div>';
	for (var i = 0; i < lev2; i++) {
		html += "<img src='images/p-xx2.png'/>";
	}
	html += lev1_html;
	for (var j = 0; j < 5 - lev2 - 1; j++) {
		html += "<img src='images/p-xx0.png'/>";
	}
	html += '</div>';
	return html;
}
//更据经理星数 生成html代码 --个人中心
function getStartlevalDivPersonal(leval) {
	if (leval == null) leval = 5;
	var temp = (leval * 10) % 10; //判断是否有半颗心
	var lev2 = leval;
	var lev1_html = ''; //保存半颗心的html
	var len_0=null; //保存零星的数量
	if (temp) {
		lev2 = Math.floor(leval);
		lev1_html = "<div class='p-1'></div>";
		len_0=5-lev2-1;
	}else{
		len_0=5-lev2;
	}
	var html = '';
	for (var i = 0; i < lev2; i++) {
		html += "<div class='p-2'></div>";
	}
	html += lev1_html;
	for (var j = 0; j < len_0; j++) {
		html += "<div class='p-0'></div>";
	}
	return html;
}
//时间戳 转换为20160425050505
function getDateString() {
	var nowTime = new Date();
	return nowTime.getFullYear() + ToTime(nowTime.getMonth() + 1) + ToTime(nowTime.getDate()) + ToTime(nowTime.getHours()) + ToTime(nowTime.getMinutes()) + ToTime(nowTime.getSeconds());
}
//时间戳 转换为2016-04-25
function getTime(time) {
	var my_time = new Date(parseInt(time));
	return my_time.getFullYear() + "-" + ToTime(my_time.getMonth() + 1) + "-" + ToTime(my_time.getDate());
}
//返回转介原因html代码
function getReasonList(results) {
	var len = results.length;
	var html = '<ul class="record-ul">';
	for (var i = 0; i < len; i++) {
		var obj = results[i];
		html += '<li class="record-icon"><span class="mui-pull-left record-text">' + obj.text + '</span><i class="my-icon mui-pull-right"></i></li>'
	}
	html += "</ul>";
	return html;
}

/*
 * 返回空页面显示的html
 * 
 */
function getNullHtml() {
	var html = '<div class="null-div">' + '<div class="null-clas"></div>' + '<div class="null-text">空空如也,什么都没有</div>' + '</div>';
	return html;
}
/*
 * 返回转介原因html
 * 
 */
function getReasonsHtml(reasonList,tap) {
	var len = reasonList.length;
	if (len == 0) {
		return "";
	}
	var html = '';
	for (var i = 0; i < len; i++) {
		var obj = reasonList[i];
		
		if (obj.enableStatus.enableStatus == "ENABLE") {
			if(tap=="noicon"){
				html += '<li class="record-icon"><span class="mui-pull-left">' + obj.content + '</span></li>';
			}else{
				html += '<li class="record-icon"><span class="mui-pull-left record-text">' + obj.content + '</span><i class="my-icon mui-pull-right"></i></li>';
			}
		}
	}
	html += '<div class="mui-clearfix"></div>';
	return html;
}

function getUrl(url) { //获取总url 便于更改接口
	var MyUrl = 'http://124.161.16.235:8280/uich/app/' + url;
	return MyUrl;
}
/*"b70bb2bf6b25aba1f8d9bf4af4a9a0d3"*/

//关闭窗口并且无效果关闭 单个关闭
function closeWindows(w) {
	mui.plusReady(function() {
		var ws = plus.webview.getWebviewById(w);
		if (ws) {
			//console.log("关闭" + w);
			ws.hide('none');
			plus.webview.close(ws, "none");
		}
	});
}
//关闭窗口并且无效果关闭  关闭多个
function closeWindowsList(arr) {
	mui.plusReady(function() {
		for (var i = 0; i < arr.length; i++) {
			var ws = plus.webview.getWebviewById(arr[i]);
			if (ws) {
				console.log("关闭" + arr[i]);
				ws.hide();
				plus.webview.close(ws, "none");
			}
		}
	});
}
//添加自定义事件监听 改变消息按钮
window.addEventListener('info', function(event) {
	//获得事件参数
	document.getElementById("info").className += " myinfo-active";
});

//添加自定义事件监听 改变消息按钮
window.addEventListener('removeInfo', function(event) {
	$("#info").removeClass("myinfo-active");
});
/*
 * id：融资单id
 * status：修改的状态  INTERVIEW("已面访") UPLOADED("资料上传");
 * num ：本地储存融资单的key
 */
function interAndupStatus(status, num) {
	mui.plusReady(function() {
		var dt = plus.storage.getItem(num); //保存融资单num 发送邮件成功后返回用到
		var result = JSON.parse(dt); //获取该融资单的对象
		var url = getUrl("financingSingle/updateInterViewApi");
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			financingSingleId: result.id,
			interViewStatus: status
		};
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data.flag) {

					if (status == "INTERVIEW") {
						result.interViewStatus.text = "已面访";
					} else {
						result.interViewStatus.text = "资料上传";
					}
					result.interViewStatus.interViewStatus = status;
					plus.storage.setItem(num, JSON.stringify(result));
					console.log("mf：修改成功");
				} else {
					console.log("mf：修改失败");
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log('获取数据，请检查网络连接' + errorThrown);
				plus.nativeUI.closeWaiting();
			}
		});
	});
}
/*
 * 
 * 判断地理位置是否过期  1分钟之内有效
 * 
 */
function addressIsValid(){
	var dt=plus.storage.getItem('geolocation');
	if (!dt){  //如果没有位置记录  则视为过期
		return true;
	}
	var geo=JSON.parse(dt);
	var time=geo.time; 

	var nowTime=new Date().getTime();
	var t=nowTime-time;
	var m= t/1000;
	if(m<=30){   //30秒过期
		return false;
	}else{
		return true;
	}
}
