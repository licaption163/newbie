$(function(){
    var AppId = "wxa116501401533ece";
    var isLogin = true;
    var friendAllNum = 5;
    var allTimes = 3*60*60;
    var fruitOnTree = 180;
    var baseUrl = "http://g.ihuqu.com"
    var redirect_uri = baseUrl + "/wx/login.html";

    var loader = new resLoader({
        resources : [
            'static/images/fruit_tree/page_bg.png',
            'static/images/fruit_tree/tree_top.png',
            'static/images/fruit_tree/tree_bottom.png',
            'static/images/fruit_tree/bg_indicator.png'
        ],
        onStart : function(total){
            // console.log('start:'+total);
        },
        onProgress : function(current, total){
            // console.log(current+'/'+total);
            var percent = current/total*100;
            $('.progress_load .bar').css('width', percent+'%');
        },
        onComplete : function(total){
            $(".load").hide();
            swiperTipsFn()

            var token = LsyStorage.getItem('token') || getUriParam("token");
            var fOpenId = getUriParam('ff');

            if(fOpenId) {
                LsyStorage.setItem('ffOpenId', fOpenId);
            }

            if(!token) {
                // 获取不到token，第一次登陆，去认证
                // login(redirect_uri);
            } else {
                // LsyStorage.setItem('token', token);
                // fx()
                // getInit()
            }
        }
    });

    loader.start();

    function swiperTipsFn() {
        var swiper_tips = new Swiper('.js_swiper_tips', {
            autoplay: true,//可选选项，自动滑动
            direction : 'vertical',
            loop : true,
            observer: true,
            observerParents: true,
        });
    }

    function login(redirect_uri) {
        window.location.href = getRequestCodeUrl(redirect_uri);

    }
    function getUriParam(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
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

    function getInit() {
        var picDefault = "static/images/fruit_tree/face_default.png";
        // 我的果树信息
        $.get(baseUrl+"/api.php?op=game&act=index&token="+ LsyStorage.getItem('token'),{}, function(data){

            if(data.code==1) {
                var friendList = data.friend;
                var fruit = data.fruit;
                var userInfo = data.user;

                $(".container").removeClass("hide");

                // 用户昵称
                $(".js_username").html(userInfo.nickname);
                // 设置头像
                if(userInfo.headimgurl) {
                    $(".js_userpic").attr("src", userInfo.headimgurl)
                } else {
                    $(".js_userpic").attr("src", picDefault)
                }

                // 当前果子总数量
                $(".js_fruit_num").html(fruit.num)
                $(".js_current").html(fruitOnTree)
                TimeDown($("#times"), fruit.diff)
                // 成熟时间
                if(fruit.code == 1) {
                    // 成熟了,果子可以摘
                    $(".js_get_fruit").addClass("active")
                }
                // 好友列表
                if(friendList.length>0) {
                    var str = '<div class="swiper-wrapper">';

                    for(var i=0; i<5; i++){
                        str += '<div class="swiper-slide">';

                        if(i == 0) {
                            // 第一个是自己
                            str += '<a href="javascript:;">';
                            str += '<img src="' + userInfo.headimgurl + '" alt="">';
                            str += '<div>我</div>';
                        } else if(i<= friendList.length&& i<4 ) {
                            // 点亮的图标
                            str += '<a href="javascript:;">';
                            str += '<img src="'+ friendList[i-1].headimgurl +'">';
                            str += '<div>'+ friendList[i-1].nickname +'</div>';
                        } else {
                            // 未点亮图标
                            str += '<a class="js_invite" href="javascript:;">';
                            str += '<img src="static/images/fruit_tree/icon_worker.png" alt="">';
                            str += '<div><span class="btn-invite" href="javascript:;">去邀请</span></div>';
                        }
                        str += '</a>';
                        str += '</div>';
                    }
                    str += '</div>';
                    $(".js_swiper_worker").html(str);

                    var swiper_worker = new Swiper('.js_swiper_worker', {
                        slidesPerView : 5,
                        observer: true,
                        observerParents: true,
                    });
                } else {
                    var str = '<div class="swiper-wrapper">';

                    for(var i=0; i<5; i++) {
                        str += '<div class="swiper-slide">';

                        if(i == 0) {
                            // 第一个是自己
                            str += '<a href="javascript:;">';
                            str += '<img src="' + userInfo.headimgurl + '" alt="">';
                            str += '<div>我</div>';
                        } else {
                            // 未点亮图标
                            str += '<a class="js_invite" href="javascript:;">';
                            str += '<img src="static/images/fruit_tree/icon_worker.png" alt="">';
                            str += '<div><span class="btn-invite" href="javascript:;">去邀请</span></div>';
                        }
                        str += '</a>';
                        str += '</div>';
                    }
                    str += '</div>';
                    $(".js_swiper_worker").html(str);

                    var swiper_worker = new Swiper('.js_swiper_worker', {
                        slidesPerView : 5,
                        observer: true,
                        observerParents: true,
                    });
                }
            } else {
                login(redirect_uri)
            }
        },'json');

        // 好友列表
        $.get(baseUrl+"/api.php?op=game&act=flist&token="+ LsyStorage.getItem('token'),{}, function(data){
            var list = data.data;
            var str = '';

            if(list.length<=0) {
                $(".js_steal_list").html("您暂时还没有好友可以偷果子，快去邀请吧。")
                return;
            }
            for(var k=0; k<list.length; k++) {
                str += '<li class="clearfix">';
                if(list[k].fruitStatus==1) {
                    str += '<i class="label js_steal_friend"></i>';
                    str += '<a href="javascript:;" class="js_steal_btn" data-val="'+ list[k].openid +'"></a>';
                } else {
                    str += '<a href="javascript:;"></a>';
                }

                str += '<span class="fl icon-rank rank-first"></span>';
                str += '<div class="fl">';
                str += '<img class="fl face-pic" src="'+ list[k].headimgurl +'" alt="">';
                str += '</div>';
                str += '<p class="fl name txtElip">'+ list[k].nickname +'</p>';
                str += '<p class="fr num">'+ list[k].num +'</p>';
                str += '</li>';
            }
            $(".js_steal_list").html(str)
        },'json')
    }

    // 收金果
    $(".js_get_fruit").click(function() {
        // 成熟了可以摘
        var time = getMinutes($("#times").html())

        if(time <= 0 ) {
            $(".tree-top").addClass("bounceInDown");
            setTimeout(() => {
                $(".tree-top").removeClass("bounceInDown");
            $(".fruits-box").addClass("downFruit")
        }, 1400);
            // 接口，摘果子
            $.get(baseUrl+"/api.php?op=game&act=addFruit&token="+ LsyStorage.getItem('token'),{}, function(data){

                var all = Number($(".js_fruit_num").html())
                $(".js_fruit_num").html(Number(data.num + all));
                TimeDown($("#times"), allTimes);
                $(".js_get_fruit").removeClass("active");
                $(".hand").hide()
            },'json')

        } else {
            // 未成熟不可摘
            alert("再耐心等等吧，果子就快长熟了");
        }

    })
    // 邀请
    $(document).on("click", ".js_invite", function(){
        // var that = $(this);
        showSharePage()
        // $.get("static/js/invite.json",{}, function(data){
        //     that.find("img").attr("src", "static/images/fruit_tree/icon_worker_light.png")
        //     that.find("div").html("六羽")
        // })
    })
    // 偷好友金果
    $(document).on("click", ".js_steal_list a", function(){
        if($(this).hasClass("js_steal_btn")) {
            var ffOpenId = $(this).data("val");

            $(this).removeClass("js_steal_btn").siblings("i").remove()
            $(".fix-tool").animate({
                bottom: "-100%"
            }, 500);
            $(".steat_result").fadeIn();
            $.get(baseUrl+"/api.php?op=game&act=steal&fopenid="+ ffOpenId+"&token="+ LsyStorage.getItem('token'),{}, function(data){
                var stealNum = data.num
                $(".js_steal_num").html(stealNum);
                var all = Number($(".js_fruit_num").html())
                $(".js_fruit_num").html(Number(stealNum + all));
            }, 'json')
        } else {
            alert("偷完啦看看其他好友吧")
        }

    })
    function showSharePage() {
        $(".js_showShare").fadeIn()
    }
    /* 时间倒计时 */
    // times:秒数
    function TimeDown(obj, times) {
        var modulo;
        times-=1;
        if(times < 0) {
            obj.html("00:00:00");
            $(".js_get_fruit").addClass("active").html("")
            return
        }
        //小时数
        var hours = add0( Math.floor(times / (60 * 60)), 2);

        modulo = times % (60 * 60);
        //分钟
        var minutes = add0( Math.floor(modulo / 60), 2);
        //秒
        var seconds = add0( modulo % 60, 2);
        //输出到页面
        obj.html(hours + ":" + minutes + ":" + seconds + "")
        // document.getElementById(id).innerHTML = ;
        //延迟一秒执行自己
        setTimeout(function () {
            TimeDown(obj, times);
        }, 1000)
    }
    // /**
    //    * 时间转为秒
    //    * @param time 时间(00:00:00)
    //    * @returns {string} 时间戳（单位：秒）
    //    */
    function getMinutes(time){
        var s = '';

        var hour = time.split(':')[0];
        var min = time.split(':')[1];
        var sec = time.split(':')[2];

        s = Number(hour)*3600 + Number(min*60) + Number(sec);
        return s;
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

    function add0 (num, length) {
        //这里用slice和substr均可
        return (Array(length).join("0") + num).slice(-length);
    }

    // 分享
    function fx() {
        var timestamp;//时间戳
        var nonceStr;//随机串
        var signature;//签名
        var appId;//签名
        var payConfigURL = "/api.php?op=game&act=fx&token="+LsyStorage.getItem('token');

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
})
