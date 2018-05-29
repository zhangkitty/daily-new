/**
 * Created by fed on 2017/8/22.
 */
function getLinItemCount() {
  return 4;
}
function getCurrentArgs(from, target) {
  const delta = target - from;
  const perLine = getLinItemCount();
  const currentLine = Math.floor(from / perLine);
  const targetLine = Math.floor(target / perLine);
  const high = Math.max(currentLine, targetLine);
  const low = targetLine === high ? currentLine : targetLine;
  const operations = [

    {
      type: 1,
      before: true,
      pos: low * perLine,
      items: [
        'force-wrap'
      ]
    },
    {
      type: 1,
      pos: (high + 1) * perLine - 1,
      items: [
        'force-wrap'
      ]
    },
    {
      type: 1,
      pos: from,
      before: delta > 0,
      items: [
        'product-item-less'
      ]
    },
    {
      type: 1,
      before: delta < 0,
      pos: target,
      items: [
        'product-item-more',
      ]
    },
    {
      type: 2,
      from: from,
      to: target
    }
  ];
  if (delta > 0) {
    var i = currentLine;
    for (; i < targetLine; i++) {
      operations.push({
        type: 1,
        pos: (i + 1) * perLine - 1,
        items: [
          'product-item-less',
          'force-wrap',
          'product-item-more'
        ]
      });
      operations.push({
        type: 2,
        from: (i + 1) * perLine,
        to: (i + 1) * perLine - 1
      })
    }
  } else {
    var i = currentLine;
    for (; i > targetLine; i--) {
      operations.push({
        type: 1,
        pos: i * perLine,
        before: true,
        items: [
          'product-item-less',
          'force-wrap',
          'product-item-more',
        ]
      });
      operations.push({
        type: 2,
        from: i * perLine - 1,
        to: i * perLine
      })
    }
  }
  return operations;
}

function doAnimation(from, to, cb) {
  const t = 500;
  const operations = getCurrentArgs(from, to);
  const fns = [];
  operations.filter(function (item) { return item.type === 2 }).map(function (item) {
    return {
      bounding: $('article.product-item:nth-of-type(' + (item.from + 1) + ')')[0].getBoundingClientRect(),
      toBounding: $('article.product-item:nth-of-type(' + ( item.to + 1) + ')')[0].getBoundingClientRect(),
      item: item
    };
  }).forEach(function (item) {
    const bounding= item.bounding;
    const toBounding= item.toBounding;
    item = item.item;
    const $from = $('article.product-item:nth-of-type(' + (item.from + 1) + ')');
    $from.css({
      position: 'fixed',
      left: bounding.left + 'px',
      top: bounding.top - 30 + 'px'
    });
    setTimeout(function () {
      $from.css({
        left: toBounding.left + 'px',
        top: toBounding.top - 30 + 'px',
        width: toBounding.width + 'px',
      });
    }, 16);
    fns.push(function () {
      $from.css({
        position: 'relative',
        marginTop: '30px',
        left: 'auto',
        top: 'auto',
        width: 'auto'
      });
    });
  });
  operations.filter(function (item) { return item.type === 1 }).forEach(function (item) {
    const $target = $('article.product-item:nth-of-type(' + (item.pos + 1) + ')');
    for (var j = 0; j < item.items.length; j++) {
      const cls = item.items[j];
      const $ele = $('<div class="animate-help"></div>');
      $ele.addClass(cls);
      $target[item.before ? 'before' : 'after']($ele);
      setTimeout(function(){
        $ele.addClass(cls + '-final');
      }, 16);
    }
  });
  setTimeout(function () {
    $('.animate-help').remove();
    fns.forEach(function (fn) { fn() });
    cb();
  }, t);
}
