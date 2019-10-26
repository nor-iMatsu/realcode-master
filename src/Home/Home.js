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
      selectedUnderstanding: "",  // Q1
      selectedValidity: "",  // Q2
      selectedReasonNoValid: [], // Q2
      descriptionForNoValid: "", // Q2 reason
      selectedDifficulty: "", // Q3
      selectedTypes: [], // Q4
      descriptionForException: "", //Q4
      descriptionForOtherSyntax: "", //Q4
      descriptionForLogging: "", //Q4
      descriptionForLibrary: "", //Q4
      descriptionForOtherType: "", //Q4
      understanding: [
        { value: "", display: "(選択してください)" },
        { value: "1", display: "全く理解できなかった" },
        { value: "2", display: "理解できなかった" },
        { value: "3", display: "どちらでもない" },
        { value: "4", display: "理解できた" },
        { value: "5", display: "とても理解できた" },
      ],
      validity: [
        { value: "", display: "(選択してください)" },
        { value: "1", display: "全くそう思わない" },
        { value: "2", display: "そう思わない" },
        { value: "3", display: "どちらでもない" },
        { value: "4", display: "そう思う" },
        { value: "5", display: "とてもそう思う" }
      ],
      typesReasonNoValid: [
        { value: "fraction", display: "コード変更が断片的すぎる" },
        { value: "distinctName", display: "リポジトリ特有のライブラリ/変数を使用している" },
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
      typesOthers: [
        { value: "realBug", display: "自分が経験したことのあるバグに関する知識" },
        { value: "algorithm", display: "アルゴリズムに関する知識" },
        { value: "data", display: "データの取得・操作、データベースに関する知識" },
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
    const understanding = this.state.selectedUnderstanding;
    const validity = this.state.selectedValidity;
    const selectedReasonNoValid = this.state.selectedReasonNoValid;
    const descriptionForNoValid = this.state.descriptionForNoValid;
    const difficulty = this.state.selectedDifficulty;
    const selectedTypes = this.state.selectedTypes;
    const descriptionForException = this.state.descriptionForException;
    const descriptionForOtherSyntax = this.state.descriptionForOtherSyntax;
    const descriptionForLogging = this.state.descriptionForLogging;
    const descriptionForLibrary = this.state.descriptionForLibrary;
    const descriptionForOtherType = this.state.descriptionForOtherType;
    const dataFetchingTime = this.state.dataFetchingTime;

    try {
      await this.postAnswer(participantId, quizIndex, exerciseIndexListCurrentIndex, understanding, validity, selectedReasonNoValid, descriptionForNoValid, difficulty,
        selectedTypes, descriptionForException, descriptionForOtherSyntax, descriptionForLogging, descriptionForLibrary, descriptionForOtherType, dataFetchingTime);
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
      selectedUnderstanding: "", // Q1
      selectedValidity: "",  // Q2
      selectedReasonNoValid: [], // Q2
      descriptionForNoValid: "", // Q2 Reason
      selectedDifficulty: "", // Q3
      selectedTypes: [],
      descriptionForException: "",
      descriptionForOtherSyntax: "",
      descriptionForLogging: "",
      descriptionForLibrary: "",
      descriptionForOtherType: "",
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

  async postAnswer(participantId, quizIndex, exerciseIndexListCurrentIndex, understanding, validity, selectedReasonNoValid, descriptionForNoValid, difficulty,
    selectedTypes, descriptionForException, descriptionForOtherSyntax, descriptionForLogging, descriptionForLibrary, descriptionForOtherType, dataFetchingTime) {

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
      "understanding": understanding,
      "validity": validity,
      "selectedReasonNoValid": selectedReasonNoValid.join('@'),
      "descriptionForNoValid": descriptionForNoValid,
      "difficulty": difficulty,
      "selectedTypes": selectedTypes.join('@'),
      "descriptionForException": descriptionForException,
      "descriptionForOtherSyntax": descriptionForOtherSyntax,
      "descriptionForLogging": descriptionForLogging,
      "descriptionForLibrary": descriptionForLibrary,
      "descriptionForOtherType": descriptionForOtherType,
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

    diff.forEach((part) => {
      const color = part.added ? "green" : part.removed ? "red" : "grey";
      const regex = /\n/g;
      if (part.added) {
        // 改行の後に+を挿入
        const strValue = part.value.replace(regex,"\n+")
        codeDiffComponents.push(
          <div style={{ color: color }} key={part.value}>+{strValue}</div>
        );
      } else if (part.removed) {
        // 改行の後に+を挿入
        const strValue = part.value.replace(regex,"\n-")
        codeDiffComponents.push(
          <div style={{ color: color }} key={part.value}>-{strValue}</div>
        );
      };
    });

    // Todo: 現在の言語表示
    return (
      <div className="container">
        <script src="https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js"></script>
        <div className="row">
          <h4 className="font-weight-light mb-4">Question number: {this.state.exerciseIndexListCurrentIndex+1} / {this.state.numberOfExercise}</h4>
        </div>

        <div className="row">
          <h2 className="font-weight-bold mb-4">Quiz: {exercise.title}</h2>
        </div>
        <div
          className="row"
          dangerouslySetInnerHTML={{ __html: exercise.bodyHTML }}
        ></div>

        <hr></hr>

        <div className="row">
          <h2 className="font-weight-bold mb-4">Answer code</h2>
        </div>

        <div>
          <h4 className="font-weight-light mb-4">{exercise.file_name}</h4>
        </div>

        <pre className="prettyprint linenums">
          <code>{codeDiffComponents}</code>
        </pre>

        <div className="row">
          <h2 className="font-weight-bold mb-4">
            Answer description: {exercise.answerTitle}
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

            {/* Q1. 妥当性 */}
            <h4 className="font-weight-light mb-4 highlight">
              Q1.
              この問題の問題文と解答コードを理解できましたか？
            </h4>
            <div className="cp_group cp_ipselect">
              <select
                className="cp_sl"
                required
                value={this.state.selectedUnderstanding}
                onChange={e =>
                  this.setState({ selectedUnderstanding: e.target.value })
                }
              >
              {this.state.understanding.map(tmp => (
                <option key={tmp.value} value={tmp.value}>
                  {tmp.display}
                </option>
              ))}
              </select>
              <i className="bar"></i>
            </div>

            <h4 className="font-weight-light mb-4 highlight">
              Q2.
              この問題はプログラミング学習に有用だと思いますか？
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
              「全くそう思わない」「そう思わない」「どちらでもない」と答えた場合、その理由をすべて選択し、他にあれば自由に記述してください。
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
              <label className="cp_label" htmlFor="textarea">自由記述：</label>
              <i className="bar"></i>
            </div>

            <h5 className="font-weight-bold mb-4">
              以降の質問は、Q2.で「そう思う」「とてもそう思う」と回答した場合に答えてください
            </h5>

            {/* Q3. 難易度 */}
            <h4 className="font-weight-light mb-4 highlight">
              Q3. この問題のあなたにとっての難易度を教えてください
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

            {/* Q4. 問題の種類 */}
            <h4 className="font-weight-light mb-4 highlight">
              Q4. この問題から学べる内容をすべて選択し、他にあれば自由に記述してください
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
              ソフトウェア開発者に求められる知識
            </h5>
            {
              this.state.typesSoftware.map(tmp => (
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
              <input type="text" required="required" onChange={ e => this.setState({ descriptionForException: e.target.value })} />
              <label className="cp_label" htmlFor="input">例外処理に関する知識を学べる場合、その内容を具体的に記述してください：</label>
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
              <input type="text" required="required" onChange={ e => this.setState({ descriptionForOtherSyntax: e.target.value })} />
              <label className="cp_label" htmlFor="input">例外処理以外の文法に関する知識を学べる場合、その内容を具体的に記述してください：</label>
              <i className="bar"></i>
            </div>
            <br></br>
            <h5 className="font-weight-light mb-4">
              その他のプログラミングに関する知識
            </h5>
            {
              this.state.typesOthers.map(tmp => (
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
              <input type="text" required="required" onChange={ e => this.setState({ descriptionForLogging: e.target.value })} />
              <label className="cp_label" htmlFor="input">ログ出力に関する知識を学べる場合、その内容を具体的に記述してください：</label>
              <i className="bar"></i>
            </div>
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
              <input type="text" required="required" onChange={ e => this.setState({ descriptionForLibrary: e.target.value })} />
              <label className="cp_label" htmlFor="input">ライブラリ、フレームワーク、APIの名前：</label>
              <i className="bar"></i>
            </div>


            <h5 className="font-weight-light mb-4">
              上記以外に学べる内容がある場合は、自由に記述してください
            </h5>
            <div className="cp_group">
              <textarea required="required" rows="2" onChange={ e => this.setState({ descriptionForOtherType: e.target.value })}></textarea>
              <label className="cp_label" htmlFor="textarea">記述してください：</label>
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
