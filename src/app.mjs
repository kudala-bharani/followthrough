import {todayLocal,dayNumber,validateRecord,validateEnvelope,daysWaiting,dueDate,isDue,logFollowUp} from './model.mjs';
import {load,save} from './storage.mjs';
const $=id=>document.getElementById(id);
let data={schemaVersion:1,applications:[]}, view='follow', blocked=false, pendingImport=null;
const formatDate=value=>new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(dayNumber(value)*86400000));
function announce(message){$('notice').textContent=message;}
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function commit(next){
  try{const clean=save(window.localStorage,next);data=clean;blocked=false;$('storage-warning').hidden=true;return true;}
  catch(error){$('storage-warning').hidden=false;$('storage-warning').textContent=`Could not save. Your changes were not applied. Browser storage may be blocked or full. Back up your current list and try again. ${error.message}`;return false;}
}
function applyRecord(id,action){
 const record=data.applications.find(item=>item.id===id);if(!record||blocked)return;
 try{
  const updated=action==='follow'?logFollowUp(record):validateRecord({...record,status:action});
  if(commit({...data,applications:data.applications.map(item=>item.id===id?updated:item)})){
   render();announce(action==='follow'?`Follow-up logged for ${record.company}. Next follow-up: ${formatDate(dueDate(updated))}.`:`${record.company} marked ${action}.`);
   $(view==='follow'?'follow-view':'all-view').focus();
  }
 }catch(error){announce(error.message);}
}
function actionButton(text,action,record,subtle=false){const button=element('button',subtle?'subtle':'',text);button.type='button';button.disabled=blocked;button.setAttribute('aria-label',`${text}: ${record.company}, ${record.role}`);button.addEventListener('click',()=>applyRecord(record.id,action));return button;}
function card(record){
 const item=element('article','application');const initial=record.company.trim().slice(0,2).toUpperCase();const logo=element('span','monogram',initial);logo.setAttribute('aria-hidden','true');item.append(logo);
 const content=element('div','card-content');content.append(element('h3','company-name',record.company),element('p','role-name',record.role));content.append(element('p','meta',`Applied ${formatDate(record.appliedDate)}${record.lastFollowUpDate?' · Last follow-up '+formatDate(record.lastFollowUpDate):''}`));
 const due=isDue(record),days=daysWaiting(record);let reason=record.status==='waiting'?`${days} ${days===1?'day':'days'} since ${record.lastFollowUpDate?'your last follow-up':'you applied'}. ${due?'Ready for a check-in.':'Next follow-up '+formatDate(dueDate(record))+'.'}`:record.status==='replied'?'A reply is in. No follow-up reminder needed.':'Closed and kept here for your records.';
 content.append(element('p','reason',reason));item.append(content);
 const right=element('div','card-right');right.append(element('span',`badge ${due?'due':record.status}`,due?'Follow-up due':record.status[0].toUpperCase()+record.status.slice(1)));
 const actions=element('div','card-actions');if(record.status==='waiting'){
   const follow=actionButton(record.lastFollowUpDate===todayLocal()?'Logged today':'Log follow-up','follow',record);follow.disabled=blocked||record.lastFollowUpDate===todayLocal();actions.append(follow,actionButton('Mark replied','replied',record,true),actionButton('Close','closed',record,true));
 }else{actions.append(actionButton('Mark waiting','waiting',record,true));if(record.status==='replied')actions.append(actionButton('Close','closed',record,true));else actions.append(actionButton('Mark replied','replied',record,true));}
 right.append(actions);item.append(right);return item;
}
function render(){
 const due=data.applications.filter(record=>isDue(record));$('due-count').textContent=due.length;$('queue-count').textContent=due.length;$('waiting-count').textContent=data.applications.filter(record=>record.status==='waiting').length;$('replied-count').textContent=data.applications.filter(record=>record.status==='replied').length;
 $('follow-view').setAttribute('aria-pressed',String(view==='follow'));$('all-view').setAttribute('aria-pressed',String(view==='all'));
 $('view-title').textContent=view==='follow'?'Time to reconnect':'Every application, in one place';$('view-description').textContent=view==='follow'?'A small follow-up can keep a conversation moving.':'Keep track of where things stand, from first step to next chapter.';
 const records=(view==='follow'?due:[...data.applications]).sort((a,b)=>daysWaiting(b)-daysWaiting(a)||a.company.localeCompare(b.company));
 $('record-count').textContent=`${records.length} ${records.length===1?'application':'applications'}`;$('applications').replaceChildren(...records.map(card));$('add').disabled=blocked;$('export').disabled=blocked;
 if(!records.length){const empty=element('div','empty');empty.append(element('div','empty-icon',data.applications.length?'✓':'↗'),element('h3','',data.applications.length?'You’re all caught up.':'Your next chapter starts here.'));empty.append(element('p','',data.applications.length?'Nothing needs a follow-up right now. Your waiting applications will appear here when it’s time.':'Add your first application. We’ll help you keep track of the right moment to reach out.'));const button=element('button','secondary',data.applications.length?'View all applications':'Add your first application');button.disabled=blocked;button.addEventListener('click',()=>data.applications.length?setView('all'):openForm());empty.append(button);$('applications').append(empty);}
}
function setView(next){view=next;render();}
function clearErrors(){for(const id of ['company','role','applied-date'])$(id).removeAttribute('aria-invalid');for(const id of ['company-error','role-error','date-error','form-error'])$(id).textContent='';}
function openForm(){if(blocked)return;$('application-form').reset();clearErrors();$('applied-date').value=todayLocal();$('applied-date').max=todayLocal();$('application-dialog').showModal();$('company').focus();}
$('add').addEventListener('click',openForm);for(const id of ['close-form','cancel-form'])$(id).addEventListener('click',()=>$('application-dialog').close());$('follow-view').addEventListener('click',()=>setView('follow'));$('all-view').addEventListener('click',()=>setView('all'));
$('application-form').addEventListener('submit',event=>{
 event.preventDefault();clearErrors();let first=null;
 function error(id,target,message){$(target).textContent=message;$(id).setAttribute('aria-invalid','true');first??=$(id);}
 if(!$('company').value.trim())error('company','company-error','Enter a company name.');if(!$('role').value.trim())error('role','role-error','Enter a role.');
 try{if(dayNumber($('applied-date').value)>dayNumber(todayLocal()))throw Error('Application date cannot be in the future.');}catch(err){error('applied-date','date-error',err.message);}
 if(first){first.focus();return;}
 try{const record=validateRecord({id:crypto.randomUUID(),company:$('company').value,role:$('role').value,appliedDate:$('applied-date').value,status:$('status').value,lastFollowUpDate:null});if(blocked)throw Error('Restore a valid backup before adding applications.');if(commit({...data,applications:[...data.applications,record]})){$('application-dialog').close();render();announce(`Saved ${record.company}. ${isDue(record)?'It’s ready for a follow-up.':'You can find it in All applications.'}`);$('add').focus();}else{$('form-error').textContent='Could not save. Your entries are still here. Check browser storage and try again.';}}catch(err){$('form-error').textContent=err.message;}
});
$('export').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`followthrough-backup-${todayLocal()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Backup download requested. Keep the JSON file somewhere safe.');
});
$('import').addEventListener('click',()=>{$('import-file').value='';$('import-file').click();});
$('import-file').addEventListener('change',async()=>{
 const file=$('import-file').files[0];if(!file)return;
 try{if(file.size>5*1024*1024)throw Error('Choose a backup smaller than 5 MB.');pendingImport=validateEnvelope(JSON.parse(await file.text()));$('import-summary').textContent=`This backup has ${pendingImport.applications.length} applications. Your current list has ${data.applications.length}.${blocked?' Existing unreadable browser data will also be replaced.':''}`;$('import-dialog').showModal();$('cancel-import').focus();}
 catch(error){pendingImport=null;announce(`Import rejected: ${error.message} Nothing was changed.`);}
});
$('cancel-import').addEventListener('click',()=>$('import-dialog').close());$('import-dialog').addEventListener('close',()=>{pendingImport=null;});
$('confirm-import').addEventListener('click',()=>{if(!pendingImport)return;if(commit(pendingImport)){$('import-dialog').close();render();announce('Backup imported. Your application list has been replaced.');}else{$('import-dialog').close();}});
function refresh(){try{data=load(window.localStorage);blocked=false;$('storage-warning').hidden=true;}catch(error){blocked=true;$('storage-warning').hidden=false;$('storage-warning').textContent=`Saved data could not be read. It has not been overwritten. Adding and updating are paused. If you have a valid backup, use Import to restore it, or check browser storage permissions. ${error.message}`;}render();}
window.addEventListener('storage',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});let renderedDay=todayLocal();setInterval(()=>{const now=todayLocal();if(now!==renderedDay){renderedDay=now;render();}},60000);refresh();
