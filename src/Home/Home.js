import React, { Component } from "react";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import './Home.css';

require("colors");

// const BASE_URL = 'https://api.realcode.link'; // Remote server on EC2
const BASE_URL = 'http://localhost:8080'; // Local server
const NUMBER_OF_EXERCISES_TO_ANSWER = 10;

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
      participantId: "", // Q0
      selectedValidity: "",  // Q1
      reasonForValidity: "", // Q1 Reason
      selectedDifficulty: "", // Q2
      libraryName: "", // Q3
      ideName: "", // Q3
      selectedTypes: [], // Q4
      descriptionForType: "", // Q4 Description
      validity: [
        { value: "", display: "(選択してください)" },
        { value: "そう思う", display: "そう思う" },
        { value: "そう思わない", display: "そう思わない" },
        { value: "わからない", display: "わからない" }
      ],
      difficulties: [
        { value: "", display: "(選択してください)" },
        { value: "1", display: "1" },
        { value: "2", display: "2" },
        { value: "3", display: "3" },
        { value: "4", display: "4" },
        { value: "5", display: "5" }
      ],
      types: [
        { value: "フロントエンドの知識", display: "フロントエンドの知識" },
        { value: "サーバーサイドの知識", display: "サーバーサイドの知識" },
        { value: "データベース操作の知識", display: "データベース操作の知識" },
        { value: "データサイエンスの知識", display: "データサイエンスの知識" },
        { value: "エラー処理/例外処理に関する知識", display: "エラー処理/例外処理に関する知識" },
        { value: "本番稼動時のメンテナンスに関する知識", display: "本番稼動時のメンテナンスに関する知識" },
        { value: "自分が見たことのあるバグの修正方法", display: "自分が見たことのあるバグの修正方法" },
        { value: "自分が見たことのないバグの修正方法", display: "自分が見たことのないバグの修正方法" },
        { value: "PythonまたはJavaScriptの文法に関する知識", display: "PythonまたはJavaScriptの文法に関する知識" },
        { value: "アルゴリズムに関する知識", display: "アルゴリズムに関する知識" },
        { value: "ライブラリ、フレームワーク、APIの使用方法", display: "ライブラリ、フレームワーク、APIの使用方法" }
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
    console.log(this.state.participantId);

    try {
      // 問題数をロード
      const participantId = this.state.participantId;

      await this.fetchNumberOfExercise(participantId);

      // 回答する問題番号を決定
      const numberOfExercise = this.state.numberOfExercise;
      let exerciseIndexList = [];
      for (let i = 0; i < NUMBER_OF_EXERCISES_TO_ANSWER; i++) {
        const quizIndex = i;
        // const quizIndex = Math.floor(Math.random() * (numberOfExercise));
        exerciseIndexList.push(quizIndex);
      }

      this.setState({
        exerciseIndexList: exerciseIndexList
      })


      // 回答が終わってるかの判定
      if (this.state.exerciseIndexListCurrentIndex >= NUMBER_OF_EXERCISES_TO_ANSWER) {
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

        console.log("First state: %d/%d", this.state.exerciseIndexListCurrentIndex + 1, NUMBER_OF_EXERCISES_TO_ANSWER);
        console.log("Quiz index: %d", firstIndex);
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
    const currentQuizIndex = exerciseIndexList[this.state.exerciseIndexListCurrentIndex];
    const exerciseIndexListCurrentIndex = this.state.exerciseIndexListCurrentIndex;

    const participantId = this.state.participantId;
    const validity = this.state.selectedValidity;
    const reasonForValidity = this.state.reasonForValidity;
    const difficulty = this.state.selectedDifficulty;
    const libraryName = this.state.libraryName;
    const ideName = this.state.ideName;
    const selectedTypes = this.state.selectedTypes;
    const descriptionForType = this.state.descriptionForType;
    const dataFetchingTime = this.state.dataFetchingTime;

    try {
      await this.postAnswer(participantId, currentQuizIndex, exerciseIndexListCurrentIndex, validity, reasonForValidity, difficulty, selectedTypes, libraryName, ideName, descriptionForType, dataFetchingTime);
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
      reasonForValidity: "", // Q1 Reason
      selectedDifficulty: "", // Q2
      libraryName: "", // Q3
      ideName: "", // Q3
      selectedTypes: [], // Q3
      descriptionForType: "", // Q3 Description
    });

    let exerciseIndexListCurrentIndex = this.state.exerciseIndexListCurrentIndex;
    let exerciseIndexListNextIndex = exerciseIndexListCurrentIndex + 1;

    // 回答数がmaxに達したとき
    if (!(exerciseIndexListNextIndex < NUMBER_OF_EXERCISES_TO_ANSWER)) {
      this.setState({
        isLoading: false,
        hasFinished: true
      });
      console.log('No exercise remaining.')
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

      console.log("Current state: %d/%d", exerciseIndexListNextIndex+1,  NUMBER_OF_EXERCISES_TO_ANSWER);
      console.log("Current quiz index: %d", nextQuizIndex);

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

    console.log('url: %s', url)
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

    console.log('url: %s', url)
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

  async postAnswer(participantId, quizIndex, exerciseIndexListCurrentIndex, validity, reasonForValidity, difficulty, selectedTypes, libraryName, ideName, descriptionForType, dataFetchingTime) {

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
      "reasonForValidity": reasonForValidity,
      "difficulty": difficulty,
      "libraryName": libraryName,
      "ideName": ideName,
      "selectedTypes": selectedTypes.join('@'),
      "descriptionForType": descriptionForType,
      "dataFetchingTime": dataFetchingTime,
      "dataPostingTime": dataPostingTime
    });

    console.log(body)

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
      if (part.added) {
        codeDiffComponents.push(
          <div style={{ color: color }} key={part.value}>+ {part.value}</div>
        );
      } else if (part.removed) {
        codeDiffComponents.push(
          <div style={{ color: color }} key={part.value}>- {part.value}</div>
        );
      };
    });

    // Todo: 現在の言語表示
    return (
      <div className="container">
        <script src="https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js"></script>
        <div className="row">
          <h4 className="font-weight-light mb-4">Question number: {this.state.exerciseIndexListCurrentIndex+1} / {NUMBER_OF_EXERCISES_TO_ANSWER}</h4>
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
            <h4 className="font-weight-light mb-4">
              Q1.
              この問題は、プログラミングの演習問題として良い問題であると思いますか？
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
            <div className="cp_group">
              <textarea required="required" rows="5" onChange={ e => { this.setState({ reasonForValidity: e.target.value })}}></textarea>
              <label className="cp_label" htmlFor="textarea">わからない/そう思わないと答えた場合、その理由を記述してください </label>
              <i className="bar"></i>
            </div>

            <h4 className="font-weight-bold mb-4">
              以降の質問は、Q1.で「そう思う」と回答した場合に答えてください
            </h4>

            {/* Q2. 難易度 */}
            <h4 className="font-weight-light mb-4">
              Q2. この演習問題の、あなたにとっての難易度を教えてください（1が最も簡単 -- 5が最も難しい）
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

            {/* Q3. 問題の種類 */}
            <h4 className="font-weight-light mb-4">
              Q4. この問題から学べる内容をすべて選択してください
            </h4>
            {
              this.state.types.map(tmp => (
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

            {/* Q4.ライブラリ、フレームワーク、APIの名前 */}
            <div className="cp_group">
              <input type="text" required="required" onChange={ e => this.setState({ libraryName: e.target.value })} />
              <label className="cp_label" htmlFor="input">ライブラリ、フレームワーク、APIの名前：</label>
              <i className="bar"></i>
            </div>

            <div className="cp_group">
              <input type="text" required="required" onChange={ e => this.setState({ ideName: e.target.value })} />
              <label className="cp_label" htmlFor="input">IDEの名前：</label>
              <i className="bar"></i>
            </div>

            <h5 className="font-weight-light mb-4">
              上記の選択肢以外の内容がある場合は自由に記述してください
            </h5>
            <div className="cp_group">
              <textarea required="required" rows="5" onChange={ e => this.setState({ descriptionForType: e.target.value })}></textarea>
              <label className="cp_label" htmlFor="textarea">自由記述：</label>
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
