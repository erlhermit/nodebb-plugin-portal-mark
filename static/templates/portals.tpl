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
    <span class="btn-group btn fa fa-chevron-right" data-toggle="tooltip" data-placement="top" title="[[portalmark:title.portal.subs]]"></span>
    <!-- BEGIN subs -->
    <a class="btn-group btn btn-default" href="{relative_path}/portals/{subs.tag}">{subs.name}</a>
    <!-- END subs -->

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
            <div class="col-md-8 col-sm-9">
              <a href="{relative_path}/article/{articles.slug}">{articles.title}</a>
              <span class="badge human-readable-number" title="{articles.views}"></span>
            </div>
            <small>
              <span class="pull-right timeago" title="{articles.timestamp}"></span>
            </small>
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