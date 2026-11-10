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
    race(); save();
  }
  /* Demo race day so the live race page and its controls can be tried.
     Two brackets alternate: Super Stock (double elimination, 6 cars + 2 byes) and Masters (single elimination, 5 cars + 3 byes). */
  function race(){
    var F=window.FRB; if(!F){T.race_racers=[];T.race_heats=[];T.race_brackets=[];T.race_state=[{id:1,live:false}];T.shoutouts=[];return}
    var R=[["Maya R.","Northside Rockets","12","Goyette Mechanical","Super Stock"],["Jalen T.","Eastside Thunder","7","Ideal Group","Super Stock"],
      ["Ava M.","Calvin's Crew","21","United Way","Super Stock"],["Noah P.","Gravity Gang","3","Motor City Signs","Super Stock"],
      ["Zoe K.","Flint Flyers","44","Graphics Galore","Super Stock"],["Eli W.","Red Line Racing","18","Behind Your Design","Super Stock"],
      ["Mia S.","Brick Street Builders","9","Moonwalk Man","Masters"],["Leo D.","Vehicle City Velocity","30","Flint Community Schools","Masters"],
      ["Aria J.","Hilltop Hustle","15","Goyette Mechanical","Masters"],["Caleb B.","Southside Speed","27","Ideal Group","Masters"],["Nora F.","Checkered Dreams","5","United Way","Masters"]];
    T.race_racers=R.map(function(x,i){return{id:"rr"+i,display_name:x[0],team:x[1],car_number:x[2],sponsor:x[3],division:x[4]}});
    var a=F.build({name:"Super Stock",kind:"double",cars:6,byes:2,pairs:[["rr0","rr1"],["rr2","rr3"],["rr4",null],["rr5",null]]}),
        b=F.build({name:"Masters",kind:"single",cars:5,byes:3,pairs:[["rr6","rr7"],["rr8",null],["rr9",null],["rr10",null]]});
    a.bracket.sort_order=1;b.bracket.sort_order=2;
    var H=a.heats.concat(b.heats); F.order(H,[a.bracket,b.bracket],"alt"); H.sort(function(x,y){return x.sort_order-y.sort_order});
    /* race the first three heats, then put the fourth on the ramp for run 2 */
    var times=[[28.412,28.977,28.501,28.870],[28.851,28.603,28.790,28.655],[29.104,29.380,29.012,29.250]],n=0,cur=null;
    H.forEach(function(h){if(F.isBye(h)||cur)return;if(!h.lane1||!h.lane2)return;
      if(n<3){var t=times[n++];F.post(H,h.id,{a1:t[0],b1:t[1],a2:t[2],b2:t[3]})} else {cur=h;h.run=2;h.status="staging";h.a_time1=28.66;h.b_time1=28.94}});
    var now=Date.now();H.forEach(function(h,i){h.updated_at=new Date(now-(60-i)*6e4).toISOString()});
    T.race_brackets=[a.bracket,b.bracket]; T.race_heats=H;
    var P=[];((window.FR&&window.FR.PARTNERS)||[]).forEach(function(pg){pg.forEach(function(p){if(p.img&&!/your logo/i.test(p.name))P.push(p)})});
    T.race_ads=P.slice(0,6).map(function(p,i){return{id:"ad"+i,name:p.name,tagline:i===0?"Proud to support Flint racers":null,logo_url:p.img,active:true,sort_order:i}});
    T.race_racers.forEach(function(x,i){var m=T.race_ads.filter(function(a){return a.name.toLowerCase().indexOf(x.sponsor.split(" ")[0].toLowerCase())>=0})[0];if(m)x.logo_url=m.logo_url});
    T.race_heat_ads=T.race_ads.length?H.filter(function(h){return !F.isBye(h)}).map(function(h,i){return{heat_id:h.id,ad_id:T.race_ads[i%T.race_ads.length].id}}):[];
    T.race_show=[{id:1,screen:"race",int_title:null,int_until:null,ad_strip:true,feature_ad:null,feature_at:null,hype_text:null,hype_at:null,fact_text:"Soap box cars have no engines. Gravity does all the work.",pinned_shout:null}];
    T.race_roles=[];
    T.race_state=[{id:1,live:true,current_heat:cur?cur.id:null,banner:"DEMO RACE (test mode only). These names and times are made up.",updated_at:new Date().toISOString()}];
    var t=Date.now();
    T.shoutouts=[{id:"so1",name:"Grandma Pat",message:"Go Maya! The whole family is cheering at the finish line!",status:"approved",created_at:new Date(t-3e5).toISOString()},
      {id:"so2",name:"Coach Dee",message:"So proud of every builder out there today. You earned this ride.",status:"approved",created_at:new Date(t-2e5).toISOString()},
      {id:"so3",name:"Northside families",message:"Thank you volunteers for keeping the track running!",status:"approved",created_at:new Date(t-1e5).toISOString()},
      {id:"so4",name:"Uncle Ray",message:"Waiting for review: you can approve me in Admin > Race day > Shout-outs.",status:"pending",created_at:new Date(t).toISOString()}];
  }
  load();
  if(T&&!T.race_show){race();save();}
  addEventListener("storage",function(e){if(e.key===KEY)load()});
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
    else if(s.op==="insert"){(Array.isArray(s.row)?s.row:[s.row]).forEach(function(row){rows.push(Object.assign({id:rid(),created_at:new Date().toISOString()},s.t==="inquiries"?{status:"new"}:s.t==="shoutouts"?{status:"pending"}:{},JSON.parse(JSON.stringify(row))))});res={data:null,error:null}}
    else if(s.op==="upsert"){var i=rows.findIndex(function(r){return r.key===s.row.key});if(i>=0)rows[i]=s.row;else rows.push(s.row);res={data:null,error:null}}
    else if(s.op==="update"){rows.filter(m).forEach(function(r){Object.assign(r,s.row)});res={data:null,error:null}}
    else {T[s.t]=rows.filter(function(r){return !m(r)});res={data:null,error:null}}
    if(s.op!=="select") save();
    return Promise.resolve(res).then(ok,bad);
  };
  var files={};
  window.supabase={createClient:function(){return{
    from:function(t){return new Q(t)},
    rpc:function(fn,args){if(!T)seed();T.race_roles=T.race_roles||[];
      if(fn==="set_race_role"){T.race_roles=T.race_roles.filter(function(x){return x.role!==args.p_role});T.race_roles.push({role:args.p_role,user_id:"u-"+args.p_email,email:args.p_email});save();return Promise.resolve({data:args.p_email,error:null})}
      if(fn==="clear_race_role"){T.race_roles=T.race_roles.filter(function(x){return x.role!==args.p_role});save();return Promise.resolve({data:null,error:null})}
      return Promise.resolve({data:null,error:{message:"Unknown function"}})},
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
