#!/usr/bin/env python
"""Submit a Vertex AI managed open-model SFT job.

This helper is intentionally small because the Node backend owns dataset
creation, GCS upload, and job bookkeeping. The Python SDK currently exposes the
open-model SFT launcher before the Node SDK does.
"""

import argparse
import inspect
import json
import sys
from pathlib import Path


def load_config(path: str) -> dict:
    with Path(path).open("r", encoding="utf-8-sig") as handle:
        return json.load(handle)


def import_vertex_tuning():
    try:
        import vertexai
        from vertexai.tuning import SourceModel
        from vertexai.tuning import sft
    except Exception as exc:  # pragma: no cover - depends on local SDK install
        raise RuntimeError(
            "Missing Vertex AI Python SDK. Install with: "
            "python -m pip install -r training/vertex_open_model_tuning/requirements.txt"
        ) from exc

    return vertexai, sft, SourceModel


def make_source_model(source_model_class, base_model: str, tuning_mode: str):
    if source_model_class is None:
        return base_model

    attempts = [
        {"base_model": base_model, "tuning_mode": tuning_mode},
        {"model_name": base_model, "tuning_mode": tuning_mode},
        {"base_model": base_model},
        {"model_name": base_model},
    ]
    last_error = None
    for kwargs in attempts:
        try:
            return source_model_class(**kwargs)
        except TypeError as exc:
            last_error = exc
    raise RuntimeError(f"Could not construct SourceModel for {base_model}: {last_error}")


def add_kwarg(kwargs: dict, params: dict, names, value):
    if value in (None, ""):
        return False
    for name in names:
        if name in params:
            kwargs[name] = value
            return True
    return False


def call_sft_train(sft, source_model, config: dict):
    signature = inspect.signature(sft.train)
    params = signature.parameters
    kwargs = {}

    add_kwarg(kwargs, params, ["source_model"], source_model)
    add_kwarg(kwargs, params, ["train_dataset", "training_dataset", "train_dataset_uri"], config["train_dataset_uri"])
    add_kwarg(kwargs, params, ["validation_dataset", "validation_dataset_uri"], config.get("validation_dataset_uri"))
    add_kwarg(kwargs, params, ["tuned_model_display_name", "display_name", "model_display_name"], config.get("display_name"))
    add_kwarg(kwargs, params, ["tuning_mode"], config.get("tuning_mode"))
    add_kwarg(kwargs, params, ["epochs", "epoch_count"], int(config.get("epochs") or 3))
    add_kwarg(kwargs, params, ["output_gcs_uri", "output_uri", "output_dir"], config.get("output_gcs_uri"))
    add_kwarg(kwargs, params, ["target_endpoint", "tuned_model_endpoint", "endpoint"], config.get("target_endpoint"))
    adapter_size = config.get("adapter_size")
    if isinstance(adapter_size, str) and adapter_size.isdigit():
        adapter_size = int(adapter_size)
    add_kwarg(kwargs, params, ["adapter_size"], adapter_size)
    add_kwarg(kwargs, params, ["labels"], config.get("labels"))

    missing_required = [
        name for name, param in params.items()
        if param.default is inspect._empty
        and param.kind in (param.POSITIONAL_OR_KEYWORD, param.KEYWORD_ONLY)
        and name not in kwargs
    ]
    if missing_required:
        raise RuntimeError(f"Unsupported sft.train signature, missing required args: {', '.join(missing_required)}")

    return sft.train(**kwargs)


def get_attr(obj, names):
    for name in names:
        value = getattr(obj, name, None)
        if value:
            return value
    return ""


def job_to_payload(job, config: dict) -> dict:
    gca = getattr(job, "_gca_resource", None)
    payload = {
        "provider_job_id": get_attr(job, ["resource_name", "name", "job_name"]),
        "resource_name": get_attr(job, ["resource_name", "name", "job_name"]),
        "state": get_attr(job, ["state", "status", "job_state"]) or "JOB_STATE_PENDING",
        "tuned_model_name": get_attr(job, ["tuned_model_name", "tuned_model", "model_name"]),
        "tuned_model_endpoint": get_attr(job, ["tuned_model_endpoint", "endpoint_name", "endpoint"]),
        "output_gcs_uri": config.get("output_gcs_uri", ""),
    }

    if gca is not None:
        payload["provider_job_id"] = payload["provider_job_id"] or get_attr(gca, ["name"])
        payload["resource_name"] = payload["resource_name"] or get_attr(gca, ["name"])
        payload["state"] = str(get_attr(gca, ["state"]) or payload["state"])

    return payload


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True)
    args = parser.parse_args()

    try:
        config = load_config(args.config)
        vertexai, sft, SourceModel = import_vertex_tuning()

        if config.get("preflight"):
            print(json.dumps({"ok": True, "sft_train_signature": str(inspect.signature(sft.train))}, ensure_ascii=False))
            return 0

        vertexai.init(
            project=config["project"],
            location=config["location"],
            staging_bucket=config.get("staging_bucket") or None,
        )
        source_model = make_source_model(
            SourceModel,
            config["base_model"],
            config.get("tuning_mode") or "PEFT_ADAPTER",
        )
        job = call_sft_train(sft, source_model, config)
        print(json.dumps(job_to_payload(job, config), ensure_ascii=False))
        return 0
    except Exception as exc:  # pragma: no cover - surfaced to Node caller
        print(json.dumps({"error": str(exc)}, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    sys.exit(main())
