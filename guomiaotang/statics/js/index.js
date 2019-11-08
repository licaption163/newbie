/*首页竖直切换*/
$(function(){
    var swiper = new Swiper('.in_z .swiper-container1', {
        direction: 'vertical',
        slidesPerView: 1,
        spaceBetween: 0,
        mousewheel: true,
        pagination: {
            el: '.in_z .swiper-pagination',
            clickable: true,
        },
        on: {
            init: function() {
                swiperAnimateCache(this);
                swiperAnimate(this);
            },
            slideChangeTransitionEnd: function() {
                swiperAnimate(this); //如果只执行一次
                if (this.activeIndex == 1) {
                    // countUp();
                }
            },
        }
    });
    $('.jt_x').click(function() {
        swiper.slideTo(1, 1000, function() {
            swiperAnimate(this);
        });
    })
});


/*手机头部导航*/
$(function(){
    $(".nav_h").click(function(){
        if($(".nav_ul").css("display") == "none"){
            $(".nav_ul").slideDown();
            $(this).children(".heng1").css({"transform": "rotate(-45deg)", "margin-top": 10});
            $(this).children(".heng2").css({"opacity": 0});
            $(this).children(".heng3").css({"transform": "rotate(45deg)", "margin-top": -17});
        }else{
            $(".nav_ul").slideUp();
            $(this).children(".heng1").css({"transform": "rotate(0deg)", "margin-top": 0});
            $(this).children(".heng2").css({"opacity": 1});
            $(this).children(".heng3").css({"transform": "rotate(0deg)", "margin-top": 0});
        }
    });
});

/*我们的服务手机banner*/
// $(function(){
//     var swiper = new Swiper('.in3_ul_m .swiper-container', {
//         loop: true,
//         centeredSlides: true,
//         autoplay: {
//             delay: 2500,
//             disableOnInteraction: false,
//         },
//         navigation: {
//             nextEl: '.in4_br .swiper-button-next',
//             prevEl: '.in4_br .swiper-button-prev',
//         },
//     });
// });


// /*首页精品案例banner*/
// $(function(){
//     var swiper = new Swiper('.in4_br .swiper-container', {
//         loop: true,
//         centeredSlides: true,
//         autoplay: {
//             delay: 2500,
//             disableOnInteraction: false,
//         },
//         navigation: {
//             nextEl: '.in4_br .swiper-button-next',
//             prevEl: '.in4_br .swiper-button-prev',
//         },
//     });
// });
$(function(){
    var wh = $(window).width();
    if(wh < 1921){
		$(".in4_js1").css({"-webkit-line-clamp": "1"});
		$(".in4_js2").css({"-webkit-line-clamp": "3"});
    }
    $(window).resize(function(){
		if(wh < 1921){
			$(".in4_js1").css({"-webkit-line-clamp": "1"});
			$(".in4_js2").css({"-webkit-line-clamp": "3"});
        }
    });
});


/*公司大事记banner*/
// $(function(){
//     var galleryTop = new Swiper('.in5_br .gallery-top', {
//         loop:true,
//         loopedSlides: 5, //looped slides should be the same
// 		breakpoints: {
//             640: {
//             loopedSlides: 3,
//             },
//         }
//     });
//     var galleryThumbs = new Swiper('.in5_br .gallery-thumbs', {
//         slidesPerView: 5,
//         touchRatio: 0.2,
//         loop: true,
//         loopedSlides: 5, //looped slides should be the same
//         slideToClickedSlide: true,
//         navigation: {
//             nextEl: '.in5_br .swiper-button-next',
//             prevEl: '.in5_br .swiper-button-prev',
//         },
//         breakpoints: {
//             640: {
//             slidesPerView: 3,
//             loopedSlides: 3,
//             },
//         }
//     });
//     galleryTop.controller.control = galleryThumbs;
//     galleryThumbs.controller.control = galleryTop;
// });



// /*我们是谁-公司大事记banner*/
// $(function(){
//     var galleryTop = new Swiper('.ab2_fl .gallery-top2', {
//         direction: 'vertical',
//         slidesPerView: 4,
//         touchRatio: 0.2,
//         loop: true,
//         loopedSlides: 4, //looped slides should be the same
//         slideToClickedSlide: true,
//     });
//     var galleryThumbs = new Swiper('.ab2_fl .gallery-thumbs2', {
//         direction: 'vertical',
//         slidesPerView: 4,
//         touchRatio: 0.2,
//         loop: true,
//         loopedSlides: 4, //looped slides should be the same
//         slideToClickedSlide: true,
//         navigation: {
//             nextEl: '.ab2_fl .swiper-button-next',
//             prevEl: '.ab2_fl .swiper-button-prev',
//         },
//     });
//     galleryTop.controller.control = galleryThumbs;
//     galleryThumbs.controller.control = galleryTop;
// });



/*加入我们详情*/
$(function(){
    $(".join_an").click(function(){
        $(this).parent("tr").next(".join_xl").toggle();
        $(this).children(".join_jt").toggleClass("join_hover");
    });
});