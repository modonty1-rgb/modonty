/** جواب كل حذف: `message` تقول ماذا حصل عند جوجل حين ينجح، و`error` سبب الرفض بالعربي حين يفشل. */
export type DeleteResult = { success: boolean; message?: string; error?: string };
