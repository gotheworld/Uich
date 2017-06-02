personalMain();
//添加自定义事件监听 改变消息按钮
window.addEventListener('test', function(event) {
	personalMain();
});

function personalMain() {
	
	mui.plusReady(function() {
		var userId = '';
		//获取用户userid 
		var userString = plus.storage.getItem("uichUser");
		userId = JSON.parse(userString).id;
		//alert(userId);
		var managerInfoId = '';
		var url = getUrl("managerInfo/getManagerInfoApi");
		var FKEY = getkey(); //获取秘钥
		//console.log(FKEY); 
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
				if (data.flag) {
					//保存经理id 后面上传头像用到
					plus.storage.setItem("managerInfoId", data.data.id);
					managerInfoId = data.data.id;
					//显示到body中
					showImg(data.fileBaseUrl + data.data.headUrl); //更据url显示到头像
					$("#leval").html(getStartlevalDivPersonal(data.data.starLevel));
					$("#username").html(data.data.name);
					$("#net").html(data.data.organizationId);
					$("#typeName").html(data.data.managerType.name);
				} else { 
					mui.toast("获取失败");
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				mui.toast('获取数据，请检查网络连接');
			}
		});

		//绑定头像事件
		document.getElementById('upload-head').addEventListener('tap', function() {
			showActionSheet(); //弹出选择框
		});

		//绑定头像事件
		document.getElementsByClassName('head-img')[0].addEventListener('tap', function() {
			showActionSheet(); //弹出选择框
		});
		document.getElementById('updatePassword').addEventListener('tap', function() {
			mui.openWindow({
				id: "updatePassword",
				url: "updatePassword.html",
				show:{
					aniShow:"pop-in"
				}
			});
		});
		//预约面访弹出菜单实现
		function showActionSheet() {
			var bts = [{
				title: "拍照"
			}, {
				title: "从手机相册获取"
			}];
			plus.nativeUI.actionSheet({
					title: "上传头像",
					cancel: "取消",
					buttons: bts
				},
				function(e) {
					if (e.index == 1) { //拍照
						getImage();
					} else if (e.index == 2) { //本地获取
						galleryImg();
					}
				}
			);
		}
		//拍照
		function getImage() {
			var cmr = plus.camera.getCamera();
			cmr.captureImage(function(path) {
				//plus.gallery.save(path);//保存到本地
				//console.log("照片路径为=" + path);
				//console.log(plus.io.convertLocalFileSystemURL(path));
				var url = "file://" + plus.io.convertLocalFileSystemURL(path);
				compressImage(url); //压缩和上传
			}, function(e) {
				mui.toast("取消拍照");
			});
		}
		// 从相册中选择图片 
		function galleryImg() {
			// 从相册中选择图片
			plus.gallery.pick(function(path) {
				var url = path;
				//console.log(url);
				compressImage(url); //压缩和uplaod 到服务器
			}, function(e) {
				console.log("取消选择图片");
			}, {
				filter: "image"
			});
		}
		//压缩图片和上传 
		function compressImage(url) {
			var date_str = getDateString();
			var picName = "_doc/" + date_str + '.jpg';
			plus.zip.compressImage({
					src: url,
					dst: picName,
					quality: 20,
					width: "50%"
				},
				function(img) {
					var url = img.target;
					showImg(url);
					uploadImg(url, picName); //调用uploadImg方法post到服务器
				},
				function(error) {
					alert("Compress error!" + error.code);
				}
			);
		}

		/*
		 * 上传到服务器
		 * @url:文件地址  
		 * @picName 文件名称
		 */
		function uploadImg(url, picName) {
			var wt = plus.nativeUI.showWaiting(); //打开等待窗口

			var serverUrl = getUrl("managerInfo/updateHeadUrlApi");
			var task = plus.uploader.createUpload(serverUrl, {
					method: "POST",
					priority: 100
				},
				function(t, status) {
					// 上传完成 
					if (status == 200) { // 上传完成
						console.log("上传成功" + t.responseText);
						wt.close(); //关闭等待窗口
						mui.toast("上传成功");

						//通过自定义事件改变相应的值
						var indexWd = plus.webview.getWebviewById("index");
						mui.fire(indexWd, 'indexFire', null);

					} else {
						//alert("Upload failed: " + status);
						mui.toast("上传失败，出了点小故障");
						wt.close(); //关闭等待窗口
					}
				}
			);
			task.addData("FKEY", getkey());
			//alert(managerInfoId);
			task.addData("managerInfoId", managerInfoId.toString());
			//task.setRequestHeader('Content-Type','multipart/form-data');
			task.addFile(url, {
				key: "file",
				name: picName
			});
			task.start();
		}

	});
}

function info() {
	alert("123");
	document.getElementById("info").className += " myinfo-active";
}

function onStateChanged(upload, status) {
	if (upload.state == 4 && status == 200) {
		// 获取上传请求响应头数据
		console.log(upload.getAllResponseHeaders());
		// 上传完成
		alert("Upload success: " + upload.getFileName());
	}
}
//获取照片 显示到个人中心div
function showImg(url) {
	var htmlimg = "<img src='" + url + "'" + "/>";
	$("#p-head").html(htmlimg);
}