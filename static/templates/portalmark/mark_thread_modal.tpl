<div id="mark_thread_modal" class="modal" tabindex="-1" role="dialog" aria-labelledby="Mark Topic" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h3>[[portalmark:mark_topic]]</h3>
      </div>
      <div class="modal-body">
        <p id="marks-loading"><i class="fa fa-spin fa-refresh"></i> [[portalmark:load_marks]]</p>
        <p>
          [[portalmark:disabled_marks_note]]
        </p>
        <div id="mark-confirm" style="display: none;">
          <hr />
          <div class="alert alert-info">[[portalmark:topic_will_be_marked_to]] <strong><span id="confirm-marks-name" class="mark-list tag-list"></span></strong>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal" id="mark_thread_cancel">[[global:buttons.close]]</button>
        <button type="button" class="btn btn-primary" id="mark_thread_commit" disabled>[[portalmark:confirm_mark]]</button>
      </div>
    </div>
  </div>
</div>