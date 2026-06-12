const mongoose = require('mongoose');

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

const matchSchema = new mongoose.Schema(
  {
    start: {
      type: Number,
      min: 0,
      default: 0,
    },
    end: {
      type: Number,
      min: 0,
      default: 0,
    },
    matchedText: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    sourceText: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    sourceUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    sourceTitle: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    sourceType: {
      type: String,
      enum: ['database', 'reference', 'web', 'uploads'],
      default: 'database',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    exactMatchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    phraseOverlapScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    wordOverlapScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    scoreBasis: {
      type: String,
      enum: ['exact', 'phrase', 'word', 'none'],
      default: 'none',
    },
    matchedWords: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalWords: {
      type: Number,
      min: 0,
      default: 0,
    },
    matchedPhrases: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalPhrases: {
      type: Number,
      min: 0,
      default: 0,
    },
    phraseSize: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false },
);

const sourceSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    sourceTitle: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    sourceUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    sourceType: {
      type: String,
      enum: ['database', 'reference', 'web', 'uploads'],
      default: 'database',
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      default: null,
    },
    similarity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    plagiarismScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    topicSimilarityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    snippet: {
      type: String,
      trim: true,
      maxlength: 600,
      default: '',
    },
    matchedWords: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalWords: {
      type: Number,
      min: 0,
      default: 0,
    },
    exactMatchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    phraseOverlapScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    wordOverlapScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    scoreBasis: {
      type: String,
      enum: ['exact', 'phrase', 'word', 'none'],
      default: 'none',
    },
    matchedPhrases: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalPhrases: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false },
);

const sourceConfigSchema = new mongoose.Schema(
  {
    database: { type: Boolean, default: true },
    references: { type: Boolean, default: true },
    web: { type: Boolean, default: false },
    uploads: { type: Boolean, default: false },
  },
  { _id: false },
);

const analysisSchema = new mongoose.Schema(
  {
    effectiveThreshold: { type: Number, min: 0, max: 100, default: 35 },
    candidateCount: { type: Number, min: 0, default: 0 },
    sourceCount: { type: Number, min: 0, default: 0 },
    matchCount: { type: Number, min: 0, default: 0 },
    checkedSourceTypes: { type: [String], default: [] },
    unavailableSourceTypes: { type: [String], default: [] },
    plagiarismScore: { type: Number, min: 0, max: 100, default: 0 },
    topicSimilarityScore: { type: Number, min: 0, max: 100, default: 0 },
    exactMatchScore: { type: Number, min: 0, max: 100, default: 0 },
    phraseOverlapScore: { type: Number, min: 0, max: 100, default: 0 },
    wordOverlapScore: { type: Number, min: 0, max: 100, default: 0 },
    commonCrawl: {
      enabled: { type: Boolean, default: false },
      allowLiveFallback: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ['skipped', 'ok', 'empty', 'error'],
        default: 'skipped',
      },
      sourceMode: {
        type: String,
        enum: ['none', 'commoncrawl', 'live', 'mixed'],
        default: 'none',
      },
      searchProvider: {
        type: String,
        enum: ['none', 'serpapi'],
        default: 'none',
      },
      serpApiStatus: {
        type: String,
        enum: ['skipped', 'ok', 'empty', 'error', 'missing_api_key'],
        default: 'skipped',
      },
      serpApiQueryCount: { type: Number, min: 0, default: 0 },
      serpApiResultCount: { type: Number, min: 0, default: 0 },
      serpApiUrlCount: { type: Number, min: 0, default: 0 },
      serpApiError: { type: String, trim: true, maxlength: 500, default: '' },
      serpApiResults: {
        type: [{
          url: { type: String, trim: true, maxlength: 500, default: '' },
          title: { type: String, trim: true, maxlength: 250, default: '' },
          snippet: { type: String, trim: true, maxlength: 600, default: '' },
          position: { type: Number, min: 0, default: 0 },
          query: { type: String, trim: true, maxlength: 300, default: '' },
          group: { type: String, trim: true, maxlength: 40, default: '' },
        }],
        default: [],
      },
      explicitUrls: { type: [String], default: [] },
      indexes: { type: [String], default: [] },
      queryCount: { type: Number, min: 0, default: 0 },
      recordCount: { type: Number, min: 0, default: 0 },
      cdxHitCount: { type: Number, min: 0, default: 0 },
      cdxErrorCount: { type: Number, min: 0, default: 0 },
      warcFetchCount: { type: Number, min: 0, default: 0 },
      liveFetchCount: { type: Number, min: 0, default: 0 },
      fetchedCount: { type: Number, min: 0, default: 0 },
      targetUrlCount: { type: Number, min: 0, default: 0 },
      checkedUrlCount: { type: Number, min: 0, default: 0 },
      skippedUrlCount: { type: Number, min: 0, default: 0 },
      candidateCount: { type: Number, min: 0, default: 0 },
      minimumRecommendedSnapshots: { type: Number, min: 0, default: 5 },
      coverageLevel: {
        type: String,
        enum: ['none', 'low', 'medium', 'good'],
        default: 'none',
      },
      budgetMs: { type: Number, min: 0, default: 0 },
      elapsedMs: { type: Number, min: 0, default: 0 },
      timedOut: { type: Boolean, default: false },
      budgetExhausted: { type: Boolean, default: false },
      maxSnapshots: { type: Number, min: 0, default: 0 },
      maxUrlCandidates: { type: Number, min: 0, default: 0 },
      patterns: { type: [String], default: [] },
      searchQueries: { type: [String], default: [] },
      discoveredUrls: { type: [String], default: [] },
      checkedUrls: {
        type: [{
          url: { type: String, trim: true, maxlength: 500, default: '' },
          patterns: { type: [String], default: [] },
          cdxRecords: { type: Number, min: 0, default: 0 },
          warcFetched: { type: Boolean, default: false },
          warcFetches: { type: Number, min: 0, default: 0 },
          liveFetched: { type: Boolean, default: false },
          candidates: { type: Number, min: 0, default: 0 },
          mode: {
            type: String,
            enum: ['none', 'commoncrawl', 'live'],
            default: 'none',
          },
          error: { type: String, trim: true, maxlength: 500, default: '' },
        }],
        default: [],
      },
      error: { type: String, trim: true, maxlength: 500, default: '' },
      lastCdxError: { type: String, trim: true, maxlength: 500, default: '' },
    },
  },
  { _id: false },
);

const plagiarismReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountUser',
      required: true,
      index: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      default: null,
      index: true,
    },
    checkText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60000,
    },
    wordCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    similarityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    originalityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['completed', 'failed', 'processing'],
      default: 'completed',
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ['safe', 'review', 'high', 'critical'],
      default: 'safe',
      index: true,
    },
    matches: {
      type: [matchSchema],
      default: [],
    },
    sources: {
      type: [sourceSchema],
      default: [],
    },
    modelUsed: {
      type: String,
      trim: true,
      maxlength: 80,
      default: 'local-ngram-v1',
    },
    threshold: {
      type: Number,
      min: 0,
      max: 100,
      default: 35,
    },
    sensitivity: {
      type: String,
      enum: ['lenient', 'balanced', 'strict'],
      default: 'balanced',
    },
    ignoreCommonPhrases: {
      type: Boolean,
      default: true,
    },
    sourceConfig: {
      type: sourceConfigSchema,
      default: () => ({}),
    },
    analysis: {
      type: analysisSchema,
      default: () => ({}),
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 600,
      default: '',
    },
  },
  { timestamps: true },
);

plagiarismReportSchema.index({ userId: 1, createdAt: -1 });

plagiarismReportSchema.pre('validate', function setWordCount(next) {
  if (this.isModified('checkText') || !this.wordCount) {
    this.wordCount = countWords(this.checkText);
  }
  next();
});

module.exports = mongoose.model('PlagiarismReport', plagiarismReportSchema, 'plagiarismReports');
