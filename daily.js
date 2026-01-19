// daily.js - نظام تحدي اليوم (سؤال الـ 24 ساعة)

// 1. وظيفة المدير لنشر التحدي (تُستدعى عند الضغط على زر النشر في لوحة الإدارة)
function publishDailyChallenge() {
    const text = document.getElementById('daily-q-text').value;
    const img = document.getElementById('daily-q-img').value;
    const opts = [
        document.getElementById('daily-opt-0').value,
        document.getElementById('daily-opt-1').value,
        document.getElementById('daily-opt-2').value,
        document.getElementById('daily-opt-3').value
    ];
    const correct = parseInt(document.getElementById('daily-q-correct').value);

    if (!text || !opts[0] || !opts[1]) {
        return alert("يرجى كتابة نص السؤال وخيارين على الأقل");
    }

    const data = {
        text: text,
        img: img,
        options: opts,
        correct: correct,
        startTime: Date.now() // بداية توقيت الـ 24 ساعة
    };

    // حفظ في قاعدة البيانات (سيقوم بمسح التحدي القديم تلقائياً)
    db.ref('daily_challenge').set(data).then(() => {
        // حذف الردود السابقة لتمكين الطلاب من الحل مجدداً
        db.ref('daily_challenge/responses').remove();
        
        // إرسال إشعار عام للطلاب
        db.ref('users').once('value', snap => {
            snap.forEach(user => {
                db.ref('notifications/' + user.key).push({
                    msg: "🧠 تحدي جديد متاح الآن! ادخل صفحة إنجازاتي لحله.",
                    time: new Date().toLocaleTimeString('ar-EG'),
                    read: false
                });
            });
        });
        
        alert("تم نشر التحدي الجديد بنجاح!");
    });
}

// 2. وظيفة مراقبة التحدي وعرضه للطالب (تُستدعى عند تشغيل التطبيق)
function listenToDailyChallenge() {
    db.ref('daily_challenge').on('value', snap => {
        const box = document.getElementById('daily-challenge-box');
        const data = snap.val();
        
        // إذا لم يوجد تحدي أو المستخدم لم يسجل دخول
        if (!data || !currentUser) {
            if (box) box.classList.add('hidden');
            return;
        }

        // حساب الوقت: هل مر أكثر من 24 ساعة؟
        const hoursPassed = (Date.now() - data.startTime) / (1000 * 60 * 60);
        if (hoursPassed >= 24) {
            if (box) box.classList.add('hidden');
            return;
        }

        // التحقق هل الطالب قام بالحل مسبقاً؟
        db.ref(`daily_challenge/responses/${currentUser.username}`).once('value', s => {
            if (s.exists()) {
                if (box) box.classList.add('hidden'); // إخفاء الصندوق إذا حل الطالب
            } else {
                if (box) {
                    box.classList.remove('hidden'); // إظهار الصندوق
                    renderDailyUI(data);
                }
            }
        });
    });
}

// 3. رسم واجهة السؤال والخيارات للطالب
function renderDailyUI(data) {
    document.getElementById('daily-display-text').innerText = data.text;
    const imgDiv = document.getElementById('daily-display-img');
    imgDiv.innerHTML = data.img ? `<img src="${data.img}" class="w-full rounded-xl mb-3 border border-white/20">` : "";
    
    const grid = document.getElementById('daily-options-grid');
    grid.innerHTML = "";
    
    data.options.forEach((opt, i) => {
        if (opt && opt.trim() !== "") {
            grid.innerHTML += `
                <button onclick="answerDaily(${i})" 
                class="bg-white/10 hover:bg-white/20 border border-white/30 p-3 rounded-xl text-xs text-right transition-all text-white font-bold">
                ${opt}
                </button>`;
        }
    });
}

// 4. معالجة إجابة الطالب
function answerDaily(index) {
    db.ref('daily_challenge').once('value', snap => {
        const data = snap.val();
        
        if (index === data.correct) {
            // تسجيل النتيجة في "إنجازاتي" بنسبة 100%
            db.ref('results').push({
                uid: currentUser.username,
                userName: currentUser.fullname,
                quizTitle: "✅ تحدي اليوم",
                percent: 100,
                time: new Date().toLocaleDateString('ar-EG')
            });
            alert("إجابة صحيحة برافو عليك! تم تسجيل الإنجاز 🌟");
        } else {
            alert("للأسف إجابة خاطئة.. ركز في تحدي المرة القادمة 💪");
        }
        
        // تسجيل أن الطالب "أجاب" لكي لا يظهر له الصندوق مرة أخرى حتى ينزل تحدي جديد
        db.ref(`daily_challenge/responses/${currentUser.username}`).set({
            done: true,
            at: Date.now()
        });
    });
}