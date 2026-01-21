// ملف users_admin.js - نسخة متطورة لعرض نشاط الطلاب
function loadAllUsers() {
    if (currentUser.username !== 'admin') return;

    // جلب كل البيانات اللازمة لعمل الإحصائيات مرة واحدة
    Promise.all([
        db.ref('users').once('value'),
        db.ref('posts').once('value'),
        db.ref('tikets').once('value')
    ]).then(results => {
        const usersSnap = results[0];
        const postsSnap = results[1];
        const tiketsSnap = results[2];

        const list = document.getElementById('admin-users-list');
        list.innerHTML = "";
        let count = 0;

        usersSnap.forEach(userSnap => {
            const user = userSnap.val();
            const userId = userSnap.key;
            const username = user.username;
            count++;

            // 1. حساب الإعجابات والتعليقات من فرع الـ posts
            let totalLikes = 0;
            let totalComments = 0;
            postsSnap.forEach(postSnap => {
                const post = postSnap.val();
                // حساب الإعجابات
                if (post.likes && post.likes[username]) totalLikes++;
                // حساب التعليقات
                if (post.comments) {
                    Object.values(post.comments).forEach(comment => {
                        if (comment.username === username) totalComments++;
                    });
                }
            });

            // 2. حساب عدد الأسئلة (Tickets) التي أرسلها الطالب
            let totalQuestions = 0;
            tiketsSnap.forEach(tSnap => {
                if (tSnap.val().username === username || tSnap.val().userName === user.fullname) {
                    totalQuestions++;
                }
            });

            // 3. إضافة السطر للجدول بالترتيب المطلوب
            list.innerHTML += `
                <tr class="border-b hover:bg-gray-50 text-right text-[11px]">
                    <td class="py-3 px-1 font-bold text-gray-800">${user.fullname || '---'}</td>
                    <td class="py-3 px-1 text-indigo-600">@${username || ''}</td>
                    <td class="py-3 px-1 text-center text-red-500 font-bold">${totalLikes}</td>
                    <td class="py-3 px-1 text-center text-blue-500 font-bold">${totalComments}</td>
                    <td class="py-3 px-1 text-center text-green-600 font-bold">${totalQuestions}</td>
                    <td class="py-4 px-1 text-gray-600 font-mono text-[10px]">${user.phone || 'لا يوجد'}</td>
                </tr>
            `;
        });

        document.getElementById('users-count').innerText = count + " طالب";
    });
}