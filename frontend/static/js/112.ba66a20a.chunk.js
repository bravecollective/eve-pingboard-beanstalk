(this["webpackJsonp@ping-board/frontend"]=this["webpackJsonp@ping-board/frontend"]||[]).push([[112],{245:function(e,t,r){e.exports=function(e){"use strict";function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var r=t(e),a={words:{m:["\u0458\u0435\u0434\u0430\u043d \u043c\u0438\u043d\u0443\u0442","\u0458\u0435\u0434\u043d\u043e\u0433 \u043c\u0438\u043d\u0443\u0442\u0430"],mm:["%d \u043c\u0438\u043d\u0443\u0442","%d \u043c\u0438\u043d\u0443\u0442\u0430","%d \u043c\u0438\u043d\u0443\u0442\u0430"],h:["\u0458\u0435\u0434\u0430\u043d \u0441\u0430\u0442","\u0458\u0435\u0434\u043d\u043e\u0433 \u0441\u0430\u0442\u0430"],hh:["%d \u0441\u0430\u0442","%d \u0441\u0430\u0442\u0430","%d \u0441\u0430\u0442\u0438"],d:["\u0458\u0435\u0434\u0430\u043d \u0434\u0430\u043d","\u0458\u0435\u0434\u043d\u043e\u0433 \u0434\u0430\u043d\u0430"],dd:["%d \u0434\u0430\u043d","%d \u0434\u0430\u043d\u0430","%d \u0434\u0430\u043d\u0430"],M:["\u0458\u0435\u0434\u0430\u043d \u043c\u0435\u0441\u0435\u0446","\u0458\u0435\u0434\u043d\u043e\u0433 \u043c\u0435\u0441\u0435\u0446\u0430"],MM:["%d \u043c\u0435\u0441\u0435\u0446","%d \u043c\u0435\u0441\u0435\u0446\u0430","%d \u043c\u0435\u0441\u0435\u0446\u0438"],y:["\u0458\u0435\u0434\u043d\u0443 \u0433\u043e\u0434\u0438\u043d\u0443","\u0458\u0435\u0434\u043d\u0435 \u0433\u043e\u0434\u0438\u043d\u0435"],yy:["%d \u0433\u043e\u0434\u0438\u043d\u0443","%d \u0433\u043e\u0434\u0438\u043d\u0435","%d \u0433\u043e\u0434\u0438\u043d\u0430"]},correctGrammarCase:function(e,t){return e%10>=1&&e%10<=4&&(e%100<10||e%100>=20)?e%10==1?t[0]:t[1]:t[2]},relativeTimeFormatter:function(e,t,r,m){var _=a.words[r];if(1===r.length)return"y"===r&&t?"\u0458\u0435\u0434\u043d\u0430 \u0433\u043e\u0434\u0438\u043d\u0430":m||t?_[0]:_[1];var i=a.correctGrammarCase(e,_);return"yy"===r&&t&&"%d \u0433\u043e\u0434\u0438\u043d\u0443"===i?e+" \u0433\u043e\u0434\u0438\u043d\u0430":i.replace("%d",e)}},m={name:"sr-cyrl",weekdays:"\u041d\u0435\u0434\u0435\u0459\u0430_\u041f\u043e\u043d\u0435\u0434\u0435\u0459\u0430\u043a_\u0423\u0442\u043e\u0440\u0430\u043a_\u0421\u0440\u0435\u0434\u0430_\u0427\u0435\u0442\u0432\u0440\u0442\u0430\u043a_\u041f\u0435\u0442\u0430\u043a_\u0421\u0443\u0431\u043e\u0442\u0430".split("_"),weekdaysShort:"\u041d\u0435\u0434._\u041f\u043e\u043d._\u0423\u0442\u043e._\u0421\u0440\u0435._\u0427\u0435\u0442._\u041f\u0435\u0442._\u0421\u0443\u0431.".split("_"),weekdaysMin:"\u043d\u0435_\u043f\u043e_\u0443\u0442_\u0441\u0440_\u0447\u0435_\u043f\u0435_\u0441\u0443".split("_"),months:"\u0408\u0430\u043d\u0443\u0430\u0440_\u0424\u0435\u0431\u0440\u0443\u0430\u0440_\u041c\u0430\u0440\u0442_\u0410\u043f\u0440\u0438\u043b_\u041c\u0430\u0458_\u0408\u0443\u043d_\u0408\u0443\u043b_\u0410\u0432\u0433\u0443\u0441\u0442_\u0421\u0435\u043f\u0442\u0435\u043c\u0431\u0430\u0440_\u041e\u043a\u0442\u043e\u0431\u0430\u0440_\u041d\u043e\u0432\u0435\u043c\u0431\u0430\u0440_\u0414\u0435\u0446\u0435\u043c\u0431\u0430\u0440".split("_"),monthsShort:"\u0408\u0430\u043d._\u0424\u0435\u0431._\u041c\u0430\u0440._\u0410\u043f\u0440._\u041c\u0430\u0458_\u0408\u0443\u043d_\u0408\u0443\u043b_\u0410\u0432\u0433._\u0421\u0435\u043f._\u041e\u043a\u0442._\u041d\u043e\u0432._\u0414\u0435\u0446.".split("_"),weekStart:1,relativeTime:{future:"\u0437\u0430 %s",past:"\u043f\u0440\u0435 %s",s:"\u043d\u0435\u043a\u043e\u043b\u0438\u043a\u043e \u0441\u0435\u043a\u0443\u043d\u0434\u0438",m:a.relativeTimeFormatter,mm:a.relativeTimeFormatter,h:a.relativeTimeFormatter,hh:a.relativeTimeFormatter,d:a.relativeTimeFormatter,dd:a.relativeTimeFormatter,M:a.relativeTimeFormatter,MM:a.relativeTimeFormatter,y:a.relativeTimeFormatter,yy:a.relativeTimeFormatter},ordinal:function(e){return e+"."},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"D. M. YYYY.",LL:"D. MMMM YYYY.",LLL:"D. MMMM YYYY. H:mm",LLLL:"dddd, D. MMMM YYYY. H:mm"}};return r.default.locale(m,null,!0),m}(r(13))}}]);
//# sourceMappingURL=112.ba66a20a.chunk.js.map