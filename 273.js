"use strict";(self.webpackChunk_dev_web=self.webpackChunk_dev_web||[]).push([[273],{273:(e,r,n)=>{n.r(r),n.d(r,{default:()=>E});var t=n(784),o=n(378),s=n.n(o);const c=[];function i(e,r,n,t=0,o=!1){for(const e of r)if(s()(n,e.args)){if(o)return;if(e.error)throw e.error;if(e.response)return e.response;throw e.promise}const c={args:n,promise:e(...n).then((e=>c.response=null==e||e)).catch((e=>c.error=null!=e?e:"unknown error")).then((()=>{t>0&&setTimeout((()=>{const e=r.indexOf(c);-1!==e&&r.splice(e,1)}),t)}))};if(r.push(c),!o)throw c.promise}function l(e,...r){if(void 0===r||0===r.length)e.splice(0,e.length);else{const n=e.find((e=>s()(r,e.args)));if(n){const r=e.indexOf(n);-1!==r&&e.splice(r,1)}}}function u(e,...r){return i(e,c,r,u.lifespan)}u.lifespan=0,u.clear=(...e)=>l(c,...e),u.preload=(e,...r)=>{i(e,c,r,u.lifespan,!0)},u.peek=(...e)=>{var r;return null==(r=c.find((r=>s()(e,r.args))))?void 0:r.response};var a=n(62),f=n.n(a),p=n(36),d=n.n(p),h=n(793),g=n.n(h),v=n(892),y=n.n(v),b=n(173),m=n.n(b),O=n(464),w=n.n(O),A=n(45),S={};S.styleTagTransform=w(),S.setAttributes=y(),S.insert=g().bind(null,"head"),S.domAPI=d(),S.insertStyleElement=m(),f()(A.Z,S);const k=A.Z&&A.Z.locals?A.Z.locals:void 0,j=function(e,r=0){const n=[];return{read:(...t)=>i(e,n,t,r),preload:(...t)=>{i(e,n,t,r,!0)},clear:(...e)=>l(n,...e),peek:(...e)=>{var r;return null==(r=n.find((r=>s()(e,r.args))))?void 0:r.response}}}((async()=>{const e=await fetch("api/quote.json");return await e.json()}));function E(){const{results:e}=j.read();return t.createElement("section",{className:k.Section},t.createElement("h2",null,"Quote"),t.createElement("pre",null,JSON.stringify(e,null,2)))}},45:(e,r,n)=>{n.d(r,{Z:()=>i});var t=n(272),o=n.n(t),s=n(609),c=n.n(s)()(o());c.push([e.id,".nIFFESrZohc36HDUpxy2{color:blue}","",{version:3,sources:["webpack://./src/containers/Quote/styles.module.scss"],names:[],mappings:"AAAA,sBACE,UAAA",sourcesContent:[".Section {\n  color: blue;\n}\n"],sourceRoot:""}]),c.locals={Section:"nIFFESrZohc36HDUpxy2"};const i=c},378:e=>{e.exports=function e(r,n){if(r===n)return!0;if(r&&n&&"object"==typeof r&&"object"==typeof n){if(r.constructor!==n.constructor)return!1;var t,o,s;if(Array.isArray(r)){if((t=r.length)!=n.length)return!1;for(o=t;0!=o--;)if(!e(r[o],n[o]))return!1;return!0}if(r.constructor===RegExp)return r.source===n.source&&r.flags===n.flags;if(r.valueOf!==Object.prototype.valueOf)return r.valueOf()===n.valueOf();if(r.toString!==Object.prototype.toString)return r.toString()===n.toString();if((t=(s=Object.keys(r)).length)!==Object.keys(n).length)return!1;for(o=t;0!=o--;)if(!Object.prototype.hasOwnProperty.call(n,s[o]))return!1;for(o=t;0!=o--;){var c=s[o];if(!e(r[c],n[c]))return!1}return!0}return r!=r&&n!=n}}}]);
//# sourceMappingURL=273.js.map