<div class="marks tags">
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

  <div class="col-lg-9">
    <div class="panel panel-default mark-management tag-management">
      <div class="panel-heading">Portal Mark Management</div>
      <div class="panel-body">
        <div class="row">
          <div class="mark-list tag-list">
            <!-- BEGIN marks -->
            <div class="mark-row tag-row" data-tag="{marks.tag}" data-toggle="tooltip" data-placement="top" title="<!-- IF marks.parent -->[{marks.parent}] <!-- ENDIF marks.parent -->[TAG] {marks.tag}">
              <span class="tag-item mark-item" data-tag="{marks.name}" style="<!-- IF marks.parent -->background-color: #cfefbf;<!-- ENDIF marks.parent -->">{marks.name}</span><span class="tag-topic-count">{marks.score}</span>
              <input type="hidden" data-name="mark-tag" value="{marks.tag}" />
              <input type="hidden" data-name="mark-name" value="{marks.name}" />
              <input type="hidden" data-name="mark-parent" value="{marks.parent}" />
            </div>

            <!-- END marks -->
          </div>
        </div>
      </div>
    </div>
    <div class="panel panel-default mark-topics">
      <div class="panel-heading">Selected Mark Topics</div>
      <div class="panel-body">
        <div class="row">
        </div>
      </div>
    </div>
  </div>

  <div class="col-lg-3">
    <div class="panel panel-default">
      <div class="panel-heading">Marks CPanel</div>
      <div class="panel-body">
        <button class="btn btn-primary btn-md" id="new">New Mark</button>
        <p></p>
        <p>Select marks via clicking and/or dragging.</p>
        <button class="btn btn-primary btn-md" id="modify">Modify Selected Marks</button>
        <button class="btn btn-warning btn-md" id="deleteSelected">Delete Selected Marks</button>
      </div>
    </div>

    <div class="panel panel-default">
      <div class="panel-heading">Search Topics for Marks</div>
      <div class="panel-body">
        <input class="form-control" type="text" id="mark-search" placeholder="Search..." />
        <br/>
      </div>
    </div>
  </div>

</div>

<script src="/plugins/nodebb-plugin-portal-mark/static/lib/admin.js"></script>
