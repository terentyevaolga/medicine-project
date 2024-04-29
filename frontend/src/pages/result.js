import Head from "next/head";
import styles from '../styles/Quiz.module.css';
import { GlobalSearch, SideMenu } from "../components";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import API_BASE_URL from '../../apiConfig.js';
import { useDispatch, useSelector } from "react-redux";
import { setClearAnswer } from "../../redux/miscSlice";

export default function Result() {

    const router = useRouter();
    const { answers, uuid } = useSelector(({ misc }) => misc);
    const { quiz, course, subject } = router.query;
    const [resultData, setResultData] = useState([]);
    const [dataMaterials, setDataMaterials] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        sendAnswers();
    }, []);

    function sendAnswers() {
        if (answers.length === 0) return router.push('/course?number=1');

        axios.post(`${API_BASE_URL}courses/test/check/`, { uuid, answers }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((res) => {
                setResultData(res.data);
            })
            .catch((e) => {
                console.log(e);
            })

        axios.get(`${API_BASE_URL}courses/test/recommendations/${quiz}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((res) => {
                console.log(res.data);
                setDataMaterials(res.data);
            })
            .catch((e) => {
                console.log(e);
            })
    };

    function again() {
        dispatch(setClearAnswer());
        router.push(`/quiz?quiz=${quiz}&course=${course}&subject=${subject}`)
    };


    function download(id, name) {
        axios.get(`${API_BASE_URL}courses/file_sources/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            responseType: 'blob'
        }).then((res) => {
            const blob = new Blob([res.data]);
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = `${name}.` + res.headers['content-type'].split('/').at(-1);
            link.click();
        })
    };

    return <>
        <Head>
            <title>Тестирование на тему {quiz}</title>
            <meta name="description" content="" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
            <SideMenu />
            <GlobalSearch />
            <div className={styles.main}>
                <p className={styles.title} >Тестирование по дисциплине <span style={{ color: '#07C88E' }} >{quiz?.split('.')[1].toLowerCase()}</span></p>
                <button className={styles.startButton} onClick={again} >Пройти еще раз</button>
                <div className={styles.resultBlock}>
                    <p className={styles.resultText}>Тестирование завершено. Результат <span style={{ color: '#07C88E' }}>{resultData.score}</span> / <span style={{ color: '#07C88E' }}>{resultData.questions_number}</span></p>
                    <p className={styles.resultText}>По результатам  тестирования рекомендуем изучить следующие материалы: </p>
                    <div className={styles.lineMaterial}>
                        {dataMaterials?.lections?.map((x, i) => i < 2 && <iframe key={i}
                            id="player" type="text/html" width="279" height="163" frameBorder="0"
                            src={`https://youtube.com/embed/${x.link.split('v=')[1].split('&')[0]}`}>
                        </iframe>)}
                    </div>
                    <div className={styles.lineMaterial}>
                        {dataMaterials?.file_sources?.map((x, i) => x.type === 'manual' && i < 3 && <div key={i} className={styles.materialBoxMetod} onClick={() => download(x.uuid, x.title)}>
                            <p className={styles.materialText}>{x.title}</p>
                        </div>)}
                    </div>
                </div>
            </div>
        </main>
    </>
}