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
      <span class="badge">{breadcrumbs.score}</span>
      <!-- ENDIF breadcrumbs.score -->
    </a>
    <!-- ENDIF !@last -->
  </li>
  <!-- END breadcrumbs -->
  <div class="pull-right">
    <!-- IMPORT portalmark/share.tpl -->
  </div>
</ol>

<div class="category row">
  <div class="col-lg-9 col-xs-12" no-widget-class="col-lg-12 col-sm-12" no-widget-target="sidebar">
    <!-- IF !articles.length -->
    <div class="alert alert-warning" id="category-no-topics">
      [[category:no_topics]]
    </div>
    <!-- ENDIF !articles.length -->

    <nav class="navbar navbar-default" role="navigation">
      <div class="container-fluid">
        <div class="navbar-header">
          <a class="navbar-brand" href="#">[[portalmark:title.portal.tags]]</a>
          <ul class="nav navbar-nav">
            <!-- BEGIN subs -->
            <li><a class="bs3-button bs3-lg-button" href="{relative_path}/portals/{subs.tag}">{subs.name}</a>
            </li>
            <!-- END subs -->
          </ul>
        </div>
        <!-- /.navbar-collapse -->
      </div>
      <!-- /.container-fluid -->
    </nav>


    <ul id="topics-container" itemscope itemtype="http://www.schema.org/ItemList" data-nextstart="0">
      <meta itemprop="itemListOrder" content="descending">
      <!-- BEGIN articles -->
      <li class="category-item" itemprop="itemListElement" data-tid="{articles.tid}" data-index="{articles.index}">
        <meta itemprop="name" content="{articles.title}">
        <div class="category-body">
          <div class="row">
            <div class="col-md-8 col-sm-9">
              <a href="{relative_path}/article/{articles.slug}">{articles.title}</a>
            </div>
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

  <div widget-area="sidebar" class="col-md-3 col-xs-12 category-sidebar"></div>
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