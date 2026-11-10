/* ===== TEST MODE (Claude preview only) =====
   Stands in for Supabase so the admin portal, editing, events, notes and the questionnaire can be
   tried without a login. Everything is saved only in this browser (localStorage). */
(function(){
  window.FR_TEST=true;
  var KEY="fr-test-db-v1", T=null;
  function save(){try{localStorage.setItem(KEY,JSON.stringify(T))}catch(e){}}
  function load(){try{var s=localStorage.getItem(KEY);if(s)T=JSON.parse(s)}catch(e){}}
  function seed(){
    var ev=(window.FR&&window.FR.EVENTS)||[];
    T={events:ev.map(function(e,i){return{id:"ev"+i,start_date:e.d,end_date:e.e||null,title:e.t,kind:e.k,to_be_confirmed:!!e.tbc,published:true,description:null,created_at:new Date().toISOString()}}),
       bulletin_notes:[],site_content:[],admins:[{user_id:"test-admin"}],
       inquiries:[{id:"inq-sample",created_at:new Date().toISOString(),first_name:"Sample",last_name:"Family",role:"Parent or guardian",organization:null,
         interests:"Building Workshops",youth_count:2,youth_ages:"9 and 12",message:"This is a sample inquiry so you can see how they look.",email:"sample@example.com",
         phone:null,contact_by:"Email",best_time:"Evening",email_updates:true,status:"new"}]};
    save();
  }
  load();
  var user={id:"test-admin",email:"test-admin@flintracing.org"}, listeners=[];
  function rid(){return Math.random().toString(36).slice(2,10)}
  function Q(t){this.t=t;this.f=[];this.op="select";this.row=null;this.single=false;this.head=false;this.ord=null}
  Q.prototype.select=function(c,o){if(o&&o.head)this.head=true;return this};
  Q.prototype.order=function(col,o){this.ord=[col,!(o&&o.ascending===false)];return this};
  Q.prototype.limit=function(){return this};
  Q.prototype.eq=function(k,v){this.f.push([k,v]);return this};
  Q.prototype.maybeSingle=function(){this.single=true;return this};
  Q.prototype.insert=function(r){this.op="insert";this.row=r;return this};
  Q.prototype.upsert=function(r){this.op="upsert";this.row=r;return this};
  Q.prototype.update=function(r){this.op="update";this.row=r;return this};
  Q.prototype.delete=function(){this.op="delete";return this};
  Q.prototype.then=function(ok,bad){
    if(!T) seed();
    var s=this, rows=T[s.t]||(T[s.t]=[]), m=function(r){return s.f.every(function(f){return r[f[0]]===f[1]})}, res;
    if(s.op==="select"){var d=rows.filter(m).slice();
      if(s.ord){var c=s.ord[0],asc=s.ord[1];d.sort(function(a,b){return (a[c]>b[c]?1:a[c]<b[c]?-1:0)*(asc?1:-1)})}
      res=s.head?{data:null,count:d.length,error:null}:{data:s.single?(d[0]||null):JSON.parse(JSON.stringify(d)),error:null}}
    else if(s.op==="insert"){rows.push(Object.assign({id:rid(),created_at:new Date().toISOString()},s.t==="inquiries"?{status:"new"}:{},s.row));res={data:null,error:null}}
    else if(s.op==="upsert"){var i=rows.findIndex(function(r){return r.key===s.row.key});if(i>=0)rows[i]=s.row;else rows.push(s.row);res={data:null,error:null}}
    else if(s.op==="update"){rows.filter(m).forEach(function(r){Object.assign(r,s.row)});res={data:null,error:null}}
    else {T[s.t]=rows.filter(function(r){return !m(r)});res={data:null,error:null}}
    if(s.op!=="select") save();
    return Promise.resolve(res).then(ok,bad);
  };
  var files={};
  window.supabase={createClient:function(){return{
    from:function(t){return new Q(t)},
    auth:{getSession:function(){return Promise.resolve({data:{session:user?{user:user}:null}})},
      onAuthStateChange:function(cb){listeners.push(cb)},
      signInWithPassword:function(){user={id:"test-admin",email:"test-admin@flintracing.org"};listeners.forEach(function(cb){cb("SIGNED_IN",{user:user})});return Promise.resolve({error:null})},
      signUp:function(){return Promise.resolve({error:null})},
      resetPasswordForEmail:function(){return Promise.resolve({error:null})},
      signOut:function(){user=null;listeners.forEach(function(cb){cb("SIGNED_OUT",null)});return Promise.resolve({})}},
    storage:{from:function(){return{
      upload:function(path,file){return new Promise(function(res){
        /* shrink the photo so test data fits in browser storage */
        var url=URL.createObjectURL(file),img=new Image();
        img.onload=function(){var w=Math.min(1200,img.naturalWidth),h=Math.round(img.naturalHeight*w/img.naturalWidth),c=document.createElement("canvas");c.width=w;c.height=h;
          c.getContext("2d").drawImage(img,0,0,w,h);files[path]=c.toDataURL("image/jpeg",0.82);URL.revokeObjectURL(url);res({error:null})};
        img.onerror=function(){res({error:{message:"Not an image"}})};img.src=url;})},
      getPublicUrl:function(p){return{data:{publicUrl:files[p]||""}}}}}}
  }}};
  window.FR_TEST_RESET=function(){try{localStorage.removeItem(KEY)}catch(e){}location.reload()};
})();
