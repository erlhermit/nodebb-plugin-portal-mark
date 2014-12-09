<div class="marks tags">
  <div class="alert alert-warning">
    <strong>Remember that only who was group by 'Master' can management portalmark at front-end.</strong>
  </div>
  <!-- IF !marks.length -->
  <div class="alert alert-warning">
    <strong>Your forum does not have any mark tags with portal marks yet!</strong>
  </div>
  <!-- ENDIF !marks.length -->
  <div class="new-mark-modal hidden">
    <div class="form-group">
      <label for="markTag">Mark Tag* <span class="label label-warning">can not modify</span>
      </label>
      <input id="markTag" placeholder="tag for url" data-name="mark-tag" class="form-control" />
      <label for="markName">Mark Name</label>
      <input id="markName" placeholder="name for display" data-name="mark-name" class="form-control" />
    </div>
  </div>
  <div class="one-mark-modal hidden">
    <div class="form-group">
      <label for="markTag">Mark Tag</label>
      <input id="markTag" placeholder="tag for url" data-name="mark-tag" class="form-control" disabled/>
      <label for="markName">Mark Name</label>
      <input id="markName" placeholder="name for display" data-name="mark-name" class="form-control" />
    </div>
    <div class="form-group">
      <label for="markParent">Mark Parent</label>
      <select class="form-control parent-category" id="markParent">
      </select>
    </div>
  </div>
  <div class="multi-mark-modal hidden">
    <div class="label-mark-tag hidden">
      <label class="tag-row" data-toggle="tooltip" data-placement="top" title="help">
        <input type="checkbox" id="markTag" value="option1"><span id="markName">Options</span>
      </label>
    </div>
    <div class="form-group">
      <label for="markTags">Mark Tags</label>
      <div id="markTags"></div>
    </div>
    <div class="form-group">
      <label for="markParent">Mark Parent</label>
      <select class="form-control parent-category" id="markParent">
      </select>
    </div>
  </div>
  <div class="container">
    <ul class="nav col-lg-3 col-xs-12 pull-right">
      <li class="panel panel-default ">
        <div class="panel-heading">Marks CPanel</div>
        <div class="panel-body">
          <button class="btn btn-primary btn-md" id="new">New Mark</button>
          <p></p>
          <p>Select marks via clicking and/or dragging.</p>
          <button class="btn btn-primary btn-md" id="modify">Modify Selected Marks</button>
          <button class="btn btn-warning btn-md" id="deleteSelected">Delete Selected Marks</button>
        </div>
      </li>

      <li class="panel panel-default">
        <div class="panel-heading">Search Topics for Marks *COMING SOON</div>
        <div class="panel-body">
          <input class="form-control" type="text" id="mark-search" placeholder="Search..." />
          <br/>
        </div>
      </li>
    </ul>


    <ul class="nav col-lg-9 col-xs-12 pull-left">
      <li class="panel panel-default mark-management tag-management">
        <div class="panel-heading">Portal Mark Management</div>
        <div class="panel-body">
          <div class="row">
            <!-- IMPORT portalmark/mark_list.tpl -->
          </div>
        </div>
      </li>
      <li class="panel panel-default mark-topics">
        <div class="panel-heading">Selected Mark Topics *COMING SOON</div>
        <div class="panel-body">
          <div class="row">
          </div>
        </div>
      </li>
    </ul>
  </div>

</div>

<script src="/plugins/nodebb-plugin-portal-mark/static/lib/admin.js"></script>