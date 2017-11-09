
function editCb(result) {
  var rawData1 = transformData(result);
  function traverseTrigger(detail) {
    detail.forEach(function (item) {
      var context = item.crumb.join().trim()
      $('li[data-rule-crumb="' +context+'"]').trigger('click')
      $('input[data-val="' + context +'"]').trigger('click')
      $('select[data-rule-crumb="' + item.crumb.slice(0, -1).join(',')+'"]').val(context).change();

      if (item.detail && item.detail.length) {
        traverseTrigger(item.detail);
      }
    });
  }
  if(rawData1.detail){
    traverseTrigger(rawData1.detail)
  }
}

function editCBFactory() {
  var condition = [];
  return function (result, idx) {
    condition[idx] = result;
    if (condition[0] && condition[1]) {
      editCb(condition[1]);
    }
  };
}


function transformData(data, crumb = []) {
  var newCrumb = crumb;
  var newId =  data.module_id || data.cat_id || data.id ;
  var newDetail = data.detail || data.cat_children;
  if (typeof newId !== 'undefined') {
    newCrumb = [...crumb, newId];
  }
  return Object.assign({}, data, {
    crumb: newCrumb,
    id: newId,
    name: data.module_name || data.name || data.cat_name,
    detail: newDetail && newDetail.map(x => transformData(x, newCrumb)),
  });
}

var edt = editCBFactory();

if(xx =='rule_edit_page'){
  $('body').append('<div id="shclDefault" style="height: 100px;width: 100px;position: absolute;z-index: 1000;left: 50%;top: 50%;transform: translate(-50%,-50%)"></div>')
  $('#shclDefault').shCircleLoader();
  $.get({
    url:'../daily_new_manage.php?act=edit_rule&rule_id='+rule_id+'',
    dataType:'json',
    success: function (result) {
      $('#shclDefault').remove();
      edt(result, 1);
      $('#titlename').val(result.rule_name)

    }
  })
}

$.get({
  url: "../daily_new_manage.php?act=add_rule",
  dataType:"json",
  success: function(result){
    result ={
      detail:result,
      rule_name:"",
    }
    var rawData = transformData(result);
    function findByCrumb(data, crumb) {
      var temp = data;
      for (var i = 0; i < crumb.length; i++)
        temp = temp.detail.find(x => x.id == crumb[i]);
      return temp;
    }
    function findParentByCrumb(data, crumb) {
      var temp = data.detail;
      for (var i = 0; i < crumb.length - 1; i++)
        temp = temp.find(x => x.id == crumb[i]).detail;
      return temp;
    }
    function doAnimation(className, from, to, cb) {
      var parent = from.parent();
      var count = 6;
      var startIdx = from.index();
      var toIdx = to.index();
      if (toIdx > startIdx) {
        toIdx += 1;
      }
      var startLine = Math.floor(startIdx / count);
      var endLine = Math.floor(toIdx / count);

      var dragEle = {
        target: from,
        from: parent.children()[toIdx].getBoundingClientRect(),
      };
      var flyItems = [];
      if (startIdx < toIdx) {
        for (var j = endLine; j > startLine; j--) {
          flyItems.push({
            target: parent.find(`.${className}:nth-of-type(${j * count + 1})`),
            from: parent.find(`.${className}:nth-of-type(${j * count + 1})`)[0].getBoundingClientRect(),
            to: parent.find(`.${className}:nth-of-type(${j * count})`)[0].getBoundingClientRect()
          })
        }
        flyItems = flyItems.filter(function (item) {
          return item.target[0] !== dragEle.target[0];
        });

        from.before('<div class="animation-helper placeholder-shrink rule-last-level"></div>');
        to.before('<div class="animation-helper placeholder-grow rule-last-level"></div>');

        if (startLine !== endLine) {
          parent.find(`.${className}:nth-of-type(${startLine * count + count})`).after('<br class="animation-helper">');
          parent.find(`.${className}:nth-of-type(${startLine * count + count})`).after('<div class="animation-helper placeholder-grow rule-last-level"></div>');
          parent.find(`.${className}:nth-of-type(${endLine * count + 1})`).before('<div class="animation-helper placeholder-shrink rule-last-level"></div>');
        }
        for (var i = startLine + 1; i < endLine; i++) {
          parent.find(`.${className}:nth-of-type(${i * count + count})`).after('<br class="animation-helper">');
          parent.find(`.${className}:nth-of-type(${i * count + count})`).after('<div class="animation-helper placeholder-grow rule-last-level"></div>');
          parent.find(`.${className}:nth-of-type(${i * count + 1})`).before('<div class="animation-helper placeholder-shrink rule-last-level"></div>');
        }
      } else {
        for (var j = startLine; j > endLine; j--) {
          flyItems.push({
            target: parent.find(`.${className}:nth-of-type(${j * count})`),
            from: parent.find(`.${className}:nth-of-type(${j * count })`)[0].getBoundingClientRect(),
            to: parent.find(`.${className}:nth-of-type(${j * count + 1})`)[0].getBoundingClientRect()
          })
        }
        flyItems = flyItems.filter(function (item) {
          return item.target[0] !== dragEle.target[0];
        });
        from.after('<div class="animation-helper placeholder-shrink rule-last-level"></div>');
        to.after('<div class="animation-helper placeholder-grow rule-last-level"></div>');
        if (startLine !== endLine) {
          parent.find(`.${className}:nth-of-type(${startLine * count + 1})`).before('<br class="animation-helper">');
          parent.find(`.${className}:nth-of-type(${startLine * count + 1})`).before('<div class="animation-helper placeholder-grow rule-last-level"></div>');
          parent.find(`.${className}:nth-of-type(${endLine * count})`).after('<div class="animation-helper placeholder-shrink rule-last-level"></div>');
        }
        for (var i = startLine - 1; i > endLine; i--) {
          parent.find(`.${className}:nth-of-type(${i * count + 1})`).before('<br class="animation-helper">');
          parent.find(`.${className}:nth-of-type(${i * count + 1})`).before('<div class="animation-helper placeholder-grow rule-last-level"></div>');
          parent.find(`.${className}:nth-of-type(${i * count})`).after('<div class="animation-helper placeholder-shrink rule-last-level"></div>');
        }
      }

      dragEle.target.css({
        position: 'fixed',
        top: dragEle.from.top,
        left: dragEle.from.left,
      });
      flyItems.forEach(function (item) {
        item.target.css({
          position: 'fixed',
          top: item.from.top,
          left: item.from.left,
        });
      });
      setTimeout(function () {
        flyItems.forEach(function (item) {
          item.target.animate({
            top: item.to.top,
            left: item.to.left + 20,
          }, 480);
        });
        $('.placeholder-grow').css({
          width: 140,
        });
        $('.placeholder-shrink').css({
          width: 0,
        });
        setTimeout(function () {
          $('.animation-helper').remove();
          flyItems.forEach(function (item) {
            item.target.css({
              position: 'relative',
              top: 0,
              left: 0,
            });
          });
          cb();
          dragEle.target.css({
            position: 'relative',
            top: 0,
            left: 0,
          });
        }, 500);
      }, 16);
    }
    function submitData() {
      var rule_name = $('#titlename')[0].value
      var allData = $('[data-value]');
      var result = {
        rule_name : rule_name,
        detail: [],
      };
      allData.each(function (idx, item) {
        var crumb = $(item).attr('data-value').split(',');
        var dt = findByCrumb(rawData, crumb);
        findParentByCrumb(result, crumb).push(Object.assign({}, dt, {
          detail: []
        }));
      });
      return result;
    }
    $(function () {

      var draggingLevel;
      var draggingEle;

      var draggingLevel1;
      var draggingEle1;

      var $topRuleAdd = $('#topRuleAdd');
      var $topRuleAddContainer = $('#topRuleAddContainer');
      var templateTop = ejs.compile($('#rule_name—top').html());
      var templateTop2 = ejs.compile($('#rule_name—top-2').html());
      var templateTop3 = ejs.compile($('#rule_name—top-3').html());
      var templateTop4 = ejs.compile($('#rule_name—top-4').html());
      rawData.detail.forEach(function (t) {
        $topRuleAdd.append($(`<li data-rule-crumb="${t.crumb.join(',')}">${t.module_name}</li>`))
      });
      $topRuleAdd.on('click', 'li', function () {
        var $this = $(this);
        $this.hide();
        var crumb = $this.attr('data-rule-crumb').split(',');
        var data = findByCrumb(rawData, crumb)
        if (!data.detail[0].cat_name) {
          $topRuleAddContainer.before(templateTop(data));
        } else {
          $topRuleAddContainer.before(templateTop2(data));
        }
      });

      $(document).on('click', '.top-rule .top-rule-add input', function () {
        var crumb = $(this).attr('data-val').split(',');
        var $parent = $(this).parents('.top-rule-add');
        var dt = findByCrumb(rawData, crumb);
        var checked = $(this).prop('checked');
        if (checked) {
          var ele = $(`<li class="rule-last-level" draggable="true" data-value="${dt.crumb}" data-dnd-crumb="${dt.crumb.slice(0, -1).join(',')}">${dt.name}</li>`);
          $parent.before(ele);
        } else {
          $parent.siblings(`[data-value="${dt.crumb}"]`).remove();
        }
      });

      $(document).on('change', '.selectclassification', function (e) {
        if($(this).val()){
          var crumb = $(this).val().split(',');
          var dt = findByCrumb(rawData, crumb);
          $(this).find(`option[value="${$(this).val()}"]`).prop('disabled', true);
          $(this).parent().before(templateTop3(dt));
        }
        $('.selectclassification').val("选择一级分类")
      });

      $(document).on('click', '.top-rule .top-rule-add button', function (e) {
        $(this).parent().toggleClass('active');
      });


      $(document).on('dragstart', 'li', function (e) {
        $(this).css({
          opacity: 1,
          background: "",
          border: "1px solid #3F4C7D",
          'box-shadow':"0 0 4px 0 rgba(65,91,192,0.50)",
          'border-radius':"1px",
        });
        draggingLevel = $(this).attr('data-dnd-crumb');
        draggingEle = $(this);
        // e.dataTransfer.setData('name', 'a');

        e.originalEvent.dataTransfer.setData('name', 'node');
      }).on('dragend', 'li', function () {
        $(this).css({
          opacity: 1,
          border:"",
          background:"",
          'box-shadow':"",
          'border-radius':"",
        });
      }).on('dragenter', 'li', function (e) {
        var crb = $(this).attr('data-dnd-crumb');
        if (crb === draggingLevel) {
          $(this).css({
            opacity: 1,
            background: "",
            border: "1px solid #3F4C7D",
            'box-shadow':"0 0 4px 0 rgba(65,91,192,0.50)",
            'border-radius':"1px",
          })
          e.originalEvent.dataTransfer.dropEffect = "move";
        }
      }).on('dragleave','li',function (e) {
        var crb = $(this).attr('data-dnd-crumb');
        if (crb === draggingLevel) {
          $(this).css({
            opacity: 1,
            background: "",
            border: "",
            'box-shadow':"",
            'border-radius':"",
          })
          e.originalEvent.dataTransfer.dropEffect = "move";
          e.preventDefault();
        }
      }).on('dragover', 'li', function (e) {
        var crb = $(this).attr('data-dnd-crumb');
        if (crb === draggingLevel) {
          e.originalEvent.dataTransfer.dropEffect = "move";
          e.preventDefault();
        }
      }).on('drop', 'li', function (e) {
        var crb = $(this).attr('data-dnd-crumb');
        if (crb === draggingLevel) {
          $(this).css({
            opacity: 1,
            background: "",
            border: "",
            'box-shadow':"",
            'border-radius':"",
          })
          var $this = $(this);
          var $dragEle = draggingEle;
          var startIdx = draggingEle.index();
          var toIdx = $this.index();
          doAnimation('rule-last-level', draggingEle, $this, function () {
            if (startIdx < toIdx)
              $this.after($dragEle);
            else
              $this.before($dragEle)
          });
        }
      })
      $(document).on('click', 'body', function (e) {
        $('button + ul').each(function (idx, item) {
          if (!$(e.target).parents('.top-rule-add').length) {
            $(item).parent().removeClass('active');
          }
        })
      });


      $('.rule-detail-mid .top-rule').prop('draggable', 'true')

      var topRuleSelector = '.rule-detail-mid .top-rule';
      $(document).on('dragstart', topRuleSelector, function (e) {
        $(this).css({
          opacity: 0.5,
        });
        draggingEle1 = $(this);
        draggingLevel1 = $(this).attr('data-dnd-crumb');
        e.originalEvent.dataTransfer.setData('name', 'node');
      }).on('dragend', topRuleSelector, function () {
        $(this).css({
          opacity: 1,
        });
      }).on('dragenter', topRuleSelector, function (e) {
        var crb = $(this).attr('data-dnd-crumb');
        if (crb === draggingLevel1) {
          e.originalEvent.dataTransfer.dropEffect = "move";
        }
      }).on('dragover', topRuleSelector, function (e) {
        var crb = $(this).attr('data-dnd-crumb');
        if (crb === draggingLevel1) {
          e.originalEvent.dataTransfer.dropEffect = "move";
          e.preventDefault();
        }
      }).on('drop', topRuleSelector, function (e) {
        var crb = $(this).attr('data-dnd-crumb');
        if (crb === draggingLevel1) {
          var $this = $(this);
          var $dragEle = draggingEle1;
          var startIdx = draggingEle1.index();
          var toIdx = $this.index();
          if (startIdx < toIdx)
            $this.after($dragEle);
          else
            $this.before($dragEle)
        }
      })

      $(document).on('click', '.close-btn', function () {
        $(this).parent().parent().remove()
        var value = $(this).parent().parent().attr("data-value")
        $('#topRuleAdd li[data-rule-crumb=' + value + ']').css('display', '')
      })

      $(document).on('click', '.littleclose', function () {
        //$(this).parent().parent().css('display', 'none')
        $(this).parent().parent().remove()
        var tempcontent = $(this).parent().text().trim()
        $('.selectclassification option:contains(' + tempcontent + ')').prop('disabled', false);
      });
      edt(result, 0);

      $(document).on('click','.top-rule-2 ul.rule-detail ul>li',function () {

      })
      $('.title button.btn').click(function (e) {
        e.preventDefault()
        var data = submitData()
        function printAttr(node) {
          if (node instanceof Array) {
            for (var i in node) {
              printAttr(node[i]);
            }
          }
          else if (node instanceof Object) {
            for (var p in node) {
              if(p=='cat_children'){
                node[p] = node.detail
              }
              printAttr(node[p]);
            }
          }
        }

        printAttr(data)
        var rule_name = $('#titlename')[0].value
        if(!rule_name){
          alert('规则名不能为空')
          return null
        }
        $(e.target).text('保存中..')
        $(e.target).attr('disabled',true);
        if(xx!='rule_edit_page'){
          var url = '../daily_new_manage.php?act=insert_rule&rule_name='+rule_name+''
        }else {
          var url = '../daily_new_manage.php?act=update_rule&rule_id='+rule_id+''
        }
        $.ajax({
          type: "POST",
          url: url,
          data: data,
          dataType: 'json',
          success:function (reslut) {
            $(e.target).text('保存')
            $(e.target).attr('disabled',false);
            if(reslut=='ok'){
              alert('success')
              window.location.href = '../daily_new_manage.php?act=get_rule_list'
            }else{
              alert('fail')
            }

          }
        });
      });
    });
  }});

