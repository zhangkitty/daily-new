var crumbCount = {};

function addCount(crumbName) {
  if (!crumbCount.hasOwnProperty(crumbName)) {
    crumbCount[crumbName] = 0;
  } else {
    crumbCount[crumbName] += 1;
  }
}

function editCb(result) {
  var rawData1 = transformData(result);
  function traverseTrigger(detail) {
    detail.forEach(function (item) {
      var context = item.crumb.join().trim()
      $('li[data-rule-crumb="' +context+'"]').trigger('click')
      $('input[data-val="' + context +'"]').trigger('click')
      $('select[data-rule-crumb="' + item.crumb.slice(0, -1).join(',')+'"]').val(context).change();
      if(context==2){
        var temp= [context]

        item.detail.forEach(function (v){

          v.cat_id.map(value=>temp.push(value.id))
          for (i=1;i<temp.length;i++){
            var crumbName = temp.slice(0,i+1).join(',')
            addCount(crumbName)

            $('select[data-rule-crumb="' + temp.slice(0,i).join(',')+'"]')
                .eq(crumbCount[temp.slice(0,i).join(',')] || 0)
                .val(temp.slice(0,i+1).join(',')).change()
          }
          v.cat_children.map(v=>{
            temp.push(v.id)
            $('input[data-val="'+temp.join(',')+'"]').eq(crumbCount[crumbName]).trigger('click')
            temp.pop();
          })
          temp=[context]
        })

      }

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
    url:'admin27/daily_new_manage.php?act=edit_rule&rule_id='+rule_id+'',
    dataType:'json',
    success: function (result) {
      $('#shclDefault').remove();
      edt(result, 1);
      $('#titlename').val(result.rule_name)

    }
  })
}

$.get({
  url: "admin27/daily_new_manage.php?act=add_rule",
  dataType:"json",
  success: function(result){
    const zcc = result;
    const Arr = result.filter(value => value.module_id===2)[0].detail
    const tempArr = Arr.map(
        v=>Object.assign({},v, {'detail':[]})
    )
    const temp = tempArr.filter(v=>v.parent_id==="0")

    function pushDataInDetail(Detail) {
      Detail.map(v=>{
        tempArr.map(i=>{
          if(i.parent_id===v.cat_id){
            v.detail.push(i)
          }
        })
        if(v.detail.length>0){
          pushDataInDetail(v.detail)
        }
        return v
      })
    }

    pushDataInDetail(temp)

    const lastData = result.map(value => {
      if(value.module_id===2){
        return Object.assign({},value,{
          detail:temp
        })
      }
      return value
    })
    result ={
      detail:lastData,
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



      var detail = $('.classification').map(function () {
        var catChildrenIds = $(this).find('.rule-last-level[data-value]').map(function () {
          return $(this).attr('data-value');
        });
        if (catChildrenIds.length) {
          const catId = catChildrenIds[0].split(',').slice(0, -1).join(',');
          return {
            cat_id: catId.split(",").slice(1).join(","),
            cat_children: [].slice.call(catChildrenIds.map(function (_, item) {
              return item.slice(catId.length + 1);
            })).map(v=>({id:v}))
          }
        } else {
          const $ruleSelect = $(this).find('select');

          var ruleSelectParent = $ruleSelect.attr('data-rule-crumb');
          if($(this).find('button').html()){
            ruleSelectParent = $(this).find('button').attr('data-dnd-crumb')
          }
          const selfVal = $ruleSelect.val();
          if (selfVal.indexOf('选择') > -1) {
            return {
              cat_id: ruleSelectParent.split(",").slice(1).join(","),
              cat_children: [],
            }
          } else {
            return {
              cat_id: selfVal.split(",").slice(1).join(","),
              cat_children: [],
            }
          }

        }
      });
      var tempArr =  [].slice.call(detail).filter(function (value) {
            return !!value.cat_id
          });

      var tempDetail =  result.detail.map(v=>{
        if(v.module_id!==2){
          return v
        }else{
          return Object.assign({},v,{
            detail:tempArr
          })
        }
      })
      var result = {
        detail:tempDetail,
        rule_name : rule_name,
      }
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
      var templateHasDetail = ejs.compile($('#rule_name-has-detail').html());

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

      function isLast(detail) {
        return detail.some(x => x.detail && x.detail.length);
      }

      function insertOption(level, $ctx, classname, exteranlClassName) {
        if ($ctx.val() && String($ctx.val()) !== '-1') {
          var crumb = $ctx.val().split(',')
          var dt = findByCrumb(rawData, crumb);
          dt.level = level;
          dt.classname = classname;
          dt.exteranlClassName = exteranlClassName || '';
          if (dt.detail && dt.detail.length && isLast(dt.detail)) {
            $ctx.before(templateHasDetail(dt));
          } else {
            $ctx.before(templateTop3(dt));
          }
          $ctx.hide();
        }
      }

      $(document).on('change', '.selectclassification', function (e) {
        insertOption('二', $(this), '2', ' classification');
        $(this).show();
        $('.selectclassification').val(-1)
      });

      $(document).on('change', '[data-classification=2]',function (e) {
        insertOption('三', $(this), '3');
        // @TODO
        // $(this).find(`option[value="${$(this).val()}"]`).prop('disabled', false);
      })

      $(document).on('change', '[data-classification=3]',function (e) {
        insertOption('四', $(this), '4');
      });




      $(document).on('click', '.top-rule .top-rule-add button', function (e) {
        $(this).parent().toggleClass('active');
      });


      $(document).on('dragstart', 'li', function (e) {
        if (!draggingEle) {
          $(this).css({
            opacity: 0.5,
            background: "rgba(65,91,192,0.50)",
            border: "1px dashed #3F4C7D",
            'box-shadow':"0 0 4px 0 rgba(65,91,192,0.50)",
            'border-radius':"1px",
          });
          draggingEle = $(this);
          draggingLevel = $(this).attr('data-dnd-crumb');
          // e.dataTransfer.setData('name', 'a');
          e.originalEvent.dataTransfer.setData('name', 'node');
          e.stopPropagation();
        }
      }).on('dragend', 'li', function () {
        $(this).css({
          opacity: 1,
          border:"",
          background:"",
          'box-shadow':"",
          'border-radius':"",
        });
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
          // doAnimation('rule-last-level', draggingEle, $this, function () {
          //
          // });
          if (startIdx < toIdx)
            $this.after($dragEle);
          else
            $this.before($dragEle)
          draggingEle = null;
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

      var topRuleSelector = '.rule-detail-mid .top-rule[draggable="true"]';
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
        $(this).parent().parent().next().show()
        $(this).parent().parent().next().val('-1')
        $(this).parent().parent().next().attr('class')
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

        // printAttr(data)
        var rule_name = $('#titlename')[0].value
        if(!rule_name){
          alert('规则名不能为空')
          return null
        }
        $(e.target).text('保存中..')
        $(e.target).attr('disabled',true);
        if(xx!='rule_edit_page'){
          var url = 'admin27/daily_new_manage.php?act=insert_rule&rule_name='+rule_name+''
        }else {
          var url = 'admin27/daily_new_manage.php?act=update_rule&rule_id='+rule_id+''
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
              window.location.href = 'admin27/daily_new_manage.php?act=get_rule_list'
            }else{
              alert('fail')
            }

          }
        });
      });
    });
  }});

