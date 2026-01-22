// ملف users_admin.js - نسخة حساب النشاط الذكية
function loadAllUsers() {
    const database = (typeof db !== 'undefined') ? db : firebase.database();
    const list = document.getElementById('admin-users-list');
    if (!list) return;

    database.ref('/').once('value').then(snap => {
        const allData = snap.val();
        if (!allData || !allData.users) return;

        const users = allData.users;
        const posts = allData.posts || {};
        const tikets = allData.tikets || {};

        list.innerHTML = "";
        let count = 0;

        Object.keys(users).forEach(userId => {
            const user = users[userId];
            const username = (user.username || "").toLowerCase().trim();
            const fullname = (user.fullname || user.name || "").trim();
            count++;

            let likes = 0, comments = 0, qs = 0;

            // 1. جرد اللايكات والتعليقات من Posts
            Object.values(posts).forEach(p => {
                // حساب اللايكات: نبحث عن اليوزر نيم داخل كائن الـ likes
                if (p.likes) {
                    Object.keys(p.likes).forEach(lKey => {
                        if (lKey.toLowerCase().trim() === username) likes++;
                    });
                }
                
                // حساب التعليقات: نبحث في كل تعليق
                if (p.comments) {
                    Object.values(p.comments).forEach(c => {
                        const cUser = (c.username || "").toLowerCase().trim();
                        const cName = (c.name || "").trim();
                        if (cUser === username || (fullname !== "" && cName === fullname)) {
                            comments++;
                        }
                    });
                }
            });

            // 2. جرد الأسئلة من Tikets
            Object.values(tikets).forEach(t => {
                const tUser = (t.username || "").toLowerCase().trim();
                const tName = (t.userName || t.name || "").trim();
                if (tUser === username || (fullname !== "" && tName === fullname)) {
                    qs++;
                }
            });

            list.innerHTML += `
                <tr class="border-b text-right text-[11px] hover:bg-gray-50">
                    <td class="py-3 px-1 font-bold text-gray-800">${fullname || '---'}</td>
                    <td class="py-3 px-1 text-indigo-600">@${username}</td>
                    <td class="py-3 px-1 text-center text-red-500 font-bold">${likes}</td>
                    <td class="py-3 px-1 text-center text-blue-500 font-bold">${comments}</td>
                    <td class="py-3 px-1 text-center text-green-600 font-bold">${qs}</td>
                    <td class="py-3 px-1 text-gray-600 font-mono text-[10px]">${user.phone || '---'}</td>
                </tr>`;
        });

        document.getElementById('users-count').innerText = count + " طالب";
    });
}
