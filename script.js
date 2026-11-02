"use strict";
document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector, parent=document) => parent.querySelector(selector);
  const money = amount => new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(amount);
  const menuFallback = [{"id": "boss", "name": "Lakaze Boss Kota", "price": 85, "image": "assets/ko5.jpg", "description": "Russian sausage, cheese, bacon, egg, polony and slap chips.", "category": "Kota"}, {"id": "supreme", "name": "Soweto Supreme", "price": 95, "image": "assets/ko6.jpg", "description": "Braaied beef, smoked ham, mozzarella, chips and chakalaka.", "category": "Kota"}, {"id": "chicken", "name": "BBQ Pulled Chicken Kota", "price": 78, "image": "assets/ko.jpg", "description": "BBQ chicken, coleslaw, chips and melted cheese.", "category": "Kota"}, {"id": "veggie", "name": "Veggie Deluxe", "price": 70, "image": "assets/kov.jpg", "description": "Halloumi, avocado, chips, egg, lettuce and sweet chilli mayo.", "category": "Kota"}, {"id": "premium", "name": "Premium Event Catering", "price": 185, "image": "assets/kod.jpg", "description": "Starting price per guest; final quotation subject to confirmation.", "category": "Catering"}, {"id": "standard", "name": "Standard Catering", "price": 155, "image": "assets/kop.jpg", "description": "Starting price per guest; final quotation subject to confirmation.", "category": "Catering"}, {"id": "basic", "name": "Basic Catering", "price": 95, "image": "assets/kos.jpg", "description": "Starting price per guest; final quotation subject to confirmation.", "category": "Catering"}];
  let menu = menuFallback;
  const menuButton = $('#menuBtn'), navigation = $('#navLinks');
  menuButton?.addEventListener('click', () => { const opened=navigation.classList.toggle('show'); menuButton.setAttribute('aria-expanded',String(opened)); });
  // Fetch JSON when hosted; embedded fallback also works when opened as file://.
  fetch('js/menu-data.json').then(response=>{if(!response.ok) throw Error('Menu unavailable');return response.json()}).then(data=>{if(Array.isArray(data)&&data.length){menu=data;renderMenu();setupCalculator();}}).catch(()=>{});
  function renderMenu(){
    const container=$('#dynamicMenu'); if(!container)return;
    const term=($('#menuSearch')?.value||'').toLowerCase().trim(), sort=$('#menuSort')?.value||'default';
    let results=menu.filter(item=>(item.name+' '+item.description+' '+item.category).toLowerCase().includes(term));
    if(sort==='low')results.sort((a,b)=>a.price-b.price);if(sort==='high')results.sort((a,b)=>b.price-a.price);if(sort==='name')results.sort((a,b)=>a.name.localeCompare(b.name));
    container.replaceChildren();
    for(const item of results){const card=document.createElement('article');card.className='card reveal visible';
      const picture=document.createElement('img');picture.src=item.image;picture.alt=item.name+' served by Lakaze';picture.loading='lazy';picture.className='menu-photo';
      const body=document.createElement('div');body.className='card-body';
      const title=document.createElement('h3');title.textContent=item.name;
      const desc=document.createElement('p');desc.textContent=item.description;
      const price=document.createElement('strong');price.className='price-tag';price.textContent=money(item.price)+(item.category==='Catering'?' / guest (from)':'');
      const action=document.createElement('a');action.className='btn';action.href='enquiry.html?item='+encodeURIComponent(item.id);action.textContent='Calculate order';
      body.append(title,desc,price,document.createElement('br'),action);card.append(picture,body);container.append(card);
    }
    if(!results.length)container.textContent='No matching menu items found.';
  }
  $('#menuSearch')?.addEventListener('input',renderMenu);$('#menuSort')?.addEventListener('change',renderMenu);renderMenu();
  function setupCalculator(){const select=$('#orderItem');if(!select)return;
    const previous=select.value;select.replaceChildren();for(const item of menu){const option=document.createElement('option');option.value=item.id;option.textContent=item.name+' — '+money(item.price)+(item.category==='Catering'?' per guest (from)':'');select.append(option)}
    const requested=new URLSearchParams(location.search).get('item');if(menu.some(item=>item.id===(requested||previous)))select.value=requested||previous;calculate();}
  function calculate(){const item=menu.find(x=>x.id===$('#orderItem')?.value);const qty=Number($('#orderQty')?.value);const output=$('#orderTotal');if(!item||!output)return;
    if(!Number.isSafeInteger(qty)||qty<1||qty>1000){output.textContent='Enter a quantity between 1 and 1,000.';return;}
    const total=item.price*qty;output.textContent=`${qty} × ${money(item.price)} = ${money(total)}${item.category==='Catering'?' (estimated starting price)':''}`;
    const summary=$('#orderSummary');if(summary)summary.value=`${item.name}; quantity/guests: ${qty}; estimated total: ${money(total)}${item.category==='Catering'?' (from)':''}`;
  }
  $('#orderItem')?.addEventListener('change',calculate);$('#orderQty')?.addEventListener('input',calculate);setupCalculator();
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08}):null;
  document.querySelectorAll('main section, .card, .service-card').forEach(el=>{el.classList.add('reveal');if(observer)observer.observe(el);else el.classList.add('visible')});
  // Accessible image lightbox: Escape or backdrop click closes it.
  const gallery=$('main') && (location.pathname.endsWith('gallery.html'));
  if(gallery){const dialog=document.createElement('dialog');dialog.className='lightbox';dialog.innerHTML='<button type="button" class="lightbox-close" aria-label="Close image">×</button><img alt=""><p></p>';document.body.append(dialog);
    document.querySelectorAll('main img').forEach(img=>{img.tabIndex=0;img.classList.add('zoomable');const open=()=>{dialog.querySelector('img').src=img.currentSrc||img.src;dialog.querySelector('img').alt=img.alt;dialog.querySelector('p').textContent=img.alt;dialog.showModal()};img.addEventListener('click',open);img.addEventListener('keydown',e=>{if(e.key==='Enter')open()})});dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});}
  const phoneOk=value=>/^(?:\+27|0)[6-8][0-9]{8}$/.test(value.replace(/[\s-]/g,''));
  for(const form of document.querySelectorAll('.demo-form')){
    form.addEventListener('submit',async event=>{event.preventDefault();const result=$('.result',form);if(!form.reportValidity())return;
      const phone=$('input[name="phone"]',form);if(phone?.value&&!phoneOk(phone.value)){result.textContent='Enter a valid South African mobile number (e.g. 0821234567).';return;}
      if(form.id==='enquiryForm'){calculate();const summary=$('#orderSummary')?.value||'';const details=$('#details');if(details&&summary&&!details.value.includes(summary))details.value+='\n'+summary;result.textContent='Estimated order: '+($('#orderTotal')?.textContent||'')+'. This is an estimate, not a confirmed order. Submit using the configured email service to request confirmation.';}
      const action=form.getAttribute('action');if(!action||action==='#'){result.textContent+=' Form delivery is not configured yet; connect a verified form endpoint after deployment.';return;}
      const submit=$('button[type="submit"]',form);submit.disabled=true;
      try{const response=await fetch(action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});if(!response.ok)throw Error('Submission failed');result.textContent='Your message has been submitted successfully.';form.reset();}
      catch(error){result.textContent='Could not send the message. Please try again or call the business.';}finally{submit.disabled=false;}
    });
  }
});