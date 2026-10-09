---
title: Fine-Tuning Whisper for Bangla Without Guessing
description: A guarded workflow for fine-tuning Whisper on Bangla speech — fixed test set, baseline first, LoRA training from Parquet, then an evidence-based comparison.
date: 2026-10-20
tags: [Whisper, Speech Recognition, Bangla, LoRA, Python, MLOps]
draft: true
---

Generic Whisper models are good at speech recognition, but Bangla — and the mixed Bangla/English that people actually speak — exposes their limits quickly. Bangla audio can be misdetected as another Indic language, and code-switched speech needs controlled decoding.

Fine-tuning is the obvious next step. The less obvious problem is knowing whether the fine-tuned model is **actually better**. Train without a baseline and you end up in a gray area: the loss went down, a few samples look right, and you still cannot say whether the new model should replace the old one.

This post describes the workflow I built in [Bangla & English ASR Studio](/projects/bangla-and-english-asr-studio/) to remove that guesswork.

## The rule: never train without a baseline

Every training run follows the same guarded sequence:

1. **Back up** the current model, keeping exactly one backup.
2. **Evaluate the current model** on a fixed test set and record its WER and CER.
3. **Train** the new model.
4. **Evaluate the new model** on the *same* test set.
5. **Compare** both and write a report — but leave the replacement decision to a human.

The training UI and the training API run this sequence by default, so it is the easy path rather than something to remember.

## A test set that never changes

Each data split (`train`, `val`, `test`) uses the same simple format: a `metadata.csv` with `audio_path` and the ground-truth `sentence`.

```csv
audio_path,sentence
audio_001.wav,আমি বাংলায় কথা বলতে ভালোবাসি।
audio_002.wav,Automatic speech recognition is ready.
```

The important rule is that `test` stays **fixed and untouched**. `train` is for fitting, `val` is for evaluation during training, and `test` exists only for the final old-vs-new benchmark. If the test set moves, the comparison means nothing.

## Training directly from Parquet

Large Hugging Face ASR datasets such as SUBAK.KO ship as Parquet shards with the audio embedded, not as folders of `.wav` files. Extracting everything to WAV doubles the disk usage before training even starts.

The pipeline reads Parquet directly for both evaluation and training. With `--streaming_parquet` the dataset is streamed instead of copied, and because a stream has no fixed length, training is bounded with `--max_steps`. A `--dry_run_data` check loads a single shard first, so a data problem shows up in seconds instead of after an expensive GPU job has started.

## LoRA instead of full fine-tuning

Instead of updating every Whisper weight, training uses LoRA adapters on the attention projections (`q_proj`, `v_proj`). The defaults are rank 32, alpha 64 and dropout 0.05, with WER as the metric for picking the best checkpoint.

LoRA keeps memory requirements and checkpoint sizes small, makes experiments faster, and leaves the original base model untouched and reusable.

## Comparing old and new — with evidence

After training, the same evaluation runs on the new model, and a comparison step writes:

- a side-by-side WER/CER report;
- per-sample predictions from both models;
- confusion data — the most common token substitutions, deletions and insertions for each model;
- structured training logs with loss, WER, CER and learning rate per step.

The comparison ends in one of three verdicts:

| Verdict | Meaning |
| --- | --- |
| `new_better` | The new model improved WER/CER overall. |
| `old_better` | The new model regressed; keep the old one. |
| `gray_area_mixed_metrics` | One metric improved and the other regressed — needs human review. |

The tool **never replaces the model automatically**. Metrics are advisory: one metric can improve while the other regresses, or the sample predictions can reveal domain-specific errors that a single number hides.

## Results

> **DRAFT — Mahbub to fill in before publishing:** the base model and test set used, baseline WER/CER, fine-tuned WER/CER, training steps and hardware, and two or three example transcriptions (before vs after). No numbers are published until they come from real runs.

## What I would do the same way again

- **Fix the test set first.** Everything else depends on it.
- **Make the safe path the default.** Backup and baseline run automatically, not from a checklist.
- **Keep a human in the loop** for replacing a model. Mixed metrics are common, and a person who reads the sample predictions makes a better call than a threshold.

The full project — FastAPI backend, React operator UI, CLI scripts and Docker setup — is described on the [project page](/projects/bangla-and-english-asr-studio/).
