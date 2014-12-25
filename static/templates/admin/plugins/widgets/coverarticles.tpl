<label>Amount of Articles to display:</label>
<input type="text" class="form-control" name="numArticles" placeholder="5" />
<label>Custom Articles to display:
  <br />
  <small>Leave blank to ingnore</small>
</label>
<input type="text" class="form-control" name="showArticles" placeholder="input articles ids, split use ','" />
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
<div class="input-group">
  <label>Cover Width:<small>'xxxpx' or 'xxx%'</small></label>
  <input type="text" class="form-control" name="coverWidth" placeholder="440px" />
</div>
<br/>
<div class="input-group">
  <label>Cover Height:<small>'xxxpx' or 'xxx%'</small></label>
  <input type="text" class="form-control" name="coverHeight" placeholder="220px" />
</div>
<br/>
<div class="checkbox">
  <label>
    <input type="checkbox" name="hideTitle" /> Hide Title
  </label>
</div>
<script src="/plugins/nodebb-plugin-portal-mark/static/lib/utils/marksinput.js"></script>
<script>
require(['admin/plugins/portalmark/marksinput'], function (marksinput) {
  marksinput.init();
});
</script>
