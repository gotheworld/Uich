//添加自定义事件监听 改变消息按钮
window.addEventListener('indexFire', function(event) {
	indexMain('person'); //person代表是peson触发的fire事件
});
indexMain();

function indexMain(tap) {
	mui.plusReady(function() {
		var userId = '';
		//获取用户userid
		var info = plus.push.getClientInfo();
		var userString = plus.storage.getItem("uichUser");
		if(userString) {
			userId = JSON.parse(userString).id;
		} else {
			var self = plus.webview.currentWebview();
			userId = self.userId;
		}
		var url = getUrl("managerInfo/getManagerInfoApi");
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			userId: userId
		};
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if(data.flag) {
					var htmlimg = "<img src='" + data.fileBaseUrl + data.data.headUrl + "'" + "/>";
					$(".head-img").html(htmlimg);
					$(".mytell").html(data.data.phone);
					$(".leval").html(getStartlevalDiv(data.data.starLevel));
					$(".username").html(data.data.name);
					plus.storage.setItem("managerInfoId", "" + data.data.id); //储存经理ID 转介融资单等要用到
					plus.storage.setItem("managerTypeId", data.data.managerType.id.toString()); //储存经理类型ID 抢单用到

					plus.storage.removeItem('geolocation'); //登陆时清空地理位置   防止某些运行起来 解析错误
					updateAddress(data.data.id); //更新地理位置
					//关闭等待框
					plus.nativeUI.closeWaiting();
					//显示当前页面
					if(tap != 'person') {
						mui.currentWebview.show();
					}
				} else {
					plus.nativeUI.closeWaiting();
					mui.toast("获取失败，请检查网络连接");
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				plus.nativeUI.closeWaiting();
				mui.toast('获取数据，请检查网络连接');
			}
		});
		//绑定按钮事件
		document.getElementById('myuich').addEventListener('tap', function() {
			mui.openWindow({
				url: 'myUich.html',
				id: "myUich",
				show: {
					aniShow: 'pop-in'
				}
			});
		});
		if(!mui.os.ios) {
			document.getElementsByClassName("exit")[0].style.display = "block";
		}
		document.getElementById('rush').addEventListener('tap', function() {
			var rush = plus.webview.getWebviewById("rush");
			if(rush) {
				rush.show("pop-in");
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
		document.getElementById('plan').addEventListener('tap', function() {
			mui.openWindow({
				url: "plan.html",
				id: "plan",
				show: {
					aniShow: 'pop-in'
				}
			});
		});
		document.getElementsByClassName('head-img')[0].addEventListener('tap', function() {
			mui.openWindow({
				id: "personal",
				url: "personal.html",
				show: {
					aniShow: 'pop-in'
				}
			});
		});
		document.getElementById('personal').addEventListener('tap', function() {
			mui.openWindow({
				id: "personal",
				url: "personal.html",
				show: {
					aniShow: 'pop-in'
				}
			});
		});
		document.getElementById('logout-btn').addEventListener('tap', function() {
			plus.storage.removeItem("uichUser"); //删除本地数据
			plus.storage.setItem("status", '0'); //修改status状态为0
			plus.runtime.restart();
		});
		document.getElementById('exit').addEventListener('tap', function() {
			plus.runtime.quit();
		});
		
		//点击消息中心不做任何动作  只是打开app
		plus.push.addEventListener("click", function(msg) {
		}, false);
		
		/*
		 * app从后台切换到前台
		 */
		document.addEventListener("resume",function(){
			plus.push.clear();//清空所有推送消息
		})
		// 监听在线消息事件
		plus.push.addEventListener("receive", function(msg) {
			if(msg.aps) { // Apple APNS message
			} else {
				var data = msg.content;
				if(data == '1') { //日程提醒
					//所有消息按钮存在的页面 数组 
					var infoWebviewList = ['index', 'personal', 'rush', 'myUich', 'plan', 'upload'];
					//打开的页面改变消息按钮
					for(var i = 0; i < infoWebviewList.length; i++) {
						var web = plus.webview.getWebviewById(infoWebviewList[i]);
						if(web) { //如果页面已经打开 则执行自定义事件改变【消息】按钮样式
							mui.fire(web, "info", null);
						}
					}
					//如果info页面打开
					var info = plus.webview.getWebviewById('info');
					var infoDetail = plus.webview.getWebviewById('infoDetail');
					var newUich = plus.webview.getWebviewById('newUich');
					if(info) { //如果info页面存在
						mui.fire(info, "info", null);
					}
					if(infoDetail) { //如果正在打开infoDetail页面则 执行infoDetail页面的自定义事件刷新页面 而不触发info页面的自定义事件
						mui.fire(infoDetail, "infoDetail", null);
					}
					//保存在本地  存在的话消息+1
					var old = plus.storage.getItem('info');
					if(old) {
						console.log(old);
						var newInfo = parseInt(old) + 1;
						plus.storage.setItem('info', newInfo.toString());
					} else {
						console.log('不存在');
						plus.storage.setItem('info', '1');
					}
				} else { //新单来了
					var newUich = plus.webview.getWebviewById("newUich");
					//刷新清单页面
					var w2 = plus.webview.getWebviewById("rushBody");
					mui.fire(w2, 'rushBodyFire', null);

					if(newUich) {
						//alert("已经存在newUich加一条");
						mui.fire(newUich, "newUich", data);
					} else {
						mui.openWindow({
							id: "newUich",
							url: "newUich.html",
							show: {
								aniShow: 'slide-in-top',
								duration: '300'
							},
							extras: {
								data: data
							},
							styles: {
								opacity: '1'
							},
							waiting: {
								autoShow: false, //自动显示等待框，默认为true
							}
						});
					}
				}
			}
		}, false);
	});
}
//更新客户经理经纬度
function updateAddress(id) {
	var geolocation = new BMap.Geolocation();
	var gc = new BMap.Geocoder();
	geolocation.getCurrentPosition(function(r) {
		if(this.getStatus() == BMAP_STATUS_SUCCESS) {
			var latitude = r.point.lat;
			var longitude = r.point.lng;
			//console.log(latitude + "/" + longitude);
			plus.storage.setItem("geolocation", '{"latitude":' + latitude + ',"longitude":' + longitude + ',"time":' + new Date().getTime() + '}');
			var pt = r.point;
			gc.getLocation(pt, function(rs) {
				var addComp = rs.addressComponents;
				console.log(addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber);
			});
			var url = getUrl("managerInfo/updateCoordinateApi");
			var FKEY = getkey(); //获取秘钥
			var mydata = {
				FKEY: FKEY,
				longitude: longitude,
				latitude: latitude,
				managerInfoId: id
			};
			mui.ajax(url, {
				data: mydata,
				dataType: 'json', //服务器返回json格式数据
				type: 'get', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否登录成功；
					if(data.flag) {
						console.log('更新成功');
					} else {
						console.log('更新失败');
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					plus.nativeUI.closeWaiting();
					mui.toast('获取数据，请检查网络连接');
				}
			});
		} else {
			alert('获取位置失败,请输入位置查询');
		}
	});
}