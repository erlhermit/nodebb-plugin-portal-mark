<!--高速版，加载速度快，使用前需测试页面的兼容性-->
<div id="SOHUCS" sid="{sns_comment_id}"></div>
<script>
  (function() {
    var appid = 'cyrwiJsIO',
      conf = 'prod_300e828499d91d8493e478c6ea7e2649';
    var doc = document,
      s = doc.createElement('script'),
      h = doc.getElementsByTagName('head')[0] || doc.head || doc.documentElement;
    s.type = 'text/javascript';
    s.charset = 'utf-8';
    s.src = 'http://assets.changyan.sohu.com/upload/changyan.js?conf=' + conf + '&appid=' + appid;
    h.insertBefore(s, h.firstChild);
    window.SCS_NO_IFRAME = false;
  })()
</script>