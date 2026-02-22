/** Option helper for select/multiselect config. */
export const opt = (value: string, label: string) => ({ value, label });

/** Maps new sequential ids (q1–q83, q10_tools) to original config keys for getFieldConfig. */
export const NEW_ID_TO_OLD_ID: Record<string, string> = {
  q1: "q3", q2: "q4", q3: "q7", q4: "q8b", q5: "q10", q6: "q11", q7: "q12", q8: "q13", q9: "q14", q10: "q15",
  q11: "q17", q12: "q17b", q13: "q17c", q14: "q17d", q15: "q18", q16: "q19", q17: "q20", q18: "q21", q19: "q23b",
  q20: "q26", q21: "q27", q22: "q28", q23: "q29", q24: "q30", q25: "q31", q26: "q32", q27: "q34", q28: "q35", q29: "q36",
  q30: "q37", q31: "q38", q32: "q39", q33: "q40", q34: "q41", q35: "q42", q36: "q43", q37: "q44", q38: "q45", q39: "q46",
  q40: "q47", q41: "q48", q42: "q49", q43: "q50", q44: "q51", q45: "q53", q46: "q54", q47: "q55", q48: "q56", q49: "q57",
  q50: "q58", q51: "q59", q52: "q60", q53: "q61", q54: "q62", q55: "q63", q56: "q64", q57: "q65", q58: "q66", q59: "q67",
  q60: "q68", q61: "q69", q62: "q70", q63: "q71", q64: "q74", q65: "q76", q66: "q77", q67: "q77b", q68: "q78", q69: "q79",
  q70: "q80", q71: "q81", q72: "q82", q73: "q83", q74: "q85", q75: "q87", q76: "q88", q77: "q91", q78: "q91b", q79: "q91c",
  q80: "q92", q81: "q93", q82: "q94", q83: "q95",
  q10_tools: "q15_tools",
};
