(self.webpackChunk_ping_board_frontend=self.webpackChunk_ping_board_frontend||[]).push([[4357],{4357:function(e,t,i){e.exports=function(e){"use strict";function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var i=t(e);function n(e){return e%10<5&&e%10>1&&~~(e/10)%10!=1}function a(e,t,i){var a=e+" ";switch(i){case"m":return t?"minuta":"minut\u0119";case"mm":return a+(n(e)?"minuty":"minut");case"h":return t?"godzina":"godzin\u0119";case"hh":return a+(n(e)?"godziny":"godzin");case"MM":return a+(n(e)?"miesi\u0105ce":"miesi\u0119cy");case"yy":return a+(n(e)?"lata":"lat")}}var _="stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_wrze\u015bnia_pa\u017adziernika_listopada_grudnia".split("_"),r="stycze\u0144_luty_marzec_kwiecie\u0144_maj_czerwiec_lipiec_sierpie\u0144_wrzesie\u0144_pa\u017adziernik_listopad_grudzie\u0144".split("_"),s=/D MMMM/,u=function(e,t){return s.test(t)?_[e.month()]:r[e.month()]};u.s=r,u.f=_;var o={name:"pl",weekdays:"niedziela_poniedzia\u0142ek_wtorek_\u015broda_czwartek_pi\u0105tek_sobota".split("_"),weekdaysShort:"ndz_pon_wt_\u015br_czw_pt_sob".split("_"),weekdaysMin:"Nd_Pn_Wt_\u015ar_Cz_Pt_So".split("_"),months:u,monthsShort:"sty_lut_mar_kwi_maj_cze_lip_sie_wrz_pa\u017a_lis_gru".split("_"),ordinal:function(e){return e+"."},weekStart:1,yearStart:4,relativeTime:{future:"za %s",past:"%s temu",s:"kilka sekund",m:a,mm:a,h:a,hh:a,d:"1 dzie\u0144",dd:"%d dni",M:"miesi\u0105c",MM:a,y:"rok",yy:a},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"}};return i.default.locale(o,null,!0),o}(i(1219))}}]);
//# sourceMappingURL=4357.a1d9f498.chunk.js.map