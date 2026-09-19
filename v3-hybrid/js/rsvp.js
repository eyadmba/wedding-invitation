/* ---- RSVP submission -> Google Sheets ----
   POSTs to an Apps Script web app whose doPost() reads row 1 of the sheet
   and, for each header, looks for a POST field of the same name
   (case-insensitive, trimmed); a column literally named "timestamp" is
   filled server-side instead. So the field names below are a contract with
   the sheet's header row, not free-form -- renaming a header without
   renaming the matching field here makes that column go silently blank: no
   error, no rejected row, just an empty cell.

   Sheet headers this is written against:  Timestamp | Token | Name | Attending
   (add a column and send a field of the same name to capture more.) */
(function(){
  'use strict';

  /* Apps Script > Deploy > Manage deployments > copy the /exec URL, and make
     sure that deployment's access is "Anyone" -- anything stricter bounces
     anonymous guests to a Google login page and no row is ever written.

     MUST be filled in before invite links go out. Left blank, every
     submission fails visibly (console error + the error message below)
     rather than quietly swallowing the guest's answer. */
  const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwmQCDEjFSXBzqWzE0uiUJM-IsmYTzLZ2F_0xhcdAimpm_gMnmiEBFelRz-TBvULYuiag/exec';

  const form = document.querySelector('.rsvp-form');
  if (!form) return;

  const submitBtn = form.querySelector('.rsvp-submit');
  const statusEl = document.querySelector('.rsvp-status');
  const SUBMIT_LABEL = submitBtn ? submitBtn.textContent : '';

  /* published by js/guests.js, which already parses ?g= and resolves the
     name -- read once here since it can't change after load. */
  const guest = window.WeddingGuest || { known: false, token: '', name: '' };

  /* A recognized token already tells us who this is, so the form only asks
     for a name when it doesn't have one: no ?g= at all, or a token that
     isn't in GUESTS. */
  const nameField = form.querySelector('.rsvp-name');
  const nameInput = nameField ? nameField.querySelector('input') : null;
  const asksForName = !guest.known && !!nameInput;

  if (asksForName) {
    nameField.hidden = false;
    /* set here rather than in the HTML on purpose: a `required` control
       that's still hidden blocks submission with a validation bubble the
       browser can't anchor anywhere ("not focusable"), which would have
       broken the form for every tokenized guest. */
    nameInput.required = true;
  }

  // latched true on success too, not just mid-flight: one guest, one row.
  let locked = false;

  function setStatus(text, state){
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.dataset.state = state || '';
  }

  form.addEventListener('submit', function(e){
    /* also what stops the browser's default GET submit -- with no action
       attribute that would navigate to the page's own URL with
       ?attending=... appended, dropping the ?g= token and resetting the
       guest's personalization mid-RSVP. */
    e.preventDefault();
    if (locked) return;

    if (!RSVP_ENDPOINT) {
      console.error('[rsvp] RSVP_ENDPOINT is empty -- paste the Apps Script /exec URL into js/rsvp.js.');
      setStatus('تعذّر الإرسال، يرجى المحاولة لاحقاً', 'error');
      return;
    }

    const answer = form.querySelector('input[name="attendance"]:checked');

    /* typed name for an unrecognized link, GUESTS name otherwise. Trimmed
       and re-checked even though the input is `required`: native required
       is satisfied by a string of spaces, and a whitespace name is a blank
       Name column with extra steps. */
    let name = guest.name;
    if (asksForName) {
      name = nameInput.value.trim();
      nameInput.value = name;
      if (!name) {
        setStatus('يرجى كتابة الاسم الكريم', 'error');
        nameInput.focus();
        return;
      }
    }

    /* URLSearchParams, not a JSON body: JSON sets Content-Type
       application/json, which makes this a non-simple cross-origin request,
       so the browser fires a preflight OPTIONS first -- and an Apps Script
       web app only ever implements doGet/doPost, so it never answers
       OPTIONS and the request dies before doPost runs. Form-urlencoded is a
       CORS-"simple" content type (no preflight) and lands in doPost's
       e.parameter branch. Deliberately no explicit Content-Type header
       either: fetch derives the right one, and setting it by hand is
       another way to trip the preflight. */
    const body = new URLSearchParams({
      token: guest.token,
      name: name,
      attending: answer ? answer.value : ''
    });

    locked = true;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'جارٍ الإرسال…'; }
    setStatus('', '');

    fetch(RSVP_ENDPOINT, { method: 'POST', body: body })
      .then(function(res){ return res.json(); }) // doPost answers JSON either way, incl. its caught errors
      .then(function(data){
        if (!data || data.result !== 'success') throw new Error((data && data.error) || 'unexpected response');
        setStatus('شكراً لكم! تم استلام تأكيد حضوركم.', 'success');
        if (submitBtn) submitBtn.textContent = 'تم الإرسال';
        form.querySelectorAll('input').forEach(function(i){ i.disabled = true; });
      })
      .catch(function(err){
        // unlocks: a failed send is the one case where a second press should
        // be allowed, since no row was written.
        console.error('[rsvp] submission failed:', err);
        setStatus('تعذّر الإرسال، يرجى المحاولة مرة أخرى', 'error');
        locked = false;
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = SUBMIT_LABEL; }
      });
  });
})();
