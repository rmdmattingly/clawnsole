// Playwright test helpers to fail fast on browser console errors, page errors,
// and unexpected failed network calls.
//
// Usage:
//   const { installPageFailureAssertions } = require('./helpers/pw-assertions');
//   const guards = installPageFailureAssertions(page, { appOrigin });
//   ...test...
//   await guards.assertNoFailures();
//
// Notes:
// - We intentionally filter network assertions to a single appOrigin so that
//   external third-party calls (fonts, analytics, etc.) don't fail tests.

function toSafeString(x) {
  try {
    return typeof x === 'string' ? x : JSON.stringify(x);
  } catch {
    return String(x);
  }
}

function installPageFailureAssertions(page, opts = {}) {
  const appOrigin = opts.appOrigin || '';
  const allowStatusCodes = new Set(opts.allowStatusCodes || [401, 403]);
  const allowRequest = typeof opts.allowRequest === 'function' ? opts.allowRequest : () => false;

  const consoleIssues = [];
  const pageErrors = [];
  const failedRequests = [];
  const httpErrorResponses = [];

  const onConsole = (msg) => {
    const type = msg.type();
    if (type !== 'error' && type !== 'warning') return;
    consoleIssues.push({
      type,
      text: msg.text(),
      location: msg.location ? msg.location() : undefined
    });
  };

  const onPageError = (err) => {
    pageErrors.push({ message: String(err && err.stack ? err.stack : err) });
  };

  const inAppOrigin = (url) => {
    if (!appOrigin) return false;
    try {
      return new URL(url).origin === appOrigin;
    } catch {
      return false;
    }
  };

  const onRequestFailed = (req) => {
    const url = req.url();
    if (!inAppOrigin(url)) return;
    if (allowRequest(req)) return;

    const failure = req.failure();
    failedRequests.push({
      method: req.method(),
      url,
      failureText: failure ? failure.errorText : ''
    });
  };

  const onResponse = (res) => {
    const url = res.url();
    if (!inAppOrigin(url)) return;

    const status = res.status();
    if (status < 400) return;
    if (allowStatusCodes.has(status)) return;

    httpErrorResponses.push({
      status,
      url,
      method: res.request().method()
    });
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  page.on('requestfailed', onRequestFailed);
  page.on('response', onResponse);

  return {
    async assertNoFailures(extra = {}) {
      const allowConsole = typeof extra.allowConsole === 'function' ? extra.allowConsole : () => false;
      const issues = consoleIssues.filter((i) => !allowConsole(i));

      if (issues.length || pageErrors.length || failedRequests.length || httpErrorResponses.length) {
        const lines = [];
        if (issues.length) {
          lines.push(`console issues (${issues.length}):`);
          for (const i of issues.slice(0, 5)) {
            lines.push(`- [${i.type}] ${i.text}`);
          }
          if (issues.length > 5) lines.push(`- ... (${issues.length - 5} more)`);
        }
        if (pageErrors.length) {
          lines.push(`page errors (${pageErrors.length}):`);
          for (const e of pageErrors.slice(0, 3)) {
            lines.push(`- ${toSafeString(e.message).split('\n')[0]}`);
          }
          if (pageErrors.length > 3) lines.push(`- ... (${pageErrors.length - 3} more)`);
        }
        if (failedRequests.length) {
          lines.push(`failed requests (${failedRequests.length}):`);
          for (const r of failedRequests.slice(0, 5)) {
            lines.push(`- ${r.method} ${r.url} ${r.failureText ? `(${r.failureText})` : ''}`);
          }
          if (failedRequests.length > 5) lines.push(`- ... (${failedRequests.length - 5} more)`);
        }
        if (httpErrorResponses.length) {
          lines.push(`HTTP error responses (${httpErrorResponses.length}):`);
          for (const r of httpErrorResponses.slice(0, 5)) {
            lines.push(`- ${r.method} ${r.url} -> ${r.status}`);
          }
          if (httpErrorResponses.length > 5) lines.push(`- ... (${httpErrorResponses.length - 5} more)`);
        }

        throw new Error(`playwright page failure assertions:\n${lines.join('\n')}`);
      }
    },
    dispose() {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      page.off('requestfailed', onRequestFailed);
      page.off('response', onResponse);
    }
  };
}

module.exports = { installPageFailureAssertions };
