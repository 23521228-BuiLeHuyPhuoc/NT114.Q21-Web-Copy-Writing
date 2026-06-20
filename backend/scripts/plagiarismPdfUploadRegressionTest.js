const assert = require('assert');

const cloudinaryService = require('../src/services/cloudinaryService');
const PlagiarismReport = require('../src/models/PlagiarismReport');
const { preparePlagiarismFilePayload } = require('../src/middlewares/upload/plagiarismFilePayload');
const { checkPlagiarismSchema } = require('../src/validations/plagiarismValidation');
const plagiarismService = require('../src/services/plagiarismService');

const USER_ID = '507f1f77bcf86cd799439011';
let reportSequence = 0;
let cloudinaryShouldFail = false;

cloudinaryService.uploadPlagiarismFile = async (_userId, file, index = 0) => {
  if (cloudinaryShouldFail) {
    const error = new Error('File format is not supported');
    error.code = 'show_original_unsupported_file_format';
    throw error;
  }

  return {
    publicId: `mock/plagiarism/${index}/${file.originalname}`,
    url: `https://res.cloudinary.com/mock/raw/upload/plagiarism/${encodeURIComponent(file.originalname)}`,
    bytes: file.size || file.buffer.length,
    format: 'pdf',
    resourceType: 'raw',
  };
};

PlagiarismReport.create = async (doc) => ({
  _id: { toString: () => `pdf-regression-${++reportSequence}` },
  ...doc,
  createdAt: new Date('2026-06-19T00:00:00.000Z'),
  updatedAt: new Date('2026-06-19T00:00:00.000Z'),
});

function escapePdfText(value) {
  return Array.from(String(value), (char) => {
    if (char === '\\') return '\\\\';
    if (char === '(') return '\\(';
    if (char === ')') return '\\)';
    return char;
  }).join('');
}

function makePdfBuffer(text) {
  const eol = '\r\n';
  const lines = String(text)
    .split(/\n/)
    .flatMap((line) => line.match(/.{1,90}(?:\s+|$)/g) || [line]);
  const commands = ['BT', '/F1 12 Tf', '50 750 Td', '14 TL'];
  lines.forEach((line, index) => {
    commands.push(`(${escapePdfText(line.trimEnd())}) Tj`);
    if (index < lines.length - 1) commands.push('T*');
  });
  commands.push('ET');

  const stream = commands.join(eol);
  const objects = [];
  objects[1] = `1 0 obj${eol}<< /Type /Catalog /Pages 2 0 R >>${eol}endobj${eol}`;
  objects[2] = `2 0 obj${eol}<< /Type /Pages /Kids [3 0 R] /Count 1 >>${eol}endobj${eol}`;
  objects[3] = `3 0 obj${eol}<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>${eol}endobj${eol}`;
  objects[4] = `4 0 obj${eol}<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>${eol}endobj${eol}`;
  objects[5] = `5 0 obj${eol}<< /Length ${Buffer.byteLength(stream, 'latin1')} >>${eol}stream${eol}${stream}${eol}endstream${eol}endobj${eol}`;

  let output = `%PDF-1.4${eol}%\xE2\xE3\xCF\xD3${eol}`;
  const offsets = [0];
  for (let index = 1; index <= 5; index += 1) {
    offsets[index] = Buffer.byteLength(output, 'latin1');
    output += objects[index];
  }

  const xrefOffset = Buffer.byteLength(output, 'latin1');
  output += `xref${eol}0 6${eol}0000000000 65535 f ${eol}`;
  for (let index = 1; index <= 5; index += 1) {
    output += `${String(offsets[index]).padStart(10, '0')} 00000 n ${eol}`;
  }
  output += `trailer${eol}<< /Size 6 /Root 1 0 R >>${eol}startxref${eol}${xrefOffset}${eol}%%EOF${eol}`;

  const buffer = Buffer.alloc(Buffer.byteLength(output, 'latin1'));
  buffer.write(output, 'latin1');
  return buffer;
}

function fileFromText(name, text, fieldname = 'referenceFiles') {
  const buffer = makePdfBuffer(text);
  return {
    fieldname,
    originalname: name,
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer,
    size: buffer.length,
  };
}

function words(seed, count) {
  return Array.from({ length: count }, (_, index) => `${seed}${index}`).join(' ');
}

function baseParagraph(index) {
  return [
    `regression case ${index} studies subscription retention signals across pricing workflow`,
    `the audit narrative maps customer intent product evidence and conversion timing`,
    `each sentence carries unique benchmark terms delta${index} omega${index} kappa${index}`,
  ].join(' ');
}

function unrelatedParagraph(index) {
  return [
    `nebula archive ${index} describes mineral catalog storms orbit lantern cipher`,
    `harbor engine meadow syntax quartz violin paper galaxy winter compass`,
    `randomized appendix avoids marketing overlap with token family ${words(`z${index}_`, 16)}`,
  ].join(' ');
}

function wrapEvery(text, every = 6) {
  return String(text)
    .split(/\s+/)
    .map((word, index) => (index > 0 && index % every === 0 ? `\n${word}` : word))
    .join(' ')
    .replace(/ \n/g, '\n');
}

function punctuationVariant(text) {
  return String(text)
    .toUpperCase()
    .replace(/ /g, ', ')
    .replace(/,$/, '.')
    .replace(/DELTA/g, 'delta');
}

function largeSourceAround(text, index) {
  return [
    words(`largeprefix${index}_`, 140),
    wrapEvery(text, 5),
    words(`largesuffix${index}_`, 140),
  ].join(' ');
}

function oversizedSourceAround(text, index) {
  return [
    words(`oversizedprefix${index}_`, 26000),
    wrapEvery(text, 7),
    words(`oversizedsuffix${index}_`, 26000),
  ].join(' ');
}

function makeCases() {
  const cases = [];

  for (let index = 1; index <= 25; index += 1) {
    const check = baseParagraph(index);
    cases.push({
      name: `exact-single-pdf-${index}`,
      check,
      refs: [`context before ${check} context after ${index}`],
      minScore: 95,
      minMatches: 1,
    });
  }

  for (let index = 26; index <= 40; index += 1) {
    const check = baseParagraph(index);
    cases.push({
      name: `wrapped-pdf-source-${index}`,
      check,
      refs: [`source intro ${wrapEvery(check, 4)} source outro`],
      minScore: 90,
      minMatches: 1,
    });
  }

  for (let index = 41; index <= 55; index += 1) {
    const check = baseParagraph(index);
    cases.push({
      name: `case-punctuation-pdf-source-${index}`,
      check,
      refs: [`${punctuationVariant(check)} closing appendix`],
      minScore: 90,
      minMatches: 1,
    });
  }

  for (let index = 56; index <= 70; index += 1) {
    const check = baseParagraph(index);
    cases.push({
      name: `large-wrapped-pdf-source-${index}`,
      check,
      refs: [largeSourceAround(check, index)],
      minScore: 90,
      minMatches: 1,
    });
  }

  for (let index = 71; index <= 80; index += 1) {
    cases.push({
      name: `unrelated-pdf-source-${index}`,
      check: baseParagraph(index),
      refs: [unrelatedParagraph(index)],
      maxScore: 15,
      exactMatches: 0,
    });
  }

  for (let index = 81; index <= 90; index += 1) {
    const check = baseParagraph(index);
    cases.push({
      name: `multiple-reference-pdfs-${index}`,
      check,
      refs: [
        unrelatedParagraph(index),
        `matching reference ${index} ${wrapEvery(check, 7)} final evidence`,
        unrelatedParagraph(index + 100),
      ],
      minScore: 90,
      minMatches: 1,
      expectedSourceTitleIncludes: `reference-${index}-2.pdf`,
    });
  }

  for (let index = 91; index <= 95; index += 1) {
    const check = baseParagraph(index);
    cases.push({
      name: `cloudinary-failure-still-checks-${index}`,
      check,
      refs: [`cloudinary failure should not block ${check}`],
      minScore: 95,
      minMatches: 1,
      cloudinaryFails: true,
    });
  }

  for (let index = 96; index <= 100; index += 1) {
    const check = baseParagraph(index);
    cases.push({
      name: `oversized-reference-pdf-normalized-exact-${index}`,
      check,
      refs: [oversizedSourceAround(check, index)],
      minScore: 95,
      minMatches: 1,
    });
  }

  assert.strictEqual(cases.length, 100, 'test suite must contain exactly 100 cases');
  return cases;
}

async function runMiddleware(body, checkFile, referenceFiles) {
  const req = {
    user: { _id: USER_ID },
    body: { ...body },
    files: {},
  };

  if (checkFile) {
    req.files.checkFile = [checkFile];
  }

  if (referenceFiles.length > 0) {
    req.files.referenceFiles = referenceFiles;
  }

  await new Promise((resolve, reject) => {
    preparePlagiarismFilePayload(req, {}, (error) => (error ? reject(error) : resolve()));
  });

  return req.body;
}

function validatePayload(payload) {
  const result = checkPlagiarismSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (result.error) {
    const detail = result.error.details.map((item) => `${item.path.join('.')}: ${item.message}`).join('; ');
    throw new Error(`validation failed: ${detail}`);
  }

  return result.value;
}

function assertReferencePdfPayload(testCase, payload, referenceFiles) {
  assert.strictEqual(payload.text, testCase.check, 'check text must come from the text field, not from a PDF reference');
  assert.strictEqual(payload.checkFileName, undefined, 'reference PDF upload must not be treated as the check file');
  assert.ok(Array.isArray(payload.uploadedSources), 'reference PDFs must be converted into uploadedSources');
  assert.strictEqual(payload.uploadedSources.length, referenceFiles.length, 'every reference PDF must become one uploaded source');
  assert.strictEqual(payload.sources.uploads, true, 'uploads source must be enabled when reference PDFs are present');

  payload.uploadedSources.forEach((source, sourceIndex) => {
    const file = referenceFiles[sourceIndex];
    assert.strictEqual(source.sourceType, 'uploads', 'reference PDF sourceType must be uploads');
    assert.strictEqual(source.sourceTitle, file.originalname, 'source title must keep the reference PDF file name');
    assert.strictEqual(source.mimeType, 'application/pdf', 'reference PDF mime type must be preserved');
    assert.strictEqual(source.size, file.size, 'reference PDF size must be preserved');
    assert.ok(source.text && source.text.trim().split(/\s+/).length >= 5, 'reference PDF must have extracted comparison text');

    if (testCase.cloudinaryFails) {
      assert.strictEqual(source.sourceUrl, '', 'Cloudinary failure must not create a source URL');
    } else {
      assert.ok(source.sourceUrl.includes(encodeURIComponent(file.originalname)), 'source URL must come from uploaded reference PDF metadata');
    }
  });
}

function assertReport(testCase, report) {
  if (testCase.minScore !== undefined) {
    assert.ok(
      report.similarityScore >= testCase.minScore,
      `expected score >= ${testCase.minScore}, got ${report.similarityScore}`,
    );
  }

  if (testCase.maxScore !== undefined) {
    assert.ok(
      report.similarityScore <= testCase.maxScore,
      `expected score <= ${testCase.maxScore}, got ${report.similarityScore}`,
    );
  }

  if (testCase.minMatches !== undefined) {
    assert.ok(
      report.matches.length >= testCase.minMatches,
      `expected at least ${testCase.minMatches} matches, got ${report.matches.length}`,
    );
  }

  if (testCase.exactMatches !== undefined) {
    assert.strictEqual(report.matches.length, testCase.exactMatches, `expected exactly ${testCase.exactMatches} matches`);
  }

  assert.ok(report.analysis.checkedSourceTypes.includes('uploads'), 'uploads source type was not checked');
  assert.strictEqual(report.sourceConfig.uploads, true, 'uploads source config must be true');

  if (testCase.minScore !== undefined) {
    assert.ok(
      report.sources.some((source) => source.sourceType === 'uploads'),
      'matching report must include an uploaded PDF reference source',
    );
  }

  if (testCase.expectedSourceTitleIncludes) {
    const titles = report.sources.map((source) => source.sourceTitle).join(' | ');
    assert.ok(titles.includes(testCase.expectedSourceTitleIncludes), `expected source title ${testCase.expectedSourceTitleIncludes}, got ${titles}`);
  }
}

async function runCase(testCase, index) {
  cloudinaryShouldFail = Boolean(testCase.cloudinaryFails);

  const referenceFiles = testCase.refs.map((text, refIndex) => fileFromText(`reference-${index}-${refIndex + 1}.pdf`, text));
  const payload = await runMiddleware({
    text: testCase.check,
    sources: JSON.stringify({ database: false, references: false, web: false, uploads: true }),
    threshold: '35',
    sensitivity: 'balanced',
    includeReferences: 'false',
    ignoreCommonPhrases: 'false',
  }, null, referenceFiles);
  assertReferencePdfPayload(testCase, payload, referenceFiles);
  const validated = validatePayload(payload);
  assert.strictEqual(validated.uploadedSources.length, referenceFiles.length, 'validated payload must keep every reference PDF source');
  const report = await plagiarismService.checkPlagiarism(USER_ID, validated);

  assertReport(testCase, report);
  return report;
}

async function main() {
  process.stdout.write('starting reference PDF plagiarism regression suite\n');
  const cases = makeCases();
  const failures = [];

  for (let index = 0; index < cases.length; index += 1) {
    const testCase = cases[index];
    try {
      await runCase(testCase, index + 1);
      process.stdout.write(`ok ${String(index + 1).padStart(3, '0')} ${testCase.name}\n`);
    } catch (error) {
      failures.push({ index: index + 1, name: testCase.name, error });
      process.stdout.write(`FAIL ${String(index + 1).padStart(3, '0')} ${testCase.name}: ${error.message}\n`);
      break;
    }
  }

  if (failures.length > 0) {
    const failure = failures[0];
    console.error(`\nFirst failing case: #${failure.index} ${failure.name}`);
    console.error(failure.error.stack || failure.error.message);
    process.exit(1);
  }

  console.log('\nReference PDF plagiarism regression suite passed: 100/100');
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
