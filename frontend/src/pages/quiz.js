import Head from "next/head";
import styles from '../styles/Quiz.module.css';
import { GlobalSearch, SideMenu } from "../components";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import API_BASE_URL from '../../apiConfig.js';
import { setAddAnswer, setUuid } from "../../redux/miscSlice";
import { useDispatch } from "react-redux";
import { Spinner } from "@chakra-ui/react";

export default function Quiz() {

    const router = useRouter();
    const dispatch = useDispatch();
    const { quiz, course, subject } = router.query;

    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [countNow, setCountNow] = useState(0);
    const [nowAnswer, setNowAnswer] = useState([]);

    const [loading, setLoading] = useState(false);
    const [backButton, setBackButton] = useState(true);
    const [startButton, setStartButton] = useState(true);

    function start() {
        setLoading(true);
        setBackButton(false);
        setStartButton(false);
        axios.get(`${API_BASE_URL}courses/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((res) => {
                res.data[course - 1].themes.map(y => y.title === subject
                    && y.parts.map(z => z.title === quiz &&
                        axios.get(`${API_BASE_URL}courses/test/${z.tests.uuid}`, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        })
                            .then((res) => {
                                console.log(res.data);
                                setData(res.data);
                                setCount(res.data.questions.length);
                                dispatch(setUuid(z.tests.uuid));
                                setLoading(false);
                            })
                            .catch((e) => {
                                console.log(e);
                                setLoading(false);
                            })
                    ));
            })
            .catch((e) => {
                console.log(e);
                setLoading(false);
            })
    };

    function nextQuestion(question, answer) {
        const data = {};
        data.text = question;
        data.answer = answer;
        setNowAnswer('');
        dispatch(setAddAnswer({ text: question, answer: answer }))
        setCountNow(countNow + 1)
    };

    function complete(question, answer) {
        const data = {};
        data.text = question;
        data.answer = answer;
        dispatch(setAddAnswer({ text: question, answer: answer }))
        router.push(`/result?quiz=${quiz}&course=${course}&subject=${subject}`)
    };

    function select(y, question) {
        if (nowAnswer.includes(y)) {
            setNowAnswer(x => x.filter(z => z !== y))
        } else {
            setNowAnswer(old => [...old, y]);
        }
    }

    return <>
        <Head>
            <title>Тестирование на тему {quiz?.split('.')[1]}</title>
            <meta name="description" content="" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
            <SideMenu />
            <GlobalSearch />
            <div className={styles.main}>
                <p className={styles.title} >Тестирование по дисциплине <span style={{ color: '#07C88E' }} >{quiz?.split('.')[1].toLowerCase()}</span></p>
                {startButton && <button className={styles.startButton} onClick={start}>Начать</button>}
                {backButton && <div className={styles.logOutBlock} onClick={() => router.push(`/course?number=${course}`)}>
                    <div className={styles.logOutIcon}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 0.46967C6.51256 0.176777 6.98744 0.176777 7.28033 0.46967L13.2803 6.46967C13.5732 6.76256 13.5732 7.23744 13.2803 7.53033L7.28033 13.5303C6.98744 13.8232 6.51256 13.8232 6.21967 13.5303C5.92678 13.2374 5.92678 12.7626 6.21967 12.4697L10.9393 7.75H0.75C0.335786 7.75 0 7.41421 0 7C0 6.58579 0.335786 6.25 0.75 6.25H10.9393L6.21967 1.53033C5.92678 1.23744 5.92678 0.762563 6.21967 0.46967Z" fill="#000B26" fillOpacity="0.72" />
                        </svg>
                    </div>
                    <p className={styles.cources_item}>Вернуться назад</p>
                </div>}
                {data.questions && <div className={styles.quizBlock}>
                    {data.questions?.map((x, i) => i === countNow && <div key={i} className={styles.quizContent} >
                        <p className={styles.question} >{i + 1}. {x.text}</p>
                        <div className={styles.questionsBlock}>
                            {x.answers.map((y, n) => <p className={`${styles.answer} ${nowAnswer.includes(y) && styles.greenAnswer}`} key={n} onClick={() => select(y, x.text, nowAnswer)} >{y}</p>)}
                        </div>
                        {countNow !== count - 1
                            ? <button onClick={() => nextQuestion(x.text, nowAnswer)} className={styles.nextButton} >Следующий вопрос</button>
                            : <button onClick={() => complete(x.text, nowAnswer)} className={styles.finalButton}>Завершить тестирование</button>}
                    </div>)}
                </div>}
                <Spinner display={loading ? 'block' : 'none'} />
            </div>
        </main>
    </>
}