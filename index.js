!function(e,r){"object"==typeof exports&&"object"==typeof module?module.exports=r():"function"==typeof define&&define.amd?define([],r):"object"==typeof exports?exports.Khajana=r():e.Khajana=r()}(this,function(){return function(e){function r(a){if(t[a])return t[a].exports;var i=t[a]={i:a,l:!1,exports:{}};return e[a].call(i.exports,i,i.exports,r),i.l=!0,i.exports}var t={};return r.m=e,r.c=t,r.i=function(e){return e},r.d=function(e,t,a){r.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:a})},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},r.p="",r(r.s=0)}([function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var a=r.API_URL="https://devapi.khajana.org/";r.TYPES=["First Letter Start (Gurmukhi)","First Letter Anywhere (Gurmukhi)","Full Word (Gurakhar)","Full Word (English)","Romanized (English)"],r.SOURCES={all:"All Sources",G:"Guru Granth Sahib Ji",D:"Dasam Granth Sahib",B:"Bhai Gurdas Ji Vaaran",N:"Bhai Nand Lal Ji Vaaran",A:"Amrit Keertan",S:"Bhai Gurdas Singh Ji Vaaran"},r.buildApiUrl=function(e){var r=e.q,t=void 0!==r&&r,i=e.source,n=void 0!==i&&i,o=e.type,u=void 0!==o&&o,s=e.writer,d=void 0!==s&&s,l=e.raag,f=void 0!==l&&l,h=e.ang,p=void 0!==h&&h,c=e.results,v=void 0!==c&&c,m=e.offset,b=void 0!==m&&m,y=e.id,g=void 0!==y&&y,j=e.hukam,x=void 0!==j&&j,G=e.akhar,S=void 0!==G&&G,k=e.lipi,w=void 0!==k&&k,A=e.random,E=void 0!==A&&A,O=a;if(t!==!1){var P=[];n&&P.push("source="+n),u&&P.push("searchtype="+u),d&&P.push("writer="+d),f&&P.push("raag="+f),p&&P.push("ang="+p),v&&P.push("results="+v),b&&P.push("offset="+b),O+="search/"+t+"?"+P.join("&")}else if(g!==!1)O+="shabad/"+g;else if(p!==!1)O+="ang/"+p+"/"+(n?n:"");else if(x!==!1)O+="hukamnama/today";else if(S!==!1&&w!==!1)O+="akhar/"+w;else{if(E===!1)throw new Error("Invalid options sent");O+="random"}return O}}])});