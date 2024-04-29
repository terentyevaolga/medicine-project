import Head from "next/head";
import styles from '../styles/MaterialsPage.module.css';
import { SideMenu, GlobalSearch } from "../components";
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../apiConfig";
import { Button, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Articles() {

    const router = useRouter();
    const { index } = router.query;
    const [loading, setLoading] = useState(false);
    const [buttonDisplay, setButtonDisplay] = useState(true);

    const [course, setCourse] = useState(0);
    const [data, setData] = useState([]);
    const [nowLength, setNowLength] = useState(12);

    let counter = 1;

    useEffect(() => {
        load();
    }, []);

    function load() {
        setLoading(true);
        axios.get(`${API_BASE_URL}courses/articles-lite`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((res) => {
                console.log('ddd', res.data);
                setData(res.data);
                setLoading(false);
                if (res.data[course].articles.length < 12) setButtonDisplay(false);
            })
            .catch((e) => {
                console.log(e);
                setLoading(false);
            })
    };

    function arrayLength() {
        setNowLength(nowLength + 12);
        if (nowLength > data[course].articles.length) setButtonDisplay(false);
    };

    return <>
        <Head>
            <title>Статьи</title>
            <meta name="description" content="" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
            <SideMenu />
            <GlobalSearch />
            <div className={styles.main}>
                <p className={styles.title}>Статьи</p>
                <Spinner display={loading ? 'block' : 'none'} />
                {!index
                    ? <>
                        <div className={styles.column} >
                            {data.length > 0
                                ? data.map(z => z.articles.map(x => <p key={counter++} className={styles.articleText} onClick={() => router.push(x.link)}>{counter}. {x.title}</p>))
                                : !loading && <p>Статьи отсутствуют</p>}
                        </div>
                        <div className={styles.buttonBlock} >
                            <Button onClick={() => arrayLength()} backgroundColor='#07C88E' borderRadius='8px' height='56px' width='max-content' color='white' _hover={{}} fontWeight={500} display={buttonDisplay && !loading ? 'block' : 'none'} >Ещё Статьи</Button>
                        </div>
                    </>
                    : <>
                        {data.map(z => z.articles.map(x => x.uuid === index && <p key={counter++} className={styles.articleText} onClick={() => router.push(x.link)}>{counter}. {x.title}</p>))}
                        <div className={styles.buttonBlock} >
                            <Button onClick={() => router.push('/articles')} backgroundColor='#07C88E' borderRadius='8px' height='56px' width='max-content' color='white' _hover={{}} fontWeight={500}>Посмотреть все статьи</Button>
                        </div>
                    </>}
            </div>
        </main>
    </>
}