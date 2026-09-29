(function(){
  var R=window.routes||{root:'/',cart_url:'/cart',cart_add_url:'/cart/add',cart_change_url:'/cart/change'};
  var root=(R.root||'/').replace(/\/$/,'');
  function $(s,c){return (c||document).querySelector(s);}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function money(cents){
    var f=window.moneyFormat||'$'+'{{amount}}';
    var v=(cents||0)/100,m=f.match(/\{\{\s*(\w+)\s*\}\}/),key=m?m[1]:'amount';
    function g(n,sep){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,sep);}
    var p=v.toFixed(2).split('.'),s;
    if(key==='amount_no_decimals')s=g(Math.round(v),',');
    else if(key==='amount_with_comma_separator')s=g(p[0],'.')+','+p[1];
    else if(key==='amount_no_decimals_with_comma_separator')s=g(Math.round(v),'.');
    else if(key==='amount_with_apostrophe_separator')s=g(p[0],"'")+'.'+p[1];
    else s=g(p[0],',')+'.'+p[1];
    return f.replace(/\{\{\s*\w+\s*\}\}/,s);
  }
  function fetchJSON(url,opts){return fetch(url,opts).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.description||j.message||'Something went wrong');return j;});});}

  /* Drawers & modals */
  var lastFocus=null;
  function closeAll(keepLock){
    $$('.drawer.is-open,.modal.is-open').forEach(function(d){d.classList.remove('is-open');d.setAttribute('aria-hidden','true');});
    if(!keepLock){document.documentElement.classList.remove('is-locked');if(lastFocus&&lastFocus.focus)try{lastFocus.focus({preventScroll:true});}catch(e){}}
  }
  function open(id){
    var d=document.getElementById(id);if(!d)return false;
    closeAll(true);lastFocus=document.activeElement;
    d.classList.add('is-open');d.setAttribute('aria-hidden','false');document.documentElement.classList.add('is-locked');
    var panel=$('.drawer__panel,.modal__panel',d)||d,f=$('[data-close]:not(.drawer__overlay),button,a,input',panel);
    if(f)try{f.focus({preventScroll:true});}catch(e){}
    return true;
  }
  window.Avron={open:open,close:closeAll,money:money};
  document.addEventListener('click',function(e){
    var o=e.target.closest('[data-open]');
    if(o){if(document.getElementById(o.getAttribute('data-open'))){e.preventDefault();open(o.getAttribute('data-open'));}return;}
    if(e.target.closest('[data-close]')){e.preventDefault();closeAll();}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll();});

  /* Cart */
  function updateCount(){return fetchJSON(R.cart_url+'.js').then(function(c){$$('[data-cart-count]').forEach(function(el){el.textContent=c.item_count;el.hidden=c.item_count===0;});return c;});}
  function renderCart(openIt){
    if($('[data-cart-page]')){location.reload();return Promise.resolve();}
    if(!$('#CartDrawer')){location.href=R.cart_url;return Promise.resolve();}
    return fetch(window.location.pathname+'?sections=cart-drawer').then(function(r){return r.json();}).then(function(d){
      var doc=new DOMParser().parseFromString(d['cart-drawer'],'text/html');
      var n=doc.querySelector('[data-cart-inner]'),o=$('#CartDrawer [data-cart-inner]');
      if(n&&o)o.replaceWith(n);
      return updateCount();
    }).then(function(){if(openIt)open('CartDrawer');});
  }
  window.Avron.renderCart=renderCart;
  function addItems(body,isJSON){
    var h={'Accept':'application/json','X-Requested-With':'XMLHttpRequest'};if(isJSON)h['Content-Type']='application/json';
    return fetchJSON(R.cart_add_url+'.js',{method:'POST',headers:h,body:body});
  }
  document.addEventListener('submit',function(e){
    var f=e.target.closest('form[data-product-form]');if(!f)return;e.preventDefault();
    var btn=f.querySelector('[type=submit]'),err=f.querySelector('[data-form-error]');
    if(err)err.hidden=true;if(btn){btn.classList.add('is-loading');btn.disabled=true;}
    addItems(new FormData(f)).then(function(){
      if(window.cartType==='page'){location.href=R.cart_url;return;}
      return renderCart(true);
    }).catch(function(x){if(err){err.textContent=x.message;err.hidden=false;}else alert(x.message);})
    .then(function(){if(btn){btn.classList.remove('is-loading');btn.disabled=btn.getAttribute('data-soldout')==='true';}});
  });
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-line-change]');if(!b)return;e.preventDefault();
    var box=b.closest('[data-cart-inner],[data-cart-page]');if(box)box.classList.add('is-busy');
    fetchJSON(R.cart_change_url+'.js',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({line:+b.getAttribute('data-line'),quantity:+b.getAttribute('data-qty')})})
    .then(function(){return renderCart(false);}).catch(function(x){alert(x.message);if(box)box.classList.remove('is-busy');});
  });
  document.addEventListener('submit',function(e){
    var f=e.target.closest('form[data-discount-form]');if(!f)return;e.preventDefault();
    var c=(f.querySelector('input').value||'').trim();if(c)location.href=root+'/discount/'+encodeURIComponent(c)+'?redirect='+encodeURIComponent(R.cart_url);
  });
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-step]');if(!b)return;var i=b.parentNode.querySelector('input');if(!i)return;
    i.value=Math.max(+(i.min||1),(+i.value||1)+(+b.getAttribute('data-step')));i.dispatchEvent(new Event('change',{bubbles:true}));
  });

  /* Variants */
  function findVariant(vs,sel){for(var i=0;i<vs.length;i++){var ok=true;for(var j=0;j<sel.length;j++){if(vs[i].options[j]!==sel[j]){ok=false;break;}}if(ok)return vs[i];}return null;}
  function promoteMedia(sec,id){
    var g=$('[data-gallery]',sec),m=g&&$('[data-media-id="'+id+'"]',g);if(!m)return;
    $$('.pp__m--lead',g).forEach(function(x){x.classList.remove('pp__m--lead');});
    m.classList.add('pp__m--lead');g.insertBefore(m,g.firstChild);g.scrollTo({left:0,behavior:'smooth'});
    $$('[data-thumb]',sec).forEach(function(t){t.setAttribute('aria-current',t.getAttribute('data-thumb')===String(id));});
  }
  function initProduct(sec){
    if(sec.getAttribute('data-ready'))return;sec.setAttribute('data-ready','1');
    $$('[data-fbt]',sec).forEach(fbtTotal);
    sec.addEventListener('click',function(e){var t=e.target.closest('[data-thumb]');if(t)promoteMedia(sec,t.getAttribute('data-thumb'));});
    var picker=$('[data-variant-picker]',sec);if(!picker)return;
    var data=JSON.parse($('[data-product-json]',picker).textContent);
    var inv={},invEl=$('[data-inventory]',sec);if(invEl){try{inv=JSON.parse(invEl.textContent);}catch(x){}}
    var lowT=+(sec.getAttribute('data-low-stock')||0);
    picker.addEventListener('change',function(){
      var sel=$$('fieldset',picker).map(function(fs){var c=$('input:checked',fs);return c?c.value:null;});
      $$('[data-opt-label]',picker).forEach(function(l){l.textContent=sel[+l.getAttribute('data-opt-label')];});
      var v=findVariant(data.variants,sel),btn=$('[data-add]',sec),lab=btn&&$('[data-add-label]',btn),idIn=$('[data-variant-id]',sec);
      if(!v){if(btn){btn.disabled=true;btn.setAttribute('data-soldout','true');if(lab)lab.textContent='Unavailable';}return;}
      if(idIn)idIn.value=v.id;
      var price=$('[data-price]',sec),cmp=$('[data-compare]',sec),save=$('[data-save]',sec),sale=v.compare_at_price&&v.compare_at_price>v.price;
      if(price)price.textContent=money(v.price);
      if(cmp){cmp.hidden=!sale;if(sale)cmp.textContent=money(v.compare_at_price);}
      if(save){save.hidden=!sale;if(sale)save.textContent='Save '+money(v.compare_at_price-v.price);}
      if(btn){btn.disabled=!v.available;btn.setAttribute('data-soldout',v.available?'false':'true');if(lab)lab.textContent=v.available?lab.getAttribute('data-label'):'Sold out';}
      var low=$('[data-low-stock-msg]',sec);if(low){var q=inv[v.id];if(q!=null&&q>0&&q<=lowT){low.hidden=false;$('[data-low-qty]',low).textContent=q;}else low.hidden=true;}
      if(v.featured_media)promoteMedia(sec,v.featured_media.id);
      try{var u=new URL(location.href);u.searchParams.set('variant',v.id);history.replaceState({},'',u.toString());}catch(x){}
      sec.dispatchEvent(new CustomEvent('variant:change',{detail:v,bubbles:true}));
    });
  }
  function fbtTotal(w){var t=+w.getAttribute('data-main-price');$$('input:checked',w).forEach(function(c){t+=+c.getAttribute('data-price');});var o=$('[data-fbt-total]',w);if(o)o.textContent=money(t);}
  document.addEventListener('change',function(e){var w=e.target.closest('[data-fbt]');if(w)fbtTotal(w);});
  document.addEventListener('variant:change',function(e){var w=$('[data-fbt]',e.target);if(w){w.setAttribute('data-main-price',e.detail.price);fbtTotal(w);}});
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-fbt-add]');if(!b)return;e.preventDefault();
    var w=b.closest('[data-fbt]'),sec=b.closest('[data-product-section]'),id=sec&&$('[data-variant-id]',sec);
    var items=[];if(id)items.push({id:+id.value,quantity:1});$$('input:checked',w).forEach(function(c){items.push({id:+c.value,quantity:1});});
    b.classList.add('is-loading');
    addItems(JSON.stringify({items:items}),true).then(function(){return renderCart(true);}).catch(function(x){alert(x.message);}).then(function(){b.classList.remove('is-loading');});
  });

  /* Quick buy */
  function imgUrl(u,w){if(!u)return '';if(u.indexOf('//')===0)u='https:'+u;return u+(u.indexOf('?')>-1?'&':'?')+'width='+w;}
  function renderQuick(p,body){
    var first=p.variants.filter(function(v){return v.available;})[0]||p.variants[0],sel=first.options.slice();
    var imgs=(p.media||[]).filter(function(m){return m.media_type==='image';}).slice(0,4);
    if(!imgs.length&&p.featured_image)imgs=[{src:p.featured_image}];
    var single=p.variants.length===1&&/^default title$/i.test(p.variants[0].title);
    var h='<div class="qb"><div class="qb__media"><div class="qb__lead"><img data-qb-lead src="'+esc(imgUrl(imgs[0]&&imgs[0].src,900))+'" alt="'+esc(p.title)+'"></div>';
    if(imgs.length>1){h+='<div class="qb__thumbs">';imgs.forEach(function(m,i){h+='<button type="button" data-qb-img="'+esc(imgUrl(m.src,900))+'"'+(i===0?' aria-current="true"':'')+'><img src="'+esc(imgUrl(m.src,200))+'" alt=""></button>';});h+='</div>';}
    h+='</div><div class="qb__info"><span class="qb__grab" aria-hidden="true"></span><h3 class="qb__title">'+esc(p.title)+'</h3><div class="pp__price"><span class="pp__now" data-qb-price></span><s class="pp__was" data-qb-cmp hidden></s><span class="badge badge--sale" data-qb-save hidden></span></div>';
    h+='<form data-product-form action="'+esc(R.cart_add_url)+'" method="post"><input type="hidden" name="id" data-qb-id>';
    if(!single){p.options.forEach(function(o,i){var name=o.name||o,vals=o.values||[];
      h+='<fieldset class="opt"><legend>'+esc(name)+': <b data-qb-label="'+i+'">'+esc(sel[i])+'</b></legend><div class="opt__row">';
      vals.forEach(function(v){h+='<button type="button" class="optbtn optbtn--js" data-qb-opt="'+i+'" data-val="'+esc(v)+'" aria-pressed="'+(v===sel[i])+'"><span>'+esc(v)+'</span></button>';});
      h+='</div></fieldset>';});}
    h+='<div class="pp__buy"><div class="qty"><button type="button" data-step="-1" aria-label="Decrease">&minus;</button><input type="number" name="quantity" value="1" min="1" aria-label="Quantity"><button type="button" data-step="1" aria-label="Increase">+</button></div><button type="submit" class="btn btn--lg" data-qb-add><span data-add-label data-label="Add to cart">Add to cart</span></button></div><p class="form-error" data-form-error hidden></p></form>';
    h+='<div class="qb__foot"><span>&#10003; Free tracked shipping</span><span>&#10003; 30-day returns</span><a href="'+esc(p.url)+'">View full details</a></div></div></div>';
    body.innerHTML=h;
    function upd(){
      var v=findVariant(p.variants,sel),add=$('[data-qb-add]',body),lab=$('[data-add-label]',add);
      $$('[data-qb-label]',body).forEach(function(l){l.textContent=sel[+l.getAttribute('data-qb-label')];});
      $$('[data-qb-opt]',body).forEach(function(b){b.setAttribute('aria-pressed',sel[+b.getAttribute('data-qb-opt')]===b.getAttribute('data-val'));});
      if(!v){add.disabled=true;add.setAttribute('data-soldout','true');lab.textContent='Unavailable';return;}
      $('[data-qb-id]',body).value=v.id;$('[data-qb-price]',body).textContent=money(v.price);
      var s=v.compare_at_price>v.price,c=$('[data-qb-cmp]',body),sv=$('[data-qb-save]',body);c.hidden=sv.hidden=!s;
      if(s){c.textContent=money(v.compare_at_price);sv.textContent='Save '+money(v.compare_at_price-v.price);}
      add.disabled=!v.available;add.setAttribute('data-soldout',v.available?'false':'true');lab.textContent=v.available?'Add to cart':'Sold out';
      if(v.featured_image&&v.featured_image.src)$('[data-qb-lead]',body).src=imgUrl(v.featured_image.src,900);
    }
    body.onclick=function(e){
      var b=e.target.closest('[data-qb-opt]');if(b){sel[+b.getAttribute('data-qb-opt')]=b.getAttribute('data-val');upd();return;}
      var t=e.target.closest('[data-qb-img]');if(t){$('[data-qb-lead]',body).src=t.getAttribute('data-qb-img');$$('[data-qb-img]',body).forEach(function(x){x.removeAttribute('aria-current');});t.setAttribute('aria-current','true');}
    };
    upd();
  }
  document.addEventListener('click',function(e){
    var q=e.target.closest('[data-quick-add]');if(!q)return;e.preventDefault();
    var body=$('#QuickBuy [data-quick-body]');if(!body){location.href=root+'/products/'+q.getAttribute('data-quick-add');return;}
    body.innerHTML='<p class="qb__loading">Loading&hellip;</p>';open('QuickBuy');
    fetchJSON(root+'/products/'+q.getAttribute('data-quick-add')+'.js').then(function(p){renderQuick(p,body);}).catch(function(){body.innerHTML='<p class="qb__loading">Could not load this product.</p>';});
  });

  /* Tabs, slideshow, filters, recommendations */
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-tab]');if(!t)return;var w=t.closest('[data-tabs]'),i=t.getAttribute('data-tab');
    $$('[data-tab]',w).forEach(function(b){b.setAttribute('aria-selected',b.getAttribute('data-tab')===i);});
    $$('[data-panel]',w).forEach(function(p){p.hidden=p.getAttribute('data-panel')!==i;});
  });
  function initSlides(s){
    if(s.getAttribute('data-ready'))return;s.setAttribute('data-ready','1');
    var sl=$$('.hero__slide',s),dots=$$('.hero__dot',s),i=0,timer;if(sl.length<2)return;
    function go(n){sl[i].classList.remove('is-active');if(dots[i])dots[i].classList.remove('is-active');i=(n+sl.length)%sl.length;sl[i].classList.add('is-active');if(dots[i])dots[i].classList.add('is-active');}
    function play(){clearInterval(timer);if(s.getAttribute('data-autoplay')==='true')timer=setInterval(function(){go(i+1);},(+s.getAttribute('data-speed')||6)*1000);}
    dots.forEach(function(d,n){d.addEventListener('click',function(){go(n);play();});});
    s.addEventListener('shopify:block:select',function(e){var n=sl.indexOf(e.target);if(n>-1){clearInterval(timer);go(n);}});
    play();
  }
  document.addEventListener('change',function(e){
    var f=e.target.form&&e.target.form.matches('[data-filter-form]')?e.target.form:e.target.closest('[data-filter-form]');if(!f)return;
    $$('input[type=number]',f).forEach(function(i){if(!i.value)i.disabled=true;});f.submit();
  });
  function initRecs(el){
    if(el.getAttribute('data-ready'))return;el.setAttribute('data-ready','1');
    fetch(el.getAttribute('data-url')).then(function(r){return r.text();}).then(function(t){
      var n=new DOMParser().parseFromString(t,'text/html').querySelector('[data-recs]');
      if(n&&n.querySelector('.card'))el.innerHTML=n.innerHTML;else{var s=el.closest('.shopify-section');if(s)s.hidden=true;}
    });
  }
  function init(ctx){$$('[data-product-section]',ctx).forEach(initProduct);$$('[data-slideshow]',ctx).forEach(initSlides);$$('[data-recs][data-url]',ctx).forEach(initRecs);}
  if(document.readyState!=='loading')init(document);else document.addEventListener('DOMContentLoaded',function(){init(document);});
  document.addEventListener('shopify:section:load',function(e){init(e.target);});
  var hdr=$('[data-header]');if(hdr){var tick=function(){hdr.classList.toggle('is-scrolled',window.scrollY>10);};window.addEventListener('scroll',tick,{passive:true});tick();}
})();
