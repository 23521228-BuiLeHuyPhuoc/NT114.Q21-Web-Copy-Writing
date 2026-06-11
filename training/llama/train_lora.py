import argparse
import os

import torch
from datasets import load_dataset
from peft import LoraConfig
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from trl import SFTConfig, SFTTrainer


def parse_args():
    parser = argparse.ArgumentParser(description='Fine-tune Llama with SFT and LoRA or QLoRA.')
    parser.add_argument('--model-id', default='meta-llama/Llama-3.2-3B-Instruct')
    parser.add_argument('--train-file', default='training/llama/data/train.jsonl')
    parser.add_argument('--eval-file', default='training/llama/data/val.jsonl')
    parser.add_argument('--output-dir', default='training/llama/outputs/llama-copywriting-lora')
    parser.add_argument('--max-length', type=int, default=2048)
    parser.add_argument('--epochs', type=float, default=2)
    parser.add_argument('--batch-size', type=int, default=1)
    parser.add_argument('--grad-accum', type=int, default=8)
    parser.add_argument('--learning-rate', type=float, default=2e-4)
    parser.add_argument('--logging-steps', type=int, default=10)
    parser.add_argument('--lora-r', type=int, default=32)
    parser.add_argument('--lora-alpha', type=int, default=16)
    parser.add_argument('--lora-dropout', type=float, default=0.05)
    parser.add_argument('--load-in-4bit', action='store_true')
    parser.add_argument('--fp16', action='store_true')
    parser.add_argument('--bf16', action='store_true')
    parser.add_argument('--push-to-hub', action='store_true')
    parser.add_argument('--hub-model-id', default=None)
    return parser.parse_args()


def get_token():
    return os.environ.get('HF_TOKEN') or os.environ.get('HUGGINGFACE_HUB_TOKEN') or None


def load_json_dataset(train_file, eval_file):
    data_files = {'train': train_file}
    if eval_file and os.path.exists(eval_file):
        data_files['validation'] = eval_file
    return load_dataset('json', data_files=data_files)


def example_to_text(example, tokenizer):
    if example.get('text'):
        return {'text': example['text']}
    messages = example.get('messages') or []
    if hasattr(tokenizer, 'apply_chat_template'):
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
    else:
        lines = []
        for item in messages:
            role = item.get('role', 'user')
            content = item.get('content', '')
            lines.append(f'{role}: {content}')
        text = '\n'.join(lines)
    return {'text': text}


def prepare_split(split_dataset, tokenizer):
    return split_dataset.map(
        lambda example: example_to_text(example, tokenizer),
        remove_columns=split_dataset.column_names,
    )


def main():
    args = parse_args()
    token = get_token()
    compute_dtype = torch.bfloat16 if args.bf16 else torch.float16
    quantization_config = None

    if args.load_in_4bit:
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type='nf4',
            bnb_4bit_compute_dtype=compute_dtype,
            bnb_4bit_use_double_quant=True,
        )

    tokenizer = AutoTokenizer.from_pretrained(args.model_id, token=token, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        args.model_id,
        token=token,
        quantization_config=quantization_config,
        torch_dtype=compute_dtype if not args.load_in_4bit else None,
        device_map='auto',
    )
    model.config.use_cache = False

    dataset = load_json_dataset(args.train_file, args.eval_file)
    train_dataset = prepare_split(dataset['train'], tokenizer)
    eval_dataset = prepare_split(dataset['validation'], tokenizer) if 'validation' in dataset else None

    if len(train_dataset) < 50:
        print(f'Warning: only {len(train_dataset)} train examples. This is OK for a pipeline test, not for a strong model.')

    peft_config = LoraConfig(
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        lora_dropout=args.lora_dropout,
        bias='none',
        task_type='CAUSAL_LM',
        target_modules=['q_proj', 'k_proj', 'v_proj', 'o_proj'],
    )

    sft_args = SFTConfig(
        output_dir=args.output_dir,
        dataset_text_field='text',
        max_length=args.max_length,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        learning_rate=args.learning_rate,
        num_train_epochs=args.epochs,
        logging_steps=args.logging_steps,
        save_strategy='epoch',
        eval_strategy='epoch' if eval_dataset is not None else 'no',
        fp16=args.fp16,
        bf16=args.bf16,
        report_to='none',
        push_to_hub=args.push_to_hub,
        hub_model_id=args.hub_model_id,
    )

    trainer_kwargs = {
        'model': model,
        'args': sft_args,
        'train_dataset': train_dataset,
        'eval_dataset': eval_dataset,
        'peft_config': peft_config,
    }

    try:
        trainer = SFTTrainer(processing_class=tokenizer, **trainer_kwargs)
    except TypeError:
        trainer = SFTTrainer(tokenizer=tokenizer, **trainer_kwargs)

    trainer.train()
    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)

    if args.push_to_hub:
        trainer.push_to_hub()

    print(f'Saved LoRA adapter to {args.output_dir}')


if __name__ == '__main__':
    main()
