//添加自定义事件监听 改变消息按钮
window.addEventListener('planFire', function(event) {
	planMain()
});
planMain();
function planMain() {
	mui.plusReady(function() {
		mui.init();
		
		//如果是从appointmentDetail页面过来的 则关闭它
		closeWindows("appointment");
		//如果是从planDeatail页面转过来的 则关闭它
		closeWindows('planDetail');
		
		var upage = 1; //初始化未完成页数
		var dpage = 1; //初始化已完成页数
		//获取经理id
		var managerInfoId = plus.storage.getItem("managerInfoId");
		//第一次载入页面ajax获取数据 未完成和已完成
		GetMyPlanlist("main", "list_Unfinished");
		GetMyPlanlist("main", "list_done");

		//绑定li点击事件
		mui(".mui-table-view").on('tap', '.mui-table-view-cell', function() {
			//获取id和融资单id的字符串
			var idStr = this.getAttribute("id").split("/");

			//打开详情
			mui.openWindow({
				id: 'planDetail',
				url: 'planDetail.html',
				extras: {
					ID: idStr[0],
					financingSingleId: idStr[1]
				},
				show: {
					autoShow: false
				}
			});
		});
		/* ajax请求数据函数 并且输出到dom中 
		 * @flag down:下拉刷新 up上拉加载
		 * @htmlId:输出到html节点的id
		 * @下拉或者上拉刷新传入的dom对象  为空代表
		 */

		function GetMyPlanlist(f, htmlId, th) {
			var page = 0;
			if (htmlId == "list_Unfinished") {
				var url = getUrl("taskSchedule/getTaskScheduleListApi");
				var flag = "pu"; //储存记号
			} else {
				var url = getUrl("taskSchedule/getHistoryListApi");
				var flag = "pd"; //储存记号
			}
			if (f == "main") {
				var html = '';
				page = 1;
			}

			if (f == "down") { //向下刷新
				var html = '';
				//各自初始化page参数
				if (htmlId == "list_Unfinished") {
					upage = 1; //刷新时页数重置为1
					page = upage;
				}
				if (htmlId == "list_done") {
					dpage = 1; //刷新时页数重置为1
					page = dpage;
				}
			}
			if (f == "up") {
				var html = document.getElementById(htmlId).innerHTML;
				if (htmlId == "list_Unfinished") {
					upage += 1; //下拉 页数增加1
					page = upage;
				}
				if (htmlId == "list_done") {
					dpage += 1; //下拉 页数增加1
					page = dpage;
				}

			}
			var row = 10; //每页显示条数
			var FKEY = getkey(); //获取秘钥  
			var mydata = {
				FKEY: FKEY,
				rows: row,
				page: page,
				sort: 'arrangeTime',
				managerInfoId: managerInfoId
			};
			mui.ajax(url, {
				data: mydata,
				dataType: 'json', //服务器返回json格式数据
				type: 'get', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否登录成功；
					if (data.flag) {
						//保存经理id 后面上传头像用到
						var len = data.data.result.length;
						for (var i = 0; i < len; i++) {
							var obj = data.data.result[i];
							if (obj.userName) {
								var temp = obj.userName;
							} else {
								var temp = obj.legalPerson;
							}
							html += "<li id='" + obj.id + "/" + obj.financingSingleId + "' class='mui-table-view-cell c-li'>" + "<div class='c-li-div'>" + "<div class='head-man mainBg mui-pull-left'></div>" + "<div class='c-name mui-pull-left'>" + temp + "</div>" + "<div class='select-icon c-select mainBg mui-pull-right'></div>" + "<div class='c-text mui-pull-right'>" + getLocalTime(obj.arrangeTime) + "</div>" + "</div>" + "</li>";
						}
						document.getElementById(htmlId).innerHTML = html;
						if (f == "main") {
							if (len == 0) document.getElementById(htmlId).innerHTML = getNullHtml();
						}
						if (f == "down") {
							if (len == 0) document.getElementById(htmlId).innerHTML = getNullHtml();
							mui.toast("刷新成功");
							th.endPullDownToRefresh();
							th.refresh(true);
						}
						if (f == "up") {
							if (len == 0) {
								th.endPullUpToRefresh(true); //关闭下拉加载 显示没有更多
							} else {
								th.endPullUpToRefresh();
							}
						}
						$(".mui-pull-bottom-tips").css("display", "none"); //隐藏下拉加载字样
					} else {
						//mui.toast("获取失败"+data.msg);
						th.endPullDownToRefresh();
						if (data.msg = "没有获取到相关数据") {
							if (f != "main" || (f == "main" && htmlId == "list_Unfinished")) {
								//mui.toast("暂无数据");
								//document.getElementById(htmlId).innerHTML = getNullHtml();
							}
							if (f == "down") {
								document.getElementById(htmlId).innerHTML = getNullHtml();
							}
						} else {
							mui.toast("获取失败" + data.msg);
						}
						if (f == "down") {
							th.refresh(true);
						}
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					if (th) {
						th.endPullDownToRefresh();
					}
					mui.toast('获取数据失败，请检查网络连接');
				}
			});
		}
		//阻尼系数
		var deceleration = mui.os.ios ? 0.003 : 0.0009;
		mui('.mui-scroll-wrapper').scroll({
			bounce: false,
			indicators: true, //是否显示滚动条
			deceleration: deceleration
		});
		//循环初始化所有下拉刷新，上拉加载。
		mui.ready(function() {
			mui.each(document.querySelectorAll('.mui-slider-group .mui-scroll'), function(index, pullRefreshEl) {
				mui(pullRefreshEl).pullToRefresh({
					down: {
						callback: function() {
							var self = this;
							setTimeout(function() {
								var ul = self.element.querySelector('.mui-table-view');
								//当前选项卡 ul的id
								var listId = ul.getAttribute("id");
								GetMyPlanlist("down", listId, self);
							}, 1000);
						}
					},
					up: {
						contentrefresh: "正在加载...",
						callback: function() {
							var self = this;
							setTimeout(function() {
								var ul = self.element.querySelector('.mui-table-view');
								//当前选项卡 ul的id
								var listId = ul.getAttribute("id");
								GetMyPlanlist("up", listId, self);
							}, 1000);
						}
					}
				});
			});
		});
	});
}