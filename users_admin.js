// ملف users_admin.js - النسخة القاطعة
function loadAllUsers() {
    console.log("محاولة جلب البيانات...");

    // 1. التأكد من الوصول لمتغير الفايربيز الصحيح من ملفك
    // في ملفك أنت عرفت المتغير باسم db، سنحاول الوصول إليه أو تعريفه
    const database = (typeof db !== 'undefined') ? db : firebase.database();

    const list = document.getElementById('admin-users-list');
    if (!list) return;
    
    list.innerHTML = "<tr><td colspan='6' class='text-center py-4 text-indigo-600'>جاري الاتصال بالسحابة...</td></tr>";

    // 2. جلب البيانات من الجذور لضمان عدم حدوث خطأ في أسماء الفروع
    database.ref('/').once('value').then(snap => {
        const allData = snap.val();
        if (!allData || !allData.users) {
            list.innerHTML = "<tr><td colspan='6' class='text-center py-4'>لا توجد بيانات مستخدمين حالياً</td></tr>";
            return;
        }

        const users = allData.users;
        const posts = allData.posts || {};
        const tikets = allData.tikets || {};

        list.innerHTML = "";
        let count = 0;

        // تحويل الكائن إلى مصفوفة لعرضها
        Object.keys(users).forEach(userId => {
            const user = users[userId];
            const username = user.username || "بدون_يوزر";
            const fullname = user.fullname || user.name || "مستخدم غير مسمى";
            count++;

            // حساب النشاط (لايكات وتعليقات وأسئلة)
            let likes = 0, comments = 0, qs = 0;

            // جرد اللايكات والتعليقات منPosts
            Object.values(posts).forEach(p => {
                if (p.likes && p.likes[username]) likes++;
                if (p.comments) {
                    Object.values(p.comments).forEach(c => {
                        if (c.username === username) comments++;
                    });
                }
            });

            // جرد الأسئلة من Tikets
            Object.values(tikets).forEach(t => {
                if (t.username === username || t.userName === fullname) qs++;
            });

            // بناء السطر
            list.innerHTML += `
                <tr class="border-b text-right text-[11px] hover:bg-gray-50">
                    <td class="py-3 px-1 font-bold text-gray-800">${fullname}</td>
                    <td class="py-3 px-1 text-indigo-600">@${username}</td>
                    <td class="py-3 px-1 text-center text-red-500 font-bold">${likes}</td>
                    <td class="py-3 px-1 text-center text-blue-500 font-bold">${comments}</td>
                    <td class="py-3 px-1 text-center text-green-600 font-bold">${qs}</td>
                    <td class="py-3 px-1 text-gray-600 font-mono text-[10px]">${user.phone || '---'}</td>
                </tr>`;
        });

        const countDisp = document.getElementById('users-count');
        if (countDisp) countDisp.innerText = count + " طالب مسجل";

    }).catch(err => {
        console.error("خطأ:", err);
        list.innerHTML = `<tr><td colspan='6' class='text-center py-4 text-red-500'>حدث خطأ: ${err.message}</td></tr>`;
    });
}
