// ---- src/core/math.ts ----
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const wrap01=(v)=>((v%1)+1)%1;
const angleDelta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const lerpAngle=(a,b,t)=>{let d=((b-a+Math.PI)%(Math.PI*2))-Math.PI;return a+d*t;};
const dist2=(ax,az,bx,bz)=>Math.hypot(ax-bx,az-bz);
const smoothstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const mat4Identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function mat4Multiply(a,b){
 const o=new Float32Array(16);
 for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
 return o;
}
function mat4Perspective(fov,aspect,near,far){
 const f=1/Math.tan(fov/2),nf=1/(near-far);const o=new Float32Array(16);
 o[0]=f/aspect;o[5]=f;o[10]=(far+near)*nf;o[11]=-1;o[14]=2*far*near*nf;return o;
}
function mat4LookAt(ex,ey,ez,tx,ty,tz,ux=0,uy=1,uz=0){
 let zx=ex-tx,zy=ey-ty,zz=ez-tz;let zl=Math.hypot(zx,zy,zz)||1;zx/=zl;zy/=zl;zz/=zl;
 let xx=uy*zz-uz*zy,xy=uz*zx-ux*zz,xz=ux*zy-uy*zx;let xl=Math.hypot(xx,xy,xz)||1;xx/=xl;xy/=xl;xz/=xl;
 let yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;
 return new Float32Array([xx,yx,zx,0,xy,yy,zy,0,xz,yz,zz,0,-(xx*ex+xy*ey+xz*ez),-(yx*ex+yy*ey+yz*ez),-(zx*ex+zy*ey+zz*ez),1]);
}
function mat4Model(x,y,z,yaw=0,sx=1,sy=1,sz=1,pitch=0,roll=0){
 const cy=Math.cos(yaw),syaw=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),cr=Math.cos(roll),sr=Math.sin(roll);
 const r00=cy*cr+syaw*sp*sr,r01=sr*cp,r02=-syaw*cr+cy*sp*sr;
 const r10=-cy*sr+syaw*sp*cr,r11=cr*cp,r12=sr*syaw+cy*sp*cr;
 const r20=syaw*cp,r21=-sp,r22=cy*cp;
 return new Float32Array([r00*sx,r01*sx,r02*sx,0,r10*sy,r11*sy,r12*sy,0,r20*sz,r21*sz,r22*sz,0,x,y,z,1]);
}


// ---- src/data/config.ts ----
const VEHICLE={
 mass:795,wheelbase:3.55,
 maxEngineAccel:13.8,maxBrake:31.5,
 baseDrag:.00118,straightDrag:.00088,
 cornerAeroGrip:.000118,straightAeroGrip:.000072,
 maxSteerLow:.50,steerSpeedScale:35,steerExponent:1.12,
 steerRate:3.4,recenterRate:4.6,
 collisionRadius:2.05,
 baseLateralG:1.15,
 grassGrip:.34,runoffGrip:.72,
 pitSpeed:22.22
};
const TYRES={
 SOFT:{grip:1.08,wearRate:1.55,wet:0.30,warm:1.0},
 MEDIUM:{grip:1.0,wearRate:1.0,wet:0.34,warm:.9},
 HARD:{grip:.94,wearRate:.66,wet:.37,warm:.78},
 INTERMEDIATE:{grip:.87,wearRate:1.08,wet:.93,warm:.88},
 WET:{grip:.79,wearRate:.82,wet:1.12,warm:.82}
};
const AI_DIFFICULTY={
 Easy:{pace:.90,brake:.88,error:.022,energy:.64,attack:.78},
 Medium:{pace:.985,brake:.97,error:.010,energy:.84,attack:1.0},
 Hard:{pace:1.035,brake:1.02,error:.004,energy:.98,attack:1.14}
};
const GEARS=[0,75,112,148,184,220,257,294,340];
const DEFAULT_SETTINGS={
 volume:.55,camera:0,traction:'MEDIUM',abs:true,automatic:true,
 racingLine:'CORNERS',steeringAssist:'OFF',aiDifficulty:'Medium',graphics:'HIGH'
};


// ---- src/data/teams.ts ----
const TEAMS=[
 ['Apex GP','#e9ff45',['Alex Stone','Marco Vega']],['Scuderia Rosso','#e43635',['Luca Moretti','Enzo Ricci']],['Orion Motorsport','#6259ff',['Ethan Cole','Noah Park']],['Silver Arrow Racing','#b8c4c8',['Mikael Frost','Jonas Hart']],['Velocity Works','#ff8a2d',['Theo Archer','Callum Reed']],['Pacific Racing','#1f8fff',['Ren Sato','Kai Nakamura']],['Nova Engineering','#e45cff',['Sofia Marin','Elena Costa']],['Titan GP','#d9a62e',['Victor Hale','Roman Kovac']],['Falcon Motorsport','#21c987',['Leo Vega','Owen Price']],['Genesis Racing','#47d7e8',['Daniel Kim','Isaac Moon']],['Atlas Formula','#f2f2f2',['Mateo Silva','Nico Laurent']]
].map((t,teamIndex)=>({name:t[0],color:t[1],drivers:t[2].map((name,carIndex)=>({name,abbr:name.split(' ').map(x=>x[0]).join('').slice(0,3).toUpperCase(),number:teamIndex*2+carIndex+1,teamIndex,pace:.965+(((teamIndex*7+carIndex*3)%11)-5)*.004,aggression:.45+((teamIndex*13+carIndex*5)%40)/100,consistency:.82+((teamIndex*5+carIndex)%15)/100,tyreManagement:.86+((teamIndex*3+carIndex*7)%13)/100,wetSkill:.84+((teamIndex*11+carIndex*2)%14)/100}))}));
const DRIVERS=TEAMS.flatMap(t=>t.drivers.map(d=>({...d,team:t.name,color:t.color})));


// ---- src/rendering/WebGLRenderer.ts ----

class Mesh{
 constructor(gl,vertices,indices){
  this.gl=gl;this.count=indices.length;this.vbo=gl.createBuffer();this.ibo=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibo);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(indices),gl.STATIC_DRAW);
 }
}
const VS=`#version 300 es
precision highp float;layout(location=0)in vec3 p;layout(location=1)in vec3 n;uniform mat4 mvp;uniform mat4 model;out float light;void main(){vec3 nn=normalize(mat3(model)*n);light=.36+.64*max(dot(nn,normalize(vec3(.3,1.,.15))),0.);gl_Position=mvp*vec4(p,1.);}`;
const FS=`#version 300 es
precision highp float;uniform vec4 color;in float light;out vec4 outColor;void main(){outColor=vec4(color.rgb*light,color.a);}`;
function shader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s}
function program(gl){const p=gl.createProgram();gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,VS));gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,FS));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');return p}
class WebGLRenderer{
 constructor(canvas){
  this.canvas=canvas;this.gl=canvas.getContext('webgl2',{antialias:true,alpha:false});if(!this.gl)throw new Error('WebGL2 is required');
  this.program=program(this.gl);this.mvpLoc=this.gl.getUniformLocation(this.program,'mvp');this.modelLoc=this.gl.getUniformLocation(this.program,'model');this.colorLoc=this.gl.getUniformLocation(this.program,'color');
  this.view=mat4Identity();this.proj=mat4Identity();this.camera={x:0,y:20,z:20,tx:0,ty:0,tz:0,fov:68};
  this.gl.enable(this.gl.DEPTH_TEST);this.gl.enable(this.gl.CULL_FACE);this.gl.cullFace(this.gl.BACK);this.resize();
 }
 resize(){const d=Math.min(devicePixelRatio||1,1.6),w=Math.max(1,Math.floor(this.canvas.clientWidth*d)),h=Math.max(1,Math.floor(this.canvas.clientHeight*d));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}this.gl.viewport(0,0,w,h)}
 begin(clear=[0.47,0.68,0.79,1]){this.resize();const gl=this.gl;gl.clearColor(...clear);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);this.proj=mat4Perspective(this.camera.fov*Math.PI/180,this.canvas.width/this.canvas.height,.2,5000);this.view=mat4LookAt(this.camera.x,this.camera.y,this.camera.z,this.camera.tx,this.camera.ty,this.camera.tz);gl.useProgram(this.program)}
 draw(mesh,model,color){const gl=this.gl;const m=model||mat4Identity();const mvp=mat4Multiply(this.proj,mat4Multiply(this.view,m));gl.bindBuffer(gl.ARRAY_BUFFER,mesh.vbo);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.ibo);gl.uniformMatrix4fv(this.mvpLoc,false,mvp);gl.uniformMatrix4fv(this.modelLoc,false,m);gl.uniform4fv(this.colorLoc,color);gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_INT,0)}
 model(...args){return mat4Model(...args)}
 createBox(){const v=[
 -1,-1,1,0,0,1, 1,-1,1,0,0,1, 1,1,1,0,0,1, -1,1,1,0,0,1,
 1,-1,-1,0,0,-1,-1,-1,-1,0,0,-1,-1,1,-1,0,0,-1,1,1,-1,0,0,-1,
 -1,1,1,0,1,0,1,1,1,0,1,0,1,1,-1,0,1,0,-1,1,-1,0,1,0,
 -1,-1,-1,0,-1,0,1,-1,-1,0,-1,0,1,-1,1,0,-1,0,-1,-1,1,0,-1,0,
 1,-1,1,1,0,0,1,-1,-1,1,0,0,1,1,-1,1,0,0,1,1,1,1,0,0,
 -1,-1,-1,-1,0,0,-1,-1,1,-1,0,0,-1,1,1,-1,0,0,-1,1,-1,-1,0,0];
 const i=[];for(let f=0;f<6;f++){const o=f*4;i.push(o,o+1,o+2,o,o+2,o+3)}return new Mesh(this.gl,v,i)}
 createPlane(size=4000){return new Mesh(this.gl,[-size,0,-size,0,1,0,size,0,-size,0,1,0,size,0,size,0,1,0,-size,0,size,0,1,0],[0,2,1,0,3,2])}
}


// ---- src/track/GrandstoneTrack.ts ----


const CONTROL=[
 [0,0],[260,-15],[540,-30],[820,30],[1030,160],[1110,340],[1030,520],[820,610],[620,560],[470,430],[360,280],[250,180],[90,160],[-90,250],[-220,430],[-410,510],[-620,470],[-760,330],[-720,130],[-570,-40],[-370,-130],[-180,-90]
];
function catmull(p0,p1,p2,p3,t){const t2=t*t,t3=t2*t;return [.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]}
function stripMesh(renderer,pts,leftOffset,rightOffset,y=.02,closed=true){
 const v=[],ind=[],n=pts.length;
 for(const s of pts){
  const lx=s.x+s.nx*leftOffset,lz=s.z+s.nz*leftOffset;
  const rx=s.x+s.nx*rightOffset,rz=s.z+s.nz*rightOffset;
  v.push(lx,y,lz,0,1,0,rx,y,rz,0,1,0);
 }
 const limit=closed?n:n-1;
 for(let i=0;i<limit;i++){
  const ni=(i+1)%n,a=i*2,b=ni*2;
  // upward-facing winding
  ind.push(a,a+1,b, a+1,b+1,b);
 }
 return new Mesh(renderer.gl,v,ind);
}
class GrandstoneTrack{
 constructor(){
  this.width=8.8;this.runoff=18;this.samples=[];this.length=0;const per=36,n=CONTROL.length;let last=null;
  for(let i=0;i<n;i++)for(let s=0;s<per;s++){
   const p=catmull(CONTROL[(i-1+n)%n],CONTROL[i],CONTROL[(i+1)%n],CONTROL[(i+2)%n],s/per);
   if(last)this.length+=Math.hypot(p[0]-last.x,p[1]-last.z);
   this.samples.push({x:p[0],z:p[1],distance:this.length,progress:0,tx:0,tz:0,nx:0,nz:0,curvature:0,targetSpeed:82});last={x:p[0],z:p[1]}
  }
  this.length+=Math.hypot(this.samples[0].x-last.x,this.samples[0].z-last.z);
  for(let i=0;i<this.samples.length;i++){
   const a=this.samples[(i-1+this.samples.length)%this.samples.length],b=this.samples[i],c=this.samples[(i+1)%this.samples.length];
   let tx=c.x-a.x,tz=c.z-a.z,l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;b.tx=tx;b.tz=tz;b.nx=-tz;b.nz=tx;b.progress=b.distance/this.length;
   const h1=Math.atan2(b.z-a.z,b.x-a.x),h2=Math.atan2(c.z-b.z,c.x-b.x);const d=Math.abs(Math.atan2(Math.sin(h2-h1),Math.cos(h2-h1)));
   b.curvature=d/Math.max(3.5,Math.hypot(c.x-b.x,c.z-b.z));
   // profile targets roughly 105–330 km/h; physics still decides if the car can hold it
   b.targetSpeed=clamp(Math.sqrt(7.35/Math.max(.00092,b.curvature)),29,91.5);
  }
  // backwards braking envelope + light smoothing
  for(let pass=0;pass<8;pass++)for(let i=this.samples.length-1;i>=0;i--){const cur=this.samples[i],next=this.samples[(i+1)%this.samples.length],ds=Math.max(1,Math.hypot(next.x-cur.x,next.z-cur.z)),allowed=Math.sqrt(next.targetSpeed*next.targetSpeed+2*19.2*ds);cur.targetSpeed=Math.min(cur.targetSpeed,allowed)}
  const sm=this.samples.map(s=>s.targetSpeed);for(let i=0;i<this.samples.length;i++){let sum=0,w=0;for(let k=-3;k<=3;k++){const ww=4-Math.abs(k),q=sm[(i+k+sm.length)%sm.length];sum+=q*ww;w+=ww}this.samples[i].targetSpeed=sum/w}
  this.checkpoints=[.245,.535,.79];this.pitSamples=[];for(let p=.91;p<1;p+=.0026)this.pitSamples.push(this.pitSampleAt(p));for(let p=0;p<.075;p+=.0026)this.pitSamples.push(this.pitSampleAt(p));
  this.overtakeZones=[[.955,.12],[.335,.43]];
 }
 sampleAt(progress,offset=0){const p=wrap01(progress),f=p*this.samples.length,i=Math.floor(f)%this.samples.length,t=f-Math.floor(f),a=this.samples[i],b=this.samples[(i+1)%this.samples.length];const x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,tx=a.tx+(b.tx-a.tx)*t,tz=a.tz+(b.tz-a.tz)*t,nl=Math.hypot(tx,tz)||1,nx=-tz/nl,nz=tx/nl;return {x:x+nx*offset,z:z+nz*offset,tx:tx/nl,tz:tz/nl,nx,nz,targetSpeed:a.targetSpeed+(b.targetSpeed-a.targetSpeed)*t,curvature:a.curvature+(b.curvature-a.curvature)*t,progress:p}}
 nearest(x,z){let best=Infinity,bi=0;for(let i=0;i<this.samples.length;i+=3){const s=this.samples[i],d=(s.x-x)*(s.x-x)+(s.z-z)*(s.z-z);if(d<best){best=d;bi=i}}let bestFine=Infinity,idx=bi;for(let o=-6;o<=6;o++){const i=(bi+o+this.samples.length)%this.samples.length,s=this.samples[i],d=(s.x-x)*(s.x-x)+(s.z-z)*(s.z-z);if(d<bestFine){bestFine=d;idx=i}}const s=this.samples[idx],dx=x-s.x,dz=z-s.z,lateral=dx*s.nx+dz*s.nz;return {sample:s,index:idx,progress:s.progress,lateral,distance:Math.sqrt(bestFine),onTrack:Math.abs(lateral)<=this.width,onRunoff:Math.abs(lateral)<=this.width+this.runoff}}
 nearestPit(x,z){let best=Infinity,hit=null;for(const s of this.pitSamples){const d=(s.x-x)*(s.x-x)+(s.z-z)*(s.z-s.z);if(d<best){best=d;hit=s}}return {distance:Math.sqrt(best),sample:hit,onLane:Math.sqrt(best)<6.8}}
 isStraightZone(p){p=wrap01(p);return p>.955||p<.12||(p>.335&&p<.43)}
 isOvertakeZone(p){return this.isStraightZone(p)}
 isPitSegment(p){p=wrap01(p);return p>.91||p<.075}
 pitOffset(p){p=wrap01(p);if(p>.91){const t=(p-.91)/.05;return 13+17*clamp(t,0,1)}if(p<.075){const t=p/.075;return 30*(1-clamp(t,0,1))}return 0}
 pitSampleAt(p){return this.sampleAt(p,this.pitOffset(p))}
 createRoadMesh(renderer){return stripMesh(renderer,this.samples,-this.width,this.width,.035,true)}
 createRunoffMesh(renderer){return stripMesh(renderer,this.samples,-(this.width+this.runoff),this.width+this.runoff,.01,true)}
 createShoulderMesh(renderer,side){const inner=side*this.width,outer=side*(this.width+3.3);return stripMesh(renderer,this.samples,inner,outer,.026,true)}
 createKerbMesh(renderer,side,phase){
  const v=[],ind=[],n=this.samples.length;
  for(let i=phase;i<n;i+=2){
   const a=this.samples[i],b=this.samples[(i+1)%n];
   if(a.curvature<.00125&&b.curvature<.00125)continue;
   const inner=side*(this.width-.05),outer=side*(this.width+1.05);
   const pts=[a,b];const base=v.length/6;
   for(const s of pts){for(const off of [inner,outer])v.push(s.x+s.nx*off,.065,s.z+s.nz*off,0,1,0)}
   ind.push(base,base+1,base+2,base+1,base+3,base+2);
  }
  return new Mesh(renderer.gl,v,ind)
 }
 createPitMesh(renderer){const pts=[];for(let p=.91;p<1;p+=.003)pts.push(this.pitSampleAt(p));for(let p=0;p<.075;p+=.003)pts.push(this.pitSampleAt(p));return stripMesh(renderer,pts,-5.6,5.6,.05,false)}
}
