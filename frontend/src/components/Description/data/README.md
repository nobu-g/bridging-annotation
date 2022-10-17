# How To Create `example.json`

1. Generate Questions
```shell
echo こんにちは | jumanpp | knp -dpnd -tab > example.knp
python scripts/gen_question.py -i example.knp -o out
```

2. Choose one question and rename it to `example.json`

## Original Texts
- example9
```text
この機会にぜひご参加頂き、ご招待チケットをゲットしてご家族やお友達をお誘いいただき選手の後押しをお願いいたします!
```
