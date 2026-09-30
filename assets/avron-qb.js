/* Avron v1.3.2 quick buy override */
(function(){
  var R=window.routes||{},root=(R.root||'/').replace(/\/$/,'');
  function $(s,c){return (c||document).querySelector(s);}function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function imgUrl(s,w){if(!s)return '';if(s.indexOf('//')===0)s='https:'+s;return s+(s.indexOf('?')>-1?'&':'?')+'width='+w;}
  function money(c){return window.Avron&&window.Avron.money?window.Avron.money(c):'$'+(c/100).toFixed(2);}
  function findVariant(vs,sel){for(var i=0;i<vs.length;i++){var ok=true;for(var j=0;j<sel.length;j++){if(vs[i].options[j]!==sel[j]){ok=false;break;}}if(ok)return vs[i];}return null;}
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
    var q=e.target.closest('[data-quick-add]');if(!q)return;var body=$('#QuickBuy [data-quick-body]');if(!body||!window.Avron||!window.Avron.open)return;
    e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
    body.innerHTML='<p class="qb__loading">Loading&hellip;</p>';window.Avron.open('QuickBuy');
    fetch(root+'/products/'+q.getAttribute('data-quick-add')+'.js').then(function(r){return r.json();}).then(function(p){
      (p.options||[]).forEach(function(o,i){if(typeof o==='string')p.options[i]={name:o,values:p.variants.map(function(v){return v.options[i];}).filter(function(v,k,a){return a.indexOf(v)===k;})};});
      renderQuick(p,body);}).catch(function(){body.innerHTML='<p class="qb__loading">Could not load this product.</p>';});
  },true);
})();
