<!-- BEGIN articles -->
<li class="article-thumb-list <!-- IF articles.description -->description<!-- ENDIF articles.description -->">
  <a href="{config.relative_path}/article/{articles.slug}" class="item-cover" style="background-image:url({articles.thumb});"></a>
  <div class="item-info">
    <!-- IF showAuthor -->
      <div title="{articles.author.username}" class="profile-image author-img" style="background-image: url({articles.author.picture})"></div>
      <a class="author-name" href="<!-- IF articles.author.userslug -->{relative_path}/author/{articles.author.userslug}<!-- ELSE -->#<!-- ENDIF articles.author.userslug -->">
        {articles.author.username}
      </a>
      <br />
      <!-- ENDIF showAuthor -->
    <h3 class="item-title ">
      <a href="{config.relative_path}/article/{articles.slug}"><strong>{articles.title}</strong></a>
      <!-- IF showTime -->
      [<span class="timeago" title="{articles.timestamp}"></span>]
      <!-- ENDIF showTime -->
    </h3>
    <!-- IF articles.description -->
    <p class="item-intro">{articles.description}</p>
    <!-- ENDIF articles.description -->
  </div>
</li>
<!-- END articles -->
