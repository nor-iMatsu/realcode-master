import React, { Component } from "react";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import './Home.css';

require("colors");

// const BASE_URL = 'https://api.realcode.link'; // Remote server on EC2
const BASE_URL = 'http://localhost:8080'; // Local server

class Home extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  /**
   * Constructor of this class
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isError: false,
      hasFinished: false,
      exerciseIndexListCurrentIndex: 0,
      exerciseIndexList: [],
      currentExercise: null,
      dataFetchingTime: "",
      participantId: "",
      selectedValidity: "",  // Q1
      selectedReasonNoValid: [], // Q1
      descriptionForNoValid: "", // Q1 reason
      lineNumbers: {},
      selectedDifficulty: "", // Q2
      selectedTypes: [], // Q3
      descriptionForException: "", //Q3
      descriptionForOtherSyntax: "", //Q3
      descriptionForLogging: "", //Q3
      descriptionForLibrary: "", //Q3
      descriptionForData: "", //Q3
      descriptionForAlgorithms: "", //Q3
      descriptionForOtherType: "", //Q3
      comments: "", //Q4
      validity: [
        { value: "", display: "(選択してください)" },
        { value: "1", display: "全くそう思わない" },
        { value: "2", display: "そう思わない" },
        { value: "3", display: "どちらでもない" },
        { value: "4", display: "そう思う" },
        { value: "5", display: "とてもそう思う" }
      ],
      typesReasonNoValid: [
        { value: "fraction", display: "コード差分が断片的すぎて理解できない" },
        { value: "distinctName", display: "リポジトリ特有のライブラリ/変数などを使用しているため、コード差分が理解できない" },
        { value: "refactoring", display: "リファクタリングに関する知識である" }
      ],
      difficulties: [
        { value: "", display: "(選択してください)" },
        { value: "1", display: "とても簡単" },
        { value: "2", display: "簡単" },
        { value: "3", display: "どちらでもない" },
        { value: "4", display: "難しい" },
        { value: "5", display: "とても難しい" }
      ],
      typesWeb: [
        { value: "frontend", display: "フロントエンドの知識" },
        { value: "backend", display: "バックエンド/サーバーサイドの知識" }
      ],
      typesSoftware: [
        { value: "application", display: "アプリケーション開発の知識" },
        { value: "system", display: "システム開発の知識（例：OSやデバイスドライバーなど）" }
      ],
      typesException: [
        { value: "syntaxException", display: "例外処理に関する知識" }
      ],
      typesOtherSyntax: [
        { value: "syntaxOther", display: "例外処理以外の文法に関する知識" }
      ],
      typesBug: [
        { value: "realBug", display: "自分が経験したことのあるバグに関する知識" }
      ],
      typesAlgorithms: [
        { value: "algorithm", display: "アルゴリズムに関する知識" }
      ],
      typesData: [
        { value: "data", display: "データの取得・操作、データベースに関する知識" }
      ],
      typesLogging: [
        { value: "logging", display: "ログ出力に関する知識" }
      ],
      typesLibrary: [
        { value: "library", display: "外部のライブラリ、フレームワーク、APIの使用方法に関する知識" }
      ]
    };
  }

  /**
   * ComponentDidMount
   */
  componentDidMount() {
    // const { cookies } = this.props;
    if (!this.state.currentExercise) {
      this.initialize();
    }
  }

  /**
   * fetch an exercise
   */

  async initialize() {
    this.setState({
      isLoading: true
    });

    const search = this.props.location.search
    const params = new URLSearchParams(search);
    this.state.participantId = params.get('id');
    // console.log(this.state.participantId);

    try {
      // 問題数をロード
      const participantId = this.state.participantId;

      await this.fetchNumberOfExercise(participantId);

      // 回答する問題番号を決定
      const numberOfExercise = this.state.numberOfExercise;
      let exerciseIndexList = [];
      for (let i = 0; i < numberOfExercise; i++) {
        const quizIndex = i;
        // const quizIndex = Math.floor(Math.random() * (numberOfExercise));
        exerciseIndexList.push(quizIndex);
      }

      this.setState({
        exerciseIndexList: exerciseIndexList
      })


      // 回答が終わってるかの判定
      if (this.state.exerciseIndexListCurrentIndex >= numberOfExercise) {
        this.setState({
          hasFinished: true
        });
      } else {
        // 最初の問題をロード
        // const firstIndex = exerciseIndexList[0];
        const firstIndex = exerciseIndexList[this.state.exerciseIndexListCurrentIndex];
        await this.fetchExercise(participantId, firstIndex);
        // 終わり
        this.setState({
          isLoading: false
        });

        // console.log("First state: %d/%d", this.state.exerciseIndexListCurrentIndex + 1, numberOfExercise);
        // console.log("Quiz index: %d", firstIndex);
      }

    } catch (err) {
      console.error(err);
      this.setState({
        isLoading: false,
        isError: true
      });
    }
  }

  async goToNext() {
    const exerciseIndexList = this.state.exerciseIndexList;
    const exerciseIndexListCurrentIndex = this.state.exerciseIndexListCurrentIndex;
    const quizIndex = exerciseIndexList[exerciseIndexListCurrentIndex];

    const participantId = this.state.participantId;
    const validity = this.state.selectedValidity;
    const selectedReasonNoValid = this.state.selectedReasonNoValid;
    const descriptionForNoValid = this.state.descriptionForNoValid;
    const difficulty = this.state.selectedDifficulty;
    const selectedTypes = this.state.selectedTypes;
    const descriptionForException = this.state.descriptionForException;
    const descriptionForOtherSyntax = this.state.descriptionForOtherSyntax;
    const descriptionForLogging = this.state.descriptionForLogging;
    const descriptionForLibrary = this.state.descriptionForLibrary;
    const descriptionForData = this.state.descriptionForData;
    const descriptionForAlgorithms = this.state.descriptionForAlgorithms;
    const descriptionForOtherType = this.state.descriptionForOtherType;
    const comments = this.state.comments;
    const lineNumbers = this.state.lineNumbers;
    const dataFetchingTime = this.state.dataFetchingTime;

    try {
      await this.postAnswer(participantId, quizIndex, exerciseIndexListCurrentIndex, validity, selectedReasonNoValid, descriptionForNoValid, difficulty,
        selectedTypes, descriptionForException, descriptionForOtherSyntax, descriptionForLogging, descriptionForLibrary, descriptionForData, descriptionForAlgorithms, descriptionForOtherType, comments, lineNumbers, dataFetchingTime);
      await this.loadNextExercise();

    } catch(err) {
      console.error(err);
    }
  }

  async loadNextExercise() {
    const participantId = this.state.participantId;

    this.setState({
      isLoading: true,
      // Reset all answers
      selectedValidity: "",  // Q1
      selectedReasonNoValid: [], // Q1
      descriptionForNoValid: "", // Q1 Reason
      selectedDifficulty: "", // Q2
      selectedTypes: [],
      lineNumbers: {},
      descriptionForException: "",
      descriptionForOtherSyntax: "",
      descriptionForLogging: "",
      descriptionForLibrary: "",
      descriptionForData: "",
      descriptionForAlgorithms: "",
      descriptionForOtherType: "",
      comments: "",
    });

    let exerciseIndexListCurrentIndex = this.state.exerciseIndexListCurrentIndex;
    let exerciseIndexListNextIndex = exerciseIndexListCurrentIndex + 1;

    // 回答数がmaxに達したとき
    if (!(exerciseIndexListNextIndex < this.state.numberOfExercise)) {
      this.setState({
        isLoading: false,
        hasFinished: true
      });
      // console.log('No exercise remaining.')
      return;
    }
    // 回答数がmaxに達してないとき
    else {
      this.setState({
        exerciseIndexListCurrentIndex: exerciseIndexListNextIndex,
      })
    }


    try {
      const nextQuizIndex = this.state.exerciseIndexList[exerciseIndexListNextIndex];
      await this.fetchExercise(participantId, nextQuizIndex);

      this.setState({
        isLoading: false
      });

      // console.log("Current state: %d/%d", exerciseIndexListNextIndex+1,  this.state.numberOfExercise);
      // console.log("Current quiz index: %d", nextQuizIndex);

    } catch(err) {
      console.error(err);
      this.setState({
        isLoading: false,
        isError: true
      });
    }
  }

  // TODO: 以下のメソッドからstateを除去する．
  async fetchNumberOfExercise(participantId) {
    const url = `${BASE_URL}/exercise-number?pid=${participantId}`;
    const self = this;

    // console.log('url: %s', url)
    const proxyurl = "https://cors-anywhere.herokuapp.com/";

    await fetch(url)
      .then(response => {
        return response.json();
      })
      .then(responseBody => {
        self.setState({
          numberOfExercise: responseBody.totalNumber,
          exerciseIndexListCurrentIndex: responseBody.currentIndex
        });
      })
      .catch(err => {
        console.error(err);
      });
  }

  async fetchExercise(participantId, quizIndex) {
    const url = `${BASE_URL}/exercise?pid=${participantId}&index=${quizIndex}`;
    const self = this;

    // console.log('url: %s', url)
    const proxyurl = "https://cors-anywhere.herokuapp.com/";

    await fetch(url)
      .then(response => {
        return response.json();
      })
      .then(responseBody => {
        const exercise = responseBody.exercise;
        const dataFetchingTime = (new Date()).toString()
        self.setState({
          currentExercise: exercise,
          dataFetchingTime: dataFetchingTime
        });
      })
      .catch(err => {
        console.error(err);
      });
  }

  async postAnswer(participantId, quizIndex, exerciseIndexListCurrentIndex, validity, selectedReasonNoValid, descriptionForNoValid, difficulty,
    selectedTypes, descriptionForException, descriptionForOtherSyntax, descriptionForLogging, descriptionForLibrary, descriptionForData, descriptionForAlgorithms, descriptionForOtherType, comments, lineNumbers, dataFetchingTime) {

    const dataPostingTime = (new Date()).toString()

    const url = `${BASE_URL}/answer`;
    const proxyurl = "https://cors-anywhere.herokuapp.com/";

    const method = "POST";
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    const body = JSON.stringify({
      "participantId": participantId,
      "quizIndex": quizIndex,
      "exerciseIndexListCurrentIndex": exerciseIndexListCurrentIndex,
      "validity": validity,
      "selectedReasonNoValid": selectedReasonNoValid.join('@'),
      "descriptionForNoValid": descriptionForNoValid,
      "difficulty": difficulty,
      "selectedTypes": selectedTypes.join('@'),
      "descriptionForException": descriptionForException,
      "descriptionForOtherSyntax": descriptionForOtherSyntax,
      "descriptionForLogging": descriptionForLogging,
      "descriptionForLibrary": descriptionForLibrary,
      "descriptionForData": descriptionForData,
      "descriptionForAlgorithms": descriptionForAlgorithms,
      "descriptionForOtherType": descriptionForOtherType,
      "comments": comments,
      "lineNumbers": lineNumbers,
      "dataFetchingTime": dataFetchingTime,
      "dataPostingTime": dataPostingTime
    });

    // console.log(body)

    return fetch(url, {method, headers, body})
  }

  /**
   * Render
   */
  render() {
    // console.log(this.state)
    if (this.state.isError) {
      return (
        <div className="App">
          <p>An error occurred.</p>
        </div>
      );
    }

    if (this.state.hasFinished) {
      return (
        <div className="App">
          <p>End</p>
        </div>
      )
    }

    if (this.state.isLoading | (this.state.currentExercise === null)) {
      return (
        <div className="App">
          <p>Loading...</p>
        </div>
      );
    }

    // extract information
    const exercise_raw = this.state.currentExercise;
    const exercise = {
      title: exercise_raw.title,
      bodyHTML: exercise_raw.bodyHTML,
      answerTitle: exercise_raw.pull_request.title,
      answerBodyHTML: exercise_raw.pull_request.bodyHTML,
      code_before: exercise_raw.code_change.before_body.split("\n"),
      code_after: exercise_raw.code_change.after_body.split("\n"),
      file_name: exercise_raw.code_change.file_name,
      lang: exercise_raw.lang
    };

    // Calculate code diff
    const codeDiffComponents = [];
    const diff = require("diff").diffLines(exercise_raw.code_change.before_body, exercise_raw.code_change.after_body);

    let lineCounterAddition = 1;
    let lineCounterDeletion = 1;
    diff.forEach((part) => {
      const color = part.added ? "green" : part.removed ? "red" : "grey";
      const regex = /\n/g;

      // 正規表現とマッチする文字列の個数をカウント
      let regCounter = 0;
      while (regex.exec(part.value) !== null) {
        regCounter++;
      }

      // +か-を挿入する
      let insertCharBefore = "";
      let insertCharAfter = "";
      if (part.added) {
        insertCharBefore = "a"
        insertCharAfter = "+";
      }
      else if (part.removed) {
        insertCharBefore = "d"
        insertCharAfter = "-";
      }

      if (part.added) {
        // 改行の後に行番号と+/-を挿入
        const strValue = part.value.replace(regex, function() {
          // 行番号が2桁じゃないならスペース入れる
          if (lineCounterAddition < 9) {
            return '\n ' + insertCharBefore + (++lineCounterAddition) + insertCharAfter;
          }
          return '\n' + insertCharBefore + (++lineCounterAddition) + insertCharAfter;
        });

        // lineCounterを巻き戻す
        lineCounterAddition -= regCounter;

        if (lineCounterAddition < 10) {
          codeDiffComponents.push(
            <div style={{ color: color }} key={part.value}> {insertCharBefore}{lineCounterAddition++}{insertCharAfter}{strValue}</div>
          );
        }
        else {
          codeDiffComponents.push(
            <div style={{ color: color }} key={part.value}>{insertCharBefore}{lineCounterAddition++}{insertCharAfter}{strValue}</div>
          );
        }
        // lineCounterを先に進める
        lineCounterAddition += regCounter;
      }
      else if (part.removed) {
        // 改行の後に行番号と+/-を挿入
        const strValue = part.value.replace(regex, function() {
          // 行番号が2桁じゃないならスペース入れる
          if (lineCounterDeletion < 9) {
            return '\n ' + insertCharBefore + (++lineCounterDeletion) + insertCharAfter;
          }
          return '\n' + insertCharBefore + (++lineCounterDeletion) + insertCharAfter;
        });

        // lineCounterを巻き戻す
        lineCounterDeletion -= regCounter;

        if (lineCounterDeletion < 10) {
          codeDiffComponents.push(
            <div style={{ color: color }} key={part.value}> {insertCharBefore}{lineCounterDeletion++}{insertCharAfter}{strValue}</div>
          );
        }
        else {
          codeDiffComponents.push(
            <div style={{ color: color }} key={part.value}>{insertCharBefore}{lineCounterDeletion++}{insertCharAfter}{strValue}</div>
          );
        }
        // lineCounterを先に進める
        lineCounterDeletion += regCounter;
      }
    });

    // Todo: 現在の言語表示
    return (
      <div className="container">
        <script src="https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js"></script>
        <div className="row">
          <h4 className="font-weight-light mb-4">Question number: {this.state.exerciseIndexListCurrentIndex+1} / {this.state.numberOfExercise}</h4>
        </div>

        <div className="row">
          <h2 className="font-weight-bold mb-4">Changed file: {exercise.file_name}</h2>
        </div>

        <pre className="prettyprint linenums">
          <code>{codeDiffComponents}</code>
        </pre>

        <hr></hr>

        <div className="row">
          <h2 className="font-weight-bold mb-4">Issue title: {exercise.title}</h2>
        </div>
        <div
          className="row"
          dangerouslySetInnerHTML={{ __html: exercise.bodyHTML }}
        ></div>

        <hr></hr>

        <div className="row">
          <h2 className="font-weight-bold mb-4">
            Pull request title: {exercise.answerTitle}
          </h2>
        </div>
        {
          <div
            className="row"
            dangerouslySetInnerHTML={{ __html: exercise.answerBodyHTML }}
          ></div>
        }

        {/* 回答フォーム */}
        {/*  */}
        <div className="cp_form">
          <form>
            <h2 className="font-weight-bold mb-4">Questionnaire</h2>

            <h4 className="font-weight-light mb-4 highlight">
              Q1.
              この問題は、想定ユーザ（※実験説明参照）にとって有用だと思いますか？
            </h4>
            <div className="cp_group cp_ipselect">
              <select
                className="cp_sl"
                required
                value={this.state.selectedValidity}
                onChange={e =>
                  this.setState({ selectedValidity: e.target.value })
                }
              >
              {this.state.validity.map(tmp => (
                <option key={tmp.value} value={tmp.value}>
                  {tmp.display}
                </option>
              ))}
              </select>
              <i className="bar"></i>
            </div>
            <h5 className="font-weight-light mb-4">
              「全くそう思わない」「そう思わない」と答えた場合、その理由をすべて選択し、他にあれば自由に記述してください。
            </h5>
            {
              this.state.typesReasonNoValid.map(tmp => (
                <div className="checkbox" key={tmp.value}>
                <label>
                  <input type="checkbox" onChange={ e => {
                    if(e.target.checked) {
                      let newSelectedTypes = this.state.selectedReasonNoValid.slice(0);
                      newSelectedTypes.push(tmp.value);
                      this.setState({ selectedReasonNoValid: newSelectedTypes });
                    } else {
                      const newSelectedTypes = this.state.selectedReasonNoValid.filter(element => element !== tmp.value);
                      this.setState({ selectedReasonNoValid: newSelectedTypes });
                    }
                  } }/>
                  <i className="ch_bar"></i>{tmp.display}
                </label>
              </div>
              ))
            }
            <div className="cp_group">
              <textarea required="required" rows="2" onChange={ e => { this.setState({ descriptionForNoValid: e.target.value })}}></textarea>
              <label className="cp_label" htmlFor="textarea">他にあれば、自由に記述してください：</label>
              <i className="bar"></i>
            </div>

            <h5 className="font-weight-bold mb-4">
              以降の質問（Q2 - Q4）は、Q1.で「どちらでもない」「そう思う」「とてもそう思う」と回答した場合に答えてください
            </h5>

            {/* Q3. 問題の種類 */}
            <h4 className="font-weight-light mb-4 highlight">
              Q2. 想定ユーザがこの問題から学ぶべき内容をすべて選択してください。また、該当する行番号や学べる内容を記述してください。
            </h4>
            <br></br>
            <h5 className="font-weight-light mb-4">
              Web開発者に求められる知識
            </h5>
            {
              this.state.typesWeb.map(tmp => (
                <div className="checkbox" key={tmp.value}>
                <label>
                  <input type="checkbox" onChange={ e => {
                    if(e.target.checked) {
                      let newSelectedTypes = this.state.selectedTypes.slice(0);
                      newSelectedTypes.push(tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    } else {
                      const newSelectedTypes = this.state.selectedTypes.filter(element => element !== tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    }
                  } }/>
                  <i className="ch_bar"></i>{tmp.display}
                </label>
              </div>
              ))
            }
            <br></br>
            <h5 className="font-weight-light mb-4">
              文法に関する知識
            </h5>
            {
              this.state.typesException.map(tmp => (
                <div className="checkbox" key={tmp.value}>
                <label>
                  <input type="checkbox" onChange={ e => {
                    if(e.target.checked) {
                      let newSelectedTypes = this.state.selectedTypes.slice(0);
                      newSelectedTypes.push(tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    } else {
                      const newSelectedTypes = this.state.selectedTypes.filter(element => element !== tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    }
                  } }/>
                  <i className="ch_bar"></i>{tmp.display}
                </label>
              </div>
              ))
            }
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => {
                let newLineNumbers = Object.create(this.state.lineNumbers);
                let hasyKey = this.state.typesException[0]["value"];
                newLineNumbers[String(hasyKey)] = e.target.value;
                this.setState({ lineNumbers: newLineNumbers });
              } }/>
              <label className="cp_label" htmlFor="input">コード差分中で該当する行番号を入力してください（例：d2-d4, d7, a2-a7）</label>
              <i className="bar"></i>
            </div>
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => this.setState({ descriptionForException: e.target.value })} />
              <label className="cp_label" htmlFor="input">使用されている例外型/エラー型がある場合はその名称を含めて、学べる内容を具体的に記述してください：</label>
              <i className="bar"></i>
            </div>
            {
              this.state.typesOtherSyntax.map(tmp => (
                <div className="checkbox" key={tmp.value}>
                <label>
                  <input type="checkbox" onChange={ e => {
                    if(e.target.checked) {
                      let newSelectedTypes = this.state.selectedTypes.slice(0);
                      newSelectedTypes.push(tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    } else {
                      const newSelectedTypes = this.state.selectedTypes.filter(element => element !== tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    }
                  } }/>
                  <i className="ch_bar"></i>{tmp.display}
                </label>
              </div>
              ))
            }
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => {
                let newLineNumbers = {};
                Object.assign(newLineNumbers, this.state.lineNumbers);
                let hasyKey = this.state.typesOtherSyntax[0]["value"];
                newLineNumbers[String(hasyKey)] = e.target.value;
                this.setState({ lineNumbers: newLineNumbers });
              } }/>
              <label className="cp_label" htmlFor="input">コード差分中で該当する行番号を入力してください（例：d2-d4, d7, a2-a7）</label>
              <i className="bar"></i>
            </div>
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => this.setState({ descriptionForOtherSyntax: e.target.value })} />
              <label className="cp_label" htmlFor="input">使用されている文法規則の名称を含めて、学べる内容を具体的に記述してください：</label>
              <i className="bar"></i>
            </div>
            <br></br>
            <h5 className="font-weight-light mb-4">
              その他のプログラミングに関する知識
            </h5>
            {/* ライブラリに関する知識 */}
            {
              this.state.typesLibrary.map(tmp => (
                <div className="checkbox" key={tmp.value}>
                <label>
                  <input type="checkbox" onChange={ e => {
                    if(e.target.checked) {
                      let newSelectedTypes = this.state.selectedTypes.slice(0);
                      newSelectedTypes.push(tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    } else {
                      const newSelectedTypes = this.state.selectedTypes.filter(element => element !== tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    }
                  } }/>
                  <i className="ch_bar"></i>{tmp.display}
                </label>
              </div>
              ))
            }
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => {
                let newLineNumbers = {};
                Object.assign(newLineNumbers, this.state.lineNumbers);
                let hasyKey = this.state.typesLibrary[0]["value"];
                newLineNumbers[String(hasyKey)] = e.target.value;
                this.setState({ lineNumbers: newLineNumbers });
              } }/>
              <label className="cp_label" htmlFor="input">コード差分中で該当する行番号を入力してください（例：d2-d4, d7, a2-a7）</label>
              <i className="bar"></i>
            </div>
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => this.setState({ descriptionForLibrary: e.target.value })} />
              <label className="cp_label" htmlFor="input">ライブラリ、フレームワーク、APIの名称を含めて、学べる内容を具体的に記述してください：</label>
              <i className="bar"></i>
            </div>
            {/* 自分が経験したことのあるバグに関する知識 */}
            {
              this.state.typesBug.map(tmp => (
                <div className="checkbox" key={tmp.value}>
                <label>
                  <input type="checkbox" onChange={ e => {
                    if(e.target.checked) {
                      let newSelectedTypes = this.state.selectedTypes.slice(0);
                      newSelectedTypes.push(tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    } else {
                      const newSelectedTypes = this.state.selectedTypes.filter(element => element !== tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    }
                  } }/>
                  <i className="ch_bar"></i>{tmp.display}
                </label>
              </div>
              ))
            }
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => {
                let newLineNumbers = {};
                Object.assign(newLineNumbers, this.state.lineNumbers);
                let hasyKey = this.state.typesBug[0]["value"];
                newLineNumbers[String(hasyKey)] = e.target.value;
                this.setState({ lineNumbers: newLineNumbers });
              } }/>
              <label className="cp_label" htmlFor="input">コード差分中で該当する行番号を入力してください（例：d2-d4, d7, a2-a7）</label>
              <i className="bar"></i>
            </div>

            {/* ログ出力に関する知識 */}
            {
              this.state.typesLogging.map(tmp => (
                <div className="checkbox" key={tmp.value}>
                <label>
                  <input type="checkbox" onChange={ e => {
                    if(e.target.checked) {
                      let newSelectedTypes = this.state.selectedTypes.slice(0);
                      newSelectedTypes.push(tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    } else {
                      const newSelectedTypes = this.state.selectedTypes.filter(element => element !== tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    }
                  } }/>
                  <i className="ch_bar"></i>{tmp.display}
                </label>
              </div>
              ))
            }
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => {
                let newLineNumbers = {};
                Object.assign(newLineNumbers, this.state.lineNumbers);
                let hasyKey = this.state.typesLogging[0]["value"];
                newLineNumbers[String(hasyKey)] = e.target.value;
                this.setState({ lineNumbers: newLineNumbers });
              } }/>
              <label className="cp_label" htmlFor="input">コード差分中で該当する行番号を入力してください（例：d2-d4, d7, a2-a7）</label>
              <i className="bar"></i>
            </div>
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => this.setState({ descriptionForLogging: e.target.value })} />
              <label className="cp_label" htmlFor="input">使用されている関数/属性/クラス等の名称を含めて、学べる内容を具体的に記述してください：</label>
              <i className="bar"></i>
            </div>

            {/* データの取得・操作、データベースに関する知識 */}
            {
              this.state.typesData.map(tmp => (
                <div className="checkbox" key={tmp.value}>
                <label>
                  <input type="checkbox" onChange={ e => {
                    if(e.target.checked) {
                      let newSelectedTypes = this.state.selectedTypes.slice(0);
                      newSelectedTypes.push(tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    } else {
                      const newSelectedTypes = this.state.selectedTypes.filter(element => element !== tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    }
                  } }/>
                  <i className="ch_bar"></i>{tmp.display}
                </label>
              </div>
              ))
            }
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => {
                let newLineNumbers = {};
                Object.assign(newLineNumbers, this.state.lineNumbers);
                let hasyKey = this.state.typesData[0]["value"];
                newLineNumbers[String(hasyKey)] = e.target.value;
                this.setState({ lineNumbers: newLineNumbers });
              } }/>
              <label className="cp_label" htmlFor="input">コード差分中で該当する行番号を入力してください（例：d2-d4, d7, a2-a7）</label>
              <i className="bar"></i>
            </div>
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => this.setState({ descriptionForData: e.target.value })} />
              <label className="cp_label" htmlFor="input">学べる内容を具体的に記述してください：</label>
              <i className="bar"></i>
            </div>

            {/* アルゴリズムに関する知識 */}
            {
              this.state.typesAlgorithms.map(tmp => (
                <div className="checkbox" key={tmp.value}>
                <label>
                  <input type="checkbox" onChange={ e => {
                    if(e.target.checked) {
                      let newSelectedTypes = this.state.selectedTypes.slice(0);
                      newSelectedTypes.push(tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    } else {
                      const newSelectedTypes = this.state.selectedTypes.filter(element => element !== tmp.value);
                      this.setState({ selectedTypes: newSelectedTypes });
                    }
                  } }/>
                  <i className="ch_bar"></i>{tmp.display}
                </label>
              </div>
              ))
            }
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => {
                let newLineNumbers = {};
                Object.assign(newLineNumbers, this.state.lineNumbers);
                let hasyKey = this.state.typesAlgorithms[0]["value"];
                newLineNumbers[String(hasyKey)] = e.target.value;
                this.setState({ lineNumbers: newLineNumbers });
              } }/>
              <label className="cp_label" htmlFor="input">コード差分中で該当する行番号を入力してください（例：d2-d4, d7, a2-a7）</label>
              <i className="bar"></i>
            </div>
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => this.setState({ descriptionForAlgorithms: e.target.value })} />
              <label className="cp_label" htmlFor="input">学べる内容を具体的に記述してください：</label>
              <i className="bar"></i>
            </div>


            <h5 className="font-weight-light mb-4">
              上記以外に学べる内容がある場合
            </h5>
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => {
                let newLineNumbers = {};
                Object.assign(newLineNumbers, this.state.lineNumbers);
                let hasyKey = "others";
                newLineNumbers[String(hasyKey)] = e.target.value;
                this.setState({ lineNumbers: newLineNumbers });
              } }/>
              <label className="cp_label" htmlFor="input">コード差分中で該当する行番号を入力してください（例：d2-d4, d7, a2-a7）</label>
              <i className="bar"></i>
            </div>
            <div className="cp_group">
              <textarea required="required" rows="2" onChange={ e => this.setState({ descriptionForOtherType: e.target.value })}></textarea>
              <label className="cp_label" htmlFor="textarea">自由に記述してください：</label>
              <i className="bar"></i>
            </div>

          {/* Q2. 難易度 */}
          <h4 className="font-weight-light mb-4 highlight">
            Q3. この問題のあなたにとっての難易度を教えてください。
          </h4>
          <div className="cp_group cp_ipselect">
            <select
              className="cp_sl"
              required
              value={this.state.selectedDifficulty}
              onChange={e =>
                this.setState({ selectedDifficulty: e.target.value })
              }
            >
            {this.state.difficulties.map(tmp => (
              <option key={tmp.value} value={tmp.value}>
                {tmp.display}
              </option>
            ))}
            </select>
            <i className="bar"></i>
          </div>

          {/* Q4. コメント*/}
          <h4 className="font-weight-light mb-4 highlight">
            Q4. その他、この問題に対してのコメントが何かあれば記述してください。
          </h4>
          <div className="cp_group">
            <textarea required="required" rows="2" onChange={ e => { this.setState({ comments: e.target.value })}}></textarea>
            <label className="cp_label" htmlFor="textarea">自由に記述してください：</label>
            <i className="bar"></i>
          </div>
          </form>
          <div className="btn_cont">
            <button
              className="btn"
              type="button"
              onClick={ () => this.goToNext() }
            ><span>Submit</span></button>
          </div>
        </div>
      </div>
    );
  }
}

export default withCookies(Home);
