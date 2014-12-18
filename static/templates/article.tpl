<input type="hidden" template-variable="article_id" value="{article.tid}" />
<input type="hidden" template-variable="article_slug" value="{article.slug}" />
<input type="hidden" template-variable="article_name" value="{article.title}" />
<input type="hidden" template-variable="portal_tag" value="{tag.tag}" />


<div class="topic">
  <ol class="breadcrumb">
    <!-- BEGIN breadcrumbs -->
    <li itemscope="itemscope" itemtype="http://data-vocabulary.org/Breadcrumb">
      <a href="{breadcrumbs.url}" itemprop="url">
        <span itemprop="title">{breadcrumbs.text}</span>
        <!-- IF breadcrumbs.score -->
        <span class="badge">{breadcrumbs.score}</span>
        <!-- ENDIF breadcrumbs.score -->
      </a>
    </li>
    <!-- END breadcrumbs -->
  </ol>

  <ul id="post-container" class="posts" data-tid="{tid}">
    <li class="post-row" data-pid="{article.pid}" data-uid="{author.uid}" data-username="{author.username}" data-userslug="{author.userslug}" data-index="{article.index}" data-timestamp="{timestamp}" itemscope itemtype="http://schema.org/Comment">
      <meta itemprop="datePublished" content="{article.relativeTime}">
      <meta itemprop="dateModified" content="{article.relativeEditTime}">

      <div class="topic-item">
        <div class="topic-body">
          <div class="row">
            <div class="col-md-12">
              <div class="topic-text">
                <h3 class="topic-title">
                  <p id="topic_title_{article.mainPid}" class="topic-title text-center" itemprop="name">{article.title}</p>
                </h3>
                <div class="text-center">
                  <h6> <span>发布者: {marker.username}</span>  |  原作者: {author.username} | 查看:<span id="article-views" class=""></span> | 发表于<span class="timeago" title="{timestamp}"></span> </h6>
                </div>
                <div class="well well-sm">
                  <h6><strong>摘要: </strong> <small>{article.description}</small></h6>
                </div>
                <div id="content_{article.mainPid}" class="post-content" itemprop="text">
                  {article.content}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="topic-footer">
          <div class="row">
          </div>
        </div>
    </li>

  </ul>

  <!-- IF config.usePagination -->
  <div class="text-center">
    <ul class="pagination">
      <li class="previous pull-left"><a href="#"><i class="fa fa-chevron-left"></i> [[global:previouspage]]</a>
      </li>
      <li class="next pull-right"><a href="#">[[global:nextpage]] <i class="fa fa-chevron-right"></i></a>
      </li>
    </ul>
  </div>
  <!-- ENDIF config.usePagination -->

  <!-- IMPORT portalmark/sns_comment.tpl -->

  </div>
  <noscript>
    <div class="text-center">
      <ul class="pagination">
        <!-- BEGIN pages -->
        <li <!-- IF pages.active -->class="active"
          <!-- ENDIF pages.active -->><a href="?page={pages.page}">{pages.page}</a>
        </li>
        <!-- END pages -->
      </ul>
    </div>
  </noscript>
