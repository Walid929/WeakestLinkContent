/* ChainQuest - "How to play" comic flipbook.
 * One file, no dependencies. Shared by:
 *   ChainQuestServer/wwwroot/comic.js            (served as /comic.js, page /comic)
 *   ChainQuestTV/.../Resources/tv/comic.txt       (LanServer serves it as /comic.js, page /comic)
 *   WeakestLinkUnity/.../Resources/tv/comic.txt   (same; the phone app opens /comic in the browser)
 * API: WLComic.open({ lang: 'en'|'ar', standalone: bool, onClose: fn })  - full-screen flipbook
 *      WLComic.label(lang)                                                 - button text
 *      WLComic.close()
 * English and Arabic (Arabic reads and turns right to left); the bar has a language switch. */
(function () {
  'use strict';
  if (window.WLComic) return;

  var INK = '#14121F', GOLD = '#F5B700', BLUE = '#2F6BFF', RED = '#D7263D', GREEN = '#17915A', YEL = '#FFE45C';
  var W = 360, H = 640;

  /* ------------------------------------------------------------------ characters */
  var CAST = {
    sara: { hair: 'long', hc: '#3B2416', skin: '#E8B48A', shirt: BLUE, name: 'Sara', ar: 'سارة' },
    omar: { hair: 'short', hc: '#1A1A1A', skin: '#C98E5E', shirt: GREEN, name: 'Omar', ar: 'عمر' },
    lina: { hair: 'long', hc: '#A0462A', skin: '#F2C9A0', shirt: '#F28C28', name: 'Lina', ar: 'لينا' },
    adam: { hair: 'short', hc: '#E2B33C', skin: '#F2C9A0', shirt: '#8A5CF6', name: 'Adam', ar: 'آدم' },
    noor: { hair: 'long', hc: '#1A1A1A', skin: '#8D5A3B', shirt: '#E04F8E', name: 'Noor', ar: 'نور' }
  };
  var S = ' stroke="' + INK + '" stroke-width="3.5"';
  var MOUTH = {
    smile: '<path d="M32 49 Q40 56 48 49" fill="none"' + S + ' stroke-linecap="round"/>',
    shout: '<ellipse cx="40" cy="52" rx="7" ry="6" fill="#7A1020"' + S + '/>',
    grin: '<path d="M31 48 Q40 60 49 48Z" fill="#7A1020"' + S + ' stroke-linejoin="round"/>',
    worry: '<path d="M32 53 Q36 49 40 53 Q44 57 48 53" fill="none"' + S + ' stroke-linecap="round"/>',
    flat: '<path d="M33 52 L47 52" fill="none"' + S + ' stroke-linecap="round"/>'
  };
  var EYES = {
    dot: '<circle cx="32" cy="41" r="3" fill="' + INK + '"/><circle cx="48" cy="41" r="3" fill="' + INK + '"/>',
    happy: '<path d="M28 42 Q32 37 36 42 M44 42 Q48 37 52 42" fill="none"' + S + ' stroke-width="2.5" stroke-linecap="round"/>'
  };
  var BROWS = {
    none: '',
    fierce: '<path d="M27 35 L35 38 M53 35 L45 38" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>',
    worried: '<path d="M27 33 L35 36 M53 33 L45 36" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>',
    stern: '<path d="M27 36 L36 34 M44 34 L53 36" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>'
  };
  var EXTRA = {
    phoneL: '<rect x="12" y="72" width="16" height="26" rx="3" fill="' + INK + '"/><rect x="14.5" y="75" width="11" height="18" rx="1.5" fill="#9FD4FF"/>',
    phoneR: '<rect x="52" y="72" width="16" height="26" rx="3" fill="' + INK + '"/><rect x="54.5" y="75" width="11" height="18" rx="1.5" fill="#9FD4FF"/>',
    sweat: '<path d="M64 22 q4 6 0 10 q-4 -4 0 -10Z" fill="#9FD4FF" stroke="' + INK + '" stroke-width="1.5"/>',
    trophy: '<path d="M52 78 h18 v6 q0 10 -9 10 q-9 0 -9 -10Z" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="2.5"/><rect x="58" y="94" width="6" height="8" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="2"/>',
    token: '<circle cx="62" cy="84" r="9" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="2.5"/><text x="62" y="88" font-size="10" text-anchor="middle" font-weight="700" fill="' + INK + '">+1</text>'
  };

  function person(id, o) {
    var c = CAST[id];
    var back = c.hair === 'long' ? '<path d="M14 62 Q8 14 40 12 Q72 14 66 62Z" fill="' + c.hc + '"' + S + '/>' : '';
    var arm = o.wave ? '<path d="M66 80 L78 52" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M66 80 L78 52" stroke="' + c.shirt + '" stroke-width="4" stroke-linecap="round"/>' : '';
    return '<svg class="wlc-fig' + (o.cls ? ' ' + o.cls : '') + '" viewBox="0 0 80 110" width="' + o.w + '" height="' + Math.round(o.w * 1.375) + '" style="' + (o.style || '') + '" role="img" aria-label="' + (o.label || nm(id)) + '">' +
      back + '<path d="M8 110 Q8 66 40 66 Q72 66 72 110Z" fill="' + (o.shirt || c.shirt) + '"' + S + '/>' + arm +
      '<circle cx="40" cy="38" r="22" fill="' + c.skin + '"' + S + '/>' +
      '<path d="M18 36 Q16 14 40 14 Q64 14 62 36 Q52 24 40 27 Q28 24 18 36Z" fill="' + c.hc + '"' + S + ' stroke-linejoin="round"/>' +
      BROWS[o.brows || 'none'] + EYES[o.eyes || 'dot'] + MOUTH[o.mouth || 'smile'] + (o.extra ? EXTRA[o.extra] : '') + '</svg>';
  }

  function host(o) {
    return '<svg class="wlc-fig' + (o.cls ? ' ' + o.cls : '') + '" viewBox="0 0 80 110" width="' + o.w + '" height="' + Math.round(o.w * 1.375) + '" style="' + (o.style || '') + '" role="img" aria-label="' + L('The host', 'المقدّم') + '">' +
      '<path d="M6 110 Q6 64 40 64 Q74 64 74 110Z" fill="' + INK + '"' + S + '/>' +
      '<path d="M30 66 L40 92 L50 66Z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M32 70 L40 74 L32 78Z M48 70 L40 74 L48 78Z" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="1.5"/>' +
      '<circle cx="40" cy="38" r="22" fill="#D9A27A"' + S + '/>' +
      '<path d="M17 36 Q14 12 42 13 Q66 14 63 34 Q58 22 44 22 Q30 22 26 30 Q22 26 17 36Z" fill="#2B2B2B"' + S + ' stroke-linejoin="round"/>' +
      BROWS[o.brows || 'none'] + EYES[o.eyes || 'dot'] +
      (o.mouth === 'flat' ? MOUTH.flat : '<path d="M31 49 Q40 57 49 49" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>') +
      (o.phone ? '<rect x="14" y="76" width="18" height="28" rx="3" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' : '') + '</svg>';
  }

  /* ------------------------------------------------------------------ comic bits */
  function bub(text, style, tail, extraCls) {
    return '<div class="wlc-bub' + (extraCls ? ' ' + extraCls : '') + '" style="' + style + '">' + text + '<i class="wlc-tail" style="' + (tail || 'left:24px') + '"></i></div>';
  }
  function sfx(text, style, delay) {
    return '<div class="wlc-sfx wlc-pop" style="' + style + ';animation-delay:' + (delay || 350) + 'ms">' + text + '</div>';
  }
  function note(text, style) { return '<div class="wlc-note" style="' + (style || '') + '">' + text + '</div>'; }

  var CHAIN_SVG = function (w, color) {
    return '<svg viewBox="0 0 150 150" width="' + w + '" height="' + w + '" role="img" aria-label="A breaking chain">' +
      '<rect x="12" y="52" width="62" height="38" rx="19" fill="none" stroke="' + INK + '" stroke-width="16" transform="rotate(-25 43 71)"/>' +
      '<rect x="12" y="52" width="62" height="38" rx="19" fill="none" stroke="' + color + '" stroke-width="8" transform="rotate(-25 43 71)"/>' +
      '<path d="M86 92 a19 19 0 0 1 36 -14 l10 22" fill="none" stroke="' + INK + '" stroke-width="16" stroke-linecap="round"/>' +
      '<path d="M86 92 a19 19 0 0 1 36 -14 l10 22" fill="none" stroke="' + color + '" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M78 52 L84 38 M92 60 L106 50 M72 40 L70 24" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/></svg>';
  };
  function clock(text, ring, color) {
    return '<div class="wlc-clock" style="border-color:' + ring + ';color:' + color + '">' + text + '</div>';
  }
  function dots(list, size) {
    var h = '';
    for (var i = 0; i < list.length; i++) {
      var bg = list[i] === 1 ? GREEN : list[i] === 0 ? RED : 'rgba(255,255,255,.3)';
      h += '<span class="wlc-dot wlc-pop" style="width:' + size + 'px;height:' + size + 'px;background:' + bg + ';animation-delay:' + (300 + i * 160) + 'ms"></span>';
    }
    return h;
  }

  /* ------------------------------------------------------------------ the pages */
  // Built per language. Each page: { bg, dots (halftone), num, cap, art (HTML in the art box), note }
  var LANG = 'en';
  function L(en, ar) { return LANG === 'ar' ? ar : en; }
  function money(v) { return L('$' + v, v + '$'); }
  function nm(id) { return L(CAST[id].name, CAST[id].ar); }

  function buildPages() {
    var back = L('right:-10px;bottom:22px;left:auto;transform:rotate(-45deg)', 'right:-10px;bottom:22px;left:auto;transform:rotate(-45deg)');
    return [
    { id: 'cover', bg: BLUE, dots: true, cover: true, art:
      '<div class="wlc-t" style="position:absolute;left:22px;right:22px;top:26px;font-family:var(--wlc-display);font-size:24px;letter-spacing:' + L('3px', '0') + ';color:#FFFFFF">' + L('How to play', 'طريقة اللعب') + '</div>' +
      '<div class="wlc-title" style="position:absolute;left:18px;right:18px;top:' + L('62px;font-size:84px', '58px;font-size:92px;line-height:1.05') + '">' + L('CHAIN<br>QUEST', 'تشين<br>كويست') + '</div>' +
      '<div class="wlc-pop" style="position:absolute;' + L('right', 'left') + ':12px;top:10px;animation-delay:500ms">' + CHAIN_SVG(70, GOLD) + '</div>' +
      '<div class="wlc-t" style="position:absolute;left:22px;right:22px;top:250px;font-family:var(--wlc-body);font-weight:700;font-size:19px;line-height:1.35;color:#FFFFFF">' +
        L('The quiz where you answer fast, bank smart, and vote off the Chain Breaker.', 'مسابقة تجيب فيها بسرعة، وتودِع بذكاء، وتصوّت لإخراج كاسر السلسلة.') + '</div>' +
      host({ w: 170, style: 'position:absolute;right:6px;bottom:-4px', cls: 'wlc-bob' }) +
      bub(L('Welcome to ChainQuest!', 'أهلًا بكم في تشين كويست!'), 'left:16px;bottom:120px;width:150px', back) +
      '<div class="wlc-hint" style="position:absolute;left:16px;bottom:18px;width:150px;line-height:1.3">' + L('&larr; Swipe left or tap to turn the page', 'اسحب لليمين أو اضغط لقلب الصفحة &rarr;') + '</div>' },

    { id: 'join', bg: '#DCE8FF', num: '1', cap: L('Everyone scans the QR code on the TV and types their name.', 'يمسح الجميع رمز QR على التلفاز ويكتبون أسماءهم.'), art:
      '<div class="wlc-tv" style="left:24px;top:22px">' +
        '<svg width="84" height="84" viewBox="0 0 9 9" role="img" aria-label="QR" style="background:#FFFFFF;padding:5px;border-radius:4px" shape-rendering="crispEdges">' +
        '<path d="M0 0h3v3h-3zM6 0h3v3h-3zM0 6h3v3h-3z" fill="' + INK + '"/><path d="M1 1h1v1h-1zM7 1h1v1h-1zM1 7h1v1h-1z" fill="#FFFFFF"/>' +
        '<path d="M4 0h1v2h-1zM4 3h2v1h-2zM3 4h1v2h-1zM5 5h2v1h-2zM6 7h1v2h-1zM8 4h1v3h-1zM4 7h1v1h-1z" fill="' + INK + '"/></svg>' +
        '<div style="font-family:var(--wlc-display);color:' + GOLD + ';font-size:22px;line-height:1.05;letter-spacing:' + L('1px', '0') + '">' + L('JOIN<br>THE<br>GAME', 'انضم<br>إلى<br>اللعبة') + '</div></div>' +
      '<div style="position:absolute;left:94px;top:152px;width:44px;height:12px;background:' + INK + '"></div>' +
      person('omar', { w: 112, extra: 'phoneL', style: 'position:absolute;left:40px;bottom:-4px', cls: 'wlc-bob' }) +
      person('noor', { w: 112, extra: 'phoneR', style: 'position:absolute;right:30px;bottom:-4px', cls: 'wlc-bob wlc-bob2' }) +
      bub(L("I'm in!", 'أنا معكم!'), 'left:36px;top:178px;width:100px;text-align:center', 'left:36px', 'wlc-pop') +
      bub(L('Noor joined &#10003;', 'انضمت نور &#10003;'), 'right:14px;top:178px;width:124px;font-size:16px;text-align:center', 'left:56px', 'wlc-pop wlc-d2'),
      note: L('No phone? The host adds you by name. Phones are optional when answers are said out loud.', 'ليس معك هاتف؟ يضيفك المقدّم باسمك. الهاتف اختياري عندما تُقال الإجابات بصوت عالٍ.') },

    { id: 'rules', bg: '#FFF4CC', dots: true, num: '2', cap: L('The host picks the rules and how players answer.', 'يختار المقدّم القواعد وطريقة إجابة اللاعبين.'), art:
      '<div class="wlc-t" style="position:absolute;left:16px;right:16px;top:14px;display:flex;flex-direction:column;gap:7px">' +
        '<div class="wlc-k">' + L('Rules', 'القواعد') + '</div>' +
        '<div class="wlc-row"><span class="wlc-chip" style="background:' + GOLD + '">' + L('Classic', 'الكلاسيكية') + '</span><span>' + L('the full show', 'العرض الكامل') + '</span></div>' +
        '<div class="wlc-row"><span class="wlc-chip">' + L('Quick Fire', 'السريعة') + '</span><span>' + L('short rounds', 'جولات قصيرة') + '</span></div>' +
        '<div class="wlc-row"><span class="wlc-chip">' + L('High Stakes', 'الرهان الكبير') + '</span><span>' + L('chain grows', 'السلسلة تكبر') + '</span></div>' +
        '<div class="wlc-row"><span class="wlc-chip">' + L('Family', 'العائلية') + '</span><span>' + L('nobody leaves', 'لا أحد يغادر') + '</span></div>' +
        '<div class="wlc-k" style="margin-top:8px">' + L('How players answer', 'طريقة الإجابة') + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:5px"><span class="wlc-chip" style="background:#DCE8FF">' + L('Out loud', 'بصوت عالٍ') + '</span><span class="wlc-chip">' + L('Type it', 'كتابة الإجابة') +
        '</span><span class="wlc-chip">' + L('Multiple choice', 'اختيار من متعدد') + '</span><span class="wlc-chip">' + L('First letters', 'الحروف الأولى') + '</span><span class="wlc-chip">' + L('Junior', 'للصغار') + '</span></div></div>' +
      host({ w: 120, phone: true, style: 'position:absolute;right:4px;bottom:-4px', cls: 'wlc-bob' }) +
      bub(L('Classic tonight. Out loud, just like TV!', 'الكلاسيكية الليلة، وبصوت عالٍ مثل التلفاز!'), 'left:16px;bottom:30px;width:180px;font-size:16px', back, 'wlc-pop wlc-d2') },

    { id: 'clock', bg: INK, num: '3', cap: L('The host taps <b>Start the clock</b>. Questions go round the group, one player at a time.', 'يضغط المقدّم <b>«ابدأ الوقت»</b>. تدور الأسئلة على اللاعبين، لاعبًا بعد لاعب.'), art:
      '<div class="wlc-spin" style="position:absolute;left:50%;top:40px;margin-left:-85px">' + clock('2:30', GOLD, INK) + '</div>' +
      sfx(L('TICK', 'تِك'), 'left:22px;top:230px;font-size:38px;color:' + GOLD, 400) +
      sfx(L('TOCK', 'تاك'), 'right:22px;top:250px;font-size:38px;color:' + GOLD, 800),
      note: L('Rounds get shorter as the game goes on.', 'تقصر الجولات كلما تقدّمت اللعبة.') },

    { id: 'chain', bg: '#E6F7EE', dots: true, num: '4', cap: L('Every correct answer in a row climbs one step up the money chain.', 'كل إجابة صحيحة متتالية ترفع سلسلة المال درجة واحدة.'), art:
      '<div class="wlc-ladder" style="left:14px;top:12px">' +
        ['1,000', '2,500', '5,000', '10,000', '25,000', '50,000', '75,000', '125,000'].map(function (v, i) {
          var cls = i < 3 ? 'on' : i === 3 ? 'cur' : '';
          return '<div class="wlc-step ' + cls + '" style="animation-delay:' + (i < 4 ? 300 + i * 260 : 0) + 'ms">' + money(v) + '</div>';
        }).join('') + '</div>' +
      bub(L('Capital of France?', 'ما عاصمة فرنسا؟'), 'right:14px;top:10px;width:150px;background:#F2F2F2;font-size:16px', 'left:24px;background:#F2F2F2') +
      person('sara', { w: 128, mouth: 'grin', style: 'position:absolute;right:20px;bottom:-4px', cls: 'wlc-bob' }) +
      bub(L('Paris!', 'باريس!'), 'right:24px;top:150px;width:96px;text-align:center;font-size:22px', 'left:30px', 'wlc-pop') +
      sfx(L('CORRECT!', 'صحيح!'), 'right:6px;top:84px;font-size:' + L('34px', '44px') + ';color:' + GREEN + ';transform:rotate(-8deg)', 1300),
      note: L('The top step is the round&rsquo;s target.', 'أعلى درجة هي هدف الجولة.') },

    { id: 'wrong', bg: '#FFE0E0', cap: L('One wrong answer and the chain drops to zero. Everything not banked is lost.', 'إجابة خاطئة واحدة تُعيد السلسلة إلى الصفر، ويضيع كل ما لم يُودَع.'), art:
      sfx(L('KRAK!', 'طَراخ!'), 'left:18px;top:6px;font-size:86px;color:' + RED + ';transform:rotate(-6deg)', 700) +
      '<svg style="position:absolute;left:20px;top:122px;overflow:visible" width="200" height="82" viewBox="0 0 220 90" role="img" aria-label="chain">' +
        '<g class="wlc-snapL"><rect x="6" y="28" width="70" height="36" rx="18" fill="none" stroke="' + INK + '" stroke-width="14"/><rect x="6" y="28" width="70" height="36" rx="18" fill="none" stroke="' + BLUE + '" stroke-width="6"/></g>' +
        '<g class="wlc-snapR"><path d="M150 64 h-18 a18 18 0 0 1 0 -36 h10" fill="none" stroke="' + INK + '" stroke-width="14" stroke-linecap="round" transform="rotate(14 150 46)"/>' +
        '<path d="M150 64 h-18 a18 18 0 0 1 0 -36 h10" fill="none" stroke="' + BLUE + '" stroke-width="6" stroke-linecap="round" transform="rotate(14 150 46)"/>' +
        '<rect x="148" y="28" width="66" height="36" rx="18" fill="none" stroke="' + INK + '" stroke-width="14"/><rect x="148" y="28" width="66" height="36" rx="18" fill="none" stroke="' + BLUE + '" stroke-width="6"/></g>' +
        '<path class="wlc-pop" style="animation-delay:700ms" d="M92 20 L98 4 M104 40 L122 34 M88 70 L80 86" stroke="' + RED + '" stroke-width="5" stroke-linecap="round"/></svg>' +
      person('adam', { w: 124, brows: 'worried', mouth: 'worry', extra: 'sweat', style: 'position:absolute;right:16px;bottom:-4px', cls: 'wlc-shake' }) +
      bub(L('Umm... London?', 'امم... لندن؟'), 'left:24px;bottom:56px;width:150px;text-align:center', back),
      note: L('A <b>Pass</b> counts as wrong too, but saves time on a question nobody knows.', '<b>«تمرير»</b> يُحسب خطأ أيضًا، لكنه يوفّر الوقت في سؤال لا يعرفه أحد.') },

    { id: 'bank', bg: GOLD, dots: true, num: '5', capBg: '#FFFFFF', cap: L('Say <b>BANK</b> before your question to lock the money in. The chain then restarts from the bottom.', 'قل <b>«إيداع»</b> قبل سؤالك لتحفظ المال في البنك، ثم تبدأ السلسلة من الأسفل من جديد.'), art:
      sfx(L('BANK!', 'إيداع!'), 'left:0;right:0;text-align:center;top:4px;font-size:96px;color:#FFFFFF;transform:rotate(-7deg)', 300) +
      person('lina', { w: 140, brows: 'fierce', mouth: 'shout', style: 'position:absolute;left:10px;bottom:-4px', cls: 'wlc-bob' }) +
      '<div class="wlc-bank wlc-pop" style="right:16px;bottom:40px;animation-delay:900ms"><div class="wlc-k" style="color:' + GOLD + '">' + L('Bank', 'البنك') + '</div>' +
        '<div style="font-family:var(--wlc-display);font-size:38px;color:#FFFFFF;letter-spacing:' + L('2px', '0') + '">' + money('10,000') + '</div><div style="font-size:13px;color:#FFFFFF">' + L('safe for this round', 'في أمان لهذه الجولة') + '</div></div>',
      note: L('Bank early: safe but small. Wait: bigger, but risky.', 'الإيداع المبكر آمن لكنه صغير، والانتظار أكبر لكنه مخاطرة.') },

    { id: 'timeup', bg: INK, dark: true, cap: L('When the clock hits zero, any money still on the chain is lost.', 'عندما ينتهي الوقت يضيع كل مال بقي في السلسلة.'), art:
      '<div class="wlc-shake" style="position:absolute;left:50%;margin-left:-85px;top:20px">' + clock('0:00', RED, RED) + '</div>' +
      sfx(L('BZZZT!', 'بززززت!'), 'left:30px;top:206px;font-size:58px;color:' + RED + ';transform:rotate(-5deg)', 300) +
      '<div class="wlc-t" style="position:absolute;left:24px;right:24px;bottom:24px;display:flex;flex-direction:column;gap:10px">' +
        '<div class="wlc-tag" style="background:' + GOLD + '">' + L('Bank: ' + money('15,000') + ' &#10003; kept', 'البنك: ' + money('15,000') + ' &#10003; محفوظ') + '</div>' +
        '<div class="wlc-tag wlc-strike">' + L('Chain: ' + money('5,000') + ' lost', 'السلسلة: ' + money('5,000') + ' ضاعت') + '</div></div>',
      note: L('Bank the full target early and the round ends on the spot.', 'أودِعوا الهدف كاملًا مبكرًا فتنتهي الجولة فورًا.') },

    { id: 'vote', bg: '#DCE8FF', num: '6', cap: L('After every round, everyone secretly votes for the <b>Chain Breaker</b>.', 'بعد كل جولة يصوّت الجميع سرًّا على <b>«كاسر السلسلة»</b>.'), art:
      '<div class="wlc-table wlc-t" style="' + L('left', 'right') + ':14px;top:12px">' +
        '<div class="h">' + L('Player', 'اللاعب') + '</div><div class="h">' + L('Right', 'صح') + '</div><div class="h">' + L('Wrong', 'خطأ') + '</div>' +
        '<div class="g">&#9733; ' + nm('sara') + '</div><div class="g">5</div><div class="g">0</div>' +
        '<div>' + nm('omar') + '</div><div>3</div><div>1</div><div>' + nm('lina') + '</div><div>3</div><div>1</div>' +
        '<div class="r">' + nm('adam') + '</div><div class="r">1</div><div class="r">3</div></div>' +
      '<div class="wlc-t" style="position:absolute;left:14px;right:14px;top:184px;font-size:13px;font-weight:700;color:' + INK + '">' + L('&#9733; Chain Champion: the round&rsquo;s best player', '&#9733; بطل السلسلة: أفضل لاعب في الجولة') + '</div>' +
      '<div style="position:absolute;' + L('left', 'right') + ':14px;top:216px;display:flex;gap:10px">' +
        ['adam', 'adam', 'omar'].map(function (n, i) { return '<div class="wlc-phone wlc-pop" style="animation-delay:' + (400 + i * 300) + 'ms"><span>' + nm(n) + '</span></div>'; }).join('') + '</div>' +
      sfx(L('VOTE!', 'صوّتوا!'), L('left', 'right') + ':20px;top:326px;font-size:56px;color:' + YEL + ';transform:rotate(-5deg)', 1400),
      note: L('Tied vote? The Chain Champion decides. No phone? The host votes for you.', 'تعادلت الأصوات؟ القرار لبطل السلسلة. ليس معك هاتف؟ يصوّت المقدّم عنك.') },

    { id: 'goodbye', bg: '#FFE0E0', dots: true, num: '7', cap: L('The Chain Breaker leaves. Play again, one player fewer each round, until two remain.', 'يغادر كاسر السلسلة. العبوا من جديد بلاعب أقل في كل جولة حتى يبقى اثنان.'), art:
      host({ w: 130, brows: 'stern', mouth: 'flat', style: 'position:absolute;left:6px;bottom:-4px' }) +
      bub(L('Adam, you are the Chain Breaker...', 'آدم، أنت كاسر السلسلة...'), 'left:14px;top:10px;width:200px', 'left:40px') +
      sfx(L('GOODBYE!', 'وداعًا!'), 'left:0;right:0;text-align:center;top:104px;font-size:' + L('54px', '76px') + ';color:' + RED + ';transform:rotate(-4deg)', 600) +
      person('adam', { w: 110, eyes: 'happy', wave: true, style: 'position:absolute;right:20px;bottom:-4px', cls: 'wlc-walk' }) },

    { id: 'family', bg: '#E6F7EE', cap: L('Playing <b>Family</b> rules? Nobody leaves. The Chain Breaker gets a token instead.', 'تلعبون بالقواعد <b>«العائلية»</b>؟ لا أحد يغادر، بل يأخذ كاسر السلسلة شارة.'), art:
      person('adam', { w: 120, eyes: 'happy', extra: 'token', style: 'position:absolute;left:30px;bottom:-4px', cls: 'wlc-bob' }) +
      sfx(L('+1 TOKEN', '+1 شارة'), 'right:14px;top:30px;font-size:' + L('46px', '54px') + ';color:' + GOLD + ';transform:rotate(6deg)', 400) +
      bub(L('Still in the game!', 'ما زلت في اللعبة!'), 'right:16px;top:120px;width:150px;text-align:center', 'left:24px', 'wlc-pop wlc-d2'),
      note: L('After the last round, the two with the fewest tokens play the final.', 'بعد آخر جولة، يلعب النهائي اللاعبان الأقل شارات.') },

    { id: 'double', bg: GOLD, dots: true, num: '8', capBg: '#FFFFFF', cap: L('Classic bonus: the last two play one more round where everything banked is <b>doubled</b>.', 'مكافأة الكلاسيكية: يلعب آخر لاعبَين جولة إضافية <b>يُضاعَف</b> فيها كل ما يُودَع.'), art:
      sfx('&times;2', 'left:0;right:0;text-align:center;top:30px;font-size:200px;line-height:1;color:#FFFFFF;font-family:Bangers,Impact,sans-serif;direction:ltr', 300),
      note: L('Bigger bank, bigger prize.', 'بنك أكبر، جائزة أكبر.') },

    { id: 'h2h', bg: INK, dark: true, num: '9', cap: L('Head to head! 5 questions each, taking turns. Most correct answers wins.', 'المواجهة المباشرة! 5 أسئلة لكل لاعب بالتناوب، والأكثر إجابات صحيحة يفوز.'), art:
      '<div class="wlc-t" style="position:absolute;left:16px;right:16px;top:24px;display:flex;flex-direction:column;gap:20px">' +
        '<div class="wlc-h2h"><b>&#9733; ' + nm('sara') + '</b>' + dots([1, 1, 0, 1, 1], 32) + '<em>4</em></div>' +
        '<div class="wlc-h2h"><b>' + nm('lina') + '</b>' + dots([1, 0, 1, 0, -1], 32) + '<em style="color:#FFFFFF">2</em></div></div>' +
      sfx(L("CAN'T CATCH HER!", 'لا أحد يلحق بها!'), 'left:0;right:0;text-align:center;top:170px;font-size:' + L('40px', '48px') + ';color:' + GOLD + ';transform:rotate(-4deg)', 1400),
      note: L('Green = right, red = wrong. The Chain Champion chooses to go first or second.', 'الأخضر صحيح والأحمر خطأ. بطل السلسلة يختار أن يبدأ أولًا أو ثانيًا.') },

    { id: 'sudden', bg: '#2B1240', dark: true, cap: L('Still level after 5? <b>Sudden death</b>: one question each until one is right and the other wrong.', 'ما زال التعادل بعد 5؟ <b>«الموت المفاجئ»</b>: سؤال لكل لاعب حتى يصيب أحدهما ويخطئ الآخر.'), art:
      '<div class="wlc-t" style="position:absolute;left:16px;right:16px;top:24px;display:flex;flex-direction:column;gap:20px">' +
        '<div class="wlc-h2h"><b>' + nm('omar') + '</b>' + dots([1, 1], 40) + '</div>' +
        '<div class="wlc-h2h"><b>' + nm('noor') + '</b>' + dots([1, 0], 40) + '</div></div>' +
      sfx(L('SUDDEN DEATH!', 'الموت المفاجئ!'), 'left:0;right:0;text-align:center;top:160px;font-size:' + L('46px', '54px') + ';color:' + RED + ';transform:rotate(-3deg)', 900),
      note: L('Omar is right, Noor is wrong: Omar wins.', 'عمر أصاب ونور أخطأت: عمر يفوز.') },

    { id: 'winner', bg: BLUE, dots: true, art:
      '<div class="wlc-confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
      '<div class="wlc-title wlc-pop" style="position:absolute;left:0;right:0;top:24px;text-align:center;white-space:nowrap;font-size:' + L('56px', '64px;line-height:1.15') + ';animation-delay:200ms">' +
        L('WINNER<br>TAKES<br>THE BANK!', 'الفائز<br>يأخذ البنك<br>كله!') + '</div>' +
      person('sara', { w: 136, eyes: 'happy', mouth: 'grin', extra: 'trophy', shirt: '#FFFFFF', style: 'position:absolute;left:50%;margin-left:-68px;bottom:-4px', cls: 'wlc-bob' }),
      note: L('Then tap <b>Back to the lobby</b> to play again with the same players.', 'ثم اضغط <b>«العودة إلى الردهة»</b> لتلعبوا من جديد بنفس اللاعبين.') },

    { id: 'cheat', bg: YEL, cheat: true, cap: L('Cheat sheet', 'الخلاصة'), art:
      '<div class="wlc-cheat wlc-t">' +
        [[L('Correct', 'صحيح'), GREEN, L('one step up the chain', 'درجة للأعلى في السلسلة')], [L('Wrong', 'خطأ'), RED, L('chain back to zero', 'السلسلة تعود إلى الصفر')],
         [L('Pass', 'تمرير'), INK, L('counts as wrong', 'يُحسب خطأ')], [L('Bank', 'إيداع'), '#9A6F00', L('saves the chain&rsquo;s money', 'يحفظ مال السلسلة')],
         [L('Vote', 'التصويت'), BLUE, L('the Chain Breaker leaves', 'يغادر كاسر السلسلة')], [L('Head to head', 'المواجهة'), '#6D3FE0', L('winner takes it all', 'الفائز يأخذ كل شيء')]]
        .map(function (c, i) { return '<div class="wlc-tile wlc-pop" style="animation-delay:' + (200 + i * 120) + 'ms"><b style="color:' + c[1] + '">' + c[0] + '</b><span>' + c[2] + '</span></div>'; }).join('') +
      '</div><button type="button" class="wlc-again" data-wlc-go="0">' + L('Read it again', 'اقرأها من جديد') + '</button>' }
    ];
  }
  var PAGES = buildPages();

  /* ------------------------------------------------------------------ styles */
  var CSS =
    '#wlc{--wlc-display:"Bangers",Impact,"Arial Black",sans-serif;--wlc-body:"Comic Neue","Comic Sans MS","Chalkboard SE","Segoe Print",sans-serif;' +
      'position:fixed;inset:0;z-index:2147483000;background:#1B1F3B;color:' + INK + ';display:flex;flex-direction:column;align-items:center;' +
      'font-family:var(--wlc-body);-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;touch-action:pan-y;overflow:hidden;direction:ltr}' +
    '#wlc *{box-sizing:border-box}' +
    '#wlc .wlc-bar{width:100%;max-width:560px;display:flex;align-items:center;justify-content:space-between;padding:calc(8px + env(safe-area-inset-top, 0px)) 12px 8px;gap:8px;min-height:56px;color:#FFFFFF}' +
    '#wlc .wlc-bar h1{margin:0;min-width:0;white-space:nowrap;overflow:hidden;font-family:var(--wlc-display);font-weight:400;font-size:22px;letter-spacing:2px;color:' + GOLD + '}' +
    '#wlc .wlc-count{font-weight:700;font-size:14px;opacity:.85;white-space:nowrap}' +
    '#wlc button{font:inherit;cursor:pointer}' +
    '#wlc .wlc-x{flex:none;width:44px;height:44px;border-radius:50%;border:2px solid #FFFFFF;background:transparent;color:#FFFFFF;font-size:22px;line-height:1;display:flex;align-items:center;justify-content:center;padding:0;margin:0}' +
    '#wlc .wlc-stage{flex:1;width:100%;display:flex;align-items:center;justify-content:center;min-height:0}' +
    '#wlc .wlc-sizer{position:relative}' +
    '#wlc .wlc-book{position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;transform-origin:0 0;perspective:1800px}' +
    '#wlc .wlc-page{position:absolute;inset:0;padding:10px 14px 16px 10px;display:flex;flex-direction:column;background:#1B1F3B;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform-origin:0 50%}' +
    '#wlc .wlc-panel{position:relative;flex:1;display:flex;flex-direction:column;border:4px solid ' + INK + ';box-shadow:7px 7px 0 ' + INK + ';overflow:hidden;background-color:#FFFFFF}' +
    '#wlc .wlc-panel.dots{background-image:radial-gradient(rgba(20,18,31,.13) 2px,transparent 2.6px);background-size:14px 14px}' +
    '#wlc .wlc-panel.dark.dots,#wlc .wlc-panel.dark{background-image:radial-gradient(rgba(255,255,255,.07) 2px,transparent 2.6px);background-size:14px 14px}' +
    '#wlc .wlc-cap{position:relative;z-index:3;margin:-4px -4px 0;background:' + YEL + ';border:3px solid ' + INK + ';padding:10px 12px;font-weight:700;font-size:18px;line-height:1.25}' +
    '#wlc .wlc-num{font-family:var(--wlc-display);font-size:26px;letter-spacing:1px;margin-right:8px;color:' + RED + ';vertical-align:-2px}' +
    '#wlc .wlc-art{position:relative;flex:1;min-height:0}' +
    '#wlc .wlc-note{position:relative;z-index:3;margin:0 10px 12px;background:#FFFFFF;border:3px solid ' + INK + ';padding:8px 10px;font-weight:700;font-size:15px;line-height:1.3}' +
    '#wlc .wlc-bub{position:absolute;z-index:2;background:#FFFFFF;border:3px solid ' + INK + ';border-radius:20px;padding:9px 14px;font-weight:700;font-size:17px;line-height:1.2}' +
    '#wlc .wlc-tail{position:absolute;width:16px;height:16px;background:inherit;border-right:3px solid ' + INK + ';border-bottom:3px solid ' + INK + ';transform:rotate(45deg);bottom:-10px}' +
    '#wlc .wlc-sfx{position:absolute;z-index:2;font-family:var(--wlc-display);letter-spacing:2px;-webkit-text-stroke:3px ' + INK + ';paint-order:stroke fill;text-shadow:5px 5px 0 ' + INK + ';line-height:1}' +
    '#wlc .wlc-title{font-family:var(--wlc-display);font-size:96px;line-height:.9;letter-spacing:4px;color:' + GOLD + ';-webkit-text-stroke:4px ' + INK + ';paint-order:stroke fill;text-shadow:7px 7px 0 ' + INK + '}' +
    '#wlc .wlc-hint{font-weight:700;font-size:15px;color:#FFFFFF;animation:wlcNudge 1.4s ease-in-out infinite}' +
    '#wlc .wlc-k{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px}' +
    '#wlc .wlc-row{display:flex;gap:8px;align-items:center;font-weight:700;font-size:14px}' +
    '#wlc .wlc-chip{font-weight:700;font-size:14px;border:3px solid ' + INK + ';border-radius:999px;padding:4px 10px;background:#FFFFFF;white-space:nowrap}' +
    '#wlc .wlc-tv{position:absolute;width:200px;height:130px;background:' + INK + ';border-radius:10px;display:flex;align-items:center;justify-content:center;gap:12px}' +
    '#wlc .wlc-clock{width:170px;height:170px;border-radius:50%;background:#FFFFFF;border:9px solid;display:flex;align-items:center;justify-content:center;font-family:var(--wlc-display);font-size:62px;letter-spacing:2px}' +
    '#wlc .wlc-ladder{position:absolute;display:flex;flex-direction:column-reverse;gap:4px;width:136px}' +
    '#wlc .wlc-step{font-family:var(--wlc-display);font-size:19px;letter-spacing:1px;border:3px solid ' + INK + ';border-radius:999px;padding:2px 10px;background:#FFFFFF;text-align:center}' +
    '#wlc .wlc-step.on{animation:wlcStepOn .35s ease-out both}' +
    '#wlc .wlc-step.cur{animation:wlcStepCur .4s ease-out both}' +
    '#wlc .wlc-bank{position:absolute;width:160px;background:' + INK + ';box-shadow:6px 6px 0 #FFFFFF;display:flex;flex-direction:column;align-items:center;padding:10px;gap:2px;font-weight:700}' +
    '#wlc .wlc-tag{border:3px solid ' + INK + ';padding:8px 12px;font-weight:700;font-size:18px;background:#FFFFFF}' +
    '#wlc .wlc-strike{text-decoration:line-through;color:#7A1020;animation:wlcFade 1s 900ms both}' +
    '#wlc .wlc-table{position:absolute;width:190px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));background:#FFFFFF;border:3px solid ' + INK + ';box-shadow:4px 4px 0 ' + INK + ';font-weight:700;font-size:14px}' +
    '#wlc .wlc-table div{padding:5px 6px;border-bottom:2px solid ' + INK + '}' +
    '#wlc .wlc-table .h{background:' + INK + ';color:#FFFFFF}#wlc .wlc-table .g{background:' + YEL + '}#wlc .wlc-table .r{background:#FFE0E0}' +
    '#wlc .wlc-phone{width:64px;height:96px;background:' + INK + ';border-radius:10px;padding:6px;display:flex}' +
    '#wlc .wlc-phone span{flex:1;background:#FFFFFF;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px}' +
    '#wlc .wlc-h2h{display:flex;align-items:center;gap:8px}' +
    '#wlc .wlc-h2h b{font-family:var(--wlc-display);font-weight:400;font-size:24px;color:#FFFFFF;letter-spacing:1px;width:84px;white-space:nowrap;flex:none}' +
    '#wlc .wlc-h2h em{font-style:normal;font-family:var(--wlc-display);font-size:36px;color:' + GOLD + ';margin-inline-start:6px}' +
    '#wlc .wlc-dot{display:inline-block;border-radius:50%;border:3px solid ' + INK + ';box-shadow:0 0 0 2px rgba(255,255,255,.6)}' +
    '#wlc .wlc-cheat{position:absolute;left:12px;right:12px;top:12px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}' +
    '#wlc .wlc-tile{background:#FFFFFF;border:3px solid ' + INK + ';padding:10px;display:flex;flex-direction:column;gap:3px;min-height:92px}' +
    '#wlc .wlc-tile b{font-family:var(--wlc-display);font-weight:400;font-size:26px;letter-spacing:1px}' +
    '#wlc .wlc-tile span{font-weight:700;font-size:15px;line-height:1.2}' +
    '#wlc .wlc-again{position:absolute;left:12px;right:12px;bottom:14px;height:56px;border:3px solid ' + INK + ';background:' + BLUE + ';color:#FFFFFF;font-family:var(--wlc-display);font-size:26px;letter-spacing:2px;box-shadow:5px 5px 0 ' + INK + '}' +
    '#wlc .wlc-confetti i{position:absolute;top:-20px;width:12px;height:7px;background:' + GOLD + ';animation:wlcFall 2.6s linear infinite}' +
    '#wlc .wlc-confetti i:nth-child(2n){background:#FFFFFF;width:8px;height:8px;border-radius:50%}#wlc .wlc-confetti i:nth-child(3n){background:' + YEL + '}' +
    '#wlc .wlc-nav{width:100%;max-width:560px;display:flex;align-items:center;gap:10px;padding:8px 12px calc(12px + env(safe-area-inset-bottom))}' +
    '#wlc .wlc-nav button.arrow{width:56px;height:48px;border:3px solid ' + INK + ';background:' + GOLD + ';color:' + INK + ';font-size:24px;font-weight:700;box-shadow:4px 4px 0 #000;margin:0;padding:0;border-radius:0}' +
    '#wlc .wlc-nav button.arrow:disabled{opacity:.35}' +
    '#wlc .wlc-pips{flex:1;display:flex;justify-content:center;flex-wrap:wrap;gap:6px}' +
    '#wlc .wlc-pips i{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.3)}#wlc .wlc-pips i.on{background:' + GOLD + ';transform:scale(1.35)}' +
    '#wlc .wlc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}' +
    /* page turn */
    '#wlc .wlc-out{animation:wlcTurnOut .62s cubic-bezier(.45,.05,.55,.95) forwards;z-index:2}' +
    '#wlc .wlc-in{animation:wlcTurnIn .62s cubic-bezier(.45,.05,.55,.95) forwards;z-index:2}' +
    '#wlc .wlc-out::after,#wlc .wlc-in::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0),rgba(0,0,0,.45));animation:wlcShade .62s forwards;pointer-events:none}' +
    '@keyframes wlcTurnOut{from{transform:rotateY(0)}to{transform:rotateY(-105deg)}}' +
    '@keyframes wlcTurnIn{from{transform:rotateY(-105deg)}to{transform:rotateY(0)}}' +
    '@keyframes wlcShade{0%{opacity:0}50%{opacity:1}100%{opacity:0}}' +
    /* page life */
    '#wlc .wlc-live .wlc-pop{animation:wlcPop .45s cubic-bezier(.2,1.6,.4,1) both}' +
    '#wlc .wlc-live .wlc-bub{animation:wlcPop .4s cubic-bezier(.2,1.6,.4,1) 200ms both}' +
    '#wlc .wlc-live .wlc-d2{animation-delay:700ms}' +
    '#wlc .wlc-live .wlc-bob{animation:wlcBob 2.4s ease-in-out infinite}#wlc .wlc-live .wlc-bob2{animation-delay:-1.2s}' +
    '#wlc .wlc-live .wlc-shake{animation:wlcShake .5s 300ms 2}' +
    '#wlc .wlc-live .wlc-walk{animation:wlcWalk 3s 900ms ease-in forwards}' +
    '#wlc .wlc-live .wlc-spin{animation:wlcBob 1s ease-in-out infinite}' +
    '#wlc .wlc-live .wlc-snapL{animation:wlcSnapL .5s 600ms ease-out forwards}#wlc .wlc-live .wlc-snapR{animation:wlcSnapR .5s 600ms ease-out forwards}' +
    '@keyframes wlcPop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}' +
    '#wlc .wlc-live .wlc-sfx.wlc-pop{animation-name:wlcSlam}' +
    '@keyframes wlcSlam{0%{opacity:0;scale:2.2}70%{opacity:1;scale:.92}100%{opacity:1;scale:1}}' +
    '@keyframes wlcBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}' +
    '@keyframes wlcShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}' +
    '@keyframes wlcWalk{0%{transform:none}100%{transform:translateX(180px)}}' +
    '@keyframes wlcSnapL{to{transform:translate(-10px,8px) rotate(-12deg)}}@keyframes wlcSnapR{to{transform:translate(14px,10px) rotate(14deg)}}' +
    '@keyframes wlcStepOn{from{background:#FFFFFF;color:' + INK + '}to{background:' + BLUE + ';color:#FFFFFF}}' +
    '@keyframes wlcStepCur{from{background:#FFFFFF}to{background:' + GOLD + ';box-shadow:4px 4px 0 ' + INK + ';transform:translateX(8px)}}' +
    '@keyframes wlcFade{to{opacity:.55}}' +
    '@keyframes wlcNudge{0%,100%{transform:none}50%{transform:translateX(-8px)}}' +
    '@keyframes wlcNudgeR{0%,100%{transform:none}50%{transform:translateX(8px)}}' +
    '#wlc.wlc-ar .wlc-hint{animation-name:wlcNudgeR}' +
    '@keyframes wlcFall{from{transform:translateY(0) rotate(0)}to{transform:translateY(640px) rotate(540deg)}}' +
    '#wlc.wlc-ar{--wlc-display:"Lalezar","Bangers",Impact,sans-serif;--wlc-body:"Baloo Bhaijaan 2","Noto Naskh Arabic","Geeza Pro",Tahoma,sans-serif}' +
    '#wlc.wlc-ar .wlc-cap,#wlc.wlc-ar .wlc-note,#wlc.wlc-ar .wlc-bub,#wlc.wlc-ar .wlc-t,#wlc.wlc-ar .wlc-sfx,#wlc.wlc-ar .wlc-title,#wlc.wlc-ar .wlc-hint,#wlc.wlc-ar .wlc-again,#wlc.wlc-ar .wlc-tv div,#wlc.wlc-ar .wlc-bank{direction:rtl}' +
    '#wlc.wlc-ar .wlc-sfx,#wlc.wlc-ar .wlc-title,#wlc.wlc-ar .wlc-bar h1,#wlc.wlc-ar .wlc-tile b,#wlc.wlc-ar .wlc-again,#wlc.wlc-ar .wlc-step,#wlc.wlc-ar .wlc-h2h b{letter-spacing:0}' +
    '#wlc.wlc-ar .wlc-cap{line-height:1.5;font-size:17px}#wlc.wlc-ar .wlc-note{line-height:1.55;font-size:14.5px}#wlc.wlc-ar .wlc-bub{line-height:1.45}' +
    '#wlc.wlc-ar .wlc-num{margin-right:0;margin-left:8px}#wlc.wlc-ar .wlc-tile span{line-height:1.45}#wlc.wlc-ar .wlc-sfx{line-height:1.3}' +
    '#wlc.wlc-ar .wlc-page{transform-origin:100% 50%}#wlc.wlc-ar .wlc-out{animation-name:wlcTurnOutR}#wlc.wlc-ar .wlc-in{animation-name:wlcTurnInR}' +
    '#wlc.wlc-ar .wlc-out::after,#wlc.wlc-ar .wlc-in::after{background:linear-gradient(270deg,rgba(0,0,0,0),rgba(0,0,0,.45))}' +
    '#wlc.wlc-ar .wlc-nav{direction:rtl}' +
    '@keyframes wlcTurnOutR{from{transform:rotateY(0)}to{transform:rotateY(105deg)}}@keyframes wlcTurnInR{from{transform:rotateY(105deg)}to{transform:rotateY(0)}}' +
    '#wlc .wlc-lang{flex:none;height:40px;min-width:0;padding:0 10px;border:2px solid #FFFFFF;background:transparent;color:#FFFFFF;font-weight:700;font-size:15px;border-radius:20px;margin:0}' +
    '#wlc .wlc-right{display:flex;align-items:center;gap:6px;flex:none}' +
    '@media (prefers-reduced-motion:reduce){#wlc *,#wlc *::after{animation-duration:1ms!important;animation-iteration-count:1!important;animation-delay:0ms!important}' +
      '#wlc .wlc-live .wlc-walk{animation:none!important}#wlc .wlc-confetti{display:none}}';

  /* ------------------------------------------------------------------ rendering */
  function pageHtml(i) {
    var p = PAGES[i];
    var cap = p.cap ? '<div class="wlc-cap" style="' + (p.capBg ? 'background:' + p.capBg : '') + (p.cheat ? ';font-family:var(--wlc-display);font-weight:400;font-size:30px;letter-spacing:2px' : '') + '">' +
      (p.num ? '<span class="wlc-num">' + p.num + '</span>' : '') + p.cap + '</div>' : '';
    return '<div class="wlc-panel' + (p.dots ? ' dots' : '') + (p.dark ? ' dark' : '') + '" style="background-color:' + p.bg + '">' +
      cap + '<div class="wlc-art">' + p.art + '</div>' + (p.note ? note(p.note) : '') + '</div>';
  }

  var root = null, book = null, sizer = null, cur = 0, busy = false, opts = {}, prevOverflow = '', keyHandler = null, resizeHandler = null;

  function label(lang) { return lang === 'ar' ? 'القصة المصورة' : 'Comic: how to play'; }

  function addFonts() {
    if (document.getElementById('wlc-fonts')) return;
    var l = document.createElement('link');
    l.id = 'wlc-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&family=Lalezar&family=Baloo+Bhaijaan+2:wght@500;700&display=swap';
    document.head.appendChild(l);
  }
  function addCss() {
    if (document.getElementById('wlc-css')) return;
    var s = document.createElement('style');
    s.id = 'wlc-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function makePage(i) {
    var el = document.createElement('div');
    el.className = 'wlc-page';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-roledescription', 'page');
    el.setAttribute('aria-label', L('Page ', 'صفحة ') + (i + 1) + L(' of ', ' من ') + PAGES.length);
    el.innerHTML = pageHtml(i);
    // confetti positions (winner page)
    var conf = el.querySelectorAll('.wlc-confetti i');
    for (var c = 0; c < conf.length; c++) {
      conf[c].style.left = (6 + c * 9.5) + '%';
      conf[c].style.animationDelay = (-c * 0.27) + 's';
    }
    return el;
  }

  function live(el) { // restart the page's animations
    el.classList.remove('wlc-live'); void el.offsetWidth; el.classList.add('wlc-live');
  }

  function updateChrome() {
    root.querySelector('.wlc-count').textContent = (cur + 1) + ' / ' + PAGES.length;
    root.querySelector('[data-wlc-prev]').disabled = cur === 0;
    root.querySelector('[data-wlc-next]').disabled = cur === PAGES.length - 1;
    var pips = root.querySelectorAll('.wlc-pips i');
    for (var i = 0; i < pips.length; i++) pips[i].className = i === cur ? 'on' : '';
    var sr = root.querySelector('.wlc-sr');
    var p = PAGES[cur];
    sr.textContent = L('Page ', 'صفحة ') + (cur + 1) + L(' of ', ' من ') + PAGES.length + '. ' + (p.cap || L('ChainQuest, how to play', 'تشين كويست، طريقة اللعب')).replace(/<[^>]+>/g, '');
  }

  // The bar, arrows and labels in the current language (arrows point the reading direction).
  function chromeText() {
    var ar = LANG === 'ar';
    root.className = ar ? 'wlc-ar' : '';
    root.setAttribute('dir', 'ltr');
    root.setAttribute('aria-label', L('ChainQuest: how to play (comic)', 'تشين كويست: طريقة اللعب (قصة مصورة)'));
    root.querySelector('.wlc-bar h1').textContent = L('ChainQuest', 'تشين كويست');
    var prev = root.querySelector('[data-wlc-prev]'), next = root.querySelector('[data-wlc-next]');
    prev.innerHTML = ar ? '&#9654;' : '&#9664;';
    next.innerHTML = ar ? '&#9664;' : '&#9654;';
    prev.setAttribute('aria-label', L('Previous page', 'الصفحة السابقة'));
    next.setAttribute('aria-label', L('Next page', 'الصفحة التالية'));
    var lb = root.querySelector('[data-wlc-lang]');
    lb.textContent = ar ? 'English' : 'عربي';
    lb.setAttribute('lang', ar ? 'en' : 'ar');
    lb.setAttribute('aria-label', ar ? 'Read in English' : 'اقرأ بالعربية');
    var x = root.querySelector('[data-wlc-close]');
    if (x) x.setAttribute('aria-label', L('Close', 'إغلاق'));
  }

  function setLang(l) {
    LANG = l === 'ar' ? 'ar' : 'en';
    PAGES = buildPages();
    if (!root) return;
    chromeText();
    busy = false;
    book.innerHTML = '';
    var pg = makePage(cur);
    book.appendChild(pg); live(pg);
    updateChrome();
    if (typeof opts.onLang === 'function') opts.onLang(LANG);
  }

  function go(n) {
    if (busy || n < 0 || n >= PAGES.length || n === cur) return;
    var old = book.querySelector('.wlc-page');
    var fresh = makePage(n);
    var forward = n > cur;
    cur = n;
    updateChrome();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!old || reduce) {
      if (old) old.remove();
      book.appendChild(fresh); live(fresh);
      return;
    }
    busy = true;
    if (forward) { book.insertBefore(fresh, old); old.classList.add('wlc-out'); live(fresh); }
    else { book.appendChild(fresh); fresh.classList.add('wlc-in'); }
    var moving = forward ? old : fresh;
    var done = function () {
      if (!busy) return;
      busy = false;
      if (old.parentNode) old.remove();
      fresh.classList.remove('wlc-in');
      if (!forward) live(fresh);
    };
    moving.addEventListener('animationend', function (e) { if (e.target === moving) done(); });
    setTimeout(done, 900); // safety net if animationend never fires
  }

  function fit() {
    if (!root) return;
    var stage = root.querySelector('.wlc-stage');
    var aw = stage.clientWidth - 16, ah = stage.clientHeight - 8;
    var s = Math.max(0.3, Math.min(aw / W, ah / H, 1.6));
    sizer.style.width = Math.round(W * s) + 'px';
    sizer.style.height = Math.round(H * s) + 'px';
    book.style.transform = 'scale(' + s + ')';
  }

  function open(o) {
    opts = o || {};
    if (root) close();
    addFonts(); addCss();
    LANG = opts.lang === 'ar' ? 'ar' : 'en';
    PAGES = buildPages();
    root = document.createElement('div');
    root.id = 'wlc';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    var pips = '';
    for (var i = 0; i < PAGES.length; i++) pips += '<i></i>';
    root.innerHTML =
      '<div class="wlc-bar"><h1></h1><div class="wlc-right"><span class="wlc-count"></span>' +
        '<button type="button" class="wlc-lang" data-wlc-lang></button>' +
        (opts.standalone ? '' : '<button type="button" class="wlc-x" data-wlc-close>&#10005;</button>') + '</div></div>' +
      '<div class="wlc-stage"><div class="wlc-sizer"><div class="wlc-book"></div></div></div>' +
      '<div class="wlc-nav"><button type="button" class="arrow" data-wlc-prev></button>' +
        '<div class="wlc-pips" aria-hidden="true">' + pips + '</div>' +
        '<button type="button" class="arrow" data-wlc-next></button></div>' +
      '<div class="wlc-sr" aria-live="polite"></div>';
    document.body.appendChild(root);
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    book = root.querySelector('.wlc-book');
    sizer = root.querySelector('.wlc-sizer');
    chromeText();
    cur = Math.max(0, Math.min(PAGES.length - 1, opts.page || 0));
    var first = makePage(cur);
    book.appendChild(first); live(first);
    updateChrome();
    fit();

    root.querySelector('[data-wlc-prev]').onclick = function () { go(cur - 1); };
    root.querySelector('[data-wlc-next]').onclick = function () { go(cur + 1); };
    var x = root.querySelector('[data-wlc-close]');
    if (x) x.onclick = close;
    root.querySelector('[data-wlc-lang]').onclick = function () { setLang(LANG === 'ar' ? 'en' : 'ar'); };

    // swipe, or tap the left/right part of the page (Arabic reads right to left: swipe right / tap left = next)
    var sx = null, sy = 0, st = 0;
    var stage = root.querySelector('.wlc-stage');
    stage.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; st = Date.now(); });
    stage.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      sx = null;
      var again = e.target.closest && e.target.closest('[data-wlc-go]');
      if (again) { go(parseInt(again.getAttribute('data-wlc-go'), 10)); return; }
      var dirSign = LANG === 'ar' ? -1 : 1;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { go(cur + (dx < 0 ? 1 : -1) * dirSign); return; }
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && Date.now() - st < 500) {
        var r = sizer.getBoundingClientRect();
        var leftTap = LANG === 'ar' ? e.clientX < r.left + r.width * 0.67 : e.clientX < r.left + r.width * 0.33;
        go(cur + (leftTap ? -1 : 1) * dirSign);
      }
    });
    keyHandler = function (e) {
      var fwd = LANG === 'ar' ? 'ArrowLeft' : 'ArrowRight', bwd = LANG === 'ar' ? 'ArrowRight' : 'ArrowLeft';
      if (e.target && e.target.closest && e.target.closest('button') && e.key === ' ') return;
      if (e.key === fwd || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(cur + 1); }
      else if (e.key === bwd || e.key === 'PageUp') { e.preventDefault(); go(cur - 1); }
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(PAGES.length - 1);
      else if (e.key === 'Escape' && !opts.standalone) close();
    };
    resizeHandler = function () { fit(); };
    document.addEventListener('keydown', keyHandler);
    window.addEventListener('resize', resizeHandler);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    root.querySelector('[data-wlc-next]').focus();
  }

  function close() {
    if (!root) return;
    document.removeEventListener('keydown', keyHandler);
    window.removeEventListener('resize', resizeHandler);
    root.remove();
    root = null; busy = false;
    document.body.style.overflow = prevOverflow;
    if (typeof opts.onClose === 'function') opts.onClose();
  }

  window.WLComic = { open: open, close: close, label: label, setLang: setLang, pages: PAGES.length };
})();
