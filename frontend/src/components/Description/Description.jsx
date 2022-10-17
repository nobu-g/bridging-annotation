import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import {SPECIALS} from '../Question/QuestionCard';

import style from './description.module.scss';
import example1 from './data/example1.json';
import example6 from './data/example6.json';
import example7 from './data/example7.json';
import example9 from './data/example9.json';
import example10 from './data/example10.json';

const NoAnswer = ({state = 0}) => (
  <span className={style[['na-inactive', 'na-active'][state]] + ' px-0'}><b>【該当なし】</b></span>
);

const Exophor = ({text, state = 0}) => (
  <span className={style[['inactive', 'active', 'active2'][state]] + ' px-0'}>{text}</span>
);
const Reader = () => <Exophor text={'【読み手】'}/>;
const Writer = () => <Exophor text={'【書き手】'}/>;
const UnspecifiedPerson = () => <Exophor text={'【その他（人）】'}/>;
const UnspecifiedObject = () => <Exophor text={'【その他（物）】'}/>;

const Example = ({
                   phrases,
                   specials = [],
                   candidate = [],
                   selected = [],
                   selected2 = [],
                   target = -1,
                 }) => {
  return (
    <div className={style.ex}>
      {
        specials.map((phrase, idx) => {
          idx += phrases.length;
          let state = 0;
          if (selected2.includes(idx)) {
            state = 2;
          } else if (selected.includes(idx)) {
            state = 1;
          }
          return <Exophor text={phrase} state={state} key={idx}/>;
        })
      }
      {specials.length > 0 && <br/>}
      {
        phrases.map((phrase, idx) => {
          let className = '';
          if (idx === target) {
            className = style.b;
          } else if (selected2.includes(idx)) {
            className = style.active2;
          } else if (selected.includes(idx)) {
            className = style.active;
          } else if (candidate.includes(idx)) {
            className = style.inactive;
          }
          return (
            <React.Fragment key={idx}>
              <span className={className}>{phrase}</span>
            </React.Fragment>
          );
        })
      }
    </div>
  );
};

const Example2 = ({question, answer, answer2}) => {
  const {phrases, target} = question;
  let phrase_to_merge = null;
  return (
    <div className={style.ex}>
      <NoAnswer state={answer2 === -1 ? 1 : 0}/>
      {
        SPECIALS.map((phrase, idx) => {
          idx += phrases.length;
          let state = 0;
          if (idx === answer2) {
            state = 2;
          } else if (answer.includes(idx)) {
            state = 1;
          }
          return <Exophor text={phrase} state={state} key={idx}/>;
        })
      }
      <br/>
      {
        phrases.map((phrase, idx) => {
          if (phrase_to_merge !== null) {
            phrase = {
              ...phrase,
              text: phrase_to_merge['text'] + phrase['text'],
              before: phrase_to_merge['before'],
              core: phrase_to_merge['core'] + phrase_to_merge['after'] + phrase['before'] + phrase['core'],
              after: phrase['after']
            };
            phrase_to_merge = null;
          }
          if (phrase['mergeNext'] === true) {
            phrase_to_merge = phrase;
            return;
          }
          if (!phrase['is_cand'] && phrase['dtid'] !== target['dtid']) {
            return <span key={idx} className={style.vanilla}>{phrase.text}</span>;
          }

          let className;
          if (phrase['dtid'] === target['dtid']) {
            className = style.b;
          } else if (phrase['dtid'] === answer2) {
            className = style.active2;
          } else if (answer.includes(phrase['dtid'])) {
            className = style.active;
          } else {
            className = style.inactive;
          }
          return (
            <React.Fragment key={idx}>
              {phrase.before && <span className={style.vanilla}>{phrase.before}</span>}
              <span className={className}>{phrase.core}</span>
              {phrase.after && <span className={style.vanilla}>{phrase.after}</span>}
            </React.Fragment>
          );
        })
      }
    </div>
  );
};

const ExampleRow = ({exBefore, exAfter}) => (
  <Row className="my-4 justify-content-center">
    <Col className="d-flex align-items-center justify-content-center justify-content-md-end">
      {exBefore}
    </Col>
    <Col className="d-flex align-items-center justify-content-center" md="auto">
      <div className={'mx-auto ' + style.arrow}>
        &#8658;
      </div>
    </Col>
    <Col className="d-flex align-items-center justify-content-center justify-content-md-start">
      {exAfter}
    </Col>
  </Row>
);

const ExampleRow2 = ({exBefore, exAfter}) => (
  <Row className="mt-0 mb-2 justify-content-center">
    <Col className="d-flex align-items-center justify-content-center justify-content-md-end col-3">
      {exBefore}
    </Col>
    <Col className="d-flex align-items-center justify-content-center col-1" md="auto">
      <div className={'mx-auto ' + style.arrow2}>
        &#8658;
      </div>
    </Col>
    <Col className="d-flex align-items-center justify-content-center justify-content-md-start col-8">
      {exAfter}
    </Col>
  </Row>
);

const ExampleRow3 = ({exBefore, exAfter}) => (
  <Row className="my-4 justify-content-center">
    <Col className="d-flex align-items-center justify-content-center justify-content-md-start">
      {exBefore}
    </Col>
    <Col className="d-flex align-items-center justify-content-center col-1" md="auto">
      <div className={'mx-auto ' + style.arrow}>
        &#8658;
      </div>
    </Col>
    <Col className="d-flex align-items-center justify-content-center justify-content-md-start">
      {exAfter}
    </Col>
  </Row>
);

const Abstract = () => (
  <>
    <span>
      下線を引いた赤字の単語<span className={style['b-inline']}>△△</span>について、
      文章中の枠線で囲まれた単語<span className={style['inactive-inline']}>〇〇</span>の中から
      <b>「〇〇の△△」</b>という関係が成り立つ単語を<b>全て</b>選んでください。<br/>
      例えば次の文では、「太郎の先生」「英語の先生」という関係が成り立つので、「太郎」「英語」を選択します。
    </span>
    <ExampleRow
      exBefore={
        <Example
          phrases={'昨日 、 太郎 は 英語 の 先生 に 質問した 。'.split(' ')}
          candidate={[0, 2, 4, 6]}
          selected={[]}
          target={6}
        />
      }
      exAfter={
        <Example
          phrases={'昨日 、 太郎 は 英語 の 先生 に 質問した 。'.split(' ')}
          candidate={[0, 2, 4, 6]}
          selected={[2, 4]}
          target={6}
        />
      }
    />
    <span>
      ここで、単語<span className={style['inactive-inline']}>〇〇</span>は単語<span className={style['b-inline']}>△△</span>から簡単に連想できる単語としてください。
      具体的には、まず単語<span className={style['b-inline']}>△△</span>から<b>「〇〇の△△」と連想できる</b>単語を考えてください。
    </span>
    <ExampleRow2
      exBefore={<Example phrases={['先生']} target={0}/>}
      exAfter={<Example phrases={['教科(数学、英語...)　生徒(〇〇君、□□さん...)　場所(小学校、教習所...)']}/>}
    />
    <span>
      そして、選択肢の中に連想した単語（もしくは同じような単語）があればそれを選択します。
      さらに、単語<span className={style['b-inline']}>△△</span>にとって<b>最も重要、あるいは必須</b>と考えられる単語も同時に選んでください。<br/>
      上記の例では、<b>何の教科の先生なのか</b>が重要かつ必須的な情報なので、「英語」をもう1度クリックして選択します。
      選ぶのが難しい場合は、一番最初に連想した単語を選んでも構いません。
    </span>
    <ExampleRow
      exBefore={
        <Example
          phrases={'昨日 、 太郎 は 英語 の 先生 に 質問した 。'.split(' ')}
          candidate={[0, 2, 4, 6]}
          selected={[]}
          selected2={[]}
          target={6}
        />
      }
      exAfter={
        <Example
          phrases={'昨日 、 太郎 は 英語 の 先生 に 質問した 。'.split(' ')}
          candidate={[0, 2, 4, 6]}
          selected={[2, 4]}
          selected2={[4]}
          target={6}
        />
      }
    />
    <span>
      単語<span className={style['b-inline']}>△△</span>からの連想の他の例を示します。
    </span>
    <ExampleRow2
      exBefore={<Example phrases={['屋根']} target={0}/>}
      exAfter={<Example phrases={['建物(民家、ガレージ...)']} target={-1}/>}
    />
    <ExampleRow2
      exBefore={<Example phrases={['社員']} target={0}/>}
      exAfter={<Example phrases={['会社(〇〇グループ、株式会社□□...)']} target={-1}/>}
    />
    <ExampleRow2
      exBefore={<Example phrases={['記録']} target={0}/>}
      exAfter={<Example phrases={['種目(マラソン、水泳...)　出来事(戦争、災害...)　保持者(高橋尚子、北島康介...)']}/>}
    />
    <span>
      問題は練習問題3問を含む全13問です。
      全ての問題に回答し、「送信」ボタンを押すとタスク終了です。
    </span>
  </>
);

const Caveats = () => (
  <>
    <ul className="mt-3">
      <li>
        「〇〇の△△」が<b>意味的に正しくなる</b>ような単語のみを選んでください。<br/>
        次の例では、下線部の「先生」は「太郎」が教わっている先生ではないため、「太郎の先生」は意味的に正しくありません。
        したがって、この文では「太郎」は選択しません。
        <ExampleRow
          exBefore={
            <Example
              phrases={'太郎 は 英語 の 先生 に なる の が 夢だ 。'.split(' ')}
              candidate={[0, 2, 4]}
              selected2={[]}
              target={4}
            />
          }
          exAfter={
            <Example
              phrases={'太郎 は 英語 の 先生 に なる の が 夢だ 。'.split(' ')}
              candidate={[0, 2, 4]}
              selected2={[2]}
              target={4}
            />
          }
        />
      </li>
      <li>
        連想した単語が<b>原文に存在しない</b>問題も多くあります。<br/>
        その単語が「私」など、原文の書き手であれば<Writer/>を、 反対に「あなた」など、原文の読み手であれば<Reader/>を選んでください。
        どちらにも当てはまらない場合は、連想した単語が人か物かによって<UnspecifiedPerson/>または<UnspecifiedObject/>を選んでください。<br/>
        <ExampleRow3
          exBefore={
            <Example
              phrases={'今日 は 先日 生まれた 息子 を 紹介 したい と 思い ます 。'.split(' ')}
              specials={['【書き手】']}
              candidate={[0, 2, 12]}
              selected2={[]}
              target={4}
            />
          }
          exAfter={
            <Example
              phrases={'今日 は 先日 生まれた 息子 を 紹介 したい と 思い ます 。'.split(' ')}
              specials={['【書き手】']}
              candidate={[0, 2, 12]}
              selected2={[12]}
              target={4}
            />
          }
        />
        <ExampleRow3
          exBefore={
            <Example
              phrases={'階段 を 登って 街並み を 屋根 から 見渡した 。'.split(' ')}
              specials={['【その他（物）】']}
              candidate={[0, 3, 9]}
              selected2={[]}
              target={5}
            />
          }
          exAfter={
            <Example
              phrases={'階段 を 登って 街並み を 屋根 から 見渡した 。'.split(' ')}
              specials={['【その他（物）】']}
              candidate={[0, 3, 9]}
              selected2={[9]}
              target={5}
            />
          }
        />
      </li>
      <li>
        以下のように単語<span className={style['inactive-inline']}>〇〇</span>が<b>連想しにくい</b>名詞も多くあります。
        この場合は<NoAnswer/>を選んでください。<br/>
        その他、選択が難しい場合も<NoAnswer/>を選んでください。
        <ExampleRow2
          exBefore={<Example phrases={['ピアニスト']} target={0}/>}
          exAfter={<Example phrases={['？']} target={-1}/>}
        />
        <ExampleRow2
          exBefore={<Example phrases={['政治家']} target={0}/>}
          exAfter={<Example phrases={['？']} target={-1}/>}
        />
        <ExampleRow2
          exBefore={<Example phrases={['東京タワー']} target={0}/>}
          exAfter={<Example phrases={['？']} target={-1}/>}
        />
        <ExampleRow2
          exBefore={<Example phrases={['太郎']} target={0}/>}
          exAfter={<Example phrases={['？']} target={-1}/>}
        />
      </li>
      <li>
        問題文はウェブサイトの文章を切り取ったものです。
        文脈が不足している場合は、適宜話題を推測しつつお答えください。
      </li>
    </ul>
  </>
);

const SampleAnswers = () => (
  <ul>
    <li className="mt-3 mb-4"><Example2 question={example1} answer={[1]} answer2={1}/></li>
    {/*<li className="my-4"><Example2 question={example3} answer={[0, 5]} answer2={5}/></li>*/}
    <li className="mt-3 mb-4"><Example2 question={example7} answer={[1, 16, 17]} answer2={16}/></li>
    {/*<li className="my-4"><Example2 question={example8} answer={[4, 5]} answer2={5}/></li>*/}
    {/*<li className="my-4"><Example2 question={example5} answer={[2, 9]} answer2={2}/></li>*/}
    <li className="mt-3 mb-4"><Example2 question={example9} answer={[16]} answer2={16}/></li>
    <li className="mt-3 mb-4"><Example2 question={example6} answer={[19]} answer2={19}/></li>
    <li className="mt-3 mb-4"><Example2 question={example10} answer={[-1]} answer2={-1}/></li>
  </ul>
);

const Description = ({opened}) => {
  return (
    <Container fluid="lg">
      <details open={opened && 'open'}>
        <summary>概要</summary>
        <Abstract/>
      </details>
      <details open={opened && 'open'}>
        <summary>注意点</summary>
        <Caveats/>
      </details>
      <details open={opened && 'open'}>
        <summary>回答例</summary>
        <SampleAnswers/>
      </details>
    </Container>
  );
};

export default React.memo(Description);
