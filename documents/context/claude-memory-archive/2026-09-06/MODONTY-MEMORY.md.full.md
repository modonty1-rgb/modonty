## 🥇 قواعد ذهبية

- 🔴 [على الإنتاج لا مكان لغلطة](feedback_production_has_no_room_for_mistakes.md) — قبل أي كتابة: افتح الكود الذي يقرأ الحقل وأثبت المصدر بـ`ملف:سطر`، لا استنتاج من اسم المجموعة. (كتبتُ ٥٦ صفاً في `reels` والشاشة تقرأ `media`.) ٣١ أغسطس.

- 🔴 [«push>» و«main>» = ادفع على test **وادمج فوراً على main**](feedback_push_means_merge_to_main.md) — التأكيد مضمَّن فيها؛ الوقفة عند test كانت تمنع خالد من رؤية شغله (الأدمن والكونسول بلا نطاق اختبار). تنسخ قاعدة ١٣ أغسطس أدناه. ١ سبتمبر.
- ⤿ [~~ممنوع merge بلا تأكيد صريح~~](feedback_never_merge_without_explicit_confirmation.md) — **مَنسوخة** بالسطر أعلاه؛ يبقى منها: لا دمج بلا `push>` أو أمر صريح مكافئ.
- [التاسك ما يخلص إلا متحقَّقاً ١٠٠٪ + تنبيه صوتي](feedback_task_done_verified_sound_alert.md) — تست كامل بدليل، ثم صوت على ويندوز. 2026-08-05.
- [التنبيه الصوتي في ثلاث حالات](feedback_sound_alert_on_task_done_and_on_blocking.md) — انتهاء تاسك · انتظار قرار · انتظار ضغطة. نغمتان متمايزتان. 2026-08-07.
- [نظّف القديم والمكرّر بلا استئذان](feedback_clean_stale_duplicates_without_asking.md) — السؤال «أنظّفه؟» مخالفة؛ انقل ثم احذف. 2026-08-06.
- [تاسك واحد جوّا التاسك](feedback_one_task_per_item.md) — ممنوع منعاً باتاً تجميع أعمال في بند؛ الصِّغَر = أمان. 2026-08-06.
- [المنجز له مكان واحد ويختفي من الباقي](feedback_auto_tick_work_plan_files.md) — نقل لا تعليم صحّ؛ يختفي من خط السير والقوائم؛ الترقيم يُحسب لا يُكتب. 2026-08-06.
- [ممنوع اقتراح تقنية خارج الاستاك](feedback_no_out_of_stack_proposals.md) — ولا كخيار ولا للمقارنة؛ حشو وعدم احترافية. 2026-08-05.
- 🔴 [افتح الملف قبل ما تدّعي عطلاً](feedback_open_the_file_before_claiming_a_bug.md) — `grep` مرشَّح لا حكم؛ ٥ من ٨ «أعطال» سقطت بفتح الملف، والتعليق فوق السطر كان يقول إنها مُصلَحة. ٣١ أغسطس.
- 🔴 [الصفحة المرسومة ليست مصدر حقيقة](feedback_rendered_page_is_not_source_of_truth.md) — الكاش يعطي جواباً قديماً بثقة كاملة؛ افحص `x-vercel-cache`/`age` أو اقرأ القاعدة. غلطتُ مرّتين في جلسة واحدة على نفس البند. ٣١ أغسطس.
- [الفهرس ليس محتوى](feedback_index_is_not_content.md) — `git status` يعطي مرشَّحاً لا نتيجة؛ والإنذار الكاذب أغلى من البشارة الكاذبة. بوّابة عامة تحجبه. ١٣ أغسطس.
- [الاسم يذكر نطاقه الحقيقي](feedback_names_must_state_their_scope.md) — الاسم الأوسع من الكود يخلق خريطة ذهنية غلط؛ `getPageSeo` كان يخدم القوائم السبع وحدها. ١٤ أغسطس.
- 🔴 [التحقّق على الفرع ببيانات إنتاج مُزامَنة](feedback_verify_on_branch_with_synced_prod_data.md) — الدمج نتيجة التحقّق لا شرطه؛ ممنوع «لن يثبت حتى يُدمج» كملاحظة. ٢٨ أغسطس.
- 🔴 [رسالة المنع تسمّي العطل والحقل](feedback_blocking_messages_must_name_field.md) — البوّابة تبقى مقفلة، والرسالة هي ما يُصلَح؛ «غالباً…» تخمين مرفوض. ٢٥ أغسطس.
- 🔴 [أمر واجهة مبهم = سطر تأكيد قبل البناء](feedback_confirm_page_and_element_before_building.md) — ليلة ٢٢–٢٣ أغسطس ضاعت على تخمينين؛ الرجوع أغلى من السؤال. ٢٣ أغسطس.
- [تعليق JSX لا يوضع داخل تعبير](feedback_jsx_comment_never_inside_expression.md) — قبل جذر `return` أو داخل `cond && (…)` = 500؛ حصل مرتين في ٢٣ أغسطس.
- 🔴 [أفضل الممارسات دائماً — قرّر بنفسك](feedback_always_best_practice_decide_yourself.md) — السؤال الذي يملك الكود جوابه تهرّب؛ اسأل في قرار العمل لا في الصنعة. ٢٩ أغسطس.
- [ممنوع التخمين](feedback_no_guessing.md) — تحقّق أو قل «ما أعرف». + [على التقارير الخارجية](feedback_no_guessing_on_external_reports.md)
- [لا مجاملة](feedback_no_flattery.md) — الغلط يُقال «غلط» بالسبب.
- [راجع كلامي قبل ما تنفّذه](feedback_verify_before_obeying.md) — اقتراح خالد يُطابَق بالتوثيق ويُناقَش أولاً.
- [الدراسة تبدأ بالوضع الحالي في الكود](feedback_study_current_state_before_proposing.md) — أي ملف فكرة يحوي «الوضع الحالي (مقيس)» قبل المقترح؛ خالد ما يفترض يسأل «درست الكونسول؟». ١٧ أغسطس.
- [مراجعة كود التاسك قبل أي تعديل](feedback_pre_task_code_review.md) — الملفات + النمط المرجعي + سلسلة البيانات، ثم اعرض، ثم عدّل.
- [Context7 + docs رسمية قبل أي كود](feedback_context7_mandatory_before_code.md) + [قبل المهام الحساسة](feedback_official_docs_first.md)
- [منهجية المهام الثقيلة](feedback_heavy_tasks_workflow.md) — مراحل · دليل قبل حكم.
- [الباقات المعقدة نناقشها سوا](feedback_discuss_complex_bugs_first.md) — ممنوع push رابع يلاحق نفس الـbug.
- [مستوى ثقة معلن لكل فحص](feedback_audit_confidence_levels.md) — «نهائي» بعد اختبار التقارب فقط.
- [معلومات كاملة من أول مرة](feedback_complete_info_first.md) · [إجابات مختصرة دائماً](feedback_brief_responses.md) · [2-5 أسطر للمهم](feedback_concise_answers.md)
- [أي مشكلة وقت التست لا تُتجاهَل](feedback_never_ignore_test_problems.md)
- [«do» = اعتمد التوصية ونفّذ](feedback_do_means_approve_recommendation.md) · [العربي فقط في الشات](feedback_arabic_only_chat.md)
- [وجّه خالد لموديل المحادثة](feedback_model_selection_advice.md) — Opus للسكيما/الإنتاج، Sonnet للتست المتكرّر.
- [لا وكلاء بدون طلب صريح](feedback_no_agents_without_explicit_request.md) · [Fast interaction mode](feedback_fast_interaction_mode.md)

## 🧭 الشغل والملفات

- 👥 [فاتن مبيعات · طارق محتوى · روان إدارة](project_team_names_roles.md) — خالد ينادي بالاسم وينتظر أن أعرف النطاق؛ وهم مستخدمو أي شاشة أدمن نبنيها. ٤ سبتمبر.
- [الفريق مصدره جبر سيو لا مدونتي](project_team_data_master_is_jbrseo.md) — نفس القاعدة (مقيس)؛ مدونتي تعرض من يشتغل عليها فقط، ولا جدول ولا شاشة عندنا. ٢٨ أغسطس.
- ⏸️ [مودو موقوف مؤقتاً عند المرحلة ١](project_modo_closed_at_phase_one.md) — ١٩ أغسطس؛ ١١ قراراً تنتظر، نرجع لها **فور** إغلاق صفحة المقالات.
- [TASK.html = لوحة الشغل المرجعية](feedback_task_html_main_board.md) — البند المنجز يُحذف من TODO.md ويُنقل لـ«منجز» معاً؛ تصفير TODO.md هو دليل اكتمال النقل. 2026-08-06.
- [بطاقات اللوحة مختصرة](feedback_task_cards_lean.md) — المحسومة = قرار وحقول وفحوص؛ ولا تبعية قبل وقتها. 2026-08-08.
- [TODO.md للمفتوح فقط](feedback_todo_open_items_only.md) — ممنوع سرد الإنجاز فيه. 2026-08-05.
- [كل فكرة = ملف HTML في documents/idea/](feedback_ideas_folder_html_per_idea.md) — نناقش ونعتمد ثم ننفّذ؛ الاسم باسم الفكرة. ١٧ أغسطس.
- [أفكار المراحل الجاية → NEW-IDEAS.md](project_new_ideas_file.md) — أول بند: قوالب صفحة العميل. 2026-08-05.
- [ملف TODO واحد فقط](feedback_todo_file_rules.md) · [TODO لخالد · TECH-NOTES لي](feedback_todo_tech_notes_split.md)
- 🔴 [MERGE-TO-MAIN-RISK.html = لوحة مسار الدمج، تُحدَّث تلقائياً](feedback_merge_board_is_the_live_file.md) — و`TASK.html` مولَّد من `task-data.json`، يحتاج إعادة بناء. ٣١ أغسطس.
- 🔴 [المتحقَّق يُقفل تلقائياً بلا سؤال](feedback_close_verified_items_without_asking.md) — «أنقله للمنجز؟» مخالفة؛ الشرط دليل خام لا إذن. ٣١ أغسطس.
- 🔴 [الحالة في الحقل لا في العنوان](feedback_state_lives_in_the_field_not_the_title.md) — ٢١ بطاقة عنوانها «أُقفلت» و`tab` مفتوح، فأُعيد فحصها كل جلسة؛ والقاعدة صارت حاجزاً يُفشل البناء. ٣ سبتمبر.
- 🔴 [اللوحة تُبنى مع التاسك لا بعده](feedback_auto_update_prd_after_task.md) — أمر صارم ٢٨ أغسطس: بلا سؤال وبلا إعلان؛ التاسك ما خلص واللوحة قديمة. TODO مستثنى.
- [ملفات الخطط = ٣ تبويبات](feedback_plan_files_three_tabs.md) — To Do · Done · Brief.
- 🔴 [خالد وحده يقرّر متى تنتهي الجلسة](feedback_khalid_decides_when_session_ends.md) — ممنوع «الجلسة خلصت» ولا توجيه لجلسة جديدة؛ `us>` وحده يشغّل كتابة السجلّ. الهوك الذي كان يطبع «Session ended» حُذف. ٥ سبتمبر.
- [تحديث ملفات MD عند المعالم فقط](feedback_batch_doc_updates.md) · [Session handoff](feedback_session_context.md) · [تدوير SESSION-LOG أسبوعياً](feedback_session_log_weekly_rotation.md)
- [لا ملفات HTML موكب إلا بطلب صريح](feedback_no_html_mockups_unless_asked.md) — الهيكل نصّاً أو مباشرة في الكود حيّاً. ١٦ أغسطس.
- [أي تسليم لخالد = HTML لا MD](feedback_deliverable_docs_html_not_md.md) — الجرد والدراسات والخطط؛ الـMD للاستمرارية والآلة فقط. ١٧ أغسطس.
- [HTML PRD للمهام الكبيرة (اسأل أول)](feedback_html_prd_for_large_tasks.md) · [روابط `file:///c:/...` كاملة](feedback_full_file_url_for_html.md)
- [Shortcuts «reminder» + «مهام معلقة»](feedback_pending_tasks_shortcut.md)
- [«check audit»](feedback_check_audit_shortcut.md) — أحدث `Downloads\modonty-seo-audit-*.md`.
- [Mariam = Claude في Chrome extension](project_mariam_identity.md) · [«موضوع مريم» = معالجة كاملة](feedback_mariam_topic_meaning.md) · [تقاريرها → TODO](feedback_mariam_audit_open_items_standard.md)

## 🚀 النشر والتحقق

- [على الإنتاج: خالد ينفّذ وكلود يراقب](feedback_khalid_executes_claude_watches.md) — ممنوع الضغط الآلي؛ وجّه ثم راقب وبلّغ. ٧ أغسطس.
- [`modonty-ui` = فرع النشر التجريبي](project_modonty_ui_is_the_test_deploy_branch.md) — مربوط بـVercel على `test.modonty.com`؛ الدمج فيه نشرٌ لا تحريك مؤشّر. ١٨ أغسطس.
- [Push safety](feedback_push_safety.md) — tsc صفر أخطاء قبل الدفع.
- [Backup قبل push](feedback_backup_before_push.md) · [Version bump](feedback_version_bump_before_push.md) · [Changelog مع كل push](feedback_changelog_with_push.md)
- [بعد كل تعديل: تحقّق وقت التشغيل](feedback_verify_at_runtime_after_every_edit.md) — البناء الأخضر ليس دليلاً على أن الصفحة ترسم. `next-dev-loop` + `agent-browser`. ١٥ أغسطس.
- [تست حي كامل قبل push](feedback_full_test_before_push.md) · [Full circle verification](feedback_full_circle_verification.md) — admin↕console↕modonty.
- [ممنوع tsc إلا بطلب صريح](feedback_no_tsc_until_asked.md) · [كلمة «تحقّق» هي مفتاح الفحص](feedback_no_verify_until_told.md) · [لا فحص Playwright زائد](feedback_reduce_playwright_overchecking.md) · [التست على أصغر عيّنة مصابة](feedback_test_smallest_sample.md)
- [ممنوع تركيب روابط بيدي](feedback_no_url_crafting_navigate_by_ui.md) — التنقّل بالضغط على الواجهة؛ الرابط المركَّب يلوّث الدليل. ١١ أغسطس.
- 🔴 [`chr>` = اشتغل في كروم؛ غيره = الكود على Edge](feedback_chr_shortcut_chrome_extension.md) — الإضافة تبقى؛ الفصل لسه ما نُفِّذ (`--extension` قائم). ٣١ أغسطس.
- [لقطات Playwright في `.playwright-mcp/`](feedback_playwright_screenshots_location.md) · [Playwright = Edge headed](project_playwright_settings.md)
- [Restart servers](feedback_restart_server_workflow.md) · [معلّق للنشر القادم](project_pending_production_push.md)

## 🗄️ القاعدة والمعمار

- [Project architecture](project_architecture.md) — ٣ تطبيقات على DB واحد.
- [كود مشترك = dataLayer](feedback_shared_code_in_datalayer.md) · [FUTURE — جرد الكود المشترك](project_shared_code_audit_datalayer.md)
- [Cascade وهمٌ في مونجو](project_mongo_cascade_is_a_lie.md) — الأيتام تُسقط الاستعلام كله.
- [null ≠ حقل غائب](project_mongo_null_vs_absent_trap.md) — استخدم OR مع `isSet:false`.
- [حقل جديد على مجموعة قائمة = تعبئة إلزامية](project_prisma_push_backfill_rule.md)
- [dataLayer/.env = PROD](feedback_check_datalayer_env.md) — اطبع الـURL قبل أي سكربت.
- [لا سكربتات DB منفصلة](feedback_no_standalone_db_scripts.md) · [كل صيانة جديدة داخل Run-All](project_auto_maintenance_rule.md) · [Run-All صار آمناً على dev](project_runall_cloudinary_dev_hazard.md) — الحظر القديم بطل؛ و«Media Reels Fields» حاجز يُعاد بعد كل Sync. 2026-08-06.
- 🔴 [أطلس شهريّ بالاستخدام ولا يقبل دفعاً سنوياً — والتذكير آليّ](project_atlas_billing_monthly_no_annual.md) — الخصم يوم ١ من كل شهر؛ فاتورة أغسطس ٩٫٥٠$ **فشلت** والإيقاف مهدَّد ١ أكتوبر، وإيميل الفوترة غير مضاف فما وصل إشعار. ٢ سبتمبر.
- [MongoDB M0→Flex](project_mongodb_flex_upgrade_host_stable.md) · [chatbot_messages = retention دائم](project_chatbot_retention.md)
- [ثوابت الفوترة الثلاثة](project_billing_invariants.md) · [ملكية حقول العميل](project_client_field_ownership.md)
- [حراسة الأدمن في proxy.ts](project_admin_auth_proxy_gate.md) — layout gate يسرّب.
- [OAuth على modonty = www فقط](project_modonty_oauth_host_www.md) · [d5 اكتمل — staff-only auth](project_pending_d5_remove_staff_fallback.md)

## 🖼️ الوسائط وBunny

- [🔒 مقفول — بني هو مورّد الوسائط الوحيد](project_bunny_is_the_only_media_vendor.md) — صور وفيديو وتخزين؛ ممنوع اقتراح بديل ولو للمقارنة. 2026-08-05.
- [إيقاف Cloudinary نهائياً، كله على Bunny](project_bunny_full_retire_cloudinary.md)
- [قاعدة كود: لا تعتمد على Cloudinary](project_zero_cloudinary_risk.md)
- [Bunny CDN يخبّي المحذوف](project_bunny_cdn_cache_delete_gotcha.md) — تحقّق على storage.bunnycdn.com.
- 🔴 [بني يقول «مكتمل ١٠٠٪» عن ملف ناقص](project_bunny_reports_complete_for_truncated_files.md) — رمز الرد وإحصاء الـAPI لا يثبتان السلامة؛ نزّله كاملاً وقارن الحجم. وHEAD يرد ٤٠٤ لملف سليم. ٣١ أغسطس.
- [ترحيل Bunny = زرّ أدمن، مرحلة تست](feedback_bunny_migration_is_admin_button_test_phase.md) · [عزل الفرع](project_bunny_branch_isolation_golden.md)
- [sharp ينهار في Turbopack → createRequire](project_sharp_turbopack_createrequire.md)
- [مجلد `documents/reels/` = مرجعية الريلز](project_reels_decision_file.md) · [تعديل الشعار](project_logo_edit_location.md)
- [تسخين صور الصفحة التالية حُذف من مدونتي](project_preload_hero_removed.md) — نمط NextFaster ليس رسمياً؛ لا يُعاد بلا قياس إنتاج. ١٥ أغسطس.

## 🔍 السيو

- [SEO dominance = الهدف #1](project_seo_dominance_goal.md) · [SEO golden rule](feedback_seo_golden_rule.md) — مصادر رسمية فقط.
- 🔴 [ليش الذكاء ما يستشهد بنا — مقيس بـ١٤ استعلاماً](project_ai_visibility_diagnosis.md) — التقني كله أخضر؛ العطل في اختيار المصدر: المحرّكات تصنّفنا «مدوّنة» وتختار المرجعية أو منصّة الحجز. وظهورنا `#5` باسم العميل هو الباب. الماركداون و`Content-Signal` أُسقطا بالدليل. ١ سبتمبر.
- [مقالات 100% قبل الفهرسة](project_golden_rule_perfect_articles.md) — ١٠ مراحل، صفر تنازل.
- [JSON-LD مسؤولية الكود](project_jsonld_is_code_responsibility.md) · [لا تحذف حقل عميل يغذّي JSON-LD](feedback_never_remove_jsonld_fields.md)
- [DB مصدر الحقيقة لحذف الروابط](project_db_is_source_of_truth_for_removal.md) · [Slug uniqueness قبل الحفظ](feedback_slug_validation.md)
- [تنسيق مراجعة السيو](feedback_seo_audit_reference_standard.md) · [GSC connection](project_gsc_connection.md)
- [GA4 مصدر الحقيقة + /analytics ترمومتر](project_ga4_sot_thermometer.md)
- [Console يجدد SEO عند الحفظ](project_console_must_regenerate_seo.md) · [Ask-Client Q&A](project_ask_client_qa_circle.md)
- [قيم Business Info للإنتاج](project_prod_business_info_values.md) · [إحداثيات مقر جدة](project_office_geo_location.md)
- [خطأ `__next_metadata_boundary__` = باق Next رسمي](project_next_metadata_boundary_framework_bug.md) — لا تعيد التحقيق.

## ⚡ الأداء

- [الأداء #1 على modonty.com](feedback_modonty_performance_first.md) · [Performance standards](project_performance_standards.md) · [Bundle policy](feedback_bundle_size_policy_per_app.md)
- [PSI المختبري على preview متغيّر جداً](project_preview_psi_lab_variance.md) · [رابط preview الرئيسي](project_version2_preview_url.md)
- [Vercel billing audit](project_vercel_billing_audit.md)

## 🎨 الواجهة

- ⛔ [الجوّال لا يمسّ الديسكتوب ولا بكسل](feedback_mobile_never_touches_desktop.md) — الإضافة لا التغيير · مكوّن جوّال منفصل مسموح ومفضَّل · بوّابة القبول قياس ١٢٨٠ قبل وبعد. ٢١ أغسطس.
- 🔴 [شغل الجوّال يُقاس بمحاكاة جهاز حقيقية](feedback_mobile_work_needs_real_device_emulation.md) — تصغير النافذة ليس جوّالاً: بلا لمس ولا DPR ولا safe-area. ٢١ أغسطس.
- 🔴 [الجوّال هو النطاق، والقارئ العائد هو العدسة](feedback_mobile_reader_retention_lens.md) — كل عنصر يمرّ بسؤالين: يخدم القراءة الآن؟ يعطيه سبباً يرجع؟ الداخل قارئ لا عميل. ٢٢ أغسطس.
- 🔴 [صمّم من نيّة الزائر لا من حقول القاعدة](feedback_design_for_visitor_intent.md) — «ما يهمّني كم مقال عنده»؛ اسأل مَن الداخل ونيّته قبل أي عنصر. ١٦ أغسطس.
- 🔴 [جسم الماركة هادئ والماسة أكسنت](feedback_icon_body_muted_diamond_accent.md) — تُطبَّق تلقائياً بلا سؤال؛ الاستثناء: الماركة التي هي الفعل نفسه (لسان · زرّ). ٢٢ أغسطس.
- 🔴 [الماسة دائماً أكسنت](feedback_diamond_always_accent.md) — الافتراضي `hsl(var(--accent))` لا `currentColor`، في الفاتح والداكن؛ الاستثناء الوحيد سطحٌ لونه أكسنت. ٢٢ أغسطس.
- 🔴 [ماركاتنا قبل لوسيد](feedback_brand_icons_before_lucide.md) — `shared/components/icons/` فيها ٤٧ ماركة، ٣٨ منها مستخرَجة من المرجع المعتمد؛ افحصها قبل أي `<Icon…>`. ٢٢ أغسطس.
- [شعار مودو دائماً، لا أيقونة عامة](feedback_modo_always_uses_its_character_logo.md) — أي عنصر يمثّل مودو يعرض شخصيته؛ الزائر يعرفه من شكله. ١٨ أغسطس.
- 🔴 [UI/UX senior = قاعدة ذهبية](feedback_uiux_standards.md) — الدور ساري حتى تنتهي مهام الواجهة، والتدريب جزء منه: سمِّ المبدأ ومصدره، وارفض الحلّ المبتدئ صراحةً. admin وضوح ≠ visitor تميّز. ١٥ أغسطس.
- [Mockup = عقد ملزم](feedback_mockup_is_the_contract.md) · [جداول الأدمن standard](feedback_admin_table_density.md)
- 🔴 [شاشات فاتن عربية بالكامل](feedback_faten_screens_are_arabic.md) — تنسخ «لغة الأدمن إنجليزي» في نطاق المبيعات وحده؛ فاتن لا تقرأ الإنجليزية فالشاشة الإنجليزية حاجز لا أسلوب. ٤ سبتمبر.
- [كتب UI/UX المعتمدة](reference_uiux_books.md) · [Admin UI بلغة بزنس](feedback_admin_ui_business_focus.md) · [لغة الأدمن إنجليزي](feedback_admin_language.md) — ⤿ مستثنى في المبيعات (فوق)
- [حفظ لكل تبويب](feedback_save_per_tab.md) · [إثراء سجل الأخطاء](project_system_error_enrichment.md)

## 🏢 البراند والمحتوى

- [«الشريك» = «العميل» — والكلمة المعتمدة «العميل»](feedback_partner_word_is_client.md) — في كل نصّ يقرأه إنسان؛ الكود والمسارات والقياسات داخل `<code>` تبقى. ٢٩ أغسطس.
- [Modonty = منظومة](feedback_modonty_positioning.md) · [الإملاء الرسمي = مُدَوَّنَتِي](project_brand_arabic_spelling.md) · [البراندات = «الشركاء»](feedback_partners_terminology.md)
- [ركائز مودونتي الثلاث](project_modonty_three_cornerstones.md) · [جمهور مودونتي واسع](feedback_modonty_audience_broad.md)
- [أسعار مودونتي الحقيقية](project_modonty_real_pricing.md) · [لا خصم، مكافآت فقط](project_pricing_no_discount.md) · [العقد = سنة + ٦ مكافأة](project_modonty_contract_founder_offer.md)
- [التسليمات حسب الباقة](project_modonty_deliverables_per_tier.md) · [لا أرقام مزيفة في العروض](feedback_no_fake_numbers_in_pitch.md) · [ألم الفجوة التقنية](feedback_technical_gap_pain.md)
- [حوافز النشرة](project_newsletter_incentive_promises.md) · [Next phase roadmap](project_next_phase.md)
- **الصوتيات:** [workflow التشكيل](project_voice_script_workflow.md) · [content writer pro](feedback_voice_script_copywriter_mode.md) · [لا jargon سيو](feedback_no_seo_jargon_in_voice.md) · [لا تشكيل إلا البراند](feedback_no_tashkeel_in_voice_scripts.md) · [لا أسعارنا في المقارنات](feedback_no_modonty_pricing_in_pitch.md) · [تنظيف تست النطق](feedback_pronunciation_test_autoclean.md) · Sana ملغاة (Hazem أساسي + Layla للديني).
- [Short Link System معلّق](project_pending_short_link_system.md) · [تخطيط فريق المحتوى](project_content_team_planning.md)

## 🔑 اعتماديات واختبار

- [حساب `ux.probe` على الإنتاج — باقٍ بقرار خالد](project_prod_probe_test_account.md) — كلمة سرّه مجهولة وبريده غير مُفعَّل، فهو صفٌّ للفحص لا حساب للدخول. ٣ سبتمبر.
- 🔑 [قارئ اختباري على مدونتي](project_modonty_reader_test_credentials.md) — `sanad.test.reader@modonty.com`؛ يفتح مسار المسجَّل (الجزر الخمس) بلا انتظار خالد. دخول Google لا يصلح للتست. ١ سبتمبر.
- [دخول جبر سيو على الكونسول](project_jabr_seo_console_credentials.md) — support@jbrseo.com · عميل الاختبار الأساسي لمقالات العملاء.
- [Admin test login](project_test_credentials.md) · [Console test (Kimazone PROD)](project_console_test_credentials.md) · [جبر سيو = عميل التست الأكمل](project_jabr_seo_test_client.md) · [Demo clients](project_demo_clients_credentials.md)
- [Sync يمحو اعتماديات التست](project_sync_wipes_test_credentials.md) — اضبطها من `/clients/[id]/edit`.
- [Test article](project_test_article.md) · [Production URLs](reference_production_urls.md) · [pl>PORT](reference_playwright_port_shortcut.md)
- [بيانات التست المحلية تبقى](feedback_no_cleanup_local_test_data.md) · [إذن حذف ملفات test/debug حقّي](feedback_can_delete_own_test_debug_files.md)

## 🖥️ الجهاز

- [استخدم PowerShell دائماً](feedback_use_powershell_windows.md) — `-LiteralPath` للمسارات فيها أقواس.
- [صلاحيات كاملة عدا الحذف](feedback_full_permissions_except_delete.md) · [`cp>` = نظّف الجهاز](feedback_clean_machine.md) — عبر PowerShell؛ يوقف السيرفرات ويمسح `.next`، فثبّت الشغل الجاري قبله. · [Disk-thrash fix](project_machine_disk_thrash_fix.md) · [MCP fix after fresh Windows](project_mcp_servers_fresh_windows_fix.md)
- [ضغط الذاكرة وتنظيف VS Code](project_vscode_memory_pressure.md) — صفر RAM حرّ وسيرفر التطوير ٥٫٧ جيجا؛ الإضافات ٢٠←٨، و«Restart TS Server» علاج تسريب الجلسات الطويلة. ٢٤ أغسطس.

- 🪪 [اسمي في هذا المشروع: **سَنَد**](project_claude_identity_sanad.md) — سلسلة الرواية الموثَّقة؛ خالد وأي وكيل ينادونني به. ٢٩ أغسطس.

## 👤 المستخدم

- [User profile](user_profile.md) — صاحب المشروع، business-focused. · [User name](user_name.md) — خالد.

> **Global rules** في `~/.claude/CLAUDE.md`: ULTRATHINK · NEVER seed prod DB · push confirmation · plan before code · observe-only until Task · «على مسؤوليتك» · senior UI/UX · Context7 · agent strategy · commit style · vc> · us> · tr> · ss>.
