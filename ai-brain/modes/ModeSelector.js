class ModeSelector {
  constructor() {}

  selectMode(discoveryReport, requestedMode = null) {
    if (requestedMode) {
      const validModes = new Set(['BUILD', 'MAINTAIN', 'EXTEND', 'AUDIT_REPAIR', 'MONITOR']);
      const normalized = requestedMode.toUpperCase().replace(/\s+/g, '_');
      if (validModes.has(normalized)) return normalized;
    }

    // Automatic classification based on discovery report
    if (discoveryReport.projectClassification === 'NEW_EMPTY_PROJECT') {
      return 'BUILD';
    }

    if (discoveryReport.projectClassification === 'EXISTING_FUNCTIONING_PROJECT') {
      return 'MAINTAIN';
    }

    if (discoveryReport.projectClassification === 'EXISTING_PARTIALLY_COMPLETED_PROJECT') {
      return 'AUDIT_REPAIR';
    }

    return 'MAINTAIN';
  }

  getModeLifecycle(mode) {
    const lifecycles = {
      BUILD: [
        'REQUIREMENTS_DISCOVERY',
        'ARCHITECTURE_DESIGN',
        'DATA_MODEL_DESIGN',
        'UI_SCAFFOLDING',
        'BACKEND_API_IMPLEMENTATION',
        'TESTING_AND_VERIFICATION',
        'DEPLOYMENT_PREPARATION'
      ],
      MAINTAIN: [
        'ENVIRONMENT_DISCOVERY',
        'BASELINE_VERIFICATION',
        'DEFECT_DIAGNOSIS',
        'CHECKPOINT_CREATION',
        'CONTROLLED_PATCHING',
        'REGRESSION_VERIFICATION'
      ],
      EXTEND: [
        'CONVENTION_MAPPING',
        'ACCEPTANCE_CRITERIA_DEFINITION',
        'FEATURE_IMPLEMENTATION',
        'REGRESSION_VERIFICATION'
      ],
      AUDIT_REPAIR: [
        'FULL_REPOSITORY_SCAN',
        'DEFECT_PRIORITIZATION',
        'SAFE_CORRECTION_APPLICATION',
        'INDEPENDENT_VERIFICATION',
        'REPORT_GENERATION'
      ],
      MONITOR: [
        'HEALTH_CHECK',
        'STALE_WORKER_RECLAMATION',
        'REGRESSION_DETECTION',
        'STATUS_REPORT'
      ]
    };

    return lifecycles[mode] || lifecycles.MAINTAIN;
  }
}

module.exports = ModeSelector;
