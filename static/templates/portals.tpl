<div class="col-lg-9 col-xs-12" no-widget-class="col-lg-12 col-sm-12" no-widget-target="sidebar">

  <input type="hidden" template-variable="portals_id" value="1" />
  <input type="hidden" template-variable="article_count" value="{article_count}" />
  <input type="hidden" template-variable="currentPage" value="1" />
  <input type="hidden" template-variable="pageCount" value="10" />


  <ol class="breadcrumb">
    <!-- BEGIN breadcrumbs -->
    <li itemscope="itemscope" itemtype="http://data-vocabulary.org/Breadcrumb">
      <!-- IF !@last -->
      <a href="{breadcrumbs.url}" itemprop="url">
        <!-- ENDIF !@last -->
        <span itemprop="title">{breadcrumbs.text}</span>
        <!-- IF !@last -->
        <!-- IF breadcrumbs.score -->
        <span class="badge human-readable-number">{breadcrumbs.score}</span>
        <!-- ENDIF breadcrumbs.score -->
      </a>
      <!-- ENDIF !@last -->
    </li>
    <!-- END breadcrumbs -->
  </ol>
  <p class="btn-toolbar" role="toolbar">
    <!-- IF subs.length -->
    <span class="btn-group btn fa fa-chevron-right" data-toggle="tooltip" data-placement="top" title="[[portalmark:title.portal.subs]]"></span>
    <!-- BEGIN subs -->
    <a class="btn-group btn btn-default" href="{relative_path}/portals/{subs.tag}">{subs.name}</a>
    <!-- END subs -->
    <!-- ENDIF subs.length -->

    <!-- IF tags.length -->
    <span class="btn-group btn fa fa-chevron-up" data-toggle="tooltip" data-placement="top" title="[[portalmark:title.portal.tags]]"></span>
    <!-- BEGIN tags -->
    <a class="btn-group btn btn-default" href="{relative_path}/portals/{tags.tag}">{tags.name}</a>
    <!-- END tags -->
    <!-- ENDIF tags.length -->

  </p>

  <div class="category row">
    <!-- IF !articles.length -->
    <div class="alert alert-warning" id="category-no-topics">
      [[portalmark:no_articles]]
    </div>
    <!-- ENDIF !articles.length -->



    <ul id="topics-container" itemscope itemtype="http://www.schema.org/ItemList" data-nextstart="0">
      <meta itemprop="itemListOrder" content="descending">
      <!-- BEGIN articles -->
      <li class="category-item" itemprop="itemListElement" data-tid="{articles.tid}" data-index="{articles.index}">
        <meta itemprop="name" content="{articles.title}">
        <div class="category-body">
          <div class="row">
            <!-- IF @first -->
            <div class="hidden-xs">
              <h4>
                <a href="{relative_path}/article/{articles.slug}">{articles.title}
                </a>
              </h4>
              <small>
                {articles.description}
              </small>
              <div class="visible-lg text-center">
                <a href="{relative_path}/article/{articles.slug}">
                <img src="{articles.thumb}" alt="{articles.title}" style="width:70%;">
              </a>
              </div>
              <samll class="pull-right hidden-xs">
                [[portalmark:publisher,{articles.author.username}]] | [[portalmark:visit]]<span class="badge human-readable-number" title="{articles.views}"></span> | <span class="timeago" title="{articles.timestamp}"></span>
              </samll>
            </div>
            <!-- ELSE -->
            <div class="pull-left hidden-xs col-sm-1 col-md-1 col-lg-2 ">
              <a class="media-middle" href="#">
                <img src="{articles.thumb}" alt="{articles.title}" style="width:100%;">
              </a>
            </div>
            <small class="pull-right">
              <span class="timeago" title="{articles.timestamp}"></span>
              <span class="visible-xs badge human-readable-number" title="{articles.views}"></span>
              <span class="visible-xs author" title="{articles.author.username}"> {articles.author.username}</span>
            </small>
            <div class="col-lg-8">
              <h4>
                <a href="{relative_path}/article/{articles.slug}">{articles.title}
                </a>
              </h4>
              <samll class="text-center hidden-xs">
                [[portalmark:publisher,{articles.author.username}]] | [[portalmark:visit]]<span class="badge human-readable-number" title="{articles.views}"></span>
              </samll>
              <div class="visible-lg">
                <small>
                  {articles.description}
                </small>
              </div>
            </div>
            <!-- ENDIF @first -->
          </div>
        </div>
      </li>
      <!-- END articles -->
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

</div>
<div class="col-lg-3 col-xs-12 portals-sidebar">
  <div widget-area="sidebar"></div>
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
