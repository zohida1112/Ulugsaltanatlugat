ULUGSALTANATLUGAT.UZ — TO‘LIQ MUSTAQIL KO‘CHIRISH PAKETI
==========================================================

BU VERSIYA NIMA QILADI?
- Birinchi Netlify build vaqtida hozirgi chatgpt.site sahifasidagi lug‘at jadvalini
  bir marta o‘qib, barcha mavjud birliklarni dist/data.json ga yozadi.
- Shundan keyin nashr qilingan sayt ishlash jarayonida chatgpt.site ga murojaat qilmaydi.
- Qidiruv, turi, makromaydon va mikromaydon filtrlari local data.json bilan ishlaydi.
- SSL va domen boshqaruvi Netlify hisobingizda bo‘ladi.

NEGA ODDIY "DEPLOY MANUALLY" EMAS?
Bu paket 306 birlikni avtomatik ko‘chirib olish uchun BUILD bosqichini ishlatadi.
Shuning uchun Netlify’da Git orqali deploy qilish kerak.

ENG OSON O‘RNATISH:
1) GitHub.com da akkauntga kiring.
2) "New repository" bosing. Nomi: ulugsaltanatlugat
3) ZIPni ochib, ichidagi barcha fayllarni repositoryga yuklang.
4) Netlify.com -> Add new project -> Import an existing project -> GitHub.
5) ulugsaltanatlugat repositorysini tanlang.
6) Netlify netlify.toml ni o‘zi taniydi:
      Build command: npm run build
      Publish directory: dist
7) Deploy bosing.
8) Build logida:
      "TAYYOR: 306 birlik mustaqil data.json fayliga yozildi"
   degan yozuv chiqishi kerak.
9) Sayt ochilgach Domain management -> Add a domain -> ulugsaltanatlugat.uz
10) Netlify bergan DNS yozuvlarini BillurCOM paneliga kiriting.
11) Netlify HTTPS/SSLni avtomatik beradi.

MUHIM:
- Yangi sayt ishga tushmaguncha BillurCOMdagi eski DNS yozuvlarini o‘chirmang.
- Birinchi build muvaffaqiyatli bo‘lgach saytning ishlashi chatgpt.site ga bog‘liq emas.
- dist/data.json nashr qilingan deployment ichida saqlanadi.
- Admin panel manzili: https://ulugsaltanatlugat.uz/admin.html
- Netlify panelida Site configuration -> Environment variables bo‘limiga
  ADMIN_PASSWORD nomi bilan faqat o‘zingiz biladigan kuchli parol kiriting.
- Admin panel orqali so‘z qo‘shish, tahrirlash va o‘chirish mumkin.
- Saqlangan o‘zgarishlar Netlify Blobs bazasida turadi va barcha tashrifchilarga ko‘rinadi.
