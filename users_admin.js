// ملف users_admin.js - النسخة المستقلة تماماً
function loadAllUsers() {
    // 1. التأكد من وجود الاتصال بـ Firebase
    if (typeof db === 'undefined') {
        console.error("Firebase db is not defined");
        return;
    }

    const list = document.getElementById('admin-users-list');
    if(list) list.innerHTML = "<tr><td colspan='6' class='text-center py-4 text-indigo-600 animate-pulse'>جاري تحميل سجل الطلاب...</td></tr>";

    // 2. جلب البيانات مباشرة
    Promise.all([
        db.ref('users').once('value'),
        db.ref('posts').once('value'),
        db.ref('tikets').once('value')
    ]).then(results => {
        const usersSnap = results[0];
        const postsSnap = results[1];
        const tiketsSnap = results[2];

        if (!list) return;
        list.innerHTML = "";
        let count = 0;

        usersSnap.forEach(userSnap => {
            const user = userSnap.val();
            const username = user.username || "";
            const fullname = user.fullname || user.name || "---";
            count++;

            // حساب التفاعلات
            let totalLikes = 0;
            let totalComments = 0;
            postsSnap.forEach(pSnap => {
                const p = pSnap.val();
                if (p.likes && p.likes[username]) totalLikes++;
                if (p.comments) {
                    Object.values(p.comments).forEach(c => {
                        if (c.username === username) totalComments++;
                    });
                }
            });

            // حساب الأسئلة
            let totalQuestions = 0;
            tiketsSnap.forEach(tSnap => {
                const t = tSnap.val();
                if (t.username === username || t.userName === fullname) totalQuestions++;
            });

            // إضافة السطر للجدول
            list.innerHTML += `
                <tr class="border-b text-right text-[11px] hover:bg-gray-50">
                    <td class="py-3 px-1 font-bold text-gray-800">${fullname}</td>
                    <td class="py-3 px-1 text-indigo-600 text-[10px]">@${username}</td>
                    <td class="py-3 px-1 text-center text-red-500 font-bold">${totalLikes}</td>
                    <td class="py-3 px-1 text-center text-blue-500 font-bold">${totalComments}</td>
                    <td class="py-3 px-1 text-center text-green-600 font-bold">${totalQuestions}</td>
                    <td class="py-3 px-1 text-gray-600 font-mono text-[10px]">${user.phone || '---'}</td>
                </tr>`;
        });

        const countDisp = document.getElementById('users-count');
        if(countDisp) countDisp.innerText = count + " طالب";

    }).catch(err => {
        console.error("Firebase Error:", err);
        if(list) list.innerHTML = "<tr><td colspan='6' class='text-center py-4 text-red-500 font-bold'>خطأ في جلب البيانات: تأكد من صلاحيات Firebase</td></tr>";
    });
}
