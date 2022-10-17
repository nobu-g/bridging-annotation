# generate a TSV string which follows the format of Yahoo! crowd sourcing
# usage:
# $ python gen_tsv.py --job-file data/jobs/job-test.json > 3588848481.tsv

import argparse
from pathlib import Path
import json


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--job-file', '-j', required=True, type=str,
                        help='job file')
    args = parser.parse_args()

    columns = ['設問ID(半角英数字20文字以内)', 'チェック設問有無(0:無 1:有)', 'チェック設問の解答(F07用)', 'F01:ラベル',
               'F02:ラベル', 'F03:ラベル', 'F04:ラベル', 'F05:リンクボタン（ＵＲＬ）', 'F06:ラベル', 'F07:テキストエリア']
    print('\t'.join(columns))

    job = json.loads(Path(args.job_file).read_text())

    for i in range(job['numTasks']):
        row = [f'{i + 1}', '0', '', 'タスク回答ページに移動し、回答を入力してください', '', '', 'タスク回答ページ',
               f'https://tulip.kuee.kyoto-u.ac.jp/bridging-crowd/public/tutorial/{job["jobName"]}/{i}',
               '回答送信後に表示されたタスクIDをコピー＆ペーストで入力してください##（タスクID入力後は回答ページを閉じて頂いて構いません）', '']
        print('\t'.join(row))


if __name__ == '__main__':
    main()
