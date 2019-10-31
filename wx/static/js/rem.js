/*creat by 2018/03/12* */
(function(win,doc){
    function change(){
      doc.documentElement.style.fontSize=doc.documentElement.clientWidth/375*100+'px';
    }
    change();
    win.addEventListener('resize',change,false);
})(window,document);