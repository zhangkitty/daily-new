function processItem() {
  var forwardstep=[]
  var backwardstep=[]
  if(forwardstep.length!=0){
    $('.back').attr("disabled",false)
  }
  if(backwardstep.length!=0){
    $('.forward').attr("disabled",false)
  }
  function doChange(from, target, ctx) {
    const $ctx = $(ctx);
    return doAnimation(from, target, function () {
      const l = Math.abs(target - from);
      const op = l / (target - from);
      const arr = new Array(l).fill(0).map(function (p1, idx) {
        return from + op * (idx + 1);
      });
      arr.forEach(function (p1) {
        const temp = $('.product-item:nth-of-type(' + (p1 + 1) + ')');
        temp.find('.product-image-no').text(p1 + 1 - op);
        temp.find('input').val(p1 + 1 - op);
      });
      $ctx.find('.product-image-no').text(target + 1);
      $ctx.find('input').val(target + 1);
      $ctx['insert' + (op > 0 ? 'After' : 'Before')]($('article.product-item:nth-of-type(' + (target + 1) + ')'));
    });
  }
  const actions = {
    'product-img-edit': function ($target) {
      $(this).addClass('product-edit-active');
      $(this).find('input:text').select()
      //$(this).find('input').putCursorAtEnd().on("focus", function() {searchInput.putCursorAtEnd()});
      //$('.product-edit-active .product-edit-box input')[0].focus()
    },
    'product-image-no' : function ($target) {
      $(this).addClass('product-edit-active');
      $(this).find('input:text').select()
      //$(this).find('input').putCursorAtEnd().on("focus", function() {searchInput.putCursorAtEnd()});
    },
    'edit-cancel': function ($target) {
      $(this).removeClass('product-edit-active');
    },
    'edit-ok': function ($target,e,a,reslut) {
      const target = parseInt($target.parent().parent().find('input').val(), 10) - 1;
      const from = $('.product-item').index(this);
      $(this).removeClass('product-edit-active');
      forwardstep.push([from,target,this])
      if(e.altKey||a){
        doChange(from, target, this);
      }else{
        if(Math.abs(target)<$('.products  article').length){
          var a = $(this).clone(true)
          a.find('.product-image-no').text(target+1)
          a.find('input').val(target+1)
          var b = $('.product-item').eq(target).clone(true)
          b.find('.product-image-no').text(from+1)
          b.find('input').val(from+1)
          $(this).replaceWith(b)
          $('.product-item').eq(target).replaceWith(a)
        }
      }
    },
    'icon-arrow': function ($target) {
      const action = {
        left: -1,
        top: -4,
        right: 1,
        bottom: 4
      };
      const ac = $target.attr('class').split(/\s+/).filter(function (cls) {
        return cls.indexOf('tool-') === 0;
      }).map(function (item) {
        return item.slice('tool-'.length);
      });
      const from = $('.product-item').index(this);
      forwardstep.push([from,from + action[ac],this])
      doChange(from, from + action[ac], this);
    },
  };
  const keys = Object.keys(actions);
  $('.product-item').click(function (e,a) {
    const $target = $(e.target);
    const that = this;
    keys.forEach(function (key) {
      if ($target.hasClass(key)) {
        actions[key].call(that, $target,e,a);
        if(forwardstep.length!=0){
          $('.back').attr("disabled",false)
        }
        if(backwardstep.length!=0){
          $('.forward').attr("disabled",false)
        }
      }
    });
  });
  $('.product-edit-box input').keydown(function (e) {
    if(e.keyCode == "13"){
      $(e.target).parent().parent().children().children(":contains(确定)").trigger("click",e.altKey)
    }
  })
  $('.back').click(function(e){
    const temp = forwardstep.pop()
    backwardstep.push(temp)
    if(forwardstep.length==0){
      $('.back').attr("disabled",true)
    }
    if(backwardstep.length!=0){
      $('.forward').attr("disabled",false)
    }
    doChange(temp[1],temp[0],temp[2])
  })
  $('.forward').click(function(e){
    const temp = backwardstep.pop()
    forwardstep.push(temp)
    if(backwardstep.length==0){
      $('.forward').attr("disabled",true)
    }
    if(forwardstep.length!=0){
      $('.back').attr("disabled",false)
    }
    doChange(temp[1],temp[0],temp[2])
  })
};


(function ($) {
  $.getUrlParam = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
  }
})(jQuery);
var  urldate = $.getUrlParam('date');
var  urlsite_uid = $.getUrlParam('site_uid');
if(urldate&&urlsite_uid){
  $('body').append('<div id="shclDefault" style="height: 100px;width: 100px;position: absolute;z-index: 1000;left: 50%;top: 50%;transform: translate(-50%,-50%)"></div>')
  $('#shclDefault').shCircleLoader();
  $(function () {
    var url = 'http://product1.mywayectest.org/admin27/daily_new_manage.php?act=getDetailInfo&date='+urldate+'&site_uid='+urlsite_uid+''
    $.get({
      url: url,
      dataType:"json",
      success: function(result){
        $('#shclDefault').remove()
        $('#site').val(urlsite_uid)
        $('#time').val(urldate)
        $('#rule').val(result.rule_id)
        result.goods.map(function (t,k) {
          var data = {...t,k:k+1}
          var template = ejs.compile($('#rule-top').html())
          $('.products').append(template(data))
        })
        for (var i = 0; i < 3; i++){
          $('.products').append($('<div class="product-item product-item-padding">1</div>'));
        }
        processItem(result)
      }});
  })
}

var start = {
  format: 'YYYY-MM-DD',
};
$("#time").jeDate(start);
$.get({
  url: "http://product1.mywayectest.org/admin27/daily_new_manage.php?act=get_all_site_uid",
  dataType:"json",
  success: function(result){
    var  template1 = ejs.compile($('#xiala').html())
    $('span.sanjiao').after(template1({result:result}))
    $('#0').prop('checked',true)
    $(document).on('change','#site',function () {
      $("ul.xialalist input").prop('checked',false)
      $('#'+$('#site')[0].value+'').prop("checked",true)
    })
    $('span.sanjiao').click(function (e) {
      e.stopPropagation()
      $(this).parent().toggleClass('active');
      var context = $('#site')[0].value
      // $('ul.xialalist').css('display','inline-block')
      $('ul.xialalist').toggleClass('xialalistactive')
    })

    $(document).click(function () {
      // $('ul.xialalist').css('display','none')
      $('ul.xialalist').removeClass('xialalistactive')
    })
    $('ul.xialalist').click(function (e) {
      e.stopPropagation()
    })
    $('.xialalist>li:nth-child(1)').click(function () {
      if($('#allselect').prop('checked')){
        $('.xialalist li input').prop('checked',true)
      }else {
        $('.xialalist li input').prop('checked',false)
      }
    })

    result.map(function (t,index) {
      $('#site').append('<option value='+index+'>'+t+'</option>')
    })
  }});
$.get({
  url: "http://product1.mywayectest.org/admin27/daily_new_manage.php?act=get_all_rule",
  dataType:"json",
  success: function(result){
    result.map(function (t) {
      $('#rule').append('<option value='+t.id+'>'+t.rule_name+'</option>')
    })
  }});
//显示商品
$('button:contains(显示商品)').click(function (e) {
  if(!$('#time')[0].value){
    alert('时间必填')
    return null
  }else {
    $('body').append('<div id="shclDefault" style="height: 100px;width: 100px;position: absolute;z-index: 1000;left: 50%;top: 50%;transform: translate(-50%,-50%)"></div>')
    $('#shclDefault').shCircleLoader();
    $('.product-item').remove()
    var date = $('#time')[0].value
    var site = $('#site :selected').text()
    var url = 'http://product1.mywayectest.org/admin27/daily_new_manage.php?act=getDetailInfo&date='+date+'&site_uid='+site+''
    $.get({
      url: url,
      dataType:"json",
      success: function(result){
        $('#shclDefault').remove()
        $('#rule').val(result.rule_id)
        result.goods.map(function (t,k) {
          var data = {...t,k:k+1}
          var template = ejs.compile($('#rule-top').html())
          $('.products').append(template(data))
        })
        for (var i = 0; i < 3; i++){
          $('.products').append($('<div class="product-item product-item-padding">1</div>'));
        }
        processItem()
      }});
  }
})
//显示操作纪录
$('.form-item-actions .btn:nth-child(1)').click(function (e) {
  var date = $('#time')[0].value
  var site = $('#site :selected').text()
  $('#record').empty()
//        if(!date){
//          alert('时间必填')
//          return
//        }
  if(!date){
    alert('请输入时间')
    return null
  }
  $.get({
    url: 'http://product1.mywayectest.org/admin27/daily_new_manage.php?act=getActionRecord&date='+date+'&site_uid='+site+'',
    dataType:"json",
    success: function(result){

      result.map(function (t) {
        var date = new Date(parseInt(t.act_time))
        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();
        $('#record').append('<div id ="myrecord">' +
          '<span style="display:inline-block;width: 200px;margin-left:50px ">'+t.date+' '+h+':'+m+':'+s+'</span>' +
          '<span style="display:inline-block;width: 80px;margin-left: 100px">'+t.act_editor+'</span>' +
          '<span style="display:inline-block;margin-left: 100px">'+t.act+'</span>' +
          '</div>')
      })
    }});
})
//确认重新排序
$('button:contains(确认重新排序)').click(function () {
  $('.product-item').remove()
  var date = $('#time')[0].value
  var site = $('#site :selected').text()
  var rule = $('#rule')[0].value
  $('body').append('<div id="shclDefault" style="height: 100px;width: 100px;position: absolute;z-index: 1000;left: 50%;top: 50%;transform: translate(-50%,-50%)"></div>')
  $('#shclDefault').shCircleLoader();
  var url = 'http://product1.mywayectest.org/admin27/daily_new_manage.php?act=resetGoodsSort&date=' + date + '&site_uid=' + site + '&rule_id=' + rule + ''
  $.get({
    url: url,
    dataType: "json",
    success: function (result) {
      $('#shclDefault').remove()
      result.map(function (t,k) {
        var data = {...t,k:k+1}
        var template = ejs.compile($('#rule-top').html())
        $('.products').append(template(data))
      })
      for (var i = 0; i < 3; i++){
        $('.products').append($('<div class="product-item product-item-padding">1</div>'));
      }
      processItem()
    }
  })
})