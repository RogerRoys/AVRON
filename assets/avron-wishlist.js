/* Avron wishlist: drawer + full page (v1.4) */
(function(){
  var KEY='avron-wishlist',R=window.routes||{},root=(R.root||'/').replace(/\/$/,''),cache={};
  function $(s,c){return (c||document).querySelector(s);}function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function money(c){return window.Avron&&window.Avron.money?window.Avron.money(c):'$'+(c/100).toFixed(2);}
  function img(s,w){if(!s)return '';if(s.indexOf('//')===0)s='https:'+s;return s+(s.indexOf('?')>-1?'&':'?')+'width='+w;}
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]').filter(function(h){return h&&h.indexOf('demo-')!==0;});}catch(e){return [];}}
  function save(l){try{localStorage.setItem(KEY,JSON.stringify(l));}catch(e){}paint();}
  function paint(){var n=list().length;$$('[data-wish-count]').forEach(function(c){c.textContent=n;});$$('[data-wish]').forEach(function(b){var on=list().indexOf(b.getAttribute('data-wish'))>-1;b.classList.toggle('is-on',on);b.setAttribute('aria-pressed',on);});}
  function get(h){if(cache[h])return Promise.resolve(cache[h]);return fetch(root+'/products/'+h+'.js').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(p){cache[h]=p;return p;}).catch(function(){return null;});}
  function load(){var l=list();return Promise.all(l.map(get)).then(function(ps){return ps.map(function(p,i){return p?{h:l[i],p:p}:null;}).filter(Boolean);});}
  function v0(p){return p.variants.filter(function(v){return v.available;})[0]||p.variants[0];}
  function heart(s){return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="#B5532E" stroke="#B5532E" stroke-width="1.8" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/></svg>';}
  var emptyIcon='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5C615B" stroke-width="1.6" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/></svg>';
  function info(it){var p=it.p,v=v0(p),single=p.variants.length===1&&/^default title$/i.test(v.title);return {v:v,var:single?'':v.title,cmp:v.compare_at_price>v.price?money(v.compare_at_price):'',im:img((v.featured_image&&v.featured_image.src)||p.featured_image,400),multi:!single};}
  function addBtn(it,cls){var i=info(it);if(!i.v.available)return '<span class="'+cls+' is-off">Sold out</span>';
    return i.multi?'<button type="button" class="'+cls+'" data-quick-add="'+esc(it.h)+'">Add to cart</button>':'<button type="button" class="'+cls+'" data-wl-add="'+i.v.id+'">Add to cart</button>';}
  function total(items){return items.reduce(function(a,it){return a+v0(it.p).price;},0);}
  function renderDrawer(items){
    var d=$('#WishlistDrawer');if(!d)return;var body=$('[data-wl-body]',d),foot=$('[data-wl-foot]',d);
    $$('[data-wl-title]',d).forEach(function(t){t.textContent='Wishlist ('+items.length+')';});
    if(!items.length){body.innerHTML='<div class="xwl__empty"><span class="xwl__eic">'+emptyIcon+'</span><b>Your wishlist is empty</b><span>Tap the heart on any light to save it.</span><a href="'+esc(root+'/collections/all')+'" class="xwl__btn">Browse best sellers</a></div>';foot.querySelector('[data-wl-sum]').hidden=true;return;}
    foot.querySelector('[data-wl-sum]').hidden=false;
    body.innerHTML=items.map(function(it){var i=info(it),p=it.p;return '<div class="xwl__line"><a href="'+esc(p.url)+'" class="xwl__img"><img src="'+esc(i.im)+'" alt="" loading="lazy"></a><div class="xwl__info"><a href="'+esc(p.url)+'" class="xwl__n">'+esc(p.title)+'</a>'+(i.var?'<span class="xwl__v">'+esc(i.var)+'</span>':'')+'<div class="xwl__pr"><b>'+money(i.v.price)+'</b>'+(i.cmp?'<s>'+i.cmp+'</s>':'')+'</div>'+addBtn(it,'xwl__add')+'</div><button type="button" class="xwl__rm" data-wl-rm="'+esc(it.h)+'" aria-label="Remove '+esc(p.title)+'">'+heart(15)+'</button></div>';}).join('');
    $('[data-wl-count]',foot).textContent=items.length+' saved item'+(items.length===1?'':'s');$('[data-wl-total]',foot).textContent=money(total(items));
    $('[data-wl-all]',foot).textContent='Add all to cart — '+money(total(items));
  }
  function renderPage(items){
    var pg=$('[data-wl-page]');if(!pg)return;
    $$('[data-wl-title]',pg).forEach(function(t){t.innerHTML='Your wishlist <span>('+items.length+')</span>';});
    var grid=$('[data-wl-grid]',pg),acts=$('[data-wl-acts]',pg),sum=$('[data-wl-summary]',pg),mbar=$('[data-wl-mbar]',pg);
    if(!items.length){grid.innerHTML='<div class="xwl__empty xwl__empty--page"><span class="xwl__eic">'+emptyIcon+'</span><b>Your wishlist is empty</b><span>Tap the heart on any light to save it here for later.</span><a href="'+esc(root+'/collections/all')+'" class="xwl__btn">Browse best sellers</a></div>';acts.hidden=sum.hidden=true;if(mbar)mbar.hidden=true;return;}
    acts.hidden=sum.hidden=false;if(mbar)mbar.hidden=false;
    grid.innerHTML=items.map(function(it){var i=info(it),p=it.p,low=i.v.inventory_quantity>0&&i.v.inventory_quantity<6;return '<div class="xwlp__card"><div class="xwlp__media"><a href="'+esc(p.url)+'"><img src="'+esc(img((i.v.featured_image&&i.v.featured_image.src)||p.featured_image,700))+'" alt="'+esc(p.title)+'" loading="lazy"></a><button type="button" class="xwlp__heart" data-wl-rm="'+esc(it.h)+'" aria-label="Remove">'+heart(17)+'</button></div><div class="xwlp__txt"><a href="'+esc(p.url)+'" class="xwlp__n">'+esc(p.title)+'</a>'+(i.var?'<span class="xwlp__v">'+esc(i.var)+'</span>':'')+'</div><div class="xwlp__pr"><b>'+money(i.v.price)+'</b>'+(i.cmp?'<s>'+i.cmp+'</s>':'')+'</div>'+(low?'<span class="xwlp__low"><i></i>Only '+i.v.inventory_quantity+' left</span>':'')+'<div class="xwlp__btns">'+addBtn(it,'xwlp__add')+'<button type="button" class="xwlp__rm" data-wl-rm="'+esc(it.h)+'">Remove</button></div></div>';}).join('');
    var t=money(total(items));$$('[data-wl-all]',pg).forEach(function(b){b.textContent=b.hasAttribute('data-short')?'Add all to cart':'Add all to cart — '+t;});
    $$('[data-wl-total]',pg).forEach(function(x){x.textContent=t;});$$('[data-wl-count]',pg).forEach(function(x){x.textContent=items.length+' items';});
  }
  function refresh(){paint();return load().then(function(items){renderDrawer(items);renderPage(items);return items;});}
  function toast(msg){var t=$('.xwl-toast');if(!t){t=document.createElement('div');t.className='xwl-toast';document.body.appendChild(t);}
    t.innerHTML=heart(16)+'<span>'+esc(msg)+'</span><button type="button" data-open="WishlistDrawer">View</button>';t.classList.remove('is-on');void t.offsetWidth;t.classList.add('is-on');clearTimeout(t.__t);t.__t=setTimeout(function(){t.classList.remove('is-on');},2400);}
  function addIds(ids,btn){if(btn){btn.classList.add('is-loading');}
    return fetch(root+'/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({items:ids.map(function(id){return {id:+id,quantity:1};})})})
    .then(function(r){return r.json();}).then(function(){if(btn){btn.classList.remove('is-loading');btn.classList.add('is-done');btn.textContent='✓ Added';}
      if(window.Avron&&window.Avron.renderCart)return window.Avron.renderCart(false);}).catch(function(){if(btn)btn.classList.remove('is-loading');});}
  document.addEventListener('click',function(e){
    var w=e.target.closest('[data-wish]');
    if(w){setTimeout(function(){var on=list().indexOf(w.getAttribute('data-wish'))>-1;if(w.getAttribute('data-wish').indexOf('demo-')!==0)toast(on?'Saved to wishlist':'Removed from wishlist');refresh();},0);return;}
    var rm=e.target.closest('[data-wl-rm]');if(rm){e.preventDefault();var l=list(),h=rm.getAttribute('data-wl-rm');save(l.filter(function(x){return x!==h;}));var row=rm.closest('.xwl__line,.xwlp__card');if(row){row.classList.add('is-out');setTimeout(refresh,280);}else refresh();return;}
    var ad=e.target.closest('[data-wl-add]');if(ad){e.preventDefault();addIds([ad.getAttribute('data-wl-add')],ad);return;}
    var all=e.target.closest('[data-wl-all]');if(all){e.preventDefault();load().then(function(items){var ids=items.map(function(it){return v0(it.p);}).filter(function(v){return v.available;}).map(function(v){return v.id;});if(ids.length)addIds(ids,null).then(function(){all.textContent='✓ All added to cart';if(window.Avron&&window.Avron.open)window.Avron.open('CartDrawer');});});return;}
    var cl=e.target.closest('[data-wl-clear]');if(cl){e.preventDefault();save([]);refresh();return;}
    var sh=e.target.closest('[data-wl-share]');if(sh){e.preventDefault();var u=location.origin+root+'/pages/wishlist?items='+encodeURIComponent(list().join(','));if(navigator.share)navigator.share({title:'My Avron wishlist',url:u}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(u).then(function(){sh.textContent='Link copied';setTimeout(function(){sh.textContent='Share list';},1800);});return;}
    var op=e.target.closest('[data-open="WishlistDrawer"]');if(op){refresh();}
  });
  function boot(){var q=new URLSearchParams(location.search).get('items');if(q&&$('[data-wl-page]')){var l=list();q.split(',').forEach(function(h){h=h.trim();if(h&&l.indexOf(h)<0)l.push(h);});save(l);}refresh();}
  if(document.readyState!=='loading')boot();else document.addEventListener('DOMContentLoaded',boot);
  window.addEventListener('storage',function(e){if(e.key===KEY)refresh();});
})();
