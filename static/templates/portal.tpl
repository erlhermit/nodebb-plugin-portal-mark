<input type="hidden" template-variable="category_id" value="{cid}" />
<input type="hidden" template-variable="category_name" value="{name}" />
<input type="hidden" template-variable="topic_count" value="{topic_count}" />
<input type="hidden" template-variable="currentPage" value="{currentPage}" />
<input type="hidden" template-variable="pageCount" value="{pageCount}" />

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
</ol>

<div class="category row">
  <div class="{topic_row_size}" no-widget-class="col-lg-12 col-sm-12" no-widget-target="sidebar">
    <div class="header category-tools clearfix">
      <div class="pull-right">
        <!-- IMPORT portalmark/share.tpl -->
      </div>
    </div>

    <ul id="topics-container" itemscope itemtype="http://www.schema.org/ItemList" data-nextstart="{nextStart}">
      <meta itemprop="itemListOrder" content="descending">
      <!-- BEGIN articles -->
      <li class="category-item" itemprop="itemListElement" data-tid="{topics.tid}" data-index="{topics.index}">
        <meta itemprop="name" content="{topics.title}">
        <div class="category-body">
          <div class="row">
            <div class="col-md-8 col-sm-9">
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