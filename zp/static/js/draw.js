var AppId = "wxa116501401533ece";
var baseUrl = "http://g.ihuqu.com"
var redirect_uri = baseUrl + "/zp";
var uid = LsyStorage.getItem('token') || getUriParam("token");
var fid = getUriParam('ff') || LsyStorage.getItem('fid');

if(fid) {
  LsyStorage.setItem('fid', fid)
}
var times = 1;

var turnplate = {
  restaraunts: [], //大转盘奖品名称
  colors: [], //大转盘奖品区块对应背景颜色
  outsideRadius: 170, //大转盘外圆的半径
  textRadius: 140, //大转盘奖品位置距离圆心的距离
  insideRadius: 50, //大转盘内圆的半径
  startAngle: 0, //开始角度
  bRotate: false //false:停止;ture:旋转
};



$(function(){
  isLogin()
  fx()

  // 设置超时时间
	var rotateTimeOut = function() {
    
    $('#wheelcanvas').rotate({
      angle: 0,
      animateTo: 2160,
      duration: 8000,
      callback: function() {
        alert('网络超时，请检查您的网络设置！');
      }
    });
  }

  //旋转转盘 item:奖品位置; txt：提示语;
  var rotateFn = function(item, txt) {
    console.log(item, txt)
    var angles = item * (360 / turnplate.restaraunts.length) - (360 / (turnplate.restaraunts.length * 2));

    if(angles < 270) {
      angles = 270 - angles;
    } else {
      angles = 360 - angles + 270;
    }

    $('#wheelcanvas').stopRotate();

    $('#wheelcanvas').rotate({
      angle: 0,
      animateTo: angles + 1800,
      duration: 8000,
      callback: function() {
        alert(txt);
        turnplate.bRotate = !turnplate.bRotate;
      }
    });
  };
          

  // 点击抽奖按钮
  $('.pointer').click(function() {
    if(!uid) {
      // 获取不到token，第一次登陆，去认证
      window.location.href = getRequestCodeUrl(redirect_uri);
    } else {
      // 抽奖机会已用尽
      if(times<=0) {
        alert("您今天的抽奖机会已用尽！")
      } else {
        // 还有抽奖次数
        // 转盘还在转
        if(turnplate.bRotate) return;

        // 去抽奖
        $.get(baseUrl+"/api.php?op=lucky&act=num&token=" + uid,{}, function(data) {

          turnplate.bRotate = !turnplate.bRotate;
          
          // 奖品次数减1
          times = times - 1;
          $(".js_times").html(times);
          //获取奖品
          var item = data.num;
          //奖品数量等于10,指针落在对应奖品区域的中心角度[252, 216, 180, 144, 108, 72, 36, 360, 324, 288]
          rotateFn(item, turnplate.restaraunts[item - 1]);
        }, 'json')     
      }
    }   
  });
})





function isLogin(){
  var code = getUriParam("code");

  // 授权进来的
  if(code) {
    login(code)
  } else {
    // 正常进来的
    getInit ()
  }
}
// 页面初始化
function getInit (token) {
    var initUrl = baseUrl+"/api.php?op=lucky&act=index";

    if(token) {
      initUrl = initUrl + "&token="+ token
    }

    $.get(initUrl,{}, function(data) {
      //动态添加大转盘的奖品与奖品区域背景颜色
      var giftArr = []
      data.gift.forEach(function(item){ //item就是json里面的List对象 下面item.Id就是遍历字段
        console.log(item.value)
        giftArr.push(item.value)
        
      })
      turnplate.restaraunts = giftArr;
      turnplate.colors = ["#FEE3C6", "#FFEFF9", "#FCCE83", "#FEE3C6", "#FFEFF9", "#FCCE83"];
      drawRouletteWheel()
      $('.js_times').html(data.times);
      times = data.times;
    }, 'json')
}
// 登录
function login(code) {
  var loginUrl = baseUrl + "/api.php?op=lucky&act=login&code=" + code;        
  var fid = LsyStorage.getItem('fid');

  if(fid) {
    loginUrl = loginUrl + "&ff=" + fid
  }
  
  $.get(loginUrl, function(data){
      if(data.code==1) {
        uid = data.data.openid;
        LsyStorage.setItem('token', uid);
        getInit (uid)
      }
  },'json')
}
// 授权链接
function getRequestCodeUrl(redirectUrl){
  urlEncodeUrl = null;
  try {
      urlEncodeUrl = encodeURI(redirectUrl);
      //urlEncodeUrl = redirectUrl;
  } catch (e) {
      alert("编码错误");
  }
  var tempStr = "https://open.weixin.qq.com/connect/oauth2/authorize?appid={0}&redirect_uri={1}&response_type=code&scope={2}&state={3}#wechat_redirect";
  var resultStr = tempStr.format(AppId, urlEncodeUrl, "snsapi_userinfo","xxxx_state");
  return resultStr;
}

function getUriParam(name){
  var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if(r!=null)return  unescape(r[2]); return null;
}

// 抽奖，奖品位置设置
function drawRouletteWheel() {
  var canvas = document.getElementById("wheelcanvas");

  if(canvas.getContext) {
    //根据奖品个数计算圆周角度
    var arc = Math.PI / (turnplate.restaraunts.length / 2);
    var ctx = canvas.getContext("2d");

    //在给定矩形内清空一个矩形
    ctx.clearRect(0, 0, 422, 422);
    //strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式  
    ctx.strokeStyle = "#FFBE04";
    //font 属性设置或返回画布上文本内容的当前字体属性
    ctx.font = '16px Microsoft YaHei';
    for(var i = 0; i < turnplate.restaraunts.length; i++) {

      var angle = turnplate.startAngle + i * arc;
      ctx.fillStyle = turnplate.colors[i];
      ctx.beginPath();
      //arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）    
      ctx.arc(211, 211, turnplate.outsideRadius, angle, angle + arc, false);
      ctx.arc(211, 211, turnplate.insideRadius, angle + arc, angle, true);
      // ctx.arc(211, 211, turnplate.outsideRadius, 0, angle + arc, true);//边框
      ctx.lineWidth = 2;
      ctx.strokeStyle="#FC8100";
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      //锁画布(为了保存之前的画布状态)
      ctx.save();
      
      //----绘制奖品开始----
      ctx.fillStyle = "#E5302F";
      var text = turnplate.restaraunts[i];
      var line_height = 17;
      //translate方法重新映射画布上的 (0,0) 位置
      ctx.translate(211 + Math.cos(angle + arc / 2) * turnplate.textRadius, 211 + Math.sin(angle + arc / 2) * turnplate.textRadius);

      //rotate方法旋转当前的绘图
      ctx.rotate(angle + arc / 2 + Math.PI / 2);

      /** 下面代码根据奖品类型、奖品名称长度渲染不同效果，如字体、颜色、图片效果。(具体根据实际情况改变) **/
      if(text.indexOf("M") > 0) { //流量包
        var texts = text.split("M");
        for(var j = 0; j < texts.length; j++) {
          ctx.font = j == 0 ? 'bold 20px Microsoft YaHei' : '16px Microsoft YaHei';
          if(j == 0) {
            ctx.fillText(texts[j] + "M", -ctx.measureText(texts[j] + "M").width / 2, j * line_height);
          } else {
            ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
          }
        }
      } else if(text.indexOf("M") == -1 && text.length > 6) { //奖品名称长度超过一定范围 
        text = text.substring(0, 6) + "||" + text.substring(6);
        var texts = text.split("||");
        for(var j = 0; j < texts.length; j++) {
          ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
        }
      } else {
        //在画布上绘制填色的文本。文本的默认颜色是黑色
        //measureText()方法返回包含一个对象，该对象包含以像素计的指定字体宽度
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      }

      //添加对应图标
      if(text.indexOf("闪币") > 0) {
        var img = document.getElementById("shan-img");
        img.onload = function() {
          ctx.drawImage(img, -15, 10);
        };
        ctx.drawImage(img, -15, 10);
      } else if(text.indexOf("谢谢参与") >= 0) {
        var img = document.getElementById("sorry-img");
        img.onload = function() {
          ctx.drawImage(img, -15, 10);
        };
        ctx.drawImage(img, -15, 10);
      }
      //把当前画布返回（调整）到上一个save()状态之前
      ctx.restore();
      ctx.save();
      //----绘制奖品结束----

      //translate方法重新映射画布上的 (0,0) 位置
      ctx.translate(211 + Math.cos(angle + arc / 2) * turnplate.textRadius, 211 + Math.sin(angle + arc / 2) * turnplate.textRadius);

      //rotate方法旋转当前的绘图
      ctx.rotate(angle + arc + Math.PI / 2);
      var light = document.getElementById("light");
      light.onload = function() {
        ctx.drawImage(light, 0, -50, 40, 30);
      };
      ctx.drawImage(light, 62, -80, 40, 30);
      // ctx.save();
      ctx.restore();
    }
  }
}

// 分享
function fx() {
  var timestamp;//时间戳
  var nonceStr;//随机串
  var signature;//签名
  var appId;//签名
  var payConfigURL = "/api.php?op=lucky&act=fx&token=" + token;

  $.post(payConfigURL,function (data, status) {
      var resultCode = data.resultCode;

      if ("success" == resultCode) {
          var payConfig = data.values;
          appId = payConfig.appId;
          timestamp = payConfig.timeStamp;
          nonceStr = payConfig.nonceStr;
          signature = payConfig.signature;

          wx.config({
              debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
              appId: appId, // 必填，公众号的唯一标识
              timestamp: timestamp, // 必填，生成签名的时间戳
              nonceStr: nonceStr, // 必填，生成签名的随机串
              signature: signature,// 必填，签名，见附录1
              jsApiList: ['updateTimelineShareData', 'updateAppMessageShareData']
              // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
          });

          wx.ready(function () {
              // wx.hideOptionMenu();
              wx.updateTimelineShareData({
                  title: payConfig.title,
                  desc: payConfig.description,
                  link: payConfig.url,
                  imgUrl: payConfig.thumb,
                  success: function () {
                      // 用户确认分享后执行的回调函数
                      // alert('分享到朋友圈成功');
                  },
                  cancel: function () {
                      // 用户取消分享后执行的回调函数
                      // alert('你没有分享到朋友圈');
                  }
              });

              wx.updateAppMessageShareData({
                  title: payConfig.title,
                  desc: payConfig.description,
                  link: payConfig.url,
                  imgUrl: payConfig.thumb,
                  // trigger: function (res) {
                  // // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
                  // },
                  success: function (res) {
                      // alert('分享给朋友成功');
                      console.log(payConfig.url)
                  },
                  cancel: function (res) {
                      // alert('你没有分享给朋友');
                  }
                  // fail: function (res) {
                  //     // alert(JSON.stringify(res));
                  // }
              });
          });
      }
  },'json');
}

String.prototype.format = function(args) {
  var result = this;
  if (arguments.length > 0) {
      if (arguments.length == 1 && typeof (args) == "object") {
          for ( var key in args) {
              if (args[key] != undefined) {
                  var reg = new RegExp("({" + key + "})", "g");
                  result = result.replace(reg, args[key]);
              }
          }
      } else {
          for (var i = 0; i < arguments.length; i++) {
              if (arguments[i] != undefined) {
                  // var reg = new RegExp("({[" + i + "]})",
                  // "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
                  var reg = new RegExp("({)" + i + "(})", "g");
                  result = result.replace(reg, arguments[i]);
              }
          }
      }
  }
  return result;
}

String.format = function() {
  if (arguments.length == 0)
      return null;

  var str = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
      var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
      str = str.replace(re, arguments[i]);
  }
  return str;
}