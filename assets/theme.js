/* Avron motion layer */
(function(){
  var A=window.Avron=window.Avron||{};
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var design=!!(window.Shopify&&window.Shopify.designMode);
  var EASE='cubic-bezier(.2,.8,.2,1)';
  function $(s,c){return (c||document).querySelector(s);}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

  /* Add-to-cart success state */
  A.markDone=function(form){
    var btns=[form.querySelector('[type=submit]')];
    if(form.id)btns=btns.concat($$('[form="'+form.id+'"]'));
    btns.forEach(function(b){if(!b)return;var l=b.querySelector('[data-add-label]');b.classList.add('is-done');if(l)l.textContent='✓ Added';
      clearTimeout(b.__t);b.__t=setTimeout(function(){b.classList.remove('is-done');if(l&&b.getAttribute('data-soldout')!=='true')l.textContent=l.getAttribute('data-label')||'Add to cart';},2200);});
  };
  document.addEventListener('submit',function(e){var f=e.target;if(!f.matches||!f.matches('form[data-product-form]'))return;var s=e.submitter;if(s&&!f.contains(s))s.classList.add('is-loading');},true);

  /* Scroll reveal */
  var RV='.sec__head,.trust,.grid>.card,.rooms__i,.mg__card,.rev,.ugc__i,.faqs>div,.scard,.feat,.kb>*,.news__in,.footer__grid>*,.coll__head,.blog__i';
  var io=null;
  function reveal(ctx){
    if(reduce||!document.body.classList.contains('anim-reveal')||!('IntersectionObserver' in window))return;
    if(!io)io=new IntersectionObserver(function(es){es.forEach(function(en){if(!en.isIntersecting)return;var el=en.target;el.classList.add('is-in');io.unobserve(el);setTimeout(function(){el.classList.remove('rv','is-in');el.style.transitionDelay='';},1400);});},{threshold:.08,rootMargin:'0px 0px -40px 0px'});
    $$(RV,ctx).forEach(function(el){
      if(el.__rv)return;el.__rv=1;
      var r=el.getBoundingClientRect();if(r.top<window.innerHeight*.9&&r.bottom>0&&document.readyState==='complete')return;
      var n=Array.prototype.indexOf.call(el.parentNode.children,el)%6;
      el.style.transitionDelay=(n*70)+'ms';el.classList.add('rv');io.observe(el);
    });
  }

  /* Announcement rotator */
  function rotator(el){
    if(el.__r)return;el.__r=1;var m=$$('.announce__msg',el),i=0,t;if(m.length<2)return;
    var ms=(+el.getAttribute('data-speed')||4)*1000;
    function go(n,dir){if(n===i)return;var o=m[i];el.classList.toggle('is-back',dir<0);
      m.forEach(function(x){x.classList.remove('is-leaving','is-enter');});
      o.classList.remove('is-active');o.classList.add('is-leaving');setTimeout(function(){o.classList.remove('is-leaving');},700);
      i=(n+m.length)%m.length;m[i].classList.add('is-enter');void m[i].offsetWidth;m[i].classList.add('is-active');setTimeout(function(){m[i]&&m[i].classList.remove('is-enter');},700);}
    function play(){clearInterval(t);t=setInterval(function(){if(!document.hidden)go(i+1,1);},ms);}
    var p=el.querySelector('[data-ann-prev]'),n=el.querySelector('[data-ann-next]');
    if(p)p.addEventListener('click',function(){go(i-1,-1);play();});
    if(n)n.addEventListener('click',function(){go(i+1,1);play();});
    play();
  }

  /* Predictive search */
  function predictive(form){
    if(form.__p)return;form.__p=1;
    var input=$('input[type=search]',form),box=$('[data-ps]',form);if(!input||!box)return;
    var pops=(form.getAttribute('data-popular')||'').split(',').map(function(x){return x.trim();}).filter(Boolean);
    var root=((window.routes&&window.routes.root)||'/').replace(/\/$/,''),t,ctl;
    function chips(){return pops.length?'<div class="ps__chips"><span>Popular:</span>'+pops.map(function(p){return '<button type="button" class="chip" data-ps-q="'+esc(p)+'">'+esc(p)+'</button>';}).join('')+'</div>':'';}
    function show(html){box.innerHTML=html;form.classList.toggle('is-ps-open',!!html);}
    function run(){
      var q=input.value.trim();
      if(!q){var ft=form.querySelector('template[data-ps-featured]');show(chips()+(ft?ft.innerHTML:''));return;}
      if(ctl&&ctl.abort)ctl.abort();ctl=window.AbortController?new AbortController():null;
      fetch(root+'/search/suggest.json?q='+encodeURIComponent(q)+'&resources[type]=product&resources[limit]=4&resources[options][unavailable_products]=last',ctl?{signal:ctl.signal}:{})
      .then(function(r){return r.json();}).then(function(d){
        var ps=(d.resources&&d.resources.results&&d.resources.results.products)||[];
        if(!ps.length){show(chips()+'<p class="ps__empty">Nothing matches “'+esc(q)+'”.</p>');return;}
        show(chips()+'<div class="ps__grid">'+ps.map(function(p){var img=(p.featured_image&&p.featured_image.url)||p.image||'';var pr=A.money?A.money(Math.round(parseFloat(p.price)*100)):p.price;
          return '<a class="ps__item" href="'+esc(p.url)+'"><span class="ps__img">'+(img?'<img src="'+esc(img)+(img.indexOf('?')>-1?'&':'?')+'width=300" alt="" loading="lazy">':'')+'</span><b>'+esc(p.title)+'</b><span class="muted">'+esc(pr)+'</span></a>';}).join('')+'</div><a class="ps__all link" href="'+esc(form.action)+'?q='+encodeURIComponent(q)+'&options[prefix]=last">See all results</a>');
      }).catch(function(){});
    }
    input.setAttribute('autocomplete','off');
    input.addEventListener('focus',function(){run();});
    input.addEventListener('input',function(){clearTimeout(t);t=setTimeout(run,180);});
    form.addEventListener('focusout',function(){setTimeout(function(){if(!form.contains(document.activeElement))show('');},150);});
    box.addEventListener('mousedown',function(e){var c=e.target.closest('[data-ps-q]');if(c){e.preventDefault();input.value=c.getAttribute('data-ps-q');run();}});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')show('');});
  }

  /* Warmth picker */
  document.addEventListener('click',function(e){
    var k=e.target.closest('[data-kel]');if(!k)return;var w=k.closest('[data-kelvin]');
    $$('[data-kel]',w).forEach(function(b){b.setAttribute('aria-pressed',b===k);});
    var t=$('[data-kel-tint]',w),g=$('[data-kel-tag]',w);if(t)t.style.backgroundColor=k.getAttribute('data-glow');
    if(g){g.classList.remove('is-swap');void g.offsetWidth;g.classList.add('is-swap');g.textContent=k.getAttribute('data-label');}
  });

  /* Reviews carousel (desktop) */
  function carousel(track){
    if(track.__c)return;track.__c=1;var sec=track.closest('.shopify-section')||document,i=0;
    function step(d){
      if(!window.matchMedia('(min-width: 990px)').matches){track.style.transform='';return;}
      var items=track.children;if(!items.length)return;var w=items[0].getBoundingClientRect().width+16,max=Math.max(0,items.length-3);
      i=d===0?0:(i+d>max?0:(i+d<0?max:i+d));track.style.transform='translateX('+(-i*w)+'px)';
    }
    var p=$('[data-rev-prev]',sec),n=$('[data-rev-next]',sec);
    if(p)p.addEventListener('click',function(){step(-1);});if(n)n.addEventListener('click',function(){step(1);});
    window.addEventListener('resize',function(){step(0);});
  }

  /* Smooth accordions */
  function clear(b){b.style.height='';b.style.opacity='';b.style.overflow='';b.style.transition='';}
  document.addEventListener('click',function(e){
    var s=e.target.closest('details.acc > summary, details.md__acc > summary');if(!s||reduce)return;
    var d=s.parentNode,b=s.nextElementSibling;if(!b)return;e.preventDefault();if(d.__anim)return;d.__anim=1;
    if(d.open){b.style.overflow='hidden';b.style.height=b.offsetHeight+'px';void b.offsetHeight;b.style.transition='height .35s '+EASE+', opacity .3s ease';b.style.height='0px';b.style.opacity='0';
      setTimeout(function(){d.open=false;clear(b);d.__anim=0;},360);}
    else{d.open=true;var h=b.scrollHeight;b.style.overflow='hidden';b.style.height='0px';b.style.opacity='0';void b.offsetHeight;b.style.transition='height .4s '+EASE+', opacity .35s ease .05s';b.style.height=h+'px';b.style.opacity='1';
      setTimeout(function(){clear(b);d.__anim=0;},430);}
  });

  /* Wishlist hearts (saved in this browser) */
  var WK='avron-wishlist';
  function wl(){try{return JSON.parse(localStorage.getItem(WK)||'[]');}catch(x){return [];}}
  function paintWish(ctx){var l=wl();$$('[data-wish]',ctx).forEach(function(b){var on=l.indexOf(b.getAttribute('data-wish'))>-1;b.classList.toggle('is-on',on);b.setAttribute('aria-pressed',on);});$$('[data-wish-count]').forEach(function(c){c.textContent=l.length;});}
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-wish]');if(!b)return;e.preventDefault();e.stopPropagation();
    var h=b.getAttribute('data-wish'),l=wl(),i=l.indexOf(h);if(i>-1)l.splice(i,1);else l.push(h);
    try{localStorage.setItem(WK,JSON.stringify(l));}catch(x){}
    paintWish(document);b.classList.remove('is-pop');void b.offsetWidth;b.classList.add('is-pop');
  });

  /* Sticky add to cart */
  function sticky(sec){
    var bar=$('[data-satc]',sec),main=$('[data-add]',sec);if(!bar||!main||bar.__s)return;bar.__s=1;
    if(bar.parentNode!==document.body)document.body.appendChild(bar);
    var past=false,atFoot=false;function paint(){var on=past&&!atFoot;bar.classList.toggle('is-on',on);bar.setAttribute('aria-hidden',!on);document.body.classList.toggle('has-satc',on);}
    new IntersectionObserver(function(es){var en=es[0];past=!en.isIntersecting&&en.boundingClientRect.top<0;paint();},{threshold:0}).observe(main);
    var foot=document.querySelector('.footer, footer, #shopify-section-footer, .shopify-section-group-footer-group');if(foot)new IntersectionObserver(function(es){atFoot=es.some(function(e){return e.isIntersecting;});paint();},{threshold:0}).observe(foot);
    sec.addEventListener('variant:change',function(e){var v=e.detail,t=$('[data-satc-variant]',bar),p=$('[data-price-sticky]',bar),b=$('[data-satc-btn]',bar),l=b&&$('[data-add-label]',b);
      if(t&&!/^default title$/i.test(v.title))t.textContent=v.title;if(p&&A.money)p.textContent=A.money(v.price);
      if(b){b.disabled=!v.available;b.setAttribute('data-soldout',v.available?'false':'true');if(l)l.textContent=v.available?(l.getAttribute('data-label')||'Add to cart'):'Sold out';}});
  }

  A.initMotion=function(ctx){
    ctx=ctx||document;
    $$('[data-rotate]',ctx).forEach(rotator);
    $$('form[data-predictive]',ctx).forEach(predictive);
    $$('[data-revs]',ctx).forEach(carousel);
    $$('[data-product-section]',ctx).forEach(sticky);
    paintWish(ctx);reveal(ctx);
  };
  document.addEventListener('cart:rendered',function(){paintWish(document);});
  var mo=new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1&&n.querySelector){paintWish(n);reveal(n);}});});});
  function boot(){mo.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState!=='loading')boot();else document.addEventListener('DOMContentLoaded',boot);
})();

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
    void d.offsetWidth;var pn=d.querySelector('.drawer__panel,.modal__panel');if(pn)void pn.offsetWidth;requestAnimationFrame(function(){d.classList.add('is-open');});d.setAttribute('aria-hidden','false');document.documentElement.classList.add('is-locked');
    var panel=$('.drawer__panel,.modal__panel',d)||d,f=$('[data-close]:not(.drawer__overlay),button,a,input',panel);
    if(f)try{f.focus({preventScroll:true});}catch(e){}
    return true;
  }
  window.Avron=window.Avron||{};window.Avron.open=open;window.Avron.close=closeAll;window.Avron.money=money;
  document.addEventListener('click',function(e){
    var o=e.target.closest('[data-open]');
    if(o){if(document.getElementById(o.getAttribute('data-open'))){e.preventDefault();open(o.getAttribute('data-open'));}return;}
    if(e.target.closest('[data-close]')){e.preventDefault();closeAll();}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll();});

  /* Cart */
  function updateCount(){return fetchJSON(R.cart_url+'.js').then(function(c){$$('[data-cart-count]').forEach(function(el){if(el.textContent!==String(c.item_count)){el.classList.remove('is-bump');void el.offsetWidth;el.classList.add('is-bump');}el.textContent=c.item_count;el.hidden=c.item_count===0;});return c;});}
  function renderCart(openIt){
    if($('[data-cart-page]')){location.reload();return Promise.resolve();}
    if(!$('#CartDrawer')){location.href=R.cart_url;return Promise.resolve();}
    var ss=$('#CartDrawer').closest('.shopify-section'),sid=(ss&&ss.id||'').replace('shopify-section-','')||'cart-drawer';
    return fetch(window.location.pathname+'?sections='+encodeURIComponent(sid)).then(function(r){return r.json();}).then(function(d){
      var html=d[sid]||d['cart-drawer']||Object.values(d)[0]||'';
      var doc=new DOMParser().parseFromString(html,'text/html');
      var n=doc.querySelector('[data-cart-inner]'),o=$('#CartDrawer [data-cart-inner]');
      if(n&&o){n.classList.add('is-swap');o.replaceWith(n);requestAnimationFrame(function(){requestAnimationFrame(function(){n.classList.remove('is-swap');});});}
      else if(o)o.classList.remove('is-busy');
      return updateCount();
    }).catch(function(){var o=$('#CartDrawer [data-cart-inner]');if(o)o.classList.remove('is-busy');}).then(function(){if(openIt)open('CartDrawer');});
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
      if(window.Avron.markDone)window.Avron.markDone(f);
      if(window.cartType==='page'){location.href=R.cart_url;return;}
      return new Promise(function(r){setTimeout(r,350);}).then(function(){return renderCart(true);});
    }).catch(function(x){if(err){err.textContent=x.message;err.hidden=false;}else alert(x.message);})
    .then(function(){if(btn){btn.classList.remove('is-loading');btn.disabled=btn.getAttribute('data-soldout')==='true';}if(f.id)$$('[form="'+f.id+'"]').forEach(function(b){b.classList.remove('is-loading');});});
  });
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-line-change]');if(!b)return;e.preventDefault();
    var box=b.closest('[data-cart-inner],[data-cart-page]');if(box)box.classList.add('is-busy');
    var line=b.closest('.xcd__item,.cd__item,[data-line-item],li');if(line&&+b.getAttribute('data-qty')===0){line.style.height=line.offsetHeight+'px';line.style.overflow='hidden';void line.offsetHeight;line.style.transition='height .35s cubic-bezier(.2,.8,.2,1),opacity .25s ease,padding .35s,margin .35s';line.style.opacity='0';line.style.height='0px';line.style.paddingTop='0';line.style.paddingBottom='0';line.style.marginTop='0';line.style.marginBottom='0';line.classList.add('is-leaving');}
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
    var g=$('[data-gallery]',sec);if(g&&g.__xrgGo){g.__xrgGo(id);return;}var m=g&&$('[data-media-id="'+id+'"]',g);if(!m)return;
    $$('.pp__m--lead',g).forEach(function(x){x.classList.remove('pp__m--lead');});
    m.classList.add('pp__m--lead');g.insertBefore(m,g.firstChild);g.scrollTo({left:0,behavior:'smooth'});
    $$('[data-thumb]',sec).forEach(function(t){t.setAttribute('aria-current',t.getAttribute('data-thumb')===String(id));});
  }
  function initProduct(sec){
    if(sec.getAttribute('data-ready'))return;sec.setAttribute('data-ready','1');
    $$('[data-fbt]',sec).forEach(fbtTotal);
    sec.addEventListener('click',function(e){var t=e.target.closest('[data-thumb]');if(t)promoteMedia(sec,t.getAttribute('data-thumb'));});
    var picker=$('[data-variant-picker]',sec);if(!picker)return;
    var pj=$('[data-product-json]',picker);if(!pj)return;var data=JSON.parse(pj.textContent);
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
    var SW={black:'#1E1E1E',bronze:'#6B4F32',gold:'#C9A866',brass:'#B8924A',white:'#F4F1EA',natural:'#CDB896',silver:'#C7C9CC',chrome:'#D9DBDE',grey:'#8A8D90',gray:'#8A8D90',nickel:'#B9B6AE',copper:'#B06F45',green:'#2F4A3A',clear:'#EEF1F4',smoked:'#6E6A66',amber:'#C88A3A'};
    function swc(v){var k=String(v).toLowerCase().split(/[\s\/-]/)[0];return SW[k]||null;}
    var badge='';(p.tags||[]).forEach(function(t){if(/^badge:/i.test(t))badge=t.replace(/^badge:\s*/i,'');});
    if(!badge&&(p.tags||[]).some(function(t){return /best.?seller/i.test(t);}))badge='Best seller';
    var h='<div class="xqb"><span class="xqb__grab" aria-hidden="true"></span><div class="xqb__media"><div class="xqb__lead"><img data-qb-lead src="'+esc(imgUrl(imgs[0]&&imgs[0].src,900))+'" alt="'+esc(p.title)+'">'+(badge?'<span class="xqb__badge">'+esc(badge)+'</span>':'')+'</div>';
    if(imgs.length>1){h+='<div class="xqb__thumbs">';imgs.slice(0,3).forEach(function(m,i){h+='<button type="button" data-qb-img="'+esc(imgUrl(m.src,900))+'"'+(i===0?' aria-current="true"':'')+'><img src="'+esc(imgUrl(m.src,300))+'" alt=""></button>';});h+='</div>';}
    h+='</div><div class="xqb__info"><div class="xqb__mhead"><span class="xqb__mimg"><img data-qb-lead2 src="'+esc(imgUrl(imgs[0]&&imgs[0].src,300))+'" alt=""></span><div class="xqb__mtxt"><b class="xqb__title">'+esc(p.title)+'</b><div class="xqb__price"><b data-qb-price></b><s data-qb-cmp hidden></s><span class="xqb__save" data-qb-save hidden></span></div></div></div>';
    h+='<form data-product-form action="'+esc(R.cart_add_url)+'" method="post" class="xqb__form"><input type="hidden" name="id" data-qb-id>';
    if(!single){p.options.forEach(function(o,i){var name=o.name||o,vals=o.values||[],isC=vals.some(swc);
      h+='<div class="xqb__opt"><span class="xqb__lab"><b>'+esc(name)+':</b> <span data-qb-label="'+i+'">'+esc(sel[i])+'</span></span><div class="'+(isC?'xqb__sws':'xqb__szs')+'">';
      vals.forEach(function(v){var c=isC?swc(v):null;h+='<button type="button" class="xqb__ob" data-qb-opt="'+i+'" data-val="'+esc(v)+'" aria-pressed="'+(v===sel[i])+'">'+(isC?'<span class="xqb__dot" style="background:'+(c||'#D6D2CA')+'"></span>':'')+esc(v)+'</button>';});
      h+='</div></div>';});}
    h+='<div class="xqb__buy"><div class="xqb__qty"><button type="button" data-step="-1" aria-label="Decrease">&minus;</button><input type="number" name="quantity" value="1" min="1" aria-label="Quantity"><button type="button" data-step="1" aria-label="Increase">+</button></div><button type="submit" class="xqb__add" data-qb-add><span data-add-label data-label="Add to cart">Add to cart</span></button></div>';
    h+='<a href="#" class="xqb__sp" data-qb-sp>Buy with Shop Pay</a><p class="form-error" data-form-error hidden></p></form>';
    h+='<div class="xqb__foot"><span>&#10003; Tracked delivery</span><span>&#10003; Clear returns policy</span><a href="'+esc(p.url)+'">Full details</a></div><p class="xqb__mnote">Tracked delivery · Clear returns policy</p></div></div>';
    body.innerHTML=h;
    function qty(){var q=$('input[name=quantity]',body);return Math.max(1,parseInt(q&&q.value,10)||1);}
    function upd(){
      var v=findVariant(p.variants,sel),add=$('[data-qb-add]',body),lab=$('[data-add-label]',add),mob=window.matchMedia('(max-width: 989px)').matches;
      $$('[data-qb-label]',body).forEach(function(l){l.textContent=sel[+l.getAttribute('data-qb-label')];});
      $$('[data-qb-opt]',body).forEach(function(b){b.setAttribute('aria-pressed',sel[+b.getAttribute('data-qb-opt')]===b.getAttribute('data-val'));});
      if(!v){add.disabled=true;add.setAttribute('data-soldout','true');lab.textContent='Unavailable';return;}
      $('[data-qb-id]',body).value=v.id;$('[data-qb-price]',body).textContent=money(v.price);
      var s=v.compare_at_price>v.price,c=$('[data-qb-cmp]',body),sv=$('[data-qb-save]',body);c.hidden=sv.hidden=!s;
      if(s){c.textContent=money(v.compare_at_price);sv.textContent='Save '+money(v.compare_at_price-v.price);}
      var txt=v.available?(mob?'Add to cart — '+money(v.price*qty()):'Add to cart'):'Sold out';
      add.disabled=!v.available;add.setAttribute('data-soldout',v.available?'false':'true');lab.textContent=txt;lab.setAttribute('data-label',v.available?txt:'Sold out');
      $('[data-qb-sp]',body).href=root+'/cart/'+v.id+':'+qty()+'?payment=shop_pay';
      if(v.featured_image&&v.featured_image.src){$('[data-qb-lead]',body).src=imgUrl(v.featured_image.src,900);$('[data-qb-lead2]',body).src=imgUrl(v.featured_image.src,300);}
    }
    body.onclick=function(e){
      var b=e.target.closest('[data-qb-opt]');if(b){sel[+b.getAttribute('data-qb-opt')]=b.getAttribute('data-val');upd();return;}
      var st=e.target.closest('.xqb__qty [data-step]');if(st){setTimeout(upd,0);}
      var t=e.target.closest('[data-qb-img]');if(t){$('[data-qb-lead]',body).src=t.getAttribute('data-qb-img');$$('[data-qb-img]',body).forEach(function(x){x.removeAttribute('aria-current');});t.setAttribute('aria-current','true');}
    };
    body.oninput=function(e){if(e.target.name==='quantity')upd();};
    upd();
  }
  document.addEventListener('click',function(e){
    var q=e.target.closest('[data-quick-add]');if(!q)return;e.preventDefault();
    var body=$('#QuickBuy [data-quick-body]');if(!body){location.href=root+'/products/'+q.getAttribute('data-quick-add');return;}
    body.classList.remove('is-ready');body.innerHTML='<div class="qb qb--skel"><div class="qb__media"><div class="qb__lead sk"></div></div><div class="qb__info"><span class="sk sk--l"></span><span class="sk sk--m"></span><span class="sk sk--s"></span><span class="sk sk--b"></span></div></div>';open('QuickBuy');
    fetchJSON(root+'/products/'+q.getAttribute('data-quick-add')+'.js').then(function(p){renderQuick(p,body);void body.offsetWidth;body.classList.add('is-ready');}).catch(function(){body.innerHTML='<p class="qb__loading">Could not load this product.</p>';});
  });

  /* Tabs, slideshow, filters, recommendations */
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-tab]');if(!t)return;var w=t.closest('[data-tabs]'),i=t.getAttribute('data-tab');
    $$('[data-tab]',w).forEach(function(b){b.setAttribute('aria-selected',b.getAttribute('data-tab')===i);});
    $$('[data-panel]',w).forEach(function(p){p.hidden=p.getAttribute('data-panel')!==i;});var sh=$('[data-panel="'+i+'"]',w);if(sh){sh.classList.remove('is-enter');void sh.offsetWidth;sh.classList.add('is-enter');}
  });
  function initSlides(s){
    if(s.getAttribute('data-ready'))return;s.setAttribute('data-ready','1');
    var sl=$$('.hero__slide',s),dots=$$('.hero__dot',s),i=0,timer;
    if(sl[0]){sl[0].classList.remove('is-active');void sl[0].offsetWidth;requestAnimationFrame(function(){requestAnimationFrame(function(){sl[0].classList.add('is-active');});});}
    if(sl.length<2)return;
    function go(n){sl[i].classList.remove('is-active');if(dots[i])dots[i].classList.remove('is-active');i=(n+sl.length)%sl.length;sl[i].classList.add('is-active');if(dots[i])dots[i].classList.add('is-active');}
    function play(){clearInterval(timer);if(s.getAttribute('data-autoplay')==='true')timer=setInterval(function(){go(i+1);},(+s.getAttribute('data-speed')||6)*1000);}
    dots.forEach(function(d,n){d.addEventListener('click',function(){go(n);play();});});
    var pv=$('[data-prev]',s),nx=$('[data-next]',s);if(pv)pv.addEventListener('click',function(){go(i-1);play();});if(nx)nx.addEventListener('click',function(){go(i+1);play();});
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
  function init(ctx){[[ '[data-product-section]',initProduct],['[data-slideshow]',initSlides],['[data-recs][data-url]',initRecs]].forEach(function(p){$$(p[0],ctx).forEach(function(el){try{p[1](el);}catch(x){console.error('Avron init',p[0],x&&x.message,x&&x.stack);}});});try{if(window.Avron.initMotion)window.Avron.initMotion(ctx);}catch(x){console.error('Avron motion',x&&x.message,x&&x.stack);}}
  if(document.readyState!=='loading')init(document);else document.addEventListener('DOMContentLoaded',function(){init(document);});
  document.addEventListener('shopify:section:load',function(e){init(e.target);});
  var hdr=$('[data-header]');if(hdr){var tick=function(){hdr.classList.toggle('is-scrolled',window.scrollY>10);};window.addEventListener('scroll',tick,{passive:true});tick();}
})();

/* v1.3 preview-exact behaviours */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click',function(e){
    var q=e.target.closest('.xfaq__q');if(!q)return;var it=q.parentNode,wrap=it.parentNode,open=!it.classList.contains('is-open');
    Array.prototype.forEach.call(wrap.querySelectorAll('[data-xfaq].is-open'),function(o){if(o!==it){o.classList.remove('is-open');o.querySelector('.xfaq__q').setAttribute('aria-expanded','false');}});
    it.classList.toggle('is-open',open);q.setAttribute('aria-expanded',open);
  });
  var E='cubic-bezier(.2,.8,.2,1)',io;
  function rv(ctx){
    if(reduce||!document.body.classList.contains('anim-reveal')||(window.Shopify&&Shopify.designMode)||!('IntersectionObserver' in window))return;
    io=io||new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.style.opacity='1';en.target.style.transform='none';io.unobserve(en.target);}});},{threshold:.08,rootMargin:'0px 0px -30px 0px'});
    Array.prototype.forEach.call((ctx||document).querySelectorAll('[data-xrv]'),function(el){if(el.__x)return;el.__x=1;var d=+el.getAttribute('data-xrv')||0;el.style.opacity='0';el.style.transform='translateY(26px)';el.style.transition='opacity .7s ease '+d+'ms, transform .9s '+E+' '+d+'ms';io.observe(el);});
  }
  if(document.readyState!=='loading')rv();else document.addEventListener('DOMContentLoaded',function(){rv();});
  document.addEventListener('shopify:section:load',function(e){rv(e.target);});
})();

/* v1.3.3 sticky header shadow */
(function(){var h=document.querySelector('[data-header]');if(!h)return;var w=h.closest('.shopify-section')||h;function f(){w.classList.toggle('is-stuck',window.scrollY>4);}window.addEventListener('scroll',f,{passive:true});f();})();

/* v1.5.5 footer accordions closed on mobile */
(function(){function f(){var m=window.matchMedia('(max-width: 989px)').matches;Array.prototype.forEach.call(document.querySelectorAll('details[data-mclose]'),function(d){if(m){if(!d.__m){d.open=false;d.__m=1;}}else{d.open=true;d.__m=0;}});}
if(document.readyState!=='loading')f();else document.addEventListener('DOMContentLoaded',f);window.addEventListener('resize',f);})();

/* v1.7 product gallery: left scroll control + click-to-zoom */
(function(){
  function init(w){if(w.__x)return;w.__x=1;var sc=w.querySelector('[data-xg-scroll]'),th=w.querySelector('[data-xg-thumb]');if(!sc)return;
    function upd(){if(!th)return;var h=sc.clientHeight/sc.scrollHeight*100,t=sc.scrollTop/sc.scrollHeight*100;th.style.height=Math.min(100,h)+'%';th.style.top=t+'%';w.classList.toggle('has-scroll',sc.scrollHeight>sc.clientHeight+4);}
    sc.addEventListener('scroll',function(){upd();var n=sc.children.length;if(!n)return;if(sc.scrollWidth>sc.clientWidth+4){var i=Math.round(sc.scrollLeft/sc.clientWidth);var c=w.querySelector('[data-xg-count]'),b=w.querySelector('[data-xg-mbar]');if(c)c.textContent=(i+1)+' / '+n;if(b)b.style.transform='translateX('+(i*100)+'%)';}},{passive:true});window.addEventListener('resize',upd);setTimeout(upd,300);upd();
    w.addEventListener('click',function(e){var u=e.target.closest('[data-xg-up]'),d=e.target.closest('[data-xg-down]');if(u||d){sc.scrollBy({top:(d?1:-1)*sc.clientHeight*.8,behavior:'smooth'});return;}
      if(!window.matchMedia('(min-width: 990px)').matches)return;var m=e.target.closest('.pp__m');if(!m||!m.querySelector('img'))return;
      var on=!m.classList.contains('is-zoom');w.querySelectorAll('.pp__m.is-zoom').forEach(function(x){x.classList.remove('is-zoom');});if(on){m.classList.add('is-zoom');pos(m,e);}});
    w.addEventListener('mousemove',function(e){var m=e.target.closest('.pp__m.is-zoom');if(m)pos(m,e);});
    w.addEventListener('mouseleave',function(){w.querySelectorAll('.pp__m.is-zoom').forEach(function(x){x.classList.remove('is-zoom');});});
  }
  function pos(m,e){var r=m.getBoundingClientRect(),img=m.querySelector('img');img.style.transformOrigin=((e.clientX-r.left)/r.width*100)+'% '+((e.clientY-r.top)/r.height*100)+'%';}
  function all(){document.querySelectorAll('[data-xgal]').forEach(init);}
  if(document.readyState!=='loading')all();else document.addEventListener('DOMContentLoaded',all);document.addEventListener('shopify:section:load',all);
})();

/* v1.7.6 mega menu controller */
(function(){
  function init(){
    var header=document.querySelector('.header');if(!header||header.__mm)return;header.__mm=1;
    var items=[].slice.call(header.querySelectorAll('.nav__item')),t;
    var dims=[].slice.call(header.querySelectorAll('.mega-dim'));
    function paint(){items.forEach(function(i){var m=i.querySelector(':scope > .mega');if(m)m.style.setProperty('display',i.classList.contains('is-open')&&i.classList.contains('has-mega')?'block':'none','important');});var on=header.classList.contains('is-mega-open')||header.classList.contains('is-search-open');dims.forEach(function(d){d.style.setProperty('display',on?'block':'none','important');});}
    function closeAll(){clearTimeout(t);items.forEach(function(i){i.classList.remove('is-open');});header.classList.remove('is-mega-open');paint();}
    function open(it){clearTimeout(t);items.forEach(function(i){if(i!==it)i.classList.remove('is-open');});if(it&&it.classList.contains('has-mega')&&it.querySelector(':scope > .mega')){it.classList.add('is-open');header.classList.add('is-mega-open');}else{if(it)it.classList.remove('is-open');header.classList.remove('is-mega-open');}paint();}
    items.forEach(function(it){
      it.addEventListener('mouseenter',function(){open(it);});
      it.addEventListener('mouseleave',function(e){clearTimeout(t);var to=e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest('.nav__item');if(to&&to!==it){open(to);return;}t=setTimeout(closeAll,120);});
      it.addEventListener('focusin',function(){open(it);});
      var m=it.querySelector('.mega');if(m)m.addEventListener('mouseenter',function(){clearTimeout(t);});
    });
    header.addEventListener('mouseleave',function(){clearTimeout(t);t=setTimeout(closeAll,120);});
    closeAll();
    header.addEventListener('focusout',function(){setTimeout(function(){if(!header.contains(document.activeElement))closeAll();},0);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll();});
    document.addEventListener('click',function(e){if(!e.target.closest('.nav__item.has-mega'))closeAll();});
    window.addEventListener('scroll',function(){if(header.classList.contains('is-mega-open')&&!header.matches(':hover'))closeAll();},{passive:true});
  }
  if(document.readyState!=='loading')init();else document.addEventListener('DOMContentLoaded',init);
  document.addEventListener('shopify:section:load',function(){var h=document.querySelector('.header');if(h)h.__mm=0;init();});
})();

(function(){function s(){var h=document.querySelector('.header');if(h)document.documentElement.style.setProperty('--header-h',Math.round(h.getBoundingClientRect().height)+'px');}window.addEventListener('load',s);window.addEventListener('resize',s);if(document.readyState!=='loading')s();else document.addEventListener('DOMContentLoaded',s);})();

/* v1.8.2 FAQ page smooth jump + mobile variant → gallery scroll */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function hdr(){var h=document.querySelector('.header');var sticky=h&&getComputedStyle(h.closest('.shopify-section')||h).position!=='static';return (sticky&&h?h.getBoundingClientRect().height:0)+16;}
  function smoothTo(y){window.scrollTo({top:Math.max(0,y),behavior:reduce?'auto':'smooth'});}
  document.addEventListener('click',function(e){
    var lj=e.target.closest('.xlg__jumps a[href^="#"]');if(lj){var lt=document.getElementById(lj.getAttribute('href').slice(1));if(lt){e.preventDefault();smoothTo(lt.getBoundingClientRect().top+scrollY-hdr());try{history.replaceState({},'',lj.getAttribute('href'));}catch(x){}}return;}
    var a=e.target.closest('.xfp__nav a[href^="#faq-"], .xfp__chip[href^="#faq-"]');if(!a)return;
    var id=a.getAttribute('href').slice(1),g=document.getElementById(id);if(!g)return;e.preventDefault();
    smoothTo(g.getBoundingClientRect().top+scrollY-hdr());
    document.querySelectorAll('.xfp__nav a,.xfp__chip').forEach(function(x){x.classList.toggle('is-on',x.getAttribute('href')==='#'+id);});
    g.classList.remove('is-flash');void g.offsetWidth;g.classList.add('is-flash');
    try{history.replaceState({},'','#'+id);}catch(x){}
  });
  if('IntersectionObserver' in window){
    var gs=document.querySelectorAll('.xfp__grp');if(gs.length){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(!en.isIntersecting)return;var id=en.target.id;document.querySelectorAll('.xfp__nav a,.xfp__chip').forEach(function(x){x.classList.toggle('is-on',x.getAttribute('href')==='#'+id);});});},{rootMargin:'-30% 0px -60% 0px'});gs.forEach(function(g){io.observe(g);});}
  }
  document.addEventListener('variant:change',function(e){
    if(!window.matchMedia('(max-width: 989px)').matches)return;
    var v=e.detail;if(!v||!v.featured_media)return;
    var sec=e.target.closest?e.target.closest('[data-product-section]')||e.target:e.target;
    var g=sec.querySelector('.pp__gallery')||sec.querySelector('[data-gallery]');if(!g)return;
    var r=g.getBoundingClientRect();if(r.top>=0&&r.top<innerHeight*.25)return;
    setTimeout(function(){smoothTo(r.top+scrollY-hdr()+ (g.getBoundingClientRect().top-r.top));},60);
  });
})();

/* Lighting guide page */
(function(){
  function fx(v){return v%1?v.toFixed(1):String(v);}
  function init(root){
    if(!root||root.__lg)return;root.__lg=1;
    var tabs=[].slice.call(root.querySelectorAll('[data-lg-tab]')),rooms=[].slice.call(root.querySelectorAll('[data-lg-room]'));
    var st={l:4,w:5,lux:tabs[0]?+tabs[0].getAttribute('data-lux'):150,nl:tabs[0]?tabs[0].getAttribute('data-nl'):'room'};
    function calc(){var q=function(s){return root.querySelector(s);};var a=Math.round(st.l*st.w*10)/10;
      q('[data-lg-v="l"]')&&(q('[data-lg-v="l"]').textContent=fx(st.l));q('[data-lg-v="w"]')&&(q('[data-lg-v="w"]').textContent=fx(st.w));
      q('[data-lg-area]')&&(q('[data-lg-area]').textContent=fx(a));q('[data-lg-diam]')&&(q('[data-lg-diam]').textContent=Math.round((st.l+st.w)*8));
      q('[data-lg-lm]')&&(q('[data-lg-lm]').textContent=(Math.round(a*st.lux/50)*50).toLocaleString('en-AU'));q('[data-lg-nl]')&&(q('[data-lg-nl]').textContent=st.nl);}
    var tb=root.querySelector('.xlg__tabs'),pill=null;if(tb){pill=document.createElement('span');pill.className='xlg__pill';tb.insertBefore(pill,tb.firstChild);tb.classList.add('has-pill');}
    function movePill(){if(!pill)return;var on=tb.querySelector('.xlg__tab.is-on');if(!on)return;pill.style.left=on.offsetLeft+'px';pill.style.width=on.offsetWidth+'px';pill.style.opacity='1';}
    movePill();setTimeout(movePill,300);window.addEventListener('resize',movePill);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(movePill);
    tabs.forEach(function(t){t.addEventListener('click',function(){var i=t.getAttribute('data-lg-tab');setTimeout(movePill,0);
      tabs.forEach(function(x){var on=x===t;x.classList.toggle('is-on',on);x.setAttribute('aria-selected',on);});
      rooms.forEach(function(r){var on=r.getAttribute('data-lg-room')===i;r.hidden=!on;r.classList.toggle('is-on',on);if(on){r.classList.remove('is-enter');void r.offsetWidth;r.classList.add('is-enter');}});
      st.lux=+t.getAttribute('data-lux')||st.lux;st.nl=t.getAttribute('data-nl')||st.nl;calc();});});
    var kels=[].slice.call(root.querySelectorAll('[data-lg-kel]')),tint=root.querySelector('[data-lg-tint]'),tag=root.querySelector('[data-lg-tag]');
    kels.forEach(function(k){k.addEventListener('click',function(){kels.forEach(function(x){x.classList.toggle('is-on',x===k);});
      if(tint){tint.style.background=k.getAttribute('data-tint');tint.style.opacity=k.getAttribute('data-op');}
      if(tag){tag.textContent='Preview: '+k.getAttribute('data-label');tag.classList.remove('is-swap');void tag.offsetWidth;tag.classList.add('is-swap');}});});
    [].slice.call(root.querySelectorAll('[data-lg-dim]')).forEach(function(b){b.addEventListener('click',function(){var k=b.getAttribute('data-lg-dim');st[k]=Math.max(1.5,Math.min(12,Math.round((st[k]+parseFloat(b.getAttribute('data-d')))*2)/2));calc();});});
    calc();
  }
  function all(){[].slice.call(document.querySelectorAll('[data-xlg]')).forEach(init);var p=document.querySelector('[data-xlg-part]');if(p){var r=document.getElementById('MainContent')||p.closest('main')||document.body;init(r);}}
  if(document.readyState!=='loading')all();else document.addEventListener('DOMContentLoaded',all);
  document.addEventListener('shopify:section:load',function(e){var r=document.getElementById('MainContent')||document.body;r.__lg=0;all();});
})();

/* Back to top */
(function(){
  var b=document.querySelector('[data-btt]');if(!b)return;
  var prog=b.querySelector('.btt__prog'),reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,raf=0,anim=0;
  function upd(){raf=0;var y=window.scrollY||document.documentElement.scrollTop,mx=document.documentElement.scrollHeight-window.innerHeight,on=y>(window.innerWidth<990?500:600);
    b.classList.toggle('is-on',on);b.tabIndex=on?0:-1;if(prog)prog.style.strokeDashoffset=(138.2*(1-(mx>0?Math.min(1,y/mx):0))).toFixed(1);
    b.classList.toggle('is-up',document.body.classList.contains('has-satc'));}
  window.addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(upd);},{passive:true});window.addEventListener('resize',upd);
  new MutationObserver(upd).observe(document.body,{attributes:true,attributeFilter:['class']});upd();
  function stop(){cancelAnimationFrame(anim);anim=0;['wheel','touchstart','keydown'].forEach(function(t){window.removeEventListener(t,stop);});}
  b.addEventListener('click',function(){
    var s=window.scrollY;if(s<=0)return;if(reduce){window.scrollTo(0,0);return;}
    var d=Math.min(1100,Math.max(500,s*.35)),t0=performance.now();cancelAnimationFrame(anim);
    ['wheel','touchstart','keydown'].forEach(function(t){window.addEventListener(t,stop,{passive:true});});
    var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;};
    (function step(n){var p=Math.min(1,(n-t0)/d);window.scrollTo(0,Math.round(s*(1-ease(p))));if(p<1)anim=requestAnimationFrame(step);else stop();})(t0);
  });
})();

/* Size guide zoom */
(function(){var fine=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
function org(z,e){var img=z.querySelector('img'),r=z.getBoundingClientRect();if(img&&e&&e.clientX!=null)img.style.transformOrigin=((e.clientX-r.left)/r.width*100)+'% '+((e.clientY-r.top)/r.height*100)+'%';}
function lbl(z,on){var h=z.querySelector('[data-sg-hint]');if(h)h.textContent=on?(fine?'Click to zoom out':'Tap to zoom out'):(fine?'Click to zoom':'Tap to zoom');}
document.addEventListener('click',function(e){var z=e.target.closest('[data-sg-zoom]');if(!z)return;var on=!z.classList.contains('is-z');if(on)org(z,e);z.classList.toggle('is-z',on);lbl(z,on);});
document.addEventListener('mousemove',function(e){var z=e.target.closest&&e.target.closest('[data-sg-zoom].is-z');if(z)org(z,e);});
document.addEventListener('mouseout',function(e){var z=e.target.closest&&e.target.closest('[data-sg-zoom].is-z');if(z&&!z.contains(e.relatedTarget)){z.classList.remove('is-z');lbl(z,false);}});
document.querySelectorAll('[data-sg-hint]').forEach(function(h){h.textContent=fine?'Click to zoom':'Tap to zoom';});})();
document.addEventListener('click',function(e){if(e.target.closest('#SizeGuide [data-close]')){var z=document.querySelector('#SizeGuide [data-sg-zoom].is-z');if(z){z.classList.remove('is-z');var h=z.querySelector('[data-sg-hint]');if(h)h.textContent='Tap to zoom';}}});

/* Size guide: mount on <body> so it sits above the sticky header */
(function(){function mv(){var m=document.getElementById('SizeGuide');if(m&&m.parentNode!==document.body)document.body.appendChild(m);}
if(document.readyState!=='loading')mv();else document.addEventListener('DOMContentLoaded',mv);document.addEventListener('shopify:section:load',mv);})();

/* Header search toggle (centred layout) */
(function(){
  function hdr(){return document.querySelector('.header--a, .header--centered, .header--stext, .header--micons');}
  function set(on){var h=hdr();if(!h)return;h.classList.toggle('is-search-open',on);h.querySelectorAll('.mega-dim').forEach(function(d){d.style.setProperty('display',on||h.classList.contains('is-mega-open')?'block':'none','important');});if(on){var i=h.querySelector('#HeaderSearch');if(i)setTimeout(function(){i.focus();},60);}}
  document.addEventListener('click',function(e){var t=e.target.closest('[data-search-toggle]');if(t){e.preventDefault();var h=hdr();set(!(h&&h.classList.contains('is-search-open')));return;}
    var h=hdr();if(h&&h.classList.contains('is-search-open')&&(e.target.closest('.mega-dim')||!e.target.closest('.header'))) set(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
  document.addEventListener('mouseover',function(e){if(window.matchMedia('(min-width:990px)').matches&&e.target.closest&&e.target.closest('.header--centered .nav__item.has-mega'))set(false);});
})();

(function(){function m(){var h=document.querySelector('.header');if(h)document.documentElement.style.setProperty('--hdr-h',Math.round(h.getBoundingClientRect().bottom)+'px');}window.addEventListener('resize',m);window.addEventListener('scroll',m,{passive:true});document.addEventListener('click',function(){setTimeout(m,0);});if(document.readyState!=='loading')m();else document.addEventListener('DOMContentLoaded',m);})();

/* Keep the tapped accordion row still while others collapse above it (no page jump) */
(function(){document.addEventListener('click',function(e){var q=e.target.closest('.xfaq__q');if(!q)return;
  var y0=q.getBoundingClientRect().top,t0=performance.now();
  (function step(){var d=q.getBoundingClientRect().top-y0;if(Math.abs(d)>0.5)window.scrollBy(0,d);if(performance.now()-t0<600)requestAnimationFrame(step);})();
},true);})();

/* Related products: You may also like / Recently viewed tabs */
(function(){var K='avron-recent';function get(){try{return JSON.parse(localStorage.getItem(K)||'[]');}catch(e){return [];}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function init(sec){if(sec.__xrv)return;sec.__xrv=1;var me=sec.querySelector('[data-xrv-me]'),cur=sec.getAttribute('data-current'),lim=+sec.getAttribute('data-limit')||8;
 if(me){try{var d=JSON.parse(me.textContent),l=get().filter(function(x){return x.handle!==d.handle;});l.unshift(d);localStorage.setItem(K,JSON.stringify(l.slice(0,12)));}catch(e){}}
 var g=sec.querySelector('[data-xrv-grid]'),em=sec.querySelector('[data-xrv-empty]');
 if(g){var items=get().filter(function(x){return x.handle!==cur;}).slice(0,lim);
  g.innerHTML=items.map(function(p){return '<div class="card"><div class="card__media"><a href="'+esc(p.url)+'" class="card__img" tabindex="-1" aria-hidden="true">'+(p.img?'<img src="'+esc(p.img)+'" alt="'+esc(p.title)+'" loading="lazy">':'')+(p.img2?'<img src="'+esc(p.img2)+'" class="card__img2" alt="" loading="lazy">':'')+'</a><button type="button" class="card__wish" data-wish="'+esc(p.handle)+'" aria-label="Save to wishlist" aria-pressed="false"><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/></svg></button><button type="button" class="card__qa" data-quick-add="'+esc(p.handle)+'" aria-label="Quick buy '+esc(p.title)+'">+ Quick buy</button></div><a href="'+esc(p.url)+'" class="card__title">'+esc(p.title)+'</a>'+(p.type?'<span class="card__meta">'+esc(p.type)+'</span>':'')+'<div class="card__price"><b>'+esc(p.price)+'</b></div></div>';}).join('');
  if(em)em.hidden=items.length>0;}
 sec.addEventListener('click',function(e){var t=e.target.closest('[data-xrv-tab]');if(!t)return;var k=t.getAttribute('data-xrv-tab');
  sec.querySelectorAll('[data-xrv-tab]').forEach(function(b){var on=b===t;b.classList.toggle('is-on',on);b.setAttribute('aria-selected',on);});
  sec.querySelectorAll('[data-xrv-panel]').forEach(function(p){var on=p.getAttribute('data-xrv-panel')===k;p.hidden=!on;p.classList.toggle('is-on',on);if(on){p.classList.remove('is-enter');void p.offsetWidth;p.classList.add('is-enter');}});});}
function run(){document.querySelectorAll('[data-xrv]').forEach(init);}
if(document.readyState!=='loading')run();else document.addEventListener('DOMContentLoaded',run);document.addEventListener('shopify:section:load',run);})();


/* Thumbnail-rail gallery (12a): arrow cursor, click/arrow keys/swipe, dots, full-screen zoom */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia&&matchMedia('(hover: hover) and (pointer: fine)').matches;
  var p2=function(n){return (n<10?'0':'')+n;};
  var ARW='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
  var active=null;
  function init(g){
    if(g.__xrg)return;g.__xrg=1;
    var st=g.querySelector('[data-xrg-stage]'),S=[].slice.call(g.querySelectorAll('[data-xrg-s]')),n=S.length,i=0;
    var T=[].slice.call(g.querySelectorAll('[data-xrg-t]')),Dt=[].slice.call(g.querySelectorAll('[data-xrg-d]'));
    var cnt=g.querySelector('[data-xrg-cnt]'),mc=g.querySelector('[data-xrg-mcnt]'),cur=g.querySelector('[data-xrg-cur]'),zb=g.querySelector('[data-xrg-zoom]');
    function go(j){if(!n)return;j=((j%n)+n)%n;if(j===i&&S[j].classList.contains('is-on'))return paint();i=j;paint();
      S.forEach(function(s){var v=s.querySelector('video');if(v&&!v.paused)v.pause();});}
    function paint(){S.forEach(function(s,k){s.classList.toggle('is-on',k===i);s.classList.toggle('pp__m--lead',k===i);});
      T.forEach(function(t){var on=+t.getAttribute('data-xrg-t')===i;t.setAttribute('aria-current',on?'true':'false');});
      Dt.forEach(function(d,k){d.classList.toggle('is-on',k===i);});
      if(cnt)cnt.textContent=p2(i+1)+' / '+p2(n);if(mc)mc.textContent=(i+1)+' / '+n;if(g.__lbPaint)g.__lbPaint();}
    g.__xrgGo=function(id){for(var k=0;k<n;k++)if(S[k].getAttribute('data-media-id')===String(id)){go(k);return;}};
    g.__xrgStep=function(d){go(i+d);};g.__xrgIdx=function(){return i;};g.__xrgS=S;
    T.forEach(function(t){t.addEventListener('click',function(){go(+t.getAttribute('data-xrg-t'));});});
    Dt.forEach(function(d,k){d.addEventListener('click',function(e){e.stopPropagation();go(k);});});
    /* cursor follower */
    var cx=null,cy=0,tx=0,ty=0,raf=0;
    function put(){if(cur&&cx!=null)cur.style.translate=cx.toFixed(1)+'px '+cy.toFixed(1)+'px';}
    function run(){if(raf)return;var tick=function(){if(cx==null){raf=0;return;}var dx=tx-cx,dy=ty-cy;cx+=dx*.45;cy+=dy*.45;put();if(Math.abs(dx)>.3||Math.abs(dy)>.3)raf=requestAnimationFrame(tick);else{cx=tx;cy=ty;put();raf=0;}};raf=requestAnimationFrame(tick);}
    function pos(e){var r=st.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top,w:r.width};}
    if(fine&&n>1){
      st.addEventListener('mouseenter',function(e){var p=pos(e);cx=tx=p.x;cy=ty=p.y;put();st.classList.add('is-hover');st.classList.toggle('is-left',p.x<p.w/2);});
      st.addEventListener('mousemove',function(e){var p=pos(e);tx=p.x;ty=p.y;if(cx==null){cx=tx;cy=ty;}run();st.classList.toggle('is-left',p.x<p.w/2);st.classList.toggle('is-ovz',!!(e.target.closest&&e.target.closest('[data-xrg-zoom],video,iframe,model-viewer')));});
      st.addEventListener('mouseleave',function(){cx=null;st.classList.remove('is-hover','is-ovz');});
    }
    /* click halves / swipe */
    var sx=null,sy=0,swiped=false;
    st.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&fine)return;sx=e.clientX;sy=e.clientY;swiped=false;});
    st.addEventListener('pointerup',function(e){if(sx==null)return;var dx=e.clientX-sx,dy=e.clientY-sy;sx=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){swiped=true;go(i+(dx<0?1:-1));}});
    st.addEventListener('pointercancel',function(){sx=null;});
    st.addEventListener('click',function(e){if(swiped){swiped=false;return;}if(e.target.closest('[data-xrg-zoom]')){openLB(g);return;}if(e.target.closest('video,iframe,model-viewer,[data-xrg-d]'))return;if(n<2)return;var p=pos(e);go(i+(p.x<p.w/2?-1:1));});
    if(zb)zb.addEventListener('mouseenter',function(){st.classList.add('is-ovz');});
    /* arrow keys while the gallery is on screen */
    document.addEventListener('keydown',function(e){if(active&&active.g===g)return;var tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT'||(e.target&&e.target.isContentEditable))return;if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;if(document.querySelector('.drawer.is-open,.is-open[role=dialog]'))return;var r=st.getBoundingClientRect();if(r.bottom<80||r.top>innerHeight-80||!r.width)return;e.preventDefault();go(i+(e.key==='ArrowRight'?1:-1));});
  }
  /* full-screen view */
  var lb=null;
  function build(){
    lb=document.createElement('div');lb.className='xrg-lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Image viewer');
    lb.innerHTML='<div class="xrg-lb__bg" data-lb-close></div><div class="xrg-lb__in"><div class="xrg-lb__top"><span data-lb-cnt></span><span class="xrg-lb__hint" data-lb-hint></span><button type="button" class="xrg-lb__x" data-lb-close aria-label="Close">×</button></div><div class="xrg-lb__mid"><button type="button" class="xrg-lb__a" data-lb-prev aria-label="Previous image">'+ARW+'</button><div class="xrg-lb__box" data-lb-box><img data-lb-img alt=""></div><button type="button" class="xrg-lb__a xrg-lb__a--r" data-lb-next aria-label="Next image">'+ARW+'</button></div><div class="xrg-lb__thumbs" data-lb-thumbs></div></div>';
    document.body.appendChild(lb);
    var box=lb.querySelector('[data-lb-box]'),img=lb.querySelector('[data-lb-img]');
    lb.addEventListener('click',function(e){if(e.target.closest('[data-lb-close]'))closeLB();else if(e.target.closest('[data-lb-prev]'))step(-1);else if(e.target.closest('[data-lb-next]'))step(1);else{var t=e.target.closest('[data-lb-t]');if(t&&active)active.g.__xrgGo(t.getAttribute('data-lb-t'));}});
    function org(e){var r=box.getBoundingClientRect();img.style.transformOrigin=((e.clientX-r.left)/r.width*100)+'% '+((e.clientY-r.top)/r.height*100)+'%';}
    box.addEventListener('click',function(e){var z=!box.classList.contains('is-z');if(z)org(e);box.classList.toggle('is-z',z);hint();});
    box.addEventListener('mousemove',function(e){if(box.classList.contains('is-z'))org(e);});
    document.addEventListener('keydown',function(e){if(!active)return;if(e.key==='Escape')closeLB();else if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowLeft')step(-1);});
  }
  function hint(){var box=lb.querySelector('[data-lb-box]'),z=box.classList.contains('is-z');lb.querySelector('[data-lb-hint]').textContent=fine?(z?'Move to explore · click to zoom out':'Click image to zoom · ← → to browse · Esc to close'):(z?'Tap to zoom out':'Tap image to zoom');}
  function step(d){if(!active)return;lb.querySelector('[data-lb-box]').classList.remove('is-z');active.g.__xrgStep(d);}
  function paintLB(){if(!active||!lb)return;var g=active.g,S=g.__xrgS,i=g.__xrgIdx(),n=S.length,im=S[i].querySelector('img');var img=lb.querySelector('[data-lb-img]');
    if(im){var src=im.currentSrc||im.src;if(img.getAttribute('src')!==src){img.classList.add('is-swap');var nimg=new Image();nimg.onload=function(){img.src=src;requestAnimationFrame(function(){img.classList.remove('is-swap');});};nimg.src=src;}img.alt=im.alt||'';}
    lb.querySelector('[data-lb-cnt]').textContent=p2(i+1)+' / '+p2(n);
    [].slice.call(lb.querySelectorAll('[data-lb-t]')).forEach(function(t,k){t.setAttribute('aria-current',k===i?'true':'false');});
    lb.querySelector('[data-lb-prev]').hidden=lb.querySelector('[data-lb-next]').hidden=n<2;}
  function openLB(g){if(!lb)build();active={g:g};g.__lbPaint=paintLB;
    var th=lb.querySelector('[data-lb-thumbs]');th.innerHTML='';if(g.__xrgS.length>1)g.__xrgS.forEach(function(s,k){var im=s.querySelector('img');var b=document.createElement('button');b.type='button';b.setAttribute('data-lb-t',s.getAttribute('data-media-id')||k);b.setAttribute('aria-label','Show image '+(k+1));if(im){var c=document.createElement('img');c.src=im.currentSrc||im.src;c.alt='';b.appendChild(c);}th.appendChild(b);});
    lb.querySelector('[data-lb-box]').classList.remove('is-z');lb.querySelector('[data-lb-img]').removeAttribute('src');paintLB();hint();
    document.documentElement.classList.add('xrg-lock');requestAnimationFrame(function(){lb.classList.add('is-open');});setTimeout(function(){var x=lb.querySelector('.xrg-lb__x');if(x)x.focus({preventScroll:true});},50);}
  function closeLB(){if(!lb||!active)return;var g=active.g;lb.classList.remove('is-open');document.documentElement.classList.remove('xrg-lock');g.__lbPaint=null;active=null;var st=g.querySelector('[data-xrg-stage]');if(st)st.focus({preventScroll:true});}
  function all(){document.querySelectorAll('[data-xrg]').forEach(init);}
  if(document.readyState!=='loading')all();else document.addEventListener('DOMContentLoaded',all);
  document.addEventListener('shopify:section:load',all);
})();

/* Announcement bar country / currency selector */
(function(){
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-cc-toggle]');
    document.querySelectorAll('[data-ann-cc].is-open').forEach(function(w){if(!t||!w.contains(t)){if(!w.contains(e.target)){w.classList.remove('is-open');var b=w.querySelector('[data-cc-toggle]');if(b)b.setAttribute('aria-expanded','false');}}});
    if(t){var w=t.closest('[data-ann-cc]'),on=!w.classList.contains('is-open');w.classList.toggle('is-open',on);t.setAttribute('aria-expanded',on?'true':'false');}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')document.querySelectorAll('[data-ann-cc].is-open').forEach(function(w){w.classList.remove('is-open');});});
})();

/* Mobile: currency selector floats bottom-left (13r); desktop stays in the announcement bar (13s) */
(function(){var mq=window.matchMedia('(max-width: 989px)');var cc,home,ann,ph;
function place(){cc=cc||document.querySelector('[data-ann-cc]');if(!cc)return;if(!home){home=cc.parentNode;ann=cc.closest('.announce');ph=document.createComment('ann-cc');home.insertBefore(ph,cc);}
 if(mq.matches){if(cc.parentNode!==document.body){document.body.appendChild(cc);cc.classList.add('is-float');if(ann)ann.classList.remove('announce--cc');}}
 else if(cc.parentNode===document.body){ph.parentNode.insertBefore(cc,ph.nextSibling);cc.classList.remove('is-float');if(ann)ann.classList.add('announce--cc');}}
if(document.readyState!=='loading')place();else document.addEventListener('DOMContentLoaded',place);
(mq.addEventListener?mq.addEventListener('change',place):mq.addListener(place));document.addEventListener('shopify:section:load',function(){cc=null;home=null;place();});})();
