import argparse
import os

import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer


SYSTEM_PROMPT = 'Bạn là chuyên gia copywriting thương mại điện tử tiếng Việt. Viết rõ ràng, tự nhiên, đúng brief và tối ưu chuyển đổi.'


def parse_args():
    parser = argparse.ArgumentParser(description='Run inference with a Llama LoRA adapter.')
    parser.add_argument('--model-id', default='meta-llama/Llama-3.2-3B-Instruct')
    parser.add_argument('--adapter-dir', default='training/llama/outputs/llama-copywriting-lora')
    parser.add_argument('--prompt', required=True)
    parser.add_argument('--max-new-tokens', type=int, default=220)
    parser.add_argument('--temperature', type=float, default=0.7)
    parser.add_argument('--top-p', type=float, default=0.9)
    return parser.parse_args()


def get_token():
    return os.environ.get('HF_TOKEN') or os.environ.get('HUGGINGFACE_HUB_TOKEN') or None


def main():
    args = parse_args()
    token = get_token()
    tokenizer = AutoTokenizer.from_pretrained(args.model_id, token=token, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        args.model_id,
        token=token,
        torch_dtype=torch.float16,
        device_map='auto',
    )
    model = PeftModel.from_pretrained(model, args.adapter_dir)
    model.eval()

    messages = [
        {'role': 'system', 'content': SYSTEM_PROMPT},
        {'role': 'user', 'content': args.prompt},
    ]
    if hasattr(tokenizer, 'apply_chat_template'):
        prompt_text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    else:
        prompt_text = f'{SYSTEM_PROMPT}\nUser: {args.prompt}\nAssistant:'

    inputs = tokenizer(prompt_text, return_tensors='pt').to(model.device)
    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=args.max_new_tokens,
            do_sample=True,
            temperature=args.temperature,
            top_p=args.top_p,
            pad_token_id=tokenizer.eos_token_id,
        )

    generated = output_ids[0][inputs['input_ids'].shape[-1]:]
    print(tokenizer.decode(generated, skip_special_tokens=True).strip())


if __name__ == '__main__':
    main()
