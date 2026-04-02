{
"@context": "https://schema.org",
"@type": "Organization",
"name": "اسم الشركة",
"alternateName": "اسم بديل إن وجد",
"url": "https://www.example.com",
"logo": "https://www.example.com/logo.png",
"description": "وصف تفصيلي عن الشركة وخدماتها.",
"foundingDate": "تاريخ التأسيس إن كان مهماً",
"founders": [
{
"@type": "Person",
"name": "اسم المؤسس الأول"
},
{
"@type": "Person",
"name": "اسم المؤسس الثاني"
}
],
"address": {
"@type": "PostalAddress",
"streetAddress": "123 شارع مثال",
"addressLocality": "المدينة",
"addressRegion": "المنطقة",
"postalCode": "12345",
"addressCountry": "SA"
},
"telephone": "+966-1-2345-6789",
"email": "contact@example.com",
"sameAs": [
"https://www.facebook.com/example",
"https://www.twitter.com/example",
"https://www.linkedin.com/company/example"
],
"contactPoint": {
"@type": "ContactPoint",
"contactType": "خدمة العملاء",
"telephone": "+966-1-9876-5432",
"areaServed": "SA",
"availableLanguage": ["ar", "en"]
}
}

{
"@context": "https://schema.org",
"@type": "Article",
"headline": "عنوان المقال بالكامل",
"alternativeHeadline": "عنوان بديل إن وجد",
"image": "https://www.example.com/article-image.jpg",
"author": {
"@type": "Person",
"name": "اسم المؤلف"
},
"publisher": {
"@type": "Organization",
"name": "اسم دار النشر",
"logo": {
"@type": "ImageObject",
"url": "https://www.example.com/logo.png"
}
},
"datePublished": "2024-06-01",
"dateModified": "2024-06-05",
"articleSection": "القسم الذي ينتمي إليه المقال",
"keywords": ["وسم1", "وسم2", "وسم3"],
"articleBody": "النص الكامل للمقال هنا بالتفصيل...",
"mainEntityOfPage": {
"@type": "WebPage",
"@id": "https://www.example.com/full-article-url"
},
"about": {
"@type": "Thing",
"name": "الموضوع الرئيسي للمقال"
},
"articleCategory": "تصنيف المقال أو الفئة",
"mentions": [
{
"@type": "Person",
"name": "اسم الشخص المذكور إن وجد"
}
],
"hasPart": [
{
"@type": "WebPageElement",
"name": "جزء من المقال متعلق بموضوع معين"
}
],
"isPartOf": {
"@type": "Blog",
"name": "اسم المدونة"
}
}

---

{
"@context": "https://schema.org",
"@type": "Article",
"headline": "عنوان المقال بالكامل",
"alternativeHeadline": "عنوان بديل إن وجد",
"image": "https://www.example.com/article-image.jpg",
"author": {
"@type": "Person",
"name": "اسم المؤلف"
},
"publisher": {
"@type": "Organization",
"name": "اسم دار النشر",
"logo": {
"@type": "ImageObject",
"url": "https://www.example.com/logo.png"
}
},
"datePublished": "2024-06-01",
"dateModified": "2024-06-05",
"expires": "2025-06-01",
"articleSection": "القسم الذي ينتمي إليه المقال",
"keywords": ["وسم1", "وسم2", "وسم3"],
"review": {
"@type": "Review",
"reviewRating": {
"@type": "Rating",
"ratingValue": "4",
"bestRating": "5"
},
"author": {
"@type": "Person",
"name": "اسم المراجع"
}
},
"about": {
"@type": "Thing",
"name": "الموضوع الرئيسي للمقال"
},
"articleCategory": ["تصنيف1", "تصنيف2"],
"mentions": [
{
"@type": "Person",
"name": "اسم الشخص المذكور إن وجد"
}
],
"hasPart": [
{
"@type": "WebPageElement",
"name": "جزء من المقال متعلق بموضوع معين"
}
],
"isPartOf": {
"@type": "Blog",
"name": "اسم المدونة"
},
"author": {
"@type": "Person",
"name": "اسم المؤلف",
"jobTitle": "منصب المؤلف",
"sameAs": ["رابط صفحة المؤلف"]
}
}

---

{
"@context": "https://schema.org",
"@type": "Article",
"headline": "عنوان المقال بالكامل",
"alternativeHeadline": "عنوان بديل إن وجد",
"image": "https://www.example.com/article-image.jpg",
"author": {
"@type": "Person",
"name": "اسم المؤلف",
"jobTitle": "منصب المؤلف",
"sameAs": ["رابط صفحة المؤلف"]
},
"publisher": {
"@type": "Organization",
"name": "اسم دار النشر",
"logo": {
"@type": "ImageObject",
"url": "https://www.example.com/logo.png"
}
},
"datePublished": "2024-06-01",
"dateModified": "2024-06-05",
"expires": "2025-06-01",
"articleSection": "القسم الذي ينتمي إليه المقال",
"keywords": ["وسم1", "وسم2", "وسم3"],
"review": {
"@type": "Review",
"reviewRating": {
"@type": "Rating",
"ratingValue": "4",
"bestRating": "5"
},
"author": {
"@type": "Person",
"name": "اسم المراجع"
}
},
"about": {
"@type": "Thing",
"name": "الموضوع الرئيسي للمقال"
},
"articleCategory": ["تصنيف1", "تصنيف2"],
"mentions": [
{
"@type": "Person",
"name": "اسم الشخص المذكور إن وجد"
}
],
"hasPart": [
{
"@type": "WebPageElement",
"name": "جزء من المقال متعلق بموضوع معين"
}
],
"isPartOf": {
"@type": "Blog",
"name": "اسم المدونة"
},
"citation": [
"https://www.example.com/source1",
"https://www.another-source.com/article"
]
}
----category------------
{
"@context": "https://schema.org",
"@type": "DefinedTerm",
"name": "اسم التصنيف، مثلاً: تقنية",
"termCode": "كود التصنيف، مثل: tech-001",
"description": "وصف مختصر للتصنيف وما يشمله من مواضيع.",
"inDefinedTermSet": {
"@type": "URL",
"url": "https://www.example.com/categories",
"name": "مجموعة التصنيفات الرئيسية التي ينتمي إليها هذا التصنيف."
},
"sameAs": "إذا كان هناك رابط خارجي لتعريف التصنيف بشكل أوضح، يمكنك وضعه هنا."
}
{
"@context": "https://schema.org",
"@type": "DefinedTerm",
"name": "اسم التصنيف، مثلاً: تقنية",
"termCode": "كود التصنيف، مثل: tech-001",
"description": "وصف مختصر للتصنيف وما يندرج تحته من مواضيع، مثل: كل ما يتعلق بالتكنولوجيا والابتكارات الحديثة.",
"inDefinedTermSet": {
"@type": "URL",
"url": "https://www.example.com/categories",
"name": "مجموعة التصنيفات العامة"
},
"sameAs": "https://en.wikipedia.org/wiki/Technology",
"hasPart": [
{
"@type": "DefinedTerm",
"name": "تصنيف فرعي، مثلاً: الذكاء الاصطناعي",
"termCode": "ai-001",
"description": "كل ما يتعلق بالذكاء الاصطناعي."
}
],
"relatedLink": [
"https://www.example.com/popular-articles-in-tech"
]
}
------------ tags
{
"@context": "https://schema.org",
"@type": "DefinedTerm",
"name": "اسم الوسم، مثلاً: برمجة",
"termCode": "كود الوسم، مثل: code-tag-001",
"description": "هذا الوسم يشير إلى جميع المقالات التي تتعلق بالبرمجة بمختلف لغاتها وأطر عملها.",
"inDefinedTermSet": {
"@type": "URL",
"url": "https://www.example.com/tags",
"name": "مجموعة الوسوم العامة في الموقع"
},
"sameAs": "https://en.wikipedia.org/wiki/Computer_programming",
"potentialAction": {
"@type": "SearchAction",
"target": "https://www.example.com/search?tag=برمجة&q={search_term_string}",
"query-input": "required name=search_term_string"
}
}
--------------auther
{
"@context": "https://schema.org",
"@type": "Person",
"name": "اسم المؤلف، مثلاً: خالد الأحمد",
"jobTitle": "المسمى الوظيفي للمؤلف، مثلاً: كاتب تقني",
"affiliation": {
"@type": "Organization",
"name": "اسم المؤسسة التي ينتمي إليها المؤلف، مثلاً: مجلة التقنية الحديثة"
},
"url": "رابط صفحة المؤلف على موقعك، مثل: https://www.example.com/authors/khaled-al-ahmed",
"sameAs": [
"روابط لصفحات المؤلف على وسائل التواصل الاجتماعي أو ويكيبيديا إن وجدت، مثل: https://www.linkedin.com/in/khaled-al-ahmed"
],
"image": "رابط صورة المؤلف، إن وجدت: https://www.example.com/images/khaled.jpg"
}

{
"@context": "https://schema.org",
"@type": "Organization",
"name": "مدونتي",
"url": "https://www.example.com",
"logo": "https://www.example.com/logo.png",
"description": "مدونتي هي المدونة الرئيسية التي تُنشر تحت اسمها جميع المقالات من قبل فريق الموظفين.",
"sameAs": [
"https://www.linkedin.com/company/mudawanty",
"https://twitter.com/mudawanty"
],
"foundingDate": "2020-01-01",
"contactPoint": {
"@type": "ContactPoint",
"telephone": "+966-555-123456",
"contactType": "customer service",
"areaServed": "SA"
},
"keywords": "مدونة، مقالات، تقنية، تطوير",
"slogan": "مدونتي - حيث تجتمع الأفكار والإبداع"
}
