import argparse
import csv
import json
import random
from pathlib import Path


DEFAULT_SYSTEM_PROMPT = 'Bạn là chuyên gia copywriting thương mại điện tử tiếng Việt. Viết rõ ràng, tự nhiên, đúng brief và tối ưu chuyển đổi.'


def normalize(value):
    return str(value or '').strip()


def build_user_message(row):
    brief = normalize(row.get('input'))
    industry = normalize(row.get('industry')) or 'general'
    tone = normalize(row.get('tone')) or 'friendly'
    parts = [
        f'Brief: {brief}',
        f'Ngành: {industry}',
        f'Tone: {tone}',
    ]
    return '\n'.join(parts)


def row_to_example(row, system_prompt):
    output = normalize(row.get('output'))
    if not normalize(row.get('input')) or not output:
        return None

    return {
        'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': build_user_message(row)},
            {'role': 'assistant', 'content': output},
        ],
        'metadata': {
            'industry': normalize(row.get('industry')),
            'tone': normalize(row.get('tone')),
        },
    }


def write_jsonl(path, examples):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('w', encoding='utf-8', newline='\n') as handle:
        for example in examples:
            handle.write(json.dumps(example, ensure_ascii=False) + '\n')


def main():
    parser = argparse.ArgumentParser(description='Convert copywriting CSV to Llama chat JSONL.')
    parser.add_argument('--input', default='fine_tune_dataset_ecommerce_vi.csv')
    parser.add_argument('--output-dir', default='training/llama/data')
    parser.add_argument('--train-ratio', type=float, default=0.85)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--system-prompt', default=DEFAULT_SYSTEM_PROMPT)
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)

    with input_path.open('r', encoding='utf-8-sig', newline='') as handle:
        reader = csv.DictReader(handle)
        examples = [row_to_example(row, args.system_prompt) for row in reader]

    examples = [example for example in examples if example]
    if len(examples) < 2:
        raise SystemExit('Need at least 2 valid examples to create train and validation files.')

    random.Random(args.seed).shuffle(examples)
    split_index = max(1, min(len(examples) - 1, int(len(examples) * args.train_ratio)))
    train_examples = examples[:split_index]
    val_examples = examples[split_index:]

    train_path = output_dir / 'train.jsonl'
    val_path = output_dir / 'val.jsonl'
    write_jsonl(train_path, train_examples)
    write_jsonl(val_path, val_examples)

    print(f'Wrote {len(train_examples)} train examples to {train_path}')
    print(f'Wrote {len(val_examples)} validation examples to {val_path}')


if __name__ == '__main__':
    main()
