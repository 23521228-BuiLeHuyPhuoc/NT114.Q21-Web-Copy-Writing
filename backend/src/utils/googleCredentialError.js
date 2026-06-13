const createError = require('./createError');

function getProjectId() {
  return String(process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || '').trim();
}

function getCredentialMessage(error) {
  const responseData = error?.response?.data || error?.data || {};
  const candidates = [
    error?.message,
    responseData.error_description,
    responseData.error,
    responseData.message,
    typeof responseData === 'string' ? responseData : '',
  ];
  return candidates.filter(Boolean).join(' ');
}

function isGoogleInvalidGrant(error) {
  return /invalid_grant|expired or revoked|token has been expired/i.test(getCredentialMessage(error));
}

function createGoogleCredentialError(error, context = 'Google Cloud request') {
  if (!isGoogleInvalidGrant(error)) return null;

  const projectId = getProjectId() || '<your-google-cloud-project>';
  return createError(
    503,
    `${context} failed because Google Application Default Credentials expired or were revoked (invalid_grant). Vertex fine-tuning needs OAuth or a service account; Gemini/Vertex API keys are not enough for GCS upload or tuning job creation. Run gcloud auth application-default login --project ${projectId}, then gcloud auth application-default set-quota-project ${projectId}, or set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON with Vertex AI and Storage permissions.`,
    undefined,
    {
      code: 'GOOGLE_ADC_INVALID_GRANT',
      projectId,
      credentialType: 'application_default_credentials',
      commands: [
        `gcloud auth application-default login --project ${projectId}`,
        `gcloud auth application-default set-quota-project ${projectId}`,
        `gcloud config set project ${projectId}`,
      ],
      serviceAccountAlternative: 'Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON that has Vertex AI User and Storage Object Admin permissions for the tuning bucket.',
    },
  );
}

function throwGoogleCredentialError(error, context) {
  const normalizedError = createGoogleCredentialError(error, context);
  if (normalizedError) throw normalizedError;
  throw error;
}

module.exports = {
  createGoogleCredentialError,
  isGoogleInvalidGrant,
  throwGoogleCredentialError,
};
