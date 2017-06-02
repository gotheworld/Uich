rushBodyMain('main');
//添加自定义事件监听 改变消息按钮
window.addEventListener('rushBodyFire', function(event) {
	rushBodyMain('noNotices');
});

function rushBodyMain(type) {
	mui.plusReady(function() {
		plus.nativeUI.closeWaiting();
		if(type == 'main') {
			//plus.webview.getWebviewById("rush").show("pop-in");
		}
		//初始化mui 和下拉刷新配置信息   
		//plus.webview.currentWebview().show("pop-in");
		mui.init({
			pullRefresh: {
				container: '#pullrefresh',
				down: {
					callback: pulldownRefresh
				},
				up: {
					contentrefresh: '正在加载...',
					callback: pullupRefresh
				}
			}
		});
		var refresh = false; //记录是否重新启动上拉加载
		GetRushlist("main"); //页面载入调用函数 获取数据并显示在rush-list中
		//绑定li点击事件  
		mui(".mui-table-view").off('tap'); //避免多次绑定先取消再绑定
		mui(".mui-table-view").on('tap', '.my-cell-li', function() {
			//获取id
			var id = this.getAttribute("id");
			//mui(".mui-table-view").off("tap"); //取消li事件
			//打开新闻详情
			mui.openWindow({
				id: 'rushDetail',
				url: 'rushDetail.html',
				extras: {
					num: id
				},
				show: {
					autoShow: false
				}
			});
		});
		/**/
		/**
		 * 下拉刷新具体业务实现
		 */
		function pulldownRefresh() {
			GetRushlist("pulldownRefresh");
			//console.log("pulldownRefresh");
		}
		var count = 0;
		/*
		 *
		 * 上拉加载具体业务实现
		 */
		function pullupRefresh() {
			//console.log("执行上拉加载");
			GetRushlist("pullupRefresh");
		}

		/*
		 * 获取数据函数
		 * @tap:动作名称   main:第一次进入页面   
		 * 1.pullupRefresh：加载更多
		 * 2.pulldownRefresh：刷新页面  
		 */
		var page = 1; //加载更多记录页数

		function GetRushlist(tap) {
			plus.push.clear();//清空所有推送消息
			if(tap == "main" || tap == "pulldownRefresh") {
				page = 1; //刷新时页数重置为1
				var myPage = page;
				var html = '';
				if(refresh) {
					//alert("执行重置"); 
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true); //参数为true代表没有更多数据了。 
					mui('#pullrefresh').pullRefresh().refresh(true);
				} //启用上拉加载
			} else if(tap == "pullupRefresh") {
				page++; //调用一次加载更多 页数+1
				var myPage = page;
				var html = document.getElementById("rush-list").innerHTML;
			}
			if(addressIsValid()) { //如果地理位置过期了或者没有  则更新一次
				//console.log("过期了");
				var geolocation = new BMap.Geolocation();
				geolocation.getCurrentPosition(function(r) {
					if(this.getStatus() == BMAP_STATUS_SUCCESS) {
						var latitude = r.point.lat;
						var longitude = r.point.lng;
						console.log(latitude + "/" + longitude);
						plus.storage.setItem("geolocation", '{"latitude":' + latitude + ',"longitude":' + longitude + ',"time":' + new Date().getTime() + '}');
						showRushList(tap, myPage, page, longitude, latitude, html, type); //调用接口显示抢单列表
					} else {
						mui.toast('获取位置失败,请重试');
					}
				});
			} else {
				//console.log("没过期");
				var dt = plus.storage.getItem('geolocation');
				var geo = JSON.parse(dt);
				showRushList(tap, myPage, page, geo.longitude, geo.latitude, html, type); //调用接口显示抢单列表
			}
		}
	});
}
//更据时间戳 算出离现在时间的差  用文字体现 比如  10分钟前
function chageTime(time) {
	var nowDate = new Date(); //开始时间
	var date3 = nowDate.getTime() - time; //时间差的毫秒数
	//console.log("毫秒："+date3);
	//计算出相差天数
	var days = Math.floor(date3 / (24 * 3600 * 1000));

	//计算出小时数
	var leave1 = date3 % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
	var hours = Math.floor(leave1 / (3600 * 1000));
	//计算相差分钟数
	var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
	var minutes = Math.floor(leave2 / (60 * 1000));
	//计算相差秒数
	var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
	var seconds = Math.round(leave3 / 1000);
	//console.log("==="+minutes);
	if(days > 0) {
		return days + "天前";
	}
	if(hours > 0) {
		return hours + "小时前";
	}
	if(minutes > 0) {
		return minutes + "分钟前";
	}
	if(seconds > 0) {
		return seconds + "秒前";
	} else {
		return "1秒前";
	}
}
/*	
 *  @tap： 区分是下拉刷新还是上拉  还是第一次导入
 *	@myPage：页数
 *	@longitude：经度
 *	@latitude:维度
 * 	@html:html初始 为空或者是追加
 * 	@type：区分是否通知 加载失败窗口  fire触发的事件不提示加载失败 
 */
function showRushList(tap, myPage, page1, longitude, latitude, html, type) {
	var row = 5; //每页显示条数
	var url = getUrl("financingSingle/getFinancingSingleListApi");
	var FKEY = getkey(); //获取秘钥
	var managerTypeId = plus.storage.getItem("managerTypeId");
	var mydata = {
		FKEY: FKEY,
		singleStatus: "NEW",
		rows: row,
		page: myPage,
		longitude: longitude,
		latitude: latitude,
		pushManagerTypeId: managerTypeId
	};
	mui.ajax(url, {
		data: mydata,
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			//console.log(data.data.result.length);
			//服务器返回响应，根据响应结果，分析是否登录成功；
			if(data.flag) {
				//保存经理id 后面上传头像用到
				mui('#pullrefresh').pullRefresh().enablePullupToRefresh();//启用上拉加载
				
				var len = data.data.result.length;
				var num = (page1 - 1) * row; // num+i 生成一个依次递增的id 方便储存和读取
				for(var i = 0; i < len; i++) {
					var obj = data.data.result[i];
					//console.log(JSON.stringify(data.data.result));
					plus.storage.setItem("d" + (num + i), JSON.stringify(obj)); //保存每一条数据
					if(obj.loanType.loanType == "ENTERPRISE") {
						var temp_name = obj.companyName;
					} else {
						var temp_name = obj.personalName + "(个人贷款)";
					}
					var referHtml = '';
					if(obj.makeOverStatus == '0') {
						referHtml = '<div class="mui-pull-left"><i class="refer-i mainBg"></i></div>';
					}
					//console.log(obj.createTime);
					var time = chageTime(obj.createTime);
					//console.log(time);
					html += "<li id='" + "d" + (num + i) + "' class='my-cell-li'>" + "<div class='list-time-div'>" + "<span class='li-time-span'>" + time + "</span>" + "</div>" + "<div class='list-div'>" + "<div class='list-div-up pading5px'>" + "<div class='list-1 mui-pull-left'>" + "<div id='rush-name' class='l-name'>" + temp_name + "</div>" + "<div class='l-head'>" + "<span class='l-yt'>" + obj.loanUse.text + "</span>" + "</div>" + "</div>" + "<div class='list-2 mui-pull-left'>" + "<div class='l-time'>" + "<div class='mymoney-rush'>" + obj.loanMoney + "(万)</div>" + "</div>" + "<span class='l-year'>" + obj.loanYear + "(年)</span>" + "</div>" + "<div class='list-3 mui-pull-right mainBg'>" + "</div>" + "<div class='mui-clearfix'></div>" + "</div>" + "<div class='list-div-down pading5px'>" + referHtml + "<div class='rush-btn mui-pull-right'>立即抢单</div>" + "<div class='mui-clearfix'></div>" + "</div>" + "</div>" + "</li>";
				}
				document.getElementById("rush-list").innerHTML = html;
				//如果为刷新动作  则关闭动作
				if(tap == "pullupRefresh" && len == 0) { //没有数据了
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true); //参数为true代表没有更多数据了。
					refresh = true;
				} else if(tap == "pullupRefresh" && len != 0) {
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //参数为true代表没有更多数据了。
				}
				if(tap == "pulldownRefresh") {
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //下拉刷新完毕
				}
				
			} else {
				if(data.msg = "没有获取到相关数据") {
					mui('#pullrefresh').pullRefresh().disablePullupToRefresh();//如果没有数据  禁用上拉加载
					document.getElementById("rush-list").innerHTML = getNullHtml();
					mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //下拉刷新完毕
					//if(type!='noNotices')mui.toast("暂无数据");
				}
			}
		},
		error: function(xhr, type1, errorThrown) {
			//异常处理；

			if(tap == "pulldownRefresh") {
				mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //下拉刷新完毕
			}
			if(document.getElementsByClassName("waiting")) {
				mui('#pullrefresh').pullRefresh().disablePullupToRefresh();//如果没有数据  禁用上拉加载
				document.getElementById("rush-list").innerHTML = getNullHtml();
			}
			console.log('获取数据，请检查网络连接' + errorThrown);
			if(type != 'noNotices') mui.toast('获取数据，请检查网络连接');
		}
	});
}