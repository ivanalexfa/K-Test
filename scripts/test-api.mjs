// Isolated temporary SQLite database configuration for tests
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const origDbPath = path.resolve(process.cwd(), 'data', 'paa_platform.sqlite');
const origDbStatBefore = fs.statSync(origDbPath);
const tmpTestDb = path.join(
  os.tmpdir(),
  `ktest-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.sqlite`
);
fs.copyFileSync(origDbPath, tmpTestDb);

process.env.SQLITE_DB_PATH = tmpTestDb;
process.env.TURSO_DATABASE_URL = '';
process.env.TURSO_AUTH_TOKEN = '';

async function invokeHandler(handler, { url, method = 'GET', body = null, headers = {}, query = {} }) {
  return new Promise((resolve) => {
    let statusCode = 200;
    const responseHeaders = {};
    let responseBody = '';

    const req = new http.IncomingMessage(null);
    req.url = url;
    req.method = method;
    req.headers = { host: 'localhost', ...headers };
    req.query = query;

    const res = {
      statusCode: 200,
      setHeader(k, v) {
        responseHeaders[k] = v;
        responseHeaders[k.toLowerCase()] = v;
      },
      getHeader(k) {
        return responseHeaders[k];
      },
      writeHead(code, h) {
        statusCode = code;
        if (h) Object.assign(responseHeaders, h);
      },
      end(chunk) {
        if (chunk) responseBody += chunk.toString();
        this.writableEnded = true;
        resolve({
          statusCode: this.statusCode || statusCode,
          headers: responseHeaders,
          body: responseBody,
        });
      },
      writableEnded: false,
    };

    if (body) {
      req.body = body;
    }

    handler(req, res);
  });
}

async function runTests() {
  console.log('=== TEST SUITE: Vercel Routing & Serverless Execution Verification ===\n');

  try {
    const { default: indexHandler } = await import('../api/index.js');
    const { default: catchAllHandler } = await import('../api/[...path].js');

    // ==========================================
    // Section 1: Regex & Routing Rules Collision
    // ==========================================
    console.log('--- Section 1: vercel.json Rewrites & SPA Isolation ---');
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf-8'));
    const spaRule = vercelConfig.rewrites.find(r => r.destination === '/index.html');
    const spaRegex = new RegExp(`^${spaRule.source}$`);

    const spaTests = [
      { path: '/', shouldMatchSpa: true },
      { path: '/login', shouldMatchSpa: true },
      { path: '/student', shouldMatchSpa: true },
      { path: '/teacher/dashboard', shouldMatchSpa: true },
      { path: '/exam/verbal-1', shouldMatchSpa: true },
      { path: '/api', shouldMatchSpa: false },
      { path: '/api/', shouldMatchSpa: false },
      { path: '/api/health', shouldMatchSpa: false },
      { path: '/api/auth/google', shouldMatchSpa: false },
      { path: '/api/auth/login', shouldMatchSpa: false },
      { path: '/api/bootstrap', shouldMatchSpa: false },
      { path: '/api/materials', shouldMatchSpa: false },
      { path: '/api/attempts', shouldMatchSpa: false },
    ];

    let spaPass = true;
    for (const t of spaTests) {
      const matches = spaRegex.test(t.path);
      const pass = matches === t.shouldMatchSpa;
      if (!pass) spaPass = false;
      console.log(`  Route: ${t.path.padEnd(25)} -> Matches SPA: ${String(matches).padEnd(6)} (Expected: ${String(t.shouldMatchSpa).padEnd(6)}) [${pass ? 'PASS' : 'FAIL'}]`);
    }
    if (!spaPass) throw new Error('SPA Regex Collision Detected!');
    console.log('✓ All SPA isolation checks passed without collision.\n');

    // ==========================================
    // Section 2: api/index.js Execution via Rewrite
    // ==========================================
    console.log('--- Section 2: api/index.js via Vercel Rewrite Destination ---');
    
    // 2.1 /api root diagnostic
    const resApi = await invokeHandler(indexHandler, { url: '/api/index.js' });
    console.log('  2.1 GET /api:', resApi.statusCode, resApi.body);
    if (resApi.statusCode !== 200) throw new Error('GET /api failed');

    // 2.2 /api/health via __pathname
    const resHealth = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/health',
      query: { __pathname: '/api/health' },
    });
    console.log('  2.2 GET /api/health (rewrite):', resHealth.statusCode, resHealth.body);
    if (resHealth.statusCode !== 200) throw new Error('GET /api/health failed');

    // 2.3 POST /api/auth/google via rewrite
    const resGoogle = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/auth/google',
      method: 'POST',
      query: { __pathname: '/api/auth/google' },
      body: {
        name: 'Carlos Estudiante Google',
        email: 'carlos.estudiante@gmail.com',
        googleId: 'google-student-777',
        requestedRole: 'student',
      },
    });
    console.log('  2.3 POST /api/auth/google (rewrite):', resGoogle.statusCode, JSON.parse(resGoogle.body).user?.email, 'Role:', JSON.parse(resGoogle.body).user?.role);
    if (resGoogle.statusCode !== 200) throw new Error('POST /api/auth/google failed');

    // 2.4 GET /api/bootstrap via rewrite
    const resBoot = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/bootstrap',
      query: { __pathname: '/api/bootstrap' },
    });
    const bootData = JSON.parse(resBoot.body);
    console.log('  2.4 GET /api/bootstrap (rewrite):', resBoot.statusCode, 'Users count:', bootData.users?.length, 'Attempts count:', bootData.attempts?.length);
    if (resBoot.statusCode !== 200) throw new Error('GET /api/bootstrap failed');

    // ==========================================
    // Section 3: api/[...path].js Native Routing Execution
    // ==========================================
    console.log('\n--- Section 3: api/[...path].js via Native Vercel Catch-All ---');

    // 3.1 POST /api/auth/google via native [...path] query
    const resGoogleNative = await invokeHandler(catchAllHandler, {
      url: '/api/auth/google',
      method: 'POST',
      query: { path: ['auth', 'google'] },
      body: {
        name: 'Sofia Lopez',
        email: 'sofia.lopez@gmail.com',
        googleId: 'google-student-888',
        requestedRole: 'student',
      },
    });
    console.log('  3.1 POST /api/auth/google (native catchall):', resGoogleNative.statusCode, JSON.parse(resGoogleNative.body).user?.email, 'Role:', JSON.parse(resGoogleNative.body).user?.role);
    if (resGoogleNative.statusCode !== 200) throw new Error('Native POST /api/auth/google failed');

    // 3.2 x-forwarded-uri header support
    const resHeaderForwarded = await invokeHandler(catchAllHandler, {
      url: '/api/[...path].js',
      headers: { 'x-forwarded-uri': '/api/health?test=1' },
    });
    console.log('  3.2 GET /api/health (x-forwarded-uri):', resHeaderForwarded.statusCode, resHeaderForwarded.body);
    if (resHeaderForwarded.statusCode !== 200) throw new Error('x-forwarded-uri failed');

    // 3.3 x-matched-path header support
    const resHeaderMatched = await invokeHandler(catchAllHandler, {
      url: '/api/[...path].js',
      headers: { 'x-matched-path': '/api/health' },
    });
    console.log('  3.3 GET /api/health (x-matched-path):', resHeaderMatched.statusCode, resHeaderMatched.body);
    if (resHeaderMatched.statusCode !== 200) throw new Error('x-matched-path failed');

    // 3.4 404 handler within serverless function
    const res404 = await invokeHandler(catchAllHandler, {
      url: '/api/invalid-endpoint',
      query: { path: ['invalid-endpoint'] },
    });
    console.log('  3.4 Unknown route within serverless:', res404.statusCode, res404.body);
    if (res404.statusCode !== 404) throw new Error('404 test failed');

    // ==========================================
    // Section 4: Adversarial Edge Cases & Boundary Conditions
    // ==========================================
    console.log('\n--- Section 4: Adversarial Edge Cases & Boundary Conditions ---');

    // 4.1 __pathname polluted with query string
    const resQueryInPath = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/health?test=1&debug=true',
      query: { __pathname: '/api/health?test=1&debug=true' },
    });
    console.log('  4.1 GET /api/health with query in __pathname:', resQueryInPath.statusCode, resQueryInPath.body);
    if (resQueryInPath.statusCode !== 200) throw new Error('Query string in __pathname failed');

    // 4.2 __pathname with trailing slash
    const resTrailingSlash = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/health/',
      query: { __pathname: '/api/health/' },
    });
    console.log('  4.2 GET /api/health/ (trailing slash):', resTrailingSlash.statusCode, resTrailingSlash.body);
    if (resTrailingSlash.statusCode !== 200) throw new Error('Trailing slash in __pathname failed');

    // 4.3 Direct root / invocation to serverless function
    const resRoot = await invokeHandler(indexHandler, {
      url: '/',
    });
    console.log('  4.3 GET / (root serverless diagnostic):', resRoot.statusCode, resRoot.body);
    if (resRoot.statusCode !== 200) throw new Error('Root / invocation failed');

    // 4.4 CORS preflight OPTIONS request
    const resOptions = await invokeHandler(indexHandler, {
      url: '/api/auth/google',
      method: 'OPTIONS',
      headers: { origin: 'https://k-test.vercel.app', 'access-control-request-headers': 'content-type' },
    });
    console.log('  4.4 OPTIONS /api/auth/google:', resOptions.statusCode, resOptions.headers['access-control-allow-origin']);
    if (resOptions.statusCode !== 204) throw new Error('OPTIONS preflight failed');
    if (!resOptions.headers['access-control-allow-origin']) throw new Error('Missing CORS headers');

    // 4.5 POST /api/auth/google/ with trailing slash
    const resGoogleTrailing = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/auth/google/',
      method: 'POST',
      query: { __pathname: '/api/auth/google/' },
      body: {
        name: 'Sofia Lopez',
        email: 'sofia.lopez@gmail.com',
        googleId: 'google-student-888',
        requestedRole: 'student',
      },
    });
    console.log('  4.5 POST /api/auth/google/ (trailing slash):', resGoogleTrailing.statusCode, JSON.parse(resGoogleTrailing.body).user?.email);
    if (resGoogleTrailing.statusCode !== 200) throw new Error('POST with trailing slash failed');

    // 4.6 Query params forwarding on /api/attempts
    const resAttemptsQuery = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/attempts&userId=stu-1',
      query: { __pathname: '/api/attempts', userId: 'stu-1' },
    });
    console.log('  4.6 GET /api/attempts?userId=stu-1:', resAttemptsQuery.statusCode, 'Attempts count:', JSON.parse(resAttemptsQuery.body).attempts?.length);
    if (resAttemptsQuery.statusCode !== 200) throw new Error('Attempts query params failed');

    // 4.7 Double slash normalization
    const resDoubleSlash = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api//health',
      query: { __pathname: '/api//health' },
    });
    console.log('  4.7 GET /api//health (double slash):', resDoubleSlash.statusCode, resDoubleSlash.body);
    if (resDoubleSlash.statusCode !== 200) throw new Error('Double slash normalization failed');

    // 4.8 req.query.userId filtering without url search params
    const resCatchAllQueryUserId = await invokeHandler(catchAllHandler, {
      url: '/api/attempts',
      query: { path: ['attempts'], userId: 'stu-1' },
    });
    const filteredAttempts = JSON.parse(resCatchAllQueryUserId.body).attempts;
    console.log('  4.8 GET /api/attempts (req.query.userId):', resCatchAllQueryUserId.statusCode, 'Count:', filteredAttempts?.length);
    if (resCatchAllQueryUserId.statusCode !== 200 || filteredAttempts?.length !== 2) {
      throw new Error('req.query.userId filtering failed (expected 2 attempts for stu-1)');
    }

    // 4.9 Invalid JSON body rejection (400 Bad Request)
    const resInvalidJson = await invokeHandler(indexHandler, {
      url: '/api/auth/google',
      method: 'POST',
      body: '{malformed_json: true',
    });
    console.log('  4.9 POST /api/auth/google with invalid JSON:', resInvalidJson.statusCode, JSON.parse(resInvalidJson.body).code);
    if (resInvalidJson.statusCode !== 400) throw new Error('Invalid JSON did not return 400');

    // 4.10 Microsoft with @keyinstitute.edu.sv automatically assigns teacher role
    const resMsTeacher = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/auth/microsoft',
      method: 'POST',
      query: { __pathname: '/api/auth/microsoft' },
      body: {
        name: 'Dra. Carmen Key',
        email: 'carmen.key@keyinstitute.edu.sv',
        microsoftOid: 'ms-prof-999',
      },
    });
    const parsedMsTeacher = JSON.parse(resMsTeacher.body);
    console.log('  4.10 POST /api/auth/microsoft with @keyinstitute.edu.sv -> auto role:', resMsTeacher.statusCode, parsedMsTeacher.user?.role);
    if (resMsTeacher.statusCode !== 200 || parsedMsTeacher.user?.role !== 'teacher') {
      throw new Error('Microsoft login with @keyinstitute.edu.sv must assign teacher role');
    }

    // 4.11 Microsoft with non-institutional email automatically assigns student role and cohort
    const resMsStudent = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/auth/microsoft',
      method: 'POST',
      query: { __pathname: '/api/auth/microsoft' },
      body: {
        name: 'Carlos Outlook',
        email: 'carlos.outlook@outlook.com',
        microsoftOid: 'ms-stu-888',
        cohort: 'Ciclo 1 2027',
      },
    });
    const parsedMsStudent = JSON.parse(resMsStudent.body);
    console.log('  4.11 POST /api/auth/microsoft non-institutional -> auto student role:', resMsStudent.statusCode, parsedMsStudent.user?.role, parsedMsStudent.user?.cohort);
    if (resMsStudent.statusCode !== 200 || parsedMsStudent.user?.role !== 'student' || parsedMsStudent.user?.cohort !== 'Ciclo 1 2027') {
      throw new Error('Microsoft login without @keyinstitute.edu.sv must assign student role and chosen cohort');
    }

    // 4.11b Google with any email automatically assigns student role and chosen cohort
    const resGoogleStudent = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/auth/google',
      method: 'POST',
      query: { __pathname: '/api/auth/google' },
      body: {
        name: 'Ana Google',
        email: 'ana.key@keyinstitute.edu.sv',
        googleId: 'goog-stu-555',
        cohort: 'Ciclo 2 2027',
      },
    });
    const parsedGoogleStudent = JSON.parse(resGoogleStudent.body);
    console.log('  4.11b POST /api/auth/google -> auto student role:', resGoogleStudent.statusCode, parsedGoogleStudent.user?.role, parsedGoogleStudent.user?.cohort);
    if (resGoogleStudent.statusCode !== 200 || parsedGoogleStudent.user?.role !== 'student' || parsedGoogleStudent.user?.cohort !== 'Ciclo 2 2027') {
      throw new Error('Google login must always assign student role and chosen cohort');
    }

    // 4.12 Empty identifier validations on dynamic routes
    const resEmptyMatPut = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/materials/%20',
      method: 'PUT',
      query: { __pathname: '/api/materials/%20' },
      body: { title: 'Test' },
    });
    console.log('  4.12 PUT /api/materials/%20 (whitespace ID):', resEmptyMatPut.statusCode, JSON.parse(resEmptyMatPut.body).error);
    if (resEmptyMatPut.statusCode !== 400) throw new Error('Empty material ID on PUT should return 400');

    const resEmptyMatDel = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/materials/%20',
      method: 'DELETE',
      query: { __pathname: '/api/materials/%20' },
    });
    console.log('  4.13 DELETE /api/materials/%20 (whitespace ID):', resEmptyMatDel.statusCode, JSON.parse(resEmptyMatDel.body).error);
    if (resEmptyMatDel.statusCode !== 400) throw new Error('Empty material ID on DELETE should return 400');

    const resEmptyUserCohort = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/users//cohort',
      method: 'PUT',
      query: { __pathname: '/api/users//cohort' },
      body: { cohort: 'Nueva Cohorte' },
    });
    console.log('  4.14 PUT /api/users//cohort (empty userId):', resEmptyUserCohort.statusCode, JSON.parse(resEmptyUserCohort.body).error);
    if (resEmptyUserCohort.statusCode !== 400) throw new Error('Empty user ID on PUT /cohort should return 400');

    const resEmptyUpload = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/uploads/%20',
      method: 'GET',
      query: { __pathname: '/api/uploads/%20' },
    });
    console.log('  4.15 GET /api/uploads/%20 (empty filename):', resEmptyUpload.statusCode, JSON.parse(resEmptyUpload.body).error);
    if (resEmptyUpload.statusCode !== 400) throw new Error('Empty filename on uploads should return 400');

    // 4.16 Empty body on POST /api/auth/google returns 400
    const resEmptyGoogleBody = await invokeHandler(indexHandler, {
      url: '/api/index.js?__pathname=/api/auth/google',
      method: 'POST',
      query: { __pathname: '/api/auth/google' },
      body: {},
    });
    console.log('  4.16 POST /api/auth/google with empty body:', resEmptyGoogleBody.statusCode, JSON.parse(resEmptyGoogleBody.body).error);
    if (resEmptyGoogleBody.statusCode !== 400) throw new Error('Empty body on Google auth should return 400');

    console.log('\n======================================================');
    console.log('🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================');
  } finally {
    // Clean up temporary database and verify original database was not modified
    try {
      const { resetLocalDbInstance } = await import('../server/dbDriver.ts');
      resetLocalDbInstance();
    } catch {}

    try {
      if (fs.existsSync(tmpTestDb)) {
        fs.unlinkSync(tmpTestDb);
      }
    } catch {}

    const origDbStatAfter = fs.statSync(origDbPath);
    if (
      origDbStatBefore.mtimeMs !== origDbStatAfter.mtimeMs ||
      origDbStatBefore.size !== origDbStatAfter.size
    ) {
      console.error('FATAL: data/paa_platform.sqlite was modified by test run!');
      process.exit(1);
    }
    console.log('✓ Confirmed data/paa_platform.sqlite remained 100% pristine and unmodified.');
  }
}

runTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
