const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const state={current:null};let toastTimer;
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400)}
function isCoord(v,min,max){const n=Number(v);return Number.isFinite(n)&&n>=min&&n<=max}
function destination(){const name=$('#destName').value.trim()||'목적지';const lat=$('#destLat').value.trim();const lng=$('#destLng').value.trim();if(!isCoord(lat,-90,90)||!isCoord(lng,-180,180)){toast('목적지 위도·경도를 먼저 입력하세요.');return null}return{name,lat:Number(lat),lng:Number(lng)}}
function openSchemeWithFallback(scheme,fallback){let hidden=false;const onVis=()=>{if(document.hidden)hidden=true};document.addEventListener('visibilitychange',onVis,{once:true});location.href=scheme;setTimeout(()=>{if(!hidden&&fallback)location.href=fallback},1100)}
function openProvider(provider){const d=destination();if(!d&&provider!=='inavi'&&provider!=='tmap')return;const n=encodeURIComponent(d?.name||'목적지');
 if(provider==='kakao'){location.href=`https://map.kakao.com/link/to/${n},${d.lat},${d.lng}`;return}
 if(provider==='naver'){const scheme=`nmap://navigation?dlat=${d.lat}&dlng=${d.lng}&dname=${n}&appname=com.companda.navigation`;openSchemeWithFallback(scheme,`https://map.naver.com/`);return}
 if(provider==='google'){location.href=`https://www.google.com/maps/dir/?api=1&destination=${d.lat}%2C${d.lng}&travelmode=driving&dir_action=navigate`;return}
 if(provider==='tmap'){openSchemeWithFallback('tmap://','https://play.google.com/store/apps/details?id=com.skt.tmap.ku');return}
 if(provider==='inavi'){const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent);location.href=ios?'https://apps.apple.com/kr/app/id621155759':'https://play.google.com/store/apps/details?id=com.thinkware.inaviair';return}
}
function locate(){if(!navigator.geolocation){toast('이 브라우저는 위치 기능을 지원하지 않습니다.');return}const btn=$('#locateBtn');btn.disabled=true;$('#currentPos').textContent='위치 확인 중…';navigator.geolocation.getCurrentPosition(pos=>{state.current={lat:pos.coords.latitude,lng:pos.coords.longitude};$('#currentPos').textContent=`${state.current.lat.toFixed(6)}, ${state.current.lng.toFixed(6)}`;btn.disabled=false;toast('현재 위치를 확인했습니다.')},err=>{$('#currentPos').textContent='위치 권한 필요';btn.disabled=false;toast(err.code===1?'위치 권한을 허용해 주세요.':'현재 위치를 확인하지 못했습니다.')},{enableHighAccuracy:true,timeout:9000,maximumAge:30000})}
$$('.mode-tabs button').forEach(btn=>btn.addEventListener('click',()=>{$$('.mode-tabs button').forEach(x=>x.classList.toggle('active',x===btn));$$('.panel').forEach(p=>p.classList.remove('active'));$(`#${btn.dataset.mode}Panel`).classList.add('active')}));
$$('.launcher').forEach(btn=>btn.addEventListener('click',()=>openProvider(btn.dataset.provider)));$('#locateBtn').addEventListener('click',locate);
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
