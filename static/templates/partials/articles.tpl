<!-- BEGIN articles -->
<li class="clearfix">
  <!-- IF showUser -->
  <a href="<!-- IF articles.author.userslug -->{relative_path}/author/{articles.author.userslug}<!-- ELSE -->#<!-- ENDIF articles.author.userslug -->"><img title="{articles.author.username}" class="profile-image author-img" src="{articles.author.picture}"/></a>
  <!-- ENDIF !showUser -->
  <!-- IF showTime -->
  <span class="pull-right">
    <span class="timeago" title="{articles.timestamp}"></span>
  </span>
  <!-- ENDIF !showTime -->
  <p>
    <a href="{config.relative_path}/article/{articles.slug}">{articles.title}</a>
  </p>
</li>
<!-- END articles -->
