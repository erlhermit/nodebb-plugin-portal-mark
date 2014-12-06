<a href="{relative_path}/portals/{tag.tag}">
  <span class="mark-list tag-list"><span class="mark-row tag-row" data-tag="{tag.tag}">
    <span class="tag-item mark-item" data-tag="{tag.tag}"><!-- BEGIN parents -->{parents.name}-<!-- END parents -->{tag.name}</span><span class="tag-topic-count">{tag.score}</span></span>
  </span>
</a>
<i class="fa fa-circle status {marker.status}" title='[[global:{marker.status}]]'></i> [[portalmark:topic_marked_by, <strong><a href="{relative_path}/user/{marker.userslug}">{marker.username}</a></strong>, <span class="timeago" title="{timestamp}"></span>]]
<input type="hidden" template-variable="marks.tag" value="{tag.tag}" />