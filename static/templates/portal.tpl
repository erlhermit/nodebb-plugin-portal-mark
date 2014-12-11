<ol class="breadcrumb">
  <!-- BEGIN breadcrumbs -->
  <li itemscope="itemscope" itemtype="http://data-vocabulary.org/Breadcrumb">
    <!-- IF !@last -->
    <a href="{breadcrumbs.url}" itemprop="url">
      <!-- ENDIF !@last -->
      <span itemprop="title">
        {breadcrumbs.text}
      </span>
      <!-- IF !@last -->
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
    <ul id="topics-container" itemscope itemtype="http://www.schema.org/ItemList" data-nextstart="0">
      <meta itemprop="itemListOrder" content="descending">
      <!-- BEGIN articles -->
      <li class="category-item" itemprop="itemListElement" data-tid="{articles.tid}" data-index="{articles.index}">
        <meta itemprop="name" content="{articles.title}">
        <div class="category-body">
          <div class="row">
            <div class="col-md-8 col-sm-9">
              <a href="{relative_path}/article/{articles.slug}">{articles.title}</span>
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