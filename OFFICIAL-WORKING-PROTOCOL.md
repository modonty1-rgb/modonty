# 🔐 OFFICIAL WORKING PROTOCOL
**Based On:** Google Engineering Practices (Official)  
**Verified:** Context7 - High Authority Source  
**Status:** 100% Professional Standard  
**Date:** 2026-04-08

---

## ⚖️ CORE PRINCIPLE (Official)

> "**In general, reviewers should favor approving a CL once it is in a state where it DEFINITELY IMPROVES the overall code health of the system, even if the CL isn't perfect.**"
>
> — Google Engineering Practices (Official)

**What This Means:**
- ✅ Better code now > Perfect code later
- ❌ Never approve code that WORSENS overall health
- ⚠️ Only exception: emergencies

---

## 📋 THE OFFICIAL WORKFLOW

### Phase 1: PLANNING (No Code Yet)

**Claude (Author) Must:**
1. ✅ Understand the requirement 100%
2. ✅ Create a clear PLAN (text only, no code)
3. ✅ Identify what could go wrong
4. ✅ Propose testing strategy

**Owner (Reviewer) Must:**
1. ✅ Read the plan
2. ✅ Ask questions if unclear
3. ✅ Approve or request changes
4. ✅ Give explicit approval: "OK" or "Fix first"

**Rule:** Code is NOT written until plan is approved

---

### Phase 2: CODING (After Approval)

**Claude (Author) Must:**
1. ✅ Write clean code (following codebase style)
2. ✅ Add tests with production code (not after)
3. ✅ Run compiler checks (TypeScript)
4. ✅ Run linter checks (ESLint)
5. ✅ Test locally in browser
6. ✅ Write clear commit messages

**Official Guidance:**
> "Tests should be added in the same CL as the production code unless the CL is handling an emergency."

---

### Phase 3: VERIFICATION (Before Submission)

**Claude (Author) Must Verify:**

```
MANDATORY CHECKS:
□ pnpm tsc --noEmit → 0 errors? (TypeScript)
□ pnpm eslint . --fix → 0 warnings? (Linting)
□ Code compiles? → Yes
□ Tests pass? → Yes
□ Manual browser test? → Passed
□ git diff looks correct? → Yes

If ANY checkbox is ✗ → DO NOT PROCEED
Fix first, then check again
```

---

### Phase 4: CODE REVIEW (Official Standard)

**Owner (Reviewer) Evaluates:**

✅ **APPROVE IF:**
- Code improves overall system health
- Tests are included and make sense
- No compiler/linter errors
- Follows coding style
- Changes are clear and documented

❌ **REQUEST CHANGES IF:**
- Code doesn't improve system health
- Tests are missing or incorrect
- Compiler/linter errors exist
- Code is unclear
- Breaking changes without good reason

**Official Guidance:**
> "It is important that reviewers spend enough time on review that they are certain their LGTM means 'this code meets our standards.'"

---

### Phase 5: FIXES (If Needed)

**If Owner Requests Changes:**

1. Claude reads all feedback
2. Claude fixes the issues
3. Claude re-runs all checks (tsc, eslint, tests)
4. Claude shows what changed
5. Owner reviews again
6. Repeat until approved

**Rule:** Never skip the checks after fixes

---

### Phase 6: MERGE (Final Step)

**Only after Owner says "APPROVED":**

```bash
git add [files]
git commit -m "[clear message]"
git push
```

---

## 🧪 TESTING REQUIREMENTS (Official)

**For EVERY change:**

```
Unit Tests:
□ Test new functions/methods?
□ Test edge cases?
□ Tests use simple assertions?
□ Tests will fail if code breaks?

Integration Tests:
□ Test with real data (not mocks)?
□ Feature works end-to-end?

Browser Testing:
□ Try the feature manually
□ Check for console errors
□ Check mobile view
□ Check RTL (Arabic direction)
```

**Official Guidance:**
> "Tests do not test themselves. A human must ensure that tests are valid."

---

## 🚨 EMERGENCY PROTOCOL ONLY

**When Can Code Skip This?**

Only in TRUE emergencies:
- System is DOWN
- Major data loss risk
- Security breach

Even then:
1. Deploy minimal fix
2. Follow full process for proper fix
3. Document why it was emergency

**This does NOT apply to normal features or bug fixes.**

---

## 📝 COMMIT MESSAGE STANDARD

```
GOOD:
feat: add logo upload to client edit form
fix: restore media section to client form
docs: update protocol

BAD:
update stuff
fix bugs
changes
```

**Rule:** Commit message should explain WHY, not WHAT

---

## ❓ REVIEWER FEEDBACK PROCESS (Official)

**If Owner Questions Code:**

Claude must either:
1. ✅ **Fix the code** (best option)
2. ⚠️ **Add code comment** (if fix isn't clear)
3. ❌ **Explain in review** (least preferred)

**Official Guidance:**
> "If a reviewer didn't understand some piece of your code, other future readers won't either. Clarify the code itself, not the review comment."

---

## ⏱️ SPEED REQUIREMENTS (Official)

**Response times matter:**
- ✅ Quick responses (same day)
- ✅ Fast back-and-forth
- ❌ Delays are frustrating

BUT: **Never sacrifice quality for speed**

**Official Guidance:**
> "Don't compromise on code review standards or quality for an imagined improvement in velocity."

---

## 🛡️ WHAT MAKES A GOOD APPROVAL

Owner approves when:

```
✅ Code improves system health
✅ Tests are present and valid
✅ Compiler/linter clean
✅ Changes are clear
✅ No breaking changes without reason
✅ Readable and maintainable

NOT when:
❌ Code is "perfect" (doesn't exist)
❌ Every minor style issue is fixed
❌ Code is overpolished

Official: "Reviewers should not require the author to polish every tiny piece"
```

---

## 🔴 WHAT BLOCKS APPROVAL

**Never approve if:**
1. ❌ Code WORSENS overall health
2. ❌ Tests are missing
3. ❌ Compiler/linter errors exist
4. ❌ Breaking changes without discussion
5. ❌ Code is unclear (needs clarification)

**Rule:** These are non-negotiable

---

## 📊 THE COMPLETE FLOW DIAGRAM

```
Owner Request
    ↓
Claude: PLAN (text only)
    ↓
Owner Reviews Plan
    ├─ "Fix first" → Claude fixes plan → back to review
    └─ "OK" → approved
    ↓
Claude: CODE (with tests)
    ↓
Claude: Verification
    - pnpm tsc
    - pnpm eslint
    - Browser test
    - git diff review
    ├─ Any failures → Fix → Verify again
    └─ All pass → Ready for review
    ↓
Claude: Submit for Review
    ↓
Owner: Code Review
    ├─ "Request changes" → Claude fixes → back to review
    └─ "LGTM (Looks Good To Me)" → approved
    ↓
Claude: MERGE
    - git add
    - git commit
    - git push
    ↓
DONE ✅
```

---

## 📋 DAILY CHECKLIST

**Every Single Day:**

```
Before Any Work:
□ Claude: What's today's task?
□ Claude: What could go wrong?
□ Owner: Do I understand 100%?

After Approval:
□ Claude: Did I write the code?
□ Claude: Did I run all checks?
□ Claude: Is it in the browser?
□ Owner: Did I review everything?

Before Merge:
□ Claude: All tests pass?
□ Claude: No compiler errors?
□ Claude: Commit message clear?
□ Owner: Did I give final approval?
```

---

## 🆘 WHEN SOMETHING BREAKS

1. **STOP immediately** (don't push more code)
2. **Identify the issue** (what went wrong?)
3. **Revert if needed** (git revert, git push)
4. **Analysis** (why did this happen?)
5. **Report** (document the failure)
6. **New plan** (how to fix it right?)
7. **Owner approval** (on new plan)
8. **Try again** (following full process)

---

## 🔒 ACCOUNTABILITY (Clear Responsibility)

**Claude's Responsibility:**
- ✅ Write good code
- ✅ Write tests
- ✅ Run all checks
- ✅ Be honest about limitations
- ❌ Never push unverified code
- ❌ Never skip tests
- ❌ Never ignore compiler errors

**Owner's Responsibility:**
- ✅ Review thoroughly
- ✅ Ensure code meets standards
- ✅ Make final approval decision
- ✅ Catch issues before merge
- ❌ Blame Claude for issues
- ✅ Work together to fix problems

---

## ✅ APPROVAL MEANS THIS

When Owner says "LGTM" (Looks Good To Me):

> "I have reviewed this code thoroughly and it meets our standards. This code improves our system. It is safe to deploy."

**NOT:** "This code is perfect"  
**NOT:** "I didn't read it all"  
**YES:** "I verified it improves our health"

---

## 📚 SOURCES

All guidance from:
- **Google Engineering Practices** (Official)
  - https://google.github.io/eng-practices/review
  - High Authority, Used by Google internally

- **C++ Best Practices**
  - Testing frameworks, automated checks
  - Used by professional teams

---

## 🎯 THE PROMISE

**With this protocol:**

✅ 0 surprise failures  
✅ 0 regressions like the client form  
✅ Fast review cycles  
✅ High code quality  
✅ Clear accountability  
✅ Professional standard  

**Because:**
- Every change has a plan
- Every code change has tests
- Every submission passes checks
- Every approval is verified
- Every failure is analyzed

---

## 📝 SIGNATURE

**Claude agrees to:**
- Follow this protocol 100% of the time
- Never skip verification steps
- Report all issues honestly
- Accept all owner feedback
- Work toward system health

**Owner agrees to:**
- Review thoroughly
- Give clear approval/rejection
- Work with Claude to fix issues
- Understand not all code is perfect
- Approve when code improves health

---

**This Protocol Is Binding**  
**No Exceptions**  
**Starting Now**  

Sources: Google Engineering Practices (Official)
