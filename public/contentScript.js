parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"xwKO":[function(require,module,exports) {
function n(n){var o=typeof n;return null!=n&&("object"==o||"function"==o)}module.exports=n;
},{}],"f6Xl":[function(require,module,exports) {
var global = arguments[3];
var e=arguments[3],t="object"==typeof e&&e&&e.Object===Object&&e;module.exports=t;
},{}],"VjBI":[function(require,module,exports) {
var e=require("./_freeGlobal"),t="object"==typeof self&&self&&self.Object===Object&&self,l=e||t||Function("return this")();module.exports=l;
},{"./_freeGlobal":"f6Xl"}],"o72h":[function(require,module,exports) {
var r=require("./_root"),e=function(){return r.Date.now()};module.exports=e;
},{"./_root":"VjBI"}],"Gw0y":[function(require,module,exports) {
var r=/\s/;function t(t){for(var e=t.length;e--&&r.test(t.charAt(e)););return e}module.exports=t;
},{}],"LuQU":[function(require,module,exports) {
var e=require("./_trimmedEndIndex"),r=/^\s+/;function n(n){return n?n.slice(0,e(n)+1).replace(r,""):n}module.exports=n;
},{"./_trimmedEndIndex":"Gw0y"}],"S8m2":[function(require,module,exports) {
var o=require("./_root"),r=o.Symbol;module.exports=r;
},{"./_root":"VjBI"}],"jnYZ":[function(require,module,exports) {
var r=require("./_Symbol"),t=Object.prototype,e=t.hasOwnProperty,o=t.toString,a=r?r.toStringTag:void 0;function l(r){var t=e.call(r,a),l=r[a];try{r[a]=void 0;var c=!0}catch(n){}var i=o.call(r);return c&&(t?r[a]=l:delete r[a]),i}module.exports=l;
},{"./_Symbol":"S8m2"}],"C0bq":[function(require,module,exports) {
var t=Object.prototype,o=t.toString;function r(t){return o.call(t)}module.exports=r;
},{}],"r1rA":[function(require,module,exports) {
var e=require("./_Symbol"),r=require("./_getRawTag"),o=require("./_objectToString"),t="[object Null]",i="[object Undefined]",n=e?e.toStringTag:void 0;function u(e){return null==e?void 0===e?i:t:n&&n in Object(e)?r(e):o(e)}module.exports=u;
},{"./_Symbol":"S8m2","./_getRawTag":"jnYZ","./_objectToString":"C0bq"}],"ZibF":[function(require,module,exports) {
function e(e){return null!=e&&"object"==typeof e}module.exports=e;
},{}],"hyfS":[function(require,module,exports) {
var e=require("./_baseGetTag"),r=require("./isObjectLike"),o="[object Symbol]";function t(t){return"symbol"==typeof t||r(t)&&e(t)==o}module.exports=t;
},{"./_baseGetTag":"r1rA","./isObjectLike":"ZibF"}],"JaQd":[function(require,module,exports) {
var e=require("./_baseTrim"),r=require("./isObject"),t=require("./isSymbol"),i=NaN,u=/^[-+]0x[0-9a-f]+$/i,f=/^0b[01]+$/i,n=/^0o[0-7]+$/i,s=parseInt;function a(a){if("number"==typeof a)return a;if(t(a))return i;if(r(a)){var o="function"==typeof a.valueOf?a.valueOf():a;a=r(o)?o+"":o}if("string"!=typeof a)return 0===a?a:+a;a=e(a);var b=f.test(a);return b||n.test(a)?s(a.slice(2),b?2:8):u.test(a)?i:+a}module.exports=a;
},{"./_baseTrim":"LuQU","./isObject":"xwKO","./isSymbol":"hyfS"}],"dnTF":[function(require,module,exports) {
var i=require("./isObject"),t=require("./now"),r=require("./toNumber"),n="Expected a function",e=Math.max,u=Math.min;function o(o,a,f){var c,v,d,m,l,s,T=0,p=!1,h=!1,x=!0;if("function"!=typeof o)throw new TypeError(n);function g(i){var t=c,r=v;return c=v=void 0,T=i,m=o.apply(r,t)}function q(i){var t=i-s;return void 0===s||t>=a||t<0||h&&i-T>=d}function w(){var i=t();if(q(i))return y(i);l=setTimeout(w,function(i){var t=a-(i-s);return h?u(t,d-(i-T)):t}(i))}function y(i){return l=void 0,x&&c?g(i):(c=v=void 0,m)}function b(){var i=t(),r=q(i);if(c=arguments,v=this,s=i,r){if(void 0===l)return function(i){return T=i,l=setTimeout(w,a),p?g(i):m}(s);if(h)return clearTimeout(l),l=setTimeout(w,a),g(s)}return void 0===l&&(l=setTimeout(w,a)),m}return a=r(a)||0,i(f)&&(p=!!f.leading,d=(h="maxWait"in f)?e(r(f.maxWait)||0,a):d,x="trailing"in f?!!f.trailing:x),b.cancel=function(){void 0!==l&&clearTimeout(l),T=0,c=s=v=l=void 0},b.flush=function(){return void 0===l?m:y(t())},b}module.exports=o;
},{"./isObject":"xwKO","./now":"o72h","./toNumber":"JaQd"}],"zOp4":[function(require,module,exports) {
var r=Array.isArray;module.exports=r;
},{}],"Kxtb":[function(require,module,exports) {
var e=require("./isArray"),r=require("./isSymbol"),t=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,n=/^\w*$/;function u(u,l){if(e(u))return!1;var o=typeof u;return!("number"!=o&&"symbol"!=o&&"boolean"!=o&&null!=u&&!r(u))||(n.test(u)||!t.test(u)||null!=l&&u in Object(l))}module.exports=u;
},{"./isArray":"zOp4","./isSymbol":"hyfS"}],"xOlx":[function(require,module,exports) {
var e=require("./_baseGetTag"),r=require("./isObject"),t="[object AsyncFunction]",n="[object Function]",o="[object GeneratorFunction]",c="[object Proxy]";function u(u){if(!r(u))return!1;var i=e(u);return i==n||i==o||i==t||i==c}module.exports=u;
},{"./_baseGetTag":"r1rA","./isObject":"xwKO"}],"zw2X":[function(require,module,exports) {
var r=require("./_root"),e=r["__core-js_shared__"];module.exports=e;
},{"./_root":"VjBI"}],"dW4B":[function(require,module,exports) {
var e=require("./_coreJsData"),r=function(){var r=/[^.]+$/.exec(e&&e.keys&&e.keys.IE_PROTO||"");return r?"Symbol(src)_1."+r:""}();function n(e){return!!r&&r in e}module.exports=n;
},{"./_coreJsData":"zw2X"}],"wHLP":[function(require,module,exports) {
var t=Function.prototype,r=t.toString;function n(t){if(null!=t){try{return r.call(t)}catch(n){}try{return t+""}catch(n){}}return""}module.exports=n;
},{}],"Qkpc":[function(require,module,exports) {
var e=require("./isFunction"),r=require("./_isMasked"),t=require("./isObject"),o=require("./_toSource"),n=/[\\^$.*+?()[\]{}|]/g,c=/^\[object .+?Constructor\]$/,i=Function.prototype,u=Object.prototype,p=i.toString,s=u.hasOwnProperty,a=RegExp("^"+p.call(s).replace(n,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");function l(n){return!(!t(n)||r(n))&&(e(n)?a:c).test(o(n))}module.exports=l;
},{"./isFunction":"xOlx","./_isMasked":"dW4B","./isObject":"xwKO","./_toSource":"wHLP"}],"Z8Pz":[function(require,module,exports) {
function n(n,o){return null==n?void 0:n[o]}module.exports=n;
},{}],"jJu1":[function(require,module,exports) {
var e=require("./_baseIsNative"),r=require("./_getValue");function u(u,a){var i=r(u,a);return e(i)?i:void 0}module.exports=u;
},{"./_baseIsNative":"Qkpc","./_getValue":"Z8Pz"}],"SiCv":[function(require,module,exports) {
var e=require("./_getNative"),r=e(Object,"create");module.exports=r;
},{"./_getNative":"jJu1"}],"Hz9n":[function(require,module,exports) {
var e=require("./_nativeCreate");function t(){this.__data__=e?e(null):{},this.size=0}module.exports=t;
},{"./_nativeCreate":"SiCv"}],"MFCq":[function(require,module,exports) {
function t(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e}module.exports=t;
},{}],"xsvA":[function(require,module,exports) {
var e=require("./_nativeCreate"),r="__lodash_hash_undefined__",t=Object.prototype,a=t.hasOwnProperty;function _(t){var _=this.__data__;if(e){var o=_[t];return o===r?void 0:o}return a.call(_,t)?_[t]:void 0}module.exports=_;
},{"./_nativeCreate":"SiCv"}],"aELU":[function(require,module,exports) {
var e=require("./_nativeCreate"),r=Object.prototype,t=r.hasOwnProperty;function a(r){var a=this.__data__;return e?void 0!==a[r]:t.call(a,r)}module.exports=a;
},{"./_nativeCreate":"SiCv"}],"ubfM":[function(require,module,exports) {
var e=require("./_nativeCreate"),_="__lodash_hash_undefined__";function i(i,t){var a=this.__data__;return this.size+=this.has(i)?0:1,a[i]=e&&void 0===t?_:t,this}module.exports=i;
},{"./_nativeCreate":"SiCv"}],"lVQU":[function(require,module,exports) {
var e=require("./_hashClear"),r=require("./_hashDelete"),t=require("./_hashGet"),h=require("./_hashHas"),o=require("./_hashSet");function a(e){var r=-1,t=null==e?0:e.length;for(this.clear();++r<t;){var h=e[r];this.set(h[0],h[1])}}a.prototype.clear=e,a.prototype.delete=r,a.prototype.get=t,a.prototype.has=h,a.prototype.set=o,module.exports=a;
},{"./_hashClear":"Hz9n","./_hashDelete":"MFCq","./_hashGet":"xsvA","./_hashHas":"aELU","./_hashSet":"ubfM"}],"JzEn":[function(require,module,exports) {
function t(){this.__data__=[],this.size=0}module.exports=t;
},{}],"huuc":[function(require,module,exports) {
function e(e,n){return e===n||e!=e&&n!=n}module.exports=e;
},{}],"zteS":[function(require,module,exports) {
var r=require("./eq");function e(e,n){for(var t=e.length;t--;)if(r(e[t][0],n))return t;return-1}module.exports=e;
},{"./eq":"huuc"}],"e2fl":[function(require,module,exports) {
var e=require("./_assocIndexOf"),r=Array.prototype,t=r.splice;function a(r){var a=this.__data__,o=e(a,r);return!(o<0)&&(o==a.length-1?a.pop():t.call(a,o,1),--this.size,!0)}module.exports=a;
},{"./_assocIndexOf":"zteS"}],"qACu":[function(require,module,exports) {
var r=require("./_assocIndexOf");function e(e){var a=this.__data__,o=r(a,e);return o<0?void 0:a[o][1]}module.exports=e;
},{"./_assocIndexOf":"zteS"}],"LgeR":[function(require,module,exports) {
var e=require("./_assocIndexOf");function r(r){return e(this.__data__,r)>-1}module.exports=r;
},{"./_assocIndexOf":"zteS"}],"G8aX":[function(require,module,exports) {
var s=require("./_assocIndexOf");function e(e,r){var t=this.__data__,i=s(t,e);return i<0?(++this.size,t.push([e,r])):t[i][1]=r,this}module.exports=e;
},{"./_assocIndexOf":"zteS"}],"ICfp":[function(require,module,exports) {
var e=require("./_listCacheClear"),t=require("./_listCacheDelete"),r=require("./_listCacheGet"),l=require("./_listCacheHas"),o=require("./_listCacheSet");function a(e){var t=-1,r=null==e?0:e.length;for(this.clear();++t<r;){var l=e[t];this.set(l[0],l[1])}}a.prototype.clear=e,a.prototype.delete=t,a.prototype.get=r,a.prototype.has=l,a.prototype.set=o,module.exports=a;
},{"./_listCacheClear":"JzEn","./_listCacheDelete":"e2fl","./_listCacheGet":"qACu","./_listCacheHas":"LgeR","./_listCacheSet":"G8aX"}],"u6Ae":[function(require,module,exports) {
var e=require("./_getNative"),r=require("./_root"),o=e(r,"Map");module.exports=o;
},{"./_getNative":"jJu1","./_root":"VjBI"}],"lTTh":[function(require,module,exports) {
var e=require("./_Hash"),i=require("./_ListCache"),r=require("./_Map");function a(){this.size=0,this.__data__={hash:new e,map:new(r||i),string:new e}}module.exports=a;
},{"./_Hash":"lVQU","./_ListCache":"ICfp","./_Map":"u6Ae"}],"DYPj":[function(require,module,exports) {
function o(o){var n=typeof o;return"string"==n||"number"==n||"symbol"==n||"boolean"==n?"__proto__"!==o:null===o}module.exports=o;
},{}],"v3EM":[function(require,module,exports) {
var r=require("./_isKeyable");function e(e,a){var t=e.__data__;return r(a)?t["string"==typeof a?"string":"hash"]:t.map}module.exports=e;
},{"./_isKeyable":"DYPj"}],"MDzN":[function(require,module,exports) {
var e=require("./_getMapData");function t(t){var r=e(this,t).delete(t);return this.size-=r?1:0,r}module.exports=t;
},{"./_getMapData":"v3EM"}],"iGx7":[function(require,module,exports) {
var e=require("./_getMapData");function t(t){return e(this,t).get(t)}module.exports=t;
},{"./_getMapData":"v3EM"}],"LqYa":[function(require,module,exports) {
var e=require("./_getMapData");function r(r){return e(this,r).has(r)}module.exports=r;
},{"./_getMapData":"v3EM"}],"djAV":[function(require,module,exports) {
var e=require("./_getMapData");function t(t,i){var s=e(this,t),r=s.size;return s.set(t,i),this.size+=s.size==r?0:1,this}module.exports=t;
},{"./_getMapData":"v3EM"}],"sd1L":[function(require,module,exports) {
var e=require("./_mapCacheClear"),r=require("./_mapCacheDelete"),t=require("./_mapCacheGet"),a=require("./_mapCacheHas"),p=require("./_mapCacheSet");function o(e){var r=-1,t=null==e?0:e.length;for(this.clear();++r<t;){var a=e[r];this.set(a[0],a[1])}}o.prototype.clear=e,o.prototype.delete=r,o.prototype.get=t,o.prototype.has=a,o.prototype.set=p,module.exports=o;
},{"./_mapCacheClear":"lTTh","./_mapCacheDelete":"MDzN","./_mapCacheGet":"iGx7","./_mapCacheHas":"LqYa","./_mapCacheSet":"djAV"}],"VrlS":[function(require,module,exports) {
var e=require("./_MapCache"),r="Expected a function";function t(n,a){if("function"!=typeof n||null!=a&&"function"!=typeof a)throw new TypeError(r);var c=function(){var e=arguments,r=a?a.apply(this,e):e[0],t=c.cache;if(t.has(r))return t.get(r);var o=n.apply(this,e);return c.cache=t.set(r,o)||t,o};return c.cache=new(t.Cache||e),c}t.Cache=e,module.exports=t;
},{"./_MapCache":"sd1L"}],"frJZ":[function(require,module,exports) {
var e=require("./memoize"),r=500;function n(n){var u=e(n,function(e){return c.size===r&&c.clear(),e}),c=u.cache;return u}module.exports=n;
},{"./memoize":"VrlS"}],"p8AI":[function(require,module,exports) {
var e=require("./_memoizeCapped"),r=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,p=/\\(\\)?/g,u=e(function(e){var u=[];return 46===e.charCodeAt(0)&&u.push(""),e.replace(r,function(e,r,a,o){u.push(a?o.replace(p,"$1"):r||e)}),u});module.exports=u;
},{"./_memoizeCapped":"frJZ"}],"eKAY":[function(require,module,exports) {
function r(r,n){for(var e=-1,l=null==r?0:r.length,o=Array(l);++e<l;)o[e]=n(r[e],e,r);return o}module.exports=r;
},{}],"wya6":[function(require,module,exports) {
var r=require("./_Symbol"),e=require("./_arrayMap"),i=require("./isArray"),t=require("./isSymbol"),o=1/0,u=r?r.prototype:void 0,n=u?u.toString:void 0;function a(r){if("string"==typeof r)return r;if(i(r))return e(r,a)+"";if(t(r))return n?n.call(r):"";var u=r+"";return"0"==u&&1/r==-o?"-0":u}module.exports=a;
},{"./_Symbol":"S8m2","./_arrayMap":"eKAY","./isArray":"zOp4","./isSymbol":"hyfS"}],"GLmR":[function(require,module,exports) {
var r=require("./_baseToString");function e(e){return null==e?"":r(e)}module.exports=e;
},{"./_baseToString":"wya6"}],"Hnr2":[function(require,module,exports) {
var r=require("./isArray"),e=require("./_isKey"),i=require("./_stringToPath"),t=require("./toString");function u(u,n){return r(u)?u:e(u,n)?[u]:i(t(u))}module.exports=u;
},{"./isArray":"zOp4","./_isKey":"Kxtb","./_stringToPath":"p8AI","./toString":"GLmR"}],"dmEq":[function(require,module,exports) {
var r=require("./isSymbol"),e=1/0;function t(t){if("string"==typeof t||r(t))return t;var i=t+"";return"0"==i&&1/t==-e?"-0":i}module.exports=t;
},{"./isSymbol":"hyfS"}],"VfCl":[function(require,module,exports) {
var r=require("./_castPath"),e=require("./_toKey");function t(t,o){for(var u=0,n=(o=r(o,t)).length;null!=t&&u<n;)t=t[e(o[u++])];return u&&u==n?t:void 0}module.exports=t;
},{"./_castPath":"Hnr2","./_toKey":"dmEq"}],"vzeB":[function(require,module,exports) {
var e=require("./_baseGet");function r(r,o,u){var i=null==r?void 0:e(r,o);return void 0===i?u:i}module.exports=r;
},{"./_baseGet":"VfCl"}],"IM2L":[function(require,module,exports) {
"use strict";function e(e){return new Promise((t,r)=>{chrome.runtime.sendMessage({type:"getRating",query:e},e=>{const[s,n]=e;s||r(n),t(s)})})}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=e;
},{}],"o4lX":[function(require,module,exports) {
"use strict";function e(e){return new Promise((t,r)=>{chrome.runtime.sendMessage({type:"getPrice",query:e},e=>{const[s,n]=e;s||r(n),t(s)})})}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=e;
},{}],"VdKl":[function(require,module,exports) {
"use strict";var e=n(require("lodash/debounce")),t=n(require("lodash/get")),a=n(require("./api/getRating")),i=n(require("./api/getPrice"));function n(e){return e&&e.__esModule?e:{default:e}}function l(){("https://www.lastbottlewines.com/"==window.location.href||window.location.href.includes("https://www.lastbottlewines.com/product/detail/"))&&r()}async function r(){let e=document.getElementsByClassName("offer-name")[0].innerHTML;if(isNaN(e.substring(e.length-4,e.length))||(e=e.substring(0,e.length-4)),e=(e=e.replace("NV","").replace("N.V.","")).trim())try{const g=await(0,a.default)(e);let v="N/A";g.length>0&&(v=await(0,i.default)(g[0].parentID));let h=document.getElementsByClassName("price-holder").length-1,p='<div class="price-holder"><div class="strikethrough default"><em style="color:#ed1c24">$</em><span class="amount" style="color:#ed1c24">'+v+'</span></div><p style="color:#ed1c24">Vivino</p></div>';if(document.getElementsByClassName("price-holder")[h].innerHTML=p+document.getElementsByClassName("price-holder")[h].innerHTML,document.getElementById("myTab").innerHTML+='<li class="nav-item offer-tab" role="menuitem" style="width: 33.3%;"><a class="" id="vivino-tab" data-toggle="tab" href="#vivino" role="tab" aria-controls="vivino" data-uw-rm-brl="false" aria-selected="false">Vivino Results</a></li>',document.querySelectorAll(".offer-tab").forEach(e=>{e.style.width="33.3%"}),g){var t,n,l,r;t='<div class="tab-pane fade" id="vivino" role="tabpanel" aria-labelledby="vivino"><div class="text-left"><p data-uw-rm-sr="">',t+='<section class="details-pane"></section>';var s,o,d,c,m="No ratings";let e=0;for(;e<g.length&&e<5;)n=g[e].name,l=g[e].parentID,r=await(0,i.default)(l),m=g[e].score,s=g[e].numOfReviews,o=g[e].trimmedImage,d=g[e].url,isNaN(r)||(r="$ "+r),isNaN(m)||null===m||(c=m+"<strong>&#9733;</strong> ("+s+" ratings)"),t+='<section class="details-pane"><h3 data-uw-rm-heading="level" role="heading" aria-level="2">'+n+"</h3>",t+='<img src="'+o+'" alt="'+n+'" style="height:300px !important;width:auto !important;">',t+='<ul class="tech-details">',t+="<li><strong>Average Price</strong>: "+r+"</li>",t+="<li><strong>Average Rating</strong>: "+c+"</li>",t+='<li><strong>Additional Details</strong>: <a href="'+d+'" target="_blank">Click here</a></li>',t+="</ul>",t+="</section>",e++;t+='<br role="presentation" data-uw-rm-sr="">',t+="</p></div></div>",document.getElementById("myTabContent").innerHTML+=t}else document.getElementById("myTabContent").innerHTML+='<div class="tab-pane fade" id="vivino" role="tabpanel" aria-labelledby="vivino"><div class="text-left"><p data-uw-rm-sr="">No matches found on Vivino. <br role="presentation" data-uw-rm-sr=""></p></div></div>'}catch(u){console.error(`${e} is not found on Vivino`)}}window.addEventListener("load",l);
},{"lodash/debounce":"dnTF","lodash/get":"vzeB","./api/getRating":"IM2L","./api/getPrice":"o4lX"}]},{},["VdKl"], null)
//# sourceMappingURL=/contentScript.js.map