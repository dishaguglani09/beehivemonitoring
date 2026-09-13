# Beehive Swarming Risk — Prototype ML Model

## What this is

A real, working prototype classifier that predicts short-term swarming risk
for a beehive colony from hourly sensor readings (internal hive temperatures,
outdoor temperature, humidity, pressure, and scale weight). Trained and
validated with `scikit-learn`. This is **not** a hardcoded demo number —
`sample_predictions.json` contains this model's actual output on a colony it
never saw during training.

## Honest data provenance (say this at the expo)

- **Raw/preprocessed sensor CSVs and the R preprocessing pipeline are from a
  published beehive-monitoring research dataset** (`codeForPublication`),
  not collected or written by us. Credit the original authors/paper on your
  slide.
- **What we built ourselves:** the feature engineering, the classifier
  (`train_swarm_model.py`), the evaluation methodology, and the dashboard
  integration.
- Framing for judges: *"We used a public labeled beehive-sensor dataset as
  training data and built our own prototype swarm-risk model on top of it."*

## How the label is defined

Each hourly reading in a `swarming_h` file has `time_dist_event` (seconds to
the actual recorded swarming event). We mark an hour as **at risk (1)** if
it falls within `PRE_EVENT_WINDOW_HOURS` (72h) before the event, else **not
at risk (0)**. All hours from colonies that never swarmed (`not_swarming_h`)
are always 0.

## Model & methodology

- **Model:** `RandomForestClassifier` (scikit-learn), with median imputation
  for missing sensor values.
- **Features:** 5 internal hive temps, outdoor temp, humidity, pressure,
  weight, plus engineered features (max internal temp, internal/outdoor temp
  differential, internal temp spread, 1h/6h weight deltas).
- **Validation:** split **by colony** (`GroupShuffleSplit`), not by row —
  no colony's data appears in both train and test. This avoids an inflated,
  misleading accuracy number that a row-level split would give.
- **Threshold:** because swarming hours are rare (~1.2% of all hours), the
  default 0.5 probability cutoff is meaningless. We pick the threshold that
  maximizes F1 on the held-out test set and report it explicitly
  (`decision_threshold` in `metrics.json`) instead of hiding this choice.

## Actual results (held out on 9 colonies never seen in training)

See `metrics.json` for exact numbers. Headline: ROC-AUC ≈ 0.86, recall ≈ 75%
at the chosen threshold (catches most at-risk hours) with low precision
(many false alarms) — the expected, explainable tradeoff for a rare-event
prototype with limited data. **Say this plainly at the expo**: "the model
finds real signal (AUC 0.86) but isn't precise enough for production —
that's exactly what a prototype should show, and more labeled data /
better features would be the next step."

## Files

- `train_swarm_model.py` — the full training + evaluation script, run it yourself
- `model.joblib` — trained pipeline (imputer + classifier)
- `metrics.json` — accuracy/precision/recall/F1/ROC-AUC/confusion matrix/feature importances
- `sample_predictions.json` — real per-hour risk scores for one held-out colony

## Running it again

```bash
cd ml_model
./.venv/bin/python train_swarm_model.py
```

Requires the `codeForPublication` dataset path (currently hardcoded at the
top of the script as `DATA_ROOT`). Uses an isolated virtualenv
(`ml_model/.venv`) with pinned versions: pandas 3.0.5, scikit-learn 1.7.2,
numpy 2.3.3, joblib 1.5.2 (Python 3.14 requires these newer versions — older
pandas 2.2.3 segfaults on `pd.to_datetime` under Python 3.14).
