<label>Amount of Articles to display:</label>
<input type="text" class="form-control" name="numArticles" placeholder="5" />
<label>
  Custom Portal:
  <br />
  <small>Leave blank to to dynamically pull from current portal</small>
</label>
<div class="input-group">
  <input type="text" class="form-control" name="marktag"/>
  <span class="input-group-addon marks-input" input-target="marktag"><small class="fa fa-hand-o-up"></small></span>
</div>
<br/>
<div class="checkbox">
  <label>
    <input type="checkbox" name="showThumb" /> Show Thumbnail Image
  </label>
  <label>
    <input type="checkbox" name="showAuthor" /> Show Author
  </label>
  <label>
    <input type="checkbox" name="showTime" /> Show TimeAgo
  </label>
  <label>
    <input type="checkbox" name="showAll"/> Disable Portal Selector
  </label>
</div>
<script src="/plugins/nodebb-plugin-portal-mark/static/lib/utils/marksinput.js"></script>
<script>
  require(['admin/plugins/portalmark/marksinput'], function (marksinput) {
    marksinput.init();
  });
</script>
