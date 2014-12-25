'use strict';


/* globals define, app, templates, translator, socket, bootbox, config, ajaxify, RELATIVE_PATH, utils */

define('partials/articlescover', [], function () {
	var Cover = {},lastTime,rootEl,coverEl,clicpEl,titleEl,menuEl,target;

  Cover.parse = function(root,cover,clip,title,menu,timegap,rolltime){
    rootEl = root || '.cover-preview-wrapper';
    coverEl = cover || 'ul.cover-preview';
    clicpEl = clip || 'ul.cover-preview li';
    titleEl = title || '.title span';
    menuEl = menu || 'ul.cover-slider-bar li';
    Cover.timegap = timegap || 3000;
    Cover.rolltime = rolltime || 300;
    if($(rootEl).length > 0){
      target = [];
      $(rootEl).each(function(idx){
        target[idx] = {target:$(this),id:idx};
        Cover.init(target[idx]);
      });
    }
  }

	Cover.init = function (context) {
		if (!context || !context.target || !context.target.length || $(context.target).length == 0) return;
		if (!context.target.hasClass('created')) {
      context.target.addClass('created');
			Cover.create(context);
			Cover.start(context);
		} else {
			Cover.start(context);
		}
	};

	Cover.create = function (context) {
    context.clipboard = context.target.find(coverEl);
    context.titles = context.target.find(titleEl);
    context.clips = context.target.find(clicpEl);
    context.menus = context.target.find(menuEl);
    context.numMax = context.menus.length;
    context.numCur = Cover.getCurnum(context);
    context.clipboard.height(context.target.height());
    context.clips.height(context.clipboard.height());
    context.clips.width(context.target.width());
    context.menus.each(function (idx,menu) {
			$(menu).addClass('fa fa-circle-o');
			$(menu).on('click', function () {
        Cover.show(idx,context);
			});
		});

    context.clipboard.css('width', (context.numMax * 100) + '%');
		Cover.showCover(context.numCur,context, true);
	}

	Cover.getCurnum = function (context) {
		if (context.menus) {
			for (var i = 0; i < context.menus.length; i++) {
				if ($(context.menus[i]).hasClass('on')) {
					return i;
				}
			}
		}
		return 0;
	}
  Cover.updateTitle = function (coverId,context) {
    for(var i = 0; i < context.titles.length; i++){
      if(i == coverId){
        $(context.titles[i]).fadeIn();
      }else{
        $(context.titles[i]).hide();
      }
    }
  }
	Cover.updateMenu = function (coverId,context) {
		var menu = context.menus[coverId];
    context.target.find(menuEl+'.on').removeClass('on').removeClass('fa-circle').addClass('fa-circle-o');
		$(menu).removeClass('fa-circle-o').addClass('fa-circle').addClass('on');
	}

	Cover.showCover = function (coverId,context, force) {
		var clip = context.clips[coverId];
		var title = context.titles[coverId];
    if(force){
      context.clipboard.css('margin-left', '-' + (coverId * 100) + '%');
    }else{
      context.clipboard.animate({'margin-left': '-' + (coverId * 100) + '%' }, Cover.rolltime );
    }
    Cover.updateMenu(coverId,context);
    Cover.updateTitle(coverId,context);
  }

  Cover.show = function(idx,context){
		if(context && context.timeout){
			clearTimeout(context.timeout);
		}
		if(idx == context.numCur || context.numMax == 0) return;
		if(idx >= context.numMax) {
			idx = 0;
		}
    context.numCur = idx;
    Cover.showCover(idx,context);

		Cover.start(context);
  }

	Cover.start = function (context) {
		context.timeout = setTimeout(function(){
			Cover.show(context.numCur+1,context);
		}, Cover.timegap);
	}
	return Cover;
});
