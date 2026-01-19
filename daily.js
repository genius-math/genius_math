console.log("تم تحميل ملف daily.js بنجاح");

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

    if (!text) return alert("اكتب نص السؤال");

    const data = {
        text: text,
        img: img,
        options: opts,
        correct: correct,
        startTime: Date.now()
    };

    db.ref('daily_challenge').set(data).then(() => {
        db.ref('daily_challenge/responses').remove();
        alert("تم النشر بنجاح! جرب الآن تفتح صفحة إنجازاتي");
    });
}

function listenToDailyChallenge() {
    console.log("بدء مراقبة سؤال التحدي...");
    db.ref('daily_challenge').on('value', snap => {
        const box = document.getElementById('daily-challenge-box');
        const data = snap.val();
        
        if (!data || !currentUser) {
            console.log("لا توجد بيانات تحدي أو لم يتم تسجيل الدخول");
            if (box) box.classList.add('hidden');
            return;
        }

        // ملاحظة: قمت بإلغاء شرط الـ 24 ساعة مؤقتاً للتجربة
        db.ref(`daily_challenge/responses/${currentUser.username}`).once('value', s => {
            if (s.exists()) {
                if (box) box.classList.add('hidden');
            } else {
                if (box) {
                    box.classList.remove('hidden');
                    renderDailyUI(data);
                }
            }
        });
    });
}

function renderDailyUI(data) {
    document.getElementById('daily-display-text').innerText = data.text;
    const imgDiv = document.getElementById('daily-display-img');
    imgDiv.innerHTML = data.img ? `<img src="${data.img}" class="w-full rounded-xl mb-3 border">` : "";
    
    const grid = document.getElementById('daily-options-grid');
    grid.innerHTML = "";
    data.options.forEach((opt, i) => {
        if (opt) {
            grid.innerHTML += `<button onclick="answerDaily(${i})" class="bg-white/10 hover:bg-white/20 border border-white/30 p-3 rounded-xl text-xs text-right text-white font-bold">${opt}</button>`;
        }
    });
}

function answerDaily(index) {
    db.ref('daily_challenge').once('value', snap => {
        const data = snap.val();
        if (index === data.correct) {
            alert("صح!");
            db.ref('results').push({
                uid: currentUser.username,
                userName: currentUser.fullname,
                quizTitle: "✅ تحدي اليوم",
                percent: 100,
                time: new Date().toLocaleDateString('ar-EG')
            });
        } else {
            alert("خطأ!");
        }
        db.ref(`daily_challenge/responses/${currentUser.username}`).set({done: true});
    });
}
