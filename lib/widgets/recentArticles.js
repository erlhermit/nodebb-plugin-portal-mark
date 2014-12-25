var nodebb = require('../nodebb'),
translator = nodebb.translator,
templates = nodebb.templates;
var models = require('../models');

module.exports = function (Widgets) {
  Widgets.render = Widgets.render || {};
  Widgets.render.recentArticles = function(widget, callback,context){
    function getArticles(err,articles){
      models.article.getTopicsFields(articles,['tid', 'uid', 'slug', 'title', 'views', 'thumb', 'mainPid'],function(err,data){
        console.log(articles)
        context.app.render('recentarticles',{articles: data,portal:tag||'',numArticles:numArticles,showUser:widget.data.showUser,showTime:widget.data.showTime,showThumb:widget.data.showThumb},function(err,html){
          translator.translate(html,function(translatedHTML){
            callback(err,translatedHTML);
          });
        });
      });
    }

    var numArticles = widget.data.numArticles || 5 ,tag;
    var match;
    if(widget.data.showAll){
      models.portals.getAllTopics(0,-1,getArticles);
    }else if(widget.data.marktag){
      tag = widget.data.marktag;
      models.marks.getMarkTagTopics(tag,0,-1,getArticles);
    }else if(widget.area.url.indexOf('article') == 0){
      match = widget.area.url.match('article/([0-9]+)');
      var aid = (match && match.length > 1) ? match[1] : null;
      models.article.getTopicMark(aid,function(err,data){
        if(data && data.tag){
          tag = data.tag.tag;
          models.marks.getMarkTagTopics(tag,0,-1,getArticles);
        }else{
          models.portals.getAllTopics(0,-1,getArticles);
        }
      });
    }else if(widget.area.url.indexOf('portals') == 0){
      match = widget.area.url.match('portals/([a-zA-Z0-9_-]+)');
      tag = (match && match.length > 1) ? match[1] : null;
      if(tag){
        models.marks.getMarkTagTopics(tag,0,-1,getArticles);
      }else{
        models.portals.getAllTopics(0,-1,getArticles);
      }
    }else if(widget.area.url == ''){
      models.portals.getAllTopics(0,-1,getArticles);
    }else{
      models.portals.getAllTopics(0,-1,getArticles);
    }
  }
  return Widgets;
}
