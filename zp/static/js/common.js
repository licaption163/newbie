// 获取随机数
function rnd(n, m) {
  var random = Math.floor(Math.random() * (m - n + 1) + n);
  return random;
}
// 判断手机类型
function isAndroid(){
  var u = navigator.userAgent;
  return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
}
function isiOS(){
  var u = navigator.userAgent;
  return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
}