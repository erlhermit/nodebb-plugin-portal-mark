<div class="topic">
  <ol class="breadcrumb">
    <!-- BEGIN breadcrumbs -->
    <li itemscope="itemscope" itemtype="http://data-vocabulary.org/Breadcrumb">
      <!-- IF !@last -->
      <a href="{breadcrumbs.url}" itemprop="url">
        <!-- ENDIF !@last -->
        <span itemprop="title">
        {breadcrumbs.text}
        <!-- IF @last -->
        <!-- IF !feeds:disableRSS --><a target="_blank" href="{relative_path}/article/{article.tid}.rss"><i class="fa fa-rss-square"></i></a><!-- ENDIF !feeds:disableRSS -->
        <!-- ENDIF @last -->
      </span>
        <!-- IF !@last -->
      </a>
      <!-- ENDIF !@last -->
    </li>
    <!-- END breadcrumbs -->
    <div class="pull-right">
      <!-- IMPORT portalmark/share.tpl -->
    </div>
    <div class="loading-indicator pull-right" done="0" style="display:none;">
      <i class="fa fa-refresh fa-spin"></i>
    </div>
  </ol>

  <ul id="post-container" class="posts" data-tid="{tid}">
    <li class="post-row" data-pid="{article.pid}" data-uid="{article.uid}" data-username="{article.user.username}" data-userslug="{article.user.userslug}" data-index="{article.index}" data-timestamp="{article.timestamp}" data-votes="{article.votes}" itemscope
    itemtype="http://schema.org/Comment">
      <meta itemprop="datePublished" content="{article.relativeTime}">
      <meta itemprop="dateModified" content="{article.relativeEditTime}">

      <div class="topic-item">
        <div class="topic-body">
          <div class="row">
            <div class="col-md-12">
              <div class="topic-text">
                <h3 class="topic-title">
                  <p id="topic_title_{article.mainPid}" class="topic-title text-center" itemprop="name">{article.title}</p>
                  <hr>
                </h3>
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
  </div>
  <script>
    $(window).on('action:ajaxify.end', function(event, data) {
      $('html head').find('title').text($('meta[property="og:title"]').attr('content'));
    });
  </script>
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